// This is a simple script to start the application in production mode in Docker
// avoiding the Vite dependency issue

import { createServer } from 'http';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Dynamic imports to handle ESM paths correctly
const importRoutes = async () => {
  return await import('./server/routes.js');
};

const importDbSetup = async () => {
  return await import('./server/db-setup.js');
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

function log(message, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

// Middleware for logging API requests
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

// Error handling middleware
app.use((err, _req, res, _next) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(status).json({ message });
  console.error(err);
});

// Serve static files
const serveStatic = () => {
  // Check multiple possible paths for static files
  const possiblePaths = [
    path.resolve(__dirname, 'client/public'),
    path.resolve(__dirname, 'dist/client')
  ];
  
  let distPath = null;
  
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      distPath = p;
      break;
    }
  }
  
  if (!distPath) {
    log('Checking available directories:', 'error');
    log(`Current dir: ${__dirname}`, 'error');
    log(`Contents: ${fs.readdirSync(__dirname).join(', ')}`, 'error');
    throw new Error('Could not find the static files directory. Make sure to build the client first.');
  }
  
  log(`Serving static files from: ${distPath}`);
  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
};

async function startServer() {
  try {
    // Dynamically import modules
    const { setupDatabase } = await importDbSetup();
    const { registerRoutes } = await importRoutes();
    
    // Setup the database first
    log('Setting up database...');
    await setupDatabase();
    log('Database setup complete');
    
    // Register routes
    const server = await registerRoutes(app);
    
    // Serve static files
    serveStatic();
    
    // Start the server
    const port = process.env.PORT || 5000;
    server.listen({
      port,
      host: "0.0.0.0",
      reusePort: true,
    }, () => {
      log(`Server running in production mode on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();