import { pgTable, text, serial, integer, timestamp, boolean, json, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Toppings table (ingredients for pizzas)
export const toppings = pgTable("toppings", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  price: text("price").notNull(), // Store as text to handle "$1.50" format
  category: text("category").notNull().default("regular"), // "regular", "cheese", "meat", "veggie"
  available: boolean("available").default(true),
});

export const insertToppingSchema = createInsertSchema(toppings).omit({
  id: true,
});

// Menu items table (pizzas, drinks, etc.)
export const menuItems = pgTable("menu_items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: text("price").notNull(), // Store as text to handle "$12.00+" format
  category: text("category").notNull(), // "pizza", "drink", etc.
  customizable: boolean("customizable").default(false),
  available: boolean("available").default(true),
});

export const insertMenuItemSchema = createInsertSchema(menuItems).omit({
  id: true,
});

// Menu Item Toppings - Junction table for preset toppings
export const menuItemToppings = pgTable("menu_item_toppings", {
  menuItemId: integer("menu_item_id").notNull().references(() => menuItems.id, { onDelete: 'cascade' }),
  toppingId: integer("topping_id").notNull().references(() => toppings.id, { onDelete: 'cascade' }),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.menuItemId, table.toppingId] }),
  };
});

export const insertMenuItemToppingSchema = createInsertSchema(menuItemToppings);

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
  status: text("status").notNull().default("new"), // "new", "preparing", "ready", "completed" - to be deprecated
  kitchenStatus: text("kitchen_status").notNull().default("new"), // "new", "preparing", "ready", "completed"
  barStatus: text("bar_status").notNull().default("new"), // "new", "preparing", "ready", "completed"
  type: text("type").notNull(), // "kitchen", "bar", or "both"
  items: json("items").notNull().$type<OrderItem[]>(), // Array of order items
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
});

// Define the topping item type
export interface ToppingItem {
  id: number;
  name: string;
  price: string;
}

// Define the order item type with TypeScript
export interface OrderItem {
  menuItemId: number;
  name: string;
  quantity: number;
  price: string;
  notes?: string;
  size?: string; // "Regular", "Large", etc.
  category?: string; // "pizza", "drink", etc.
  addedToppings?: ToppingItem[]; // Toppings added to the pizza
  removedToppings?: ToppingItem[]; // Toppings removed from the pizza
}

// Order status update schema
export const orderStatusUpdateSchema = z.object({
  id: z.number(),
  status: z.enum(["new", "preparing", "ready", "completed"]),
});

// Type definitions
export type MenuItem = typeof menuItems.$inferSelect;
export type InsertMenuItem = z.infer<typeof insertMenuItemSchema>;

export type Topping = typeof toppings.$inferSelect;
export type InsertTopping = z.infer<typeof insertToppingSchema>;

export type MenuItemTopping = typeof menuItemToppings.$inferSelect;
export type InsertMenuItemTopping = z.infer<typeof insertMenuItemToppingSchema>;

export type Table = typeof tables.$inferSelect;
export type InsertTable = z.infer<typeof insertTableSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type OrderStatusUpdate = z.infer<typeof orderStatusUpdateSchema>;
