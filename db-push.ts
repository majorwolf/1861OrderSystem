import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { menuItems, tables, orders } from './shared/schema';
import ws from 'ws';

// Set WebSocket constructor
neonConfig.webSocketConstructor = ws;

// Check if DATABASE_URL is defined
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not defined. Please set it in your environment variables.");
  process.exit(1);
}

const createSchema = async () => {
  try {
    console.log("Starting database schema creation...");
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const db = drizzle(pool);
    
    // Create the tables
    console.log("Creating menuItems table...");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS menu_items (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        price TEXT NOT NULL,
        category TEXT NOT NULL,
        customizable BOOLEAN DEFAULT FALSE,
        available BOOLEAN DEFAULT TRUE
      );
    `);
    
    console.log("Creating tables table...");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tables (
        id SERIAL PRIMARY KEY,
        table_number INTEGER NOT NULL UNIQUE,
        active BOOLEAN DEFAULT TRUE
      );
    `);
    
    console.log("Creating orders table...");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        table_id INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'new',
        type TEXT NOT NULL,
        items JSONB NOT NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    console.log("Schema created successfully!");
    
    // Add a test item to verify everything works
    try {
      await db.insert(menuItems).values({
        name: "Test Item",
        description: "This is a test item to ensure the schema is correct",
        price: "$0.00",
        category: "test"
      }).onConflictDoNothing();
      console.log("Test item created successfully. Schema is valid.");
    } catch (error) {
      console.error("Error adding test item:", error);
    }
    
    await pool.end();
    console.log("Database connection closed.");
    process.exit(0);
  } catch (error) {
    console.error("Schema creation failed:", error);
    process.exit(1);
  }
};

createSchema();