// Modified database setup for Docker production environment
// This file handles the path resolution explicitly without relying on path aliases

import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/pg-core';
import { eq as drizzleEq, and as drizzleAnd } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Export the drizzle operators
export const eq = drizzleEq;
export const and = drizzleAnd;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Attempt to load schema from possible locations
let schema;
try {
  // Try to find the schema file
  const possiblePaths = [
    path.join(__dirname, 'shared', 'schema.js'),
    path.join(__dirname, 'dist', 'shared', 'schema.js'),
    './shared/schema.js',
    './dist/shared/schema.js'
  ];
  
  let schemaPath = null;
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      schemaPath = p;
      console.log(`Found schema at: ${p}`);
      break;
    }
  }
  
  if (!schemaPath) {
    throw new Error('Could not find schema.js in any of the expected locations');
  }
  
  // Dynamic import using the file path
  schema = await import(schemaPath);
} catch (error) {
  console.error('Failed to load schema:', error);
  process.exit(1);
}

// Create database connection
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

console.log('Connecting to database...');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Export the database connection with schema
export const db = drizzle(pool, { schema });

// Export schema tables and types for convenience
export const {
  menuItems,
  toppings,
  menuItemToppings,
  tables,
  orders,
  users
} = schema;