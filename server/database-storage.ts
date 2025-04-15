import { db } from "./db";
import { eq, desc, inArray, and } from "drizzle-orm";
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
    // Format price to always include the $ sign if not already present
    if (item.price && !item.price.startsWith('$')) {
      item.price = `$${item.price}`;
    }
    
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
    // Format price to always include the $ sign if not already present
    if (item.price && !item.price.startsWith('$')) {
      item.price = `$${item.price}`;
    }
    
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
  
  // Toppings
  async getToppings(): Promise<Topping[]> {
    return await db.select().from(toppings);
  }
  
  async getToppingsByCategory(category: string): Promise<Topping[]> {
    return await db.select().from(toppings).where(eq(toppings.category, category));
  }
  
  async getTopping(id: number): Promise<Topping | undefined> {
    const result = await db.select().from(toppings).where(eq(toppings.id, id));
    return result.length > 0 ? result[0] : undefined;
  }
  
  async createTopping(topping: InsertTopping): Promise<Topping> {
    // Format price to always include the $ sign if not already present
    if (topping.price && !topping.price.startsWith('$')) {
      topping.price = `$${topping.price}`;
    }
    
    const [newTopping] = await db.insert(toppings).values(topping).returning();
    return newTopping;
  }
  
  async updateToppingAvailability(id: number, available: boolean): Promise<Topping | undefined> {
    const updated = await db.update(toppings)
      .set({ available })
      .where(eq(toppings.id, id))
      .returning();
    
    return updated.length > 0 ? updated[0] : undefined;
  }
  
  async updateTopping(id: number, topping: Partial<InsertTopping>): Promise<Topping | undefined> {
    // Format price to always include the $ sign if not already present
    if (topping.price && !topping.price.startsWith('$')) {
      topping.price = `$${topping.price}`;
    }
    
    const updated = await db.update(toppings)
      .set(topping)
      .where(eq(toppings.id, id))
      .returning();
    
    return updated.length > 0 ? updated[0] : undefined;
  }
  
  async deleteTopping(id: number): Promise<boolean> {
    const deleted = await db.delete(toppings)
      .where(eq(toppings.id, id))
      .returning({ id: toppings.id });
    
    return deleted.length > 0;
  }
  
  // Menu Item Toppings (Presets)
  async getMenuItemToppings(menuItemId: number): Promise<Topping[]> {
    const result = await db
      .select({
        id: toppings.id,
        name: toppings.name,
        price: toppings.price,
        category: toppings.category,
        available: toppings.available
      })
      .from(menuItemToppings)
      .innerJoin(toppings, eq(menuItemToppings.toppingId, toppings.id))
      .where(eq(menuItemToppings.menuItemId, menuItemId));
    
    return result;
  }
  
  async addToppingToMenuItem(menuItemId: number, toppingId: number): Promise<boolean> {
    try {
      await db.insert(menuItemToppings).values({ menuItemId, toppingId });
      return true;
    } catch (error) {
      console.error('Error adding topping to menu item:', error);
      return false;
    }
  }
  
  async removeToppingFromMenuItem(menuItemId: number, toppingId: number): Promise<boolean> {
    const result = await db.delete(menuItemToppings)
      .where(
        and(
          eq(menuItemToppings.menuItemId, menuItemId),
          eq(menuItemToppings.toppingId, toppingId)
        )
      )
      .returning();
    
    return result.length > 0;
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