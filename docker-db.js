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

// Import PostgreSQL table definition helpers
const pgHelpers = await import('drizzle-orm/pg-core');
const { pgTable, serial, text, boolean, timestamp, integer, jsonb } = pgHelpers;

// Create tables schema for production
const tablesSchema = {};

// Menu items table
tablesSchema.menuItems = pgTable('menu_items', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  price: text('price').notNull(),
  category: text('category').notNull(),
  image: text('image'),
  available: boolean('available').default(true),
  createdAt: timestamp('created_at').defaultNow()
});

// Toppings table
tablesSchema.toppings = pgTable('toppings', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  price: text('price').notNull(),
  category: text('category').notNull(),
  available: boolean('available').default(true),
  createdAt: timestamp('created_at').defaultNow()
});

// Menu item toppings table (junction table)
tablesSchema.menuItemToppings = pgTable('menu_item_toppings', {
  id: serial('id').primaryKey(),
  menuItemId: integer('menu_item_id').notNull(),
  toppingId: integer('topping_id').notNull()
});

// Tables table
tablesSchema.tables = pgTable('tables', {
  id: serial('id').primaryKey(),
  number: integer('number').notNull(),
  seats: integer('seats').notNull(),
  status: text('status').default('available'),
  createdAt: timestamp('created_at').defaultNow()
});

// Orders table
tablesSchema.orders = pgTable('orders', {
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

// Users table
tablesSchema.users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
  role: text('role').default('user'),
  createdAt: timestamp('created_at').defaultNow()
});

// Create database connection
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

console.log('Connecting to database...');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Export the database connection with schema
export const db = drizzle(pool, { schema: tablesSchema });

// Export individual tables
export const menuItems = tablesSchema.menuItems;
export const toppings = tablesSchema.toppings;
export const menuItemToppings = tablesSchema.menuItemToppings;
export const tables = tablesSchema.tables;
export const orders = tablesSchema.orders;
export const users = tablesSchema.users;