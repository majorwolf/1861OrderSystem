// Standalone server for Docker production environment
// This avoids any issues with TypeScript path aliases and module resolution

import express from 'express';
import { createServer } from 'http';
import ws from 'ws';
const { WebSocketServer } = ws;
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pkg from 'pg';
const { Pool } = pkg;
import { drizzle } from 'drizzle-orm/pg-core';
import { pgTable, serial, text, boolean, timestamp, integer, jsonb } from 'drizzle-orm/pg-core';
import { eq, and } from 'drizzle-orm';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ==== SCHEMA DEFINITION ====

// Define tables directly here to avoid any import issues
const menuItems = pgTable('menu_items', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  price: text('price').notNull(),
  category: text('category').notNull(),
  image: text('image'),
  available: boolean('available').default(true),
  createdAt: timestamp('created_at').defaultNow()
});

const toppings = pgTable('toppings', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  price: text('price').notNull(),
  category: text('category').notNull(),
  available: boolean('available').default(true),
  createdAt: timestamp('created_at').defaultNow()
});

const menuItemToppings = pgTable('menu_item_toppings', {
  id: serial('id').primaryKey(),
  menuItemId: integer('menu_item_id').notNull(),
  toppingId: integer('topping_id').notNull()
});

const tables = pgTable('tables', {
  id: serial('id').primaryKey(),
  number: integer('number').notNull(),
  seats: integer('seats').notNull(),
  status: text('status').default('available'),
  createdAt: timestamp('created_at').defaultNow()
});

const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  tableId: integer('table_id').notNull(),
  items: jsonb('items').notNull(),
  status: text('status').default('new'),
  kitchenStatus: text('kitchen_status').default('new'),
  barStatus: text('bar_status').default('new'),
  notes: text('notes'),
  lastName: text('last_name'),
  total: text('total'),
  createdAt: timestamp('created_at').defaultNow()
});

const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
  role: text('role').default('user'),
  createdAt: timestamp('created_at').defaultNow()
});

// ==== DATABASE CONNECTION ====

// Check for database URL
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

console.log('Connecting to database...');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Create drizzle database interface
const schema = { menuItems, toppings, menuItemToppings, tables, orders, users };
const db = drizzle(pool, { schema });

// ==== EXPRESS APP SETUP ====

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Logging middleware
function log(message, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}

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
      log(logLine);
    }
  });

  next();
});

// Error handler
app.use((err, _req, res, _next) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
  console.error(err);
});

// ==== API ROUTES ====

// Menu Items endpoints
app.get('/api/menu-items', async (req, res) => {
  try {
    const items = await db.select().from(menuItems);
    res.json(items);
  } catch (error) {
    console.error('Error fetching menu items:', error);
    res.status(500).json({ message: 'Failed to fetch menu items' });
  }
});

app.get('/api/menu-items/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [item] = await db.select().from(menuItems).where(eq(menuItems.id, id));
    
    if (!item) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    
    res.json(item);
  } catch (error) {
    console.error('Error fetching menu item:', error);
    res.status(500).json({ message: 'Failed to fetch menu item' });
  }
});

app.post('/api/menu-items', async (req, res) => {
  try {
    const [menuItem] = await db.insert(menuItems).values(req.body).returning();
    res.status(201).json(menuItem);
  } catch (error) {
    console.error('Error creating menu item:', error);
    res.status(500).json({ message: 'Failed to create menu item' });
  }
});

app.patch('/api/menu-items/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [updatedItem] = await db
      .update(menuItems)
      .set(req.body)
      .where(eq(menuItems.id, id))
      .returning();
    
    if (!updatedItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    
    // Broadcast update to all clients
    broadcastToAll({ type: 'menuItemUpdated', payload: updatedItem });
    
    res.json(updatedItem);
  } catch (error) {
    console.error('Error updating menu item:', error);
    res.status(500).json({ message: 'Failed to update menu item' });
  }
});

app.delete('/api/menu-items/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(menuItems).where(eq(menuItems.id, id));
    
    // Broadcast deletion to all clients
    broadcastToAll({ type: 'menuItemDeleted', payload: { id } });
    
    res.status(204).end();
  } catch (error) {
    console.error('Error deleting menu item:', error);
    res.status(500).json({ message: 'Failed to delete menu item' });
  }
});

// Tables endpoints
app.get('/api/tables', async (req, res) => {
  try {
    const allTables = await db.select().from(tables);
    res.json(allTables);
  } catch (error) {
    console.error('Error fetching tables:', error);
    res.status(500).json({ message: 'Failed to fetch tables' });
  }
});

