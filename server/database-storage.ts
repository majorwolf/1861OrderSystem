import { db } from "./db";
import { eq, desc, inArray } from "drizzle-orm";
import { 
  MenuItem, InsertMenuItem, 
  Table, InsertTable, 
  Order, InsertOrder,
  OrderStatusUpdate,
  Topping, InsertTopping,
  MenuItemTopping, InsertMenuItemTopping,
  menuItems,
  tables,
  orders,
  toppings,
  menuItemToppings
} from "@shared/schema";
import { IStorage } from "./storage";

export class DatabaseStorage implements IStorage {
  // Menu items
  async getMenuItems(): Promise<MenuItem[]> {
    return await db.select().from(menuItems);
  }
  
  async getMenuItemsByCategory(category: string): Promise<MenuItem[]> {
    return await db.select().from(menuItems).where(eq(menuItems.category, category));
  }
  
  async getMenuItem(id: number): Promise<MenuItem | undefined> {
    const items = await db.select().from(menuItems).where(eq(menuItems.id, id));
    return items.length > 0 ? items[0] : undefined;
  }
  
  async createMenuItem(item: InsertMenuItem): Promise<MenuItem> {
    const [newItem] = await db.insert(menuItems).values(item).returning();
    return newItem;
  }
  
  async updateMenuItemAvailability(id: number, available: boolean): Promise<MenuItem | undefined> {
    const items = await db.update(menuItems)
      .set({ available })
      .where(eq(menuItems.id, id))
      .returning();
    
    return items.length > 0 ? items[0] : undefined;
  }
  
  async updateMenuItem(id: number, item: Partial<InsertMenuItem>): Promise<MenuItem | undefined> {
    const items = await db.update(menuItems)
      .set(item)
      .where(eq(menuItems.id, id))
      .returning();
      
    return items.length > 0 ? items[0] : undefined;
  }
  
  async deleteMenuItem(id: number): Promise<boolean> {
    const deleted = await db.delete(menuItems)
      .where(eq(menuItems.id, id))
      .returning({ id: menuItems.id });
    
    return deleted.length > 0;
  }
  
  // Tables
  async getTables(): Promise<Table[]> {
    return await db.select().from(tables);
  }
  
  async getTable(id: number): Promise<Table | undefined> {
    const result = await db.select().from(tables).where(eq(tables.id, id));
    return result.length > 0 ? result[0] : undefined;
  }
  
  async getTableByNumber(tableNumber: number): Promise<Table | undefined> {
    const result = await db.select().from(tables).where(eq(tables.tableNumber, tableNumber));
    return result.length > 0 ? result[0] : undefined;
  }
  
  async createTable(table: InsertTable): Promise<Table> {
    const [newTable] = await db.insert(tables).values(table).returning();
    return newTable;
  }
  
  // Orders
  async getOrders(): Promise<Order[]> {
    return await db.select().from(orders).orderBy(desc(orders.createdAt));
  }
  
  async getOrdersByType(type: string): Promise<Order[]> {
    return await db.select().from(orders)
      .where(eq(orders.type, type))
      .orderBy(desc(orders.createdAt));
  }
  
  async getOrdersByTableId(tableId: number): Promise<Order[]> {
    return await db.select().from(orders)
      .where(eq(orders.tableId, tableId))
      .orderBy(desc(orders.createdAt));
  }
  
  async getOrdersByStatus(status: string): Promise<Order[]> {
    return await db.select().from(orders)
      .where(eq(orders.status, status))
      .orderBy(desc(orders.createdAt));
  }
  
  async getOrder(id: number): Promise<Order | undefined> {
    const result = await db.select().from(orders).where(eq(orders.id, id));
    return result.length > 0 ? result[0] : undefined;
  }
  
  async createOrder(order: InsertOrder): Promise<Order> {
    const [newOrder] = await db.insert(orders).values(order).returning();
    return newOrder;
  }
  
  async updateOrderStatus(update: OrderStatusUpdate): Promise<Order | undefined> {
    const updatedOrders = await db.update(orders)
      .set({ status: update.status })
      .where(eq(orders.id, update.id))
      .returning();
    
    return updatedOrders.length > 0 ? updatedOrders[0] : undefined;
  }
}