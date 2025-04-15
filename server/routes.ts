import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { orderStatusUpdateSchema, insertOrderSchema } from "@shared/schema";
import { log } from "./vite";

export async function registerRoutes(app: Express): Promise<Server> {
  // Create HTTP server
  const httpServer = createServer(app);

  // Create WebSocket server
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Store active connections
  const clients = new Set<WebSocket>();

  // WebSocket connection handler
  wss.on('connection', (ws) => {
    // Add to clients set
    clients.add(ws);
    
    log('WebSocket client connected');
    
    // Handle messages
    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        if (data.type === 'orderStatusUpdate') {
          // Validate order status update
          const validation = orderStatusUpdateSchema.safeParse(data.payload);
          
          if (!validation.success) {
            ws.send(JSON.stringify({ 
              type: 'error', 
              message: 'Invalid order status update'
            }));
            return;
          }
          
          // Update order status
          const updatedOrder = await storage.updateOrderStatus(validation.data);
          
          if (!updatedOrder) {
            ws.send(JSON.stringify({ 
              type: 'error', 
              message: 'Order not found'
            }));
            return;
          }
          
          // Broadcast order update to all clients
          broadcastToAll({
            type: 'orderUpdated',
            payload: updatedOrder
          });
        }
      } catch (error) {
        ws.send(JSON.stringify({ 
          type: 'error', 
          message: 'Invalid message format'
        }));
      }
    });
    
    // Handle disconnection
    ws.on('close', () => {
      clients.delete(ws);
      log('WebSocket client disconnected');
    });
    
    // Send initial data to the client
    sendInitialData(ws);
  });
  
  // Function to broadcast a message to all connected clients
  function broadcastToAll(data: any) {
    const message = JSON.stringify(data);
    clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }
  
  // Function to send initial data to a new client
  async function sendInitialData(ws: WebSocket) {
    try {
      const menuItems = await storage.getMenuItems();
      const activeOrders = await storage.getOrders();
      
      ws.send(JSON.stringify({
        type: 'initialData',
        payload: {
          menuItems,
          activeOrders
        }
      }));
    } catch (error) {
      console.error('Error sending initial data:', error);
    }
  }

  // API Routes
  
  // Get all menu items
  app.get('/api/menu', async (req, res) => {
    try {
      const menuItems = await storage.getMenuItems();
      res.json(menuItems);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get menu items' });
    }
  });
  
  // Update menu item availability
  app.post('/api/menu/update-availability', async (req, res) => {
    try {
      const updates = req.body;
      if (!Array.isArray(updates)) {
        return res.status(400).json({ message: 'Invalid request data. Expected an array.' });
      }
      
      const results = await Promise.all(
        updates.map(async (update) => {
          if (typeof update.id !== 'number' || typeof update.available !== 'boolean') {
            throw new Error('Invalid update format');
          }
          return await storage.updateMenuItemAvailability(update.id, update.available);
        })
      );
      
      res.status(200).json({ 
        message: 'Menu item availability updated successfully', 
        updatedItems: results.filter(Boolean) 
      });
    } catch (error) {
      console.error('Error updating menu item availability:', error);
      res.status(500).json({ message: 'Failed to update menu item availability' });
    }
  });
  
  // Get menu items by category
  app.get('/api/menu/:category', async (req, res) => {
    try {
      const { category } = req.params;
      const menuItems = await storage.getMenuItemsByCategory(category);
      res.json(menuItems);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get menu items' });
    }
  });
  
  // Get all tables
  app.get('/api/tables', async (req, res) => {
    try {
      const tables = await storage.getTables();
      res.json(tables);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get tables' });
    }
  });
  
  // Get a specific table by number
  app.get('/api/tables/number/:tableNumber', async (req, res) => {
    try {
      const tableNumber = parseInt(req.params.tableNumber);
      if (isNaN(tableNumber)) {
        return res.status(400).json({ message: 'Invalid table number' });
      }
      
      const table = await storage.getTableByNumber(tableNumber);
      if (!table) {
        return res.status(404).json({ message: 'Table not found' });
      }
      
      res.json(table);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get table' });
    }
  });
  
  // Get orders by table ID
  app.get('/api/orders/table/:tableId', async (req, res) => {
    try {
      const tableId = parseInt(req.params.tableId);
      if (isNaN(tableId)) {
        return res.status(400).json({ message: 'Invalid table ID' });
      }
      
      const orders = await storage.getOrdersByTableId(tableId);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get orders' });
    }
  });
  
  // Get orders by type (kitchen or bar)
  app.get('/api/orders/type/:type', async (req, res) => {
    try {
      const { type } = req.params;
      if (type !== 'kitchen' && type !== 'bar') {
        return res.status(400).json({ message: 'Invalid order type' });
      }
      
      const orders = await storage.getOrdersByType(type);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get orders' });
    }
  });
  
  // Create a new order
  app.post('/api/orders', async (req, res) => {
    try {
      // Validate the order data
      const validation = insertOrderSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ message: 'Invalid order data', errors: validation.error.errors });
      }
      
      // Create the order
      const newOrder = await storage.createOrder(validation.data);
      
      // Broadcast the new order to all connected clients
      broadcastToAll({
        type: 'newOrder',
        payload: newOrder
      });
      
      res.status(201).json(newOrder);
    } catch (error) {
      res.status(500).json({ message: 'Failed to create order' });
    }
  });
  
  // Update order status
  app.patch('/api/orders/:id/status', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid order ID' });
      }
      
      // Validate the status update
      const validation = orderStatusUpdateSchema.safeParse({
        id,
        status: req.body.status
      });
      
      if (!validation.success) {
        return res.status(400).json({ message: 'Invalid status update', errors: validation.error.errors });
      }
      
      // Update the order status
      const updatedOrder = await storage.updateOrderStatus(validation.data);
      
      if (!updatedOrder) {
        return res.status(404).json({ message: 'Order not found' });
      }
      
      // Broadcast the order update to all connected clients
      broadcastToAll({
        type: 'orderUpdated',
        payload: updatedOrder
      });
      
      res.json(updatedOrder);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update order status' });
    }
  });

  return httpServer;
}