// Orders endpoints
app.get('/api/orders', async (req, res) => {
  try {
    const allOrders = await db.select().from(orders);
    res.json(allOrders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const [order] = await db.insert(orders).values(req.body).returning();
    
    // Broadcast the new order to all clients
    broadcastToAll({ type: 'orderCreated', payload: order });
    
    res.status(201).json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Failed to create order' });
  }
});

app.patch('/api/orders/:id/status', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body;
    
    const [updatedOrder] = await db
      .update(orders)
      .set({ status })
      .where(eq(orders.id, id))
      .returning();
    
    if (!updatedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Broadcast the updated order to all clients
    broadcastToAll({ type: 'orderUpdated', payload: updatedOrder });
    
    res.json(updatedOrder);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Failed to update order status' });
  }
});

app.patch('/api/orders/:id/kitchen-status', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body;
    
    const [updatedOrder] = await db
      .update(orders)
      .set({ kitchenStatus: status })
      .where(eq(orders.id, id))
      .returning();
    
    if (!updatedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Broadcast the updated order to all clients
    broadcastToAll({ type: 'orderUpdated', payload: updatedOrder });
    
    res.json(updatedOrder);
  } catch (error) {
    console.error('Error updating kitchen status:', error);
    res.status(500).json({ message: 'Failed to update kitchen status' });
  }
});

app.patch('/api/orders/:id/bar-status', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body;
    
    const [updatedOrder] = await db
      .update(orders)
      .set({ barStatus: status })
      .where(eq(orders.id, id))
      .returning();
    
    if (!updatedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Broadcast the updated order to all clients
    broadcastToAll({ type: 'orderUpdated', payload: updatedOrder });
    
    res.json(updatedOrder);
  } catch (error) {
    console.error('Error updating bar status:', error);
    res.status(500).json({ message: 'Failed to update bar status' });
  }
});

// Toppings endpoints
app.get('/api/toppings', async (req, res) => {
  try {
    const allToppings = await db.select().from(toppings);
    res.json(allToppings);
  } catch (error) {
    console.error('Error fetching toppings:', error);
    res.status(500).json({ message: 'Failed to fetch toppings' });
  }
});

app.get('/api/toppings/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [topping] = await db.select().from(toppings).where(eq(toppings.id, id));
    
    if (!topping) {
      return res.status(404).json({ message: 'Topping not found' });
    }
    
    res.json(topping);
  } catch (error) {
    console.error('Error fetching topping:', error);
    res.status(500).json({ message: 'Failed to fetch topping' });
  }
});

app.post('/api/toppings', async (req, res) => {
  try {
    const [topping] = await db.insert(toppings).values(req.body).returning();
    res.status(201).json(topping);
  } catch (error) {
    console.error('Error creating topping:', error);
    res.status(500).json({ message: 'Failed to create topping' });
  }
});

app.patch('/api/toppings/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [updatedTopping] = await db
      .update(toppings)
      .set(req.body)
      .where(eq(toppings.id, id))
      .returning();
    
    if (!updatedTopping) {
      return res.status(404).json({ message: 'Topping not found' });
    }
    
    res.json(updatedTopping);
  } catch (error) {
    console.error('Error updating topping:', error);
    res.status(500).json({ message: 'Failed to update topping' });
  }
});

app.delete('/api/toppings/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(toppings).where(eq(toppings.id, id));
    res.status(204).end();
  } catch (error) {
    console.error('Error deleting topping:', error);
    res.status(500).json({ message: 'Failed to delete topping' });
  }
});

