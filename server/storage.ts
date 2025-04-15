import { 
  MenuItem, InsertMenuItem, 
  Table, InsertTable, 
  Order, InsertOrder,
  OrderStatusUpdate,
  menuItems
} from "@shared/schema";

// Storage interface
export interface IStorage {
  // Menu items
  getMenuItems(): Promise<MenuItem[]>;
  getMenuItemsByCategory(category: string): Promise<MenuItem[]>;
  getMenuItem(id: number): Promise<MenuItem | undefined>;
  createMenuItem(item: InsertMenuItem): Promise<MenuItem>;
  updateMenuItemAvailability(id: number, available: boolean): Promise<MenuItem | undefined>;
  updateMenuItem(id: number, item: Partial<InsertMenuItem>): Promise<MenuItem | undefined>;
  deleteMenuItem(id: number): Promise<boolean>;

  // Tables
  getTables(): Promise<Table[]>;
  getTable(id: number): Promise<Table | undefined>;
  getTableByNumber(tableNumber: number): Promise<Table | undefined>;
  createTable(table: InsertTable): Promise<Table>;

  // Orders
  getOrders(): Promise<Order[]>;
  getOrdersByType(type: string): Promise<Order[]>;
  getOrdersByTableId(tableId: number): Promise<Order[]>;
  getOrdersByStatus(status: string): Promise<Order[]>;
  getOrder(id: number): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(update: OrderStatusUpdate): Promise<Order | undefined>;
}

export class MemStorage implements IStorage {
  private menuItems: Map<number, MenuItem>;
  private tables: Map<number, Table>;
  private orders: Map<number, Order>;
  
  private menuItemId: number;
  private tableId: number;
  private orderId: number;

  constructor() {
    this.menuItems = new Map();
    this.tables = new Map();
    this.orders = new Map();
    
    this.menuItemId = 1;
    this.tableId = 1;
    this.orderId = 1;
    
    // Initialize with some menu items
    this.initializeMenuItems();
    this.initializeTables();
  }

  private initializeMenuItems() {
    const pizzas = [
      { name: "The Pirate", description: "Sun-dried tomatoes, onion, spinach, tomato sauce, mushrooms, green peppers, shredded mozzarella & provolon", price: "$12.00+", category: "pizza" },
      { name: "Wing T", description: "Grilled chicken, onion, buffalo sauce, blue cheese crumbles, shredded mozzarella & provolone", price: "$12.00+", category: "pizza" },
      { name: "Parked at State Farm", description: "Grilled chicken, onion, honey sriracha, spinach, shredded mozzarella & provolone", price: "$12.00+", category: "pizza" },
      { name: "The Elliot", description: "Pepperoni, tomato sauce, shredded mozzarella & provolone", price: "$10.00+", category: "pizza" },
      { name: "The Angelo", description: "Pineapple, ham, bacon, jalapeno, tomato sauce, shredded mozzarella & provolone", price: "$12.00+", category: "pizza" },
      { name: "Build Your Own Pizza", description: "Choose your own toppings and create a custom pizza", price: "$12.00+", category: "pizza", customizable: true },
      { name: "The Starkey", description: "Pepperoni, sausage, ham, bacon, tomato sauce, shredded mozzarella & provolone", price: "$12.00+", category: "pizza" },
      { name: "The Colony", description: "Grilled chicken, pesto, sun-dried tomatoes, shredded mozzarella & provolone", price: "$12.00+", category: "pizza" },
      { name: "Supreme Pizza", description: "Tomato sauce, pepperoni, sausage, green peppers, onions, black olives, mushrooms, mozzarella & provolone", price: "$14.00+", category: "pizza" },
      { name: "Chicken Bacon Ranch Pizza", description: "Grilled chicken, bacon, housemade ranch, spinach, mozzarella & provolone", price: "$12.00+", category: "pizza" },
    ];

    const drinks = [
      { name: "Coke", description: "Coca-Cola 16oz", price: "$2.50", category: "drink" },
      { name: "Diet Coke", description: "Diet Coca-Cola 16oz", price: "$2.50", category: "drink" },
      { name: "Sprite", description: "Sprite 16oz", price: "$2.50", category: "drink" },
      { name: "Water", description: "Bottled water", price: "$1.50", category: "drink" },
      { name: "Craft Beer", description: "Local IPA", price: "$6.00", category: "drink" },
      { name: "House Wine", description: "Red or White", price: "$7.00", category: "drink" },
    ];

    [...pizzas, ...drinks].forEach(item => {
      this.createMenuItem(item as InsertMenuItem);
    });
  }

