// Standalone schema definition for Docker deployment
// This avoids any issues with TypeScript path aliases

import { pgTable, serial, text, boolean, timestamp, integer, jsonb } from 'drizzle-orm/pg-core';

// Define tables directly
export const menuItems = pgTable('menu_items', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  price: text('price').notNull(),
  category: text('category').notNull(),
  image: text('image'),
  available: boolean('available').default(true),
  createdAt: timestamp('created_at').defaultNow()
});

export const toppings = pgTable('toppings', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  price: text('price').notNull(),
  category: text('category').notNull(),
  available: boolean('available').default(true),
  createdAt: timestamp('created_at').defaultNow()
});

export const menuItemToppings = pgTable('menu_item_toppings', {
  id: serial('id').primaryKey(),
  menuItemId: integer('menu_item_id').notNull(),
  toppingId: integer('topping_id').notNull()
});

export const tables = pgTable('tables', {
  id: serial('id').primaryKey(),
  number: integer('number').notNull(),
  seats: integer('seats').notNull(),
  status: text('status').default('available'),
  createdAt: timestamp('created_at').defaultNow()
});

export const orders = pgTable('orders', {
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

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
  role: text('role').default('user'),
  createdAt: timestamp('created_at').defaultNow()
});