// Menu Item Toppings endpoints
app.get('/api/menu-items/:id/toppings', async (req, res) => {
  try {
    const menuItemId = parseInt(req.params.id);
    
    // Get all topping IDs for this menu item
    const menuItemToppingsList = await db
      .select()
      .from(menuItemToppings)
      .where(eq(menuItemToppings.menuItemId, menuItemId));
    
    if (menuItemToppingsList.length === 0) {
      return res.json([]);
    }
    
    // Extract the topping IDs
    const toppingIds = menuItemToppingsList.map(mit => mit.toppingId);
    
    // Get the actual topping details
    const result = [];
    for (const toppingId of toppingIds) {
      const [topping] = await db.select().from(toppings).where(eq(toppings.id, toppingId));
      if (topping) {
        result.push(topping);
      }
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching menu item toppings:', error);
    res.status(500).json({ message: 'Failed to fetch menu item toppings' });
  }
});

// Admin endpoints
app.post('/api/admin/purge-orders', async (req, res) => {
  try {
    await db.delete(orders);
    
    // Broadcast that orders have been purged
    broadcastToAll({ type: 'ordersPurged' });
    
    res.status(204).end();
  } catch (error) {
    console.error('Error purging orders:', error);
    res.status(500).json({ message: 'Failed to purge orders' });
  }
});

// ==== HTTP SERVER & WEBSOCKET SETUP ====

// Create HTTP server
const server = createServer(app);

// Setup WebSockets
const wss = new WebSocketServer({ server, path: '/ws' });
log('WebSocket server created');

// Broadcast to all clients
function broadcastToAll(data) {
  wss.clients.forEach((client) => {
    if (client.readyState === 1) { // WebSocket.OPEN
      client.send(JSON.stringify(data));
    }
  });
}

// Send initial data to client on connection
async function sendInitialData(ws) {
  try {
    // Get menu items
    const menuItemsList = await db.select().from(menuItems);
    ws.send(JSON.stringify({ type: 'menuItems', payload: menuItemsList }));

    // Get tables
    const tablesList = await db.select().from(tables);
    ws.send(JSON.stringify({ type: 'tables', payload: tablesList }));

    // Get orders
    const ordersList = await db.select().from(orders);
    ws.send(JSON.stringify({ type: 'orders', payload: ordersList }));
    
    // Get toppings
    const toppingsList = await db.select().from(toppings);
    ws.send(JSON.stringify({ type: 'toppings', payload: toppingsList }));
  } catch (error) {
    console.error('Error sending initial data:', error);
  }
}

// WebSocket connection handling
wss.on('connection', async (ws) => {
  log('Client connected');
  
  // Send initial data
  await sendInitialData(ws);
  
  // Handle incoming messages
  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);
      log(`Received: ${data.type}`);
      
      switch (data.type) {
        case 'createOrder':
          try {
            const [order] = await db.insert(orders).values(data.payload).returning();
            broadcastToAll({ type: 'orderCreated', payload: order });
          } catch (error) {
            console.error('Error creating order:', error);
          }
          break;
          
        case 'updateOrderStatus':
          try {
            const { id, status } = data.payload;
            const [updatedOrder] = await db
              .update(orders)
              .set({ status })
              .where(eq(orders.id, id))
              .returning();
            broadcastToAll({ type: 'orderUpdated', payload: updatedOrder });
          } catch (error) {
            console.error('Error updating order status:', error);
          }
          break;
          
        case 'updateKitchenStatus':
          try {
            const { id, status } = data.payload;
            const [updatedOrder] = await db
              .update(orders)
              .set({ kitchenStatus: status })
              .where(eq(orders.id, id))
              .returning();
            broadcastToAll({ type: 'orderUpdated', payload: updatedOrder });
          } catch (error) {
            console.error('Error updating kitchen status:', error);
          }
          break;
          
        case 'updateBarStatus':
          try {
            const { id, status } = data.payload;
            const [updatedOrder] = await db
              .update(orders)
              .set({ barStatus: status })
              .where(eq(orders.id, id))
              .returning();
            broadcastToAll({ type: 'orderUpdated', payload: updatedOrder });
          } catch (error) {
            console.error('Error updating bar status:', error);
          }
          break;
          
        case 'purgeOrders':
          try {
            await db.delete(orders);
            broadcastToAll({ type: 'ordersPurged' });
          } catch (error) {
            console.error('Error purging orders:', error);
          }
          break;
          
        default:
          log(`Unknown message type: ${data.type}`);
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });
  
  ws.on('close', () => {
    log('Client disconnected');
  });
});

// ==== STATIC FILE SERVING ====

// In Docker, static files are in the client/public directory
const staticPath = path.resolve(__dirname, 'client/public');
if (fs.existsSync(staticPath)) {
  app.use(express.static(staticPath));
  app.use('*', (req, res) => {
    res.sendFile(path.resolve(staticPath, 'index.html'));
  });
  log(`Serving static files from: ${staticPath}`);
} else {
  log(`WARNING: Static directory not found at ${staticPath}`);
}

// ==== DATABASE SETUP & SERVER START ====

// Check and report database status
async function setupDatabase() {
  try {
    // Check if menu items exist
    const menuItemsList = await db.select().from(menuItems);
    if (menuItemsList.length === 0) {
      log('No menu items found. Database may need initialization.');
    } else {
      log(`Found ${menuItemsList.length} menu items in the database.`);
    }
    
    // Check if tables exist
    const tablesList = await db.select().from(tables);
    if (tablesList.length === 0) {
      log('No tables found. Database may need initialization.');
    } else {
      log(`Found ${tablesList.length} tables in the database.`);
    }
    
    log('Database connection successful!');
  } catch (error) {
    console.error('Error checking database:', error);
    throw error;
  }
}

// Start server
const port = process.env.PORT || 5000;
async function startServer() {
  try {
    // Setup database
    log('Setting up database connection...');
    await setupDatabase();
    
    // Start the HTTP server
    server.listen({
      port,
      host: '0.0.0.0',
      reusePort: true
    }, () => {
      log(`Server running in production mode on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();