  private initializeTables() {
    // Create 20 tables
    for (let i = 1; i <= 20; i++) {
      this.createTable({ tableNumber: i, active: true });
    }
  }

  // Menu Items
  async getMenuItems(): Promise<MenuItem[]> {
    return Array.from(this.menuItems.values());
  }

  async getMenuItemsByCategory(category: string): Promise<MenuItem[]> {
    return Array.from(this.menuItems.values()).filter(
      item => item.category === category
    );
  }

  async getMenuItem(id: number): Promise<MenuItem | undefined> {
    return this.menuItems.get(id);
  }

  async createMenuItem(item: InsertMenuItem): Promise<MenuItem> {
    const id = this.menuItemId++;
    const menuItem: MenuItem = { 
      ...item, 
      id,
      // Set defaults for new items
      available: item.available !== undefined ? item.available : true,
      customizable: item.customizable !== undefined ? item.customizable : false
    };
    this.menuItems.set(id, menuItem);
    return menuItem;
  }
  
  async updateMenuItemAvailability(id: number, available: boolean): Promise<MenuItem | undefined> {
    const menuItem = this.menuItems.get(id);
    if (!menuItem) {
      return undefined;
    }
    
    const updatedMenuItem = { ...menuItem, available };
    this.menuItems.set(id, updatedMenuItem);
    return updatedMenuItem;
  }
  
  async updateMenuItem(id: number, item: Partial<InsertMenuItem>): Promise<MenuItem | undefined> {
    const menuItem = this.menuItems.get(id);
    if (!menuItem) {
      return undefined;
    }
    
    const updatedMenuItem = { ...menuItem, ...item };
    this.menuItems.set(id, updatedMenuItem);
    return updatedMenuItem;
  }
  
  async deleteMenuItem(id: number): Promise<boolean> {
    const exists = this.menuItems.has(id);
    if (!exists) {
      return false;
    }
    
    this.menuItems.delete(id);
    return true;
  }

  // Tables
  async getTables(): Promise<Table[]> {
    return Array.from(this.tables.values());
  }

  async getTable(id: number): Promise<Table | undefined> {
    return this.tables.get(id);
  }

  async getTableByNumber(tableNumber: number): Promise<Table | undefined> {
    return Array.from(this.tables.values()).find(
      table => table.tableNumber === tableNumber
    );
  }

  async createTable(table: InsertTable): Promise<Table> {
    const id = this.tableId++;
    const newTable: Table = { ...table, id };
    this.tables.set(id, newTable);
    return newTable;
  }

  // Orders
  async getOrders(): Promise<Order[]> {
    return Array.from(this.orders.values());
  }

  async getOrdersByType(type: string): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(
      order => order.type === type
    );
  }

  async getOrdersByTableId(tableId: number): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(
      order => order.tableId === tableId
    );
  }

  async getOrdersByStatus(status: string): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(
      order => order.status === status
    );
  }

  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const id = this.orderId++;
    const createdAt = new Date();
    const newOrder: Order = { ...order, id, createdAt };
    this.orders.set(id, newOrder);
    return newOrder;
  }

  async updateOrderStatus(update: OrderStatusUpdate): Promise<Order | undefined> {
    const order = this.orders.get(update.id);
    if (!order) {
      return undefined;
    }
    
    const updatedOrder: Order = { ...order, status: update.status };
    this.orders.set(update.id, updatedOrder);
    return updatedOrder;
  }
}

// Import the DatabaseStorage class
import { DatabaseStorage } from "./database-storage";

// Use the DatabaseStorage implementation instead of MemStorage for persistence
export const storage = new DatabaseStorage();
