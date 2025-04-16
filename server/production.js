// Production server wrapper script
// This script starts the Express server in production mode without depending on Vite

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';

// For ESM compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import necessary modules
import { storage } from './storage.js';
import { setupDatabase } from './db-setup.js';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      console.log(`${new Date().toLocaleTimeString()} [express] ${logLine}`);
    }
  });

  next();
});

// Setup API routes
async function setupRoutes() {
  console.log(`${new Date().toLocaleTimeString()} [express] Setting up database...`);
  await setupDatabase();
  console.log(`${new Date().toLocaleTimeString()} [express] Database setup complete`);

  // Create HTTP server
  const httpServer = createServer(app);

  // WebSocket server
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  // Handle WebSocket connections
  wss.on('connection', async (ws) => {
    console.log(`${new Date().toLocaleTimeString()} [express] WebSocket client connected`);
    
    // Send initial data to client
    try {
      const menuItems = await storage.getMenuItems();
      const orders = await storage.getOrders();
      const tables = await storage.getTables();
      
      ws.send(JSON.stringify({
        type: 'initial',
        data: { menuItems, orders, tables }
      }));
    } catch (error) {
      console.error('Error sending initial data:', error);
    }
    
    // Listen for messages from client
    ws.on('message', async (message) => {
      try {
        const parsed = JSON.parse(message.toString());
        
        if (parsed.type === 'createOrder') {
          const order = await storage.createOrder(parsed.data);
          broadcastToAll({
            type: 'newOrder',
            data: order
          });
        } else if (parsed.type === 'updateKitchenStatus') {
          const order = await storage.updateKitchenStatus(parsed.data);
          if (order) {
            broadcastToAll({
              type: 'orderUpdated',
              data: order
            });
          }
        } else if (parsed.type === 'updateBarStatus') {
          const order = await storage.updateBarStatus(parsed.data);
          if (order) {
            broadcastToAll({
              type: 'orderUpdated',
              data: order
            });
          }
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    });
  });

  // Broadcast to all connected clients
  function broadcastToAll(data) {
    wss.clients.forEach(client => {
      if (client.readyState === 1) { // WebSocket.OPEN
        client.send(JSON.stringify(data));
      }
    });
  }

  // API Routes
  app.get('/api/menu-items', async (req, res) => {
    try {
      const menuItems = await storage.getMenuItems();
      res.json(menuItems);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/menu-items/:id', async (req, res) => {
    try {
      const menuItem = await storage.getMenuItem(parseInt(req.params.id));
      if (!menuItem) {
        return res.status(404).json({ error: 'Menu item not found' });
      }
      res.json(menuItem);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/toppings', async (req, res) => {
    try {
      const toppings = await storage.getToppings();
      res.json(toppings);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/toppings/category/:category', async (req, res) => {
    try {
      const toppings = await storage.getToppingsByCategory(req.params.category);
      res.json(toppings);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/menu-items/:id/toppings', async (req, res) => {
    try {
      const toppings = await storage.getMenuItemToppings(parseInt(req.params.id));
      res.json(toppings);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/tables', async (req, res) => {
    try {
      const tables = await storage.getTables();
      res.json(tables);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/tables/:id', async (req, res) => {
    try {
      const table = await storage.getTable(parseInt(req.params.id));
      if (!table) {
        return res.status(404).json({ error: 'Table not found' });
      }
      res.json(table);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/tables/number/:number', async (req, res) => {
    try {
      const table = await storage.getTableByNumber(parseInt(req.params.number));
      if (!table) {
        return res.status(404).json({ error: 'Table not found' });
      }
      res.json(table);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/orders', async (req, res) => {
    try {
      const orders = await storage.getOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/orders', async (req, res) => {
    try {
      const order = await storage.createOrder(req.body);
      
      // Broadcast the new order to all connected clients
      broadcastToAll({
        type: 'newOrder',
        data: order
      });
      
      res.status(201).json(order);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put('/api/orders/:id/kitchen-status', async (req, res) => {
    try {
      const order = await storage.updateKitchenStatus({
        orderId: parseInt(req.params.id),
        status: req.body.status
      });
      
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
      
      // Broadcast the updated order to all connected clients
      broadcastToAll({
        type: 'orderUpdated',
        data: order
      });
      
      res.json(order);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put('/api/orders/:id/bar-status', async (req, res) => {
    try {
      const order = await storage.updateBarStatus({
        orderId: parseInt(req.params.id),
        status: req.body.status
      });
      
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
      
      // Broadcast the updated order to all connected clients
      broadcastToAll({
        type: 'orderUpdated',
        data: order
      });
      
      res.json(order);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Admin routes
  app.post('/api/admin/purge-orders', async (req, res) => {
    try {
      const success = await storage.purgeAllOrders();
      
      if (success) {
        // Broadcast empty orders list to all connected clients
        broadcastToAll({
          type: 'ordersCleared',
          data: []
        });
        
        res.json({ success: true, message: 'All orders purged successfully' });
      } else {
        res.status(500).json({ success: false, message: 'Failed to purge orders' });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Error handler
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
  });

  // Serve static files
  const publicPath = path.resolve(__dirname, '../public');
  app.use(express.static(publicPath));

  // Serve index.html for all non-API routes
  app.get('*', (_req, res) => {
    res.sendFile(path.resolve(publicPath, 'index.html'));
  });

  return httpServer;
}

// Start the server
async function startServer() {
  // Check if we're only setting up the database (for initialization scripts)
  const setupDbOnly = process.argv.includes('--setup-db-only');
  
  try {
    console.log(`${new Date().toLocaleTimeString()} [express] Setting up database...`);
    await setupDatabase();
    console.log(`${new Date().toLocaleTimeString()} [express] Database setup complete`);
    
    if (setupDbOnly) {
      console.log('Database setup completed successfully. Exiting as requested.');
      process.exit(0);
    }
    
    const server = await setupRoutes();
    
    const port = 5000;
    server.listen({
      port,
      host: "0.0.0.0",
      reusePort: true,
    }, () => {
      console.log(`${new Date().toLocaleTimeString()} [express] serving on port ${port}`);
    });
  } catch (err) {
    console.error('Error during startup:', err);
    process.exit(1);
  }
}

startServer();