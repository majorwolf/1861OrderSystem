import { pgTable, text, serial, integer, timestamp, boolean, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Menu items table (pizzas, drinks, etc.)
export const menuItems = pgTable("menu_items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: text("price").notNull(), // Store as text to handle "$12.00+" format
  category: text("category").notNull(), // "pizza", "drink", etc.
  customizable: boolean("customizable").default(false),
});

export const insertMenuItemSchema = createInsertSchema(menuItems).omit({
  id: true,
});

// Tables for the restaurant
export const tables = pgTable("tables", {
  id: serial("id").primaryKey(),
  tableNumber: integer("table_number").notNull().unique(),
  active: boolean("active").default(true),
});

export const insertTableSchema = createInsertSchema(tables).omit({
  id: true,
});

// Orders
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  tableId: integer("table_id").notNull(),
  status: text("status").notNull().default("new"), // "new", "preparing", "ready", "completed"
  type: text("type").notNull(), // "kitchen" or "bar"
  items: json("items").notNull().$type<OrderItem[]>(), // Array of order items
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
});

// Define the order item type with TypeScript
export interface OrderItem {
  menuItemId: number;
  name: string;
  quantity: number;
  price: string;
  notes?: string;
  size?: string; // "Regular", "Large", etc.
}

// Order status update schema
export const orderStatusUpdateSchema = z.object({
  id: z.number(),
  status: z.enum(["new", "preparing", "ready", "completed"]),
});

// Type definitions
export type MenuItem = typeof menuItems.$inferSelect;
export type InsertMenuItem = z.infer<typeof insertMenuItemSchema>;

export type Table = typeof tables.$inferSelect;
export type InsertTable = z.infer<typeof insertTableSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type OrderStatusUpdate = z.infer<typeof orderStatusUpdateSchema>;
