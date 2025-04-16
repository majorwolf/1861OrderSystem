// Production server entry point for Docker

import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
// Import our custom Docker-compatible database module
import { db, menuItems, tables, orders, eq } from './docker-db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// ----- API Routes -----

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

// ----- Static file serving -----
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

// ----- Database Setup -----
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

// ----- Start server -----
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