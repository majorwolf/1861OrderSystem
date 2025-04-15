import { db } from "./db";
import { 
  menuItems,
  tables,
  InsertMenuItem,
  InsertTable
} from "@shared/schema";
import { log } from "./vite";

// Function to set up initial data
export async function setupDatabase() {
  try {
    // Check if tables exist and have data
    const existingMenuItems = await db.select().from(menuItems);
    const existingTables = await db.select().from(tables);
    
    // Only seed data if tables are empty
    if (existingMenuItems.length === 0) {
      log('No menu items found. Seeding initial menu data...');
      await seedMenuItems();
    } else {
      log(`Found ${existingMenuItems.length} existing menu items. Skipping seeding.`);
    }
    
    if (existingTables.length === 0) {
      log('No tables found. Creating initial tables...');
      await seedTables();
    } else {
      log(`Found ${existingTables.length} existing tables. Skipping seeding.`);
    }
    
    log('Database setup complete!');
  } catch (error) {
    console.error('Error setting up database:', error);
  }
}

// Seed initial menu items
async function seedMenuItems() {
  const pizzas: InsertMenuItem[] = [
    { name: "The Pirate", description: "Sun-dried tomatoes, onion, spinach, tomato sauce, mushrooms, green peppers, shredded mozzarella & provolone", price: "$12.00+", category: "pizza" },
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

  const drinks: InsertMenuItem[] = [
    { name: "Coke", description: "Coca-Cola 16oz", price: "$2.50", category: "drink" },
    { name: "Diet Coke", description: "Diet Coca-Cola 16oz", price: "$2.50", category: "drink" },
    { name: "Sprite", description: "Sprite 16oz", price: "$2.50", category: "drink" },
    { name: "Water", description: "Bottled water", price: "$1.50", category: "drink" },
    { name: "Craft Beer", description: "Local IPA", price: "$6.00", category: "drink" },
    { name: "House Wine", description: "Red or White", price: "$7.00", category: "drink" },
  ];

  try {
    // Insert all menu items in a single batch
    await db.insert(menuItems).values([...pizzas, ...drinks]);
    log(`Successfully added ${pizzas.length + drinks.length} menu items`);
  } catch (error) {
    console.error('Error seeding menu items:', error);
  }
}

// Seed initial tables
async function seedTables() {
  try {
    const tableEntries: InsertTable[] = [];
    
    // Create 20 tables
    for (let i = 1; i <= 20; i++) {
      tableEntries.push({ tableNumber: i, active: true });
    }
    
    await db.insert(tables).values(tableEntries);
    log(`Successfully added ${tableEntries.length} tables`);
  } catch (error) {
    console.error('Error seeding tables:', error);
  }
}