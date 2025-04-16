import { db } from './server/db.js';
import { menuItems, toppings, tables, menuItemToppings } from './shared/schema.js';
import { eq } from 'drizzle-orm';

/**
 * Seeds the database with initial data
 */
async function seedDatabase() {
  console.log('Seeding database...');
  
  try {
    // Seed menu items if none exist
    const existingMenuItems = await db.select().from(menuItems);
    if (existingMenuItems.length === 0) {
      console.log('Seeding menu items...');
      await seedMenuItems();
    } else {
      console.log(`Found ${existingMenuItems.length} existing menu items. Skipping seeding.`);
    }

    // Seed tables if none exist
    const existingTables = await db.select().from(tables);
    if (existingTables.length === 0) {
      console.log('Seeding tables...');
      await seedTables();
    } else {
      console.log(`Found ${existingTables.length} existing tables. Skipping seeding.`);
    }
    
    // Seed toppings if none exist
    const existingToppings = await db.select().from(toppings);
    if (existingToppings.length === 0) {
      console.log('Seeding toppings...');
      await seedToppings();
    } else {
      console.log(`Found ${existingToppings.length} existing toppings. Skipping seeding.`);
    }
    
    console.log('Database seeding complete!');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

async function seedMenuItems() {
  const pizzaItems = [
    {
      name: "Classic Pepperoni",
      description: "Pepperoni, mozzarella, tomato sauce",
      price: "$10.00+",
      category: "pizza",
      customizable: false,
      available: true
    },
    {
      name: "Margherita",
      description: "Fresh mozzarella, basil, tomato sauce",
      price: "$9.00+",
      category: "pizza",
      customizable: false,
      available: true
    },
    {
      name: "Wing T",
      description: "Grilled chicken, onion, buffalo sauce, blue cheese crumbles, shredded mozzarella & provolone",
      price: "$12.00+",
      category: "pizza",
      customizable: false,
      available: true
    },
    {
      name: "Parked at State Farm",
      description: "Grilled chicken, onion, honey sriracha, spinach, shredded mozzarella & provolone",
      price: "$12.00+",
      category: "pizza",
      customizable: false,
      available: true
    },
    {
      name: "Veggie Supreme",
      description: "Bell peppers, onions, mushrooms, olives, tomatoes, mozzarella",
      price: "$11.00+",
      category: "pizza",
      customizable: false,
      available: true
    },
    {
      name: "Meat Lover's",
      description: "Pepperoni, sausage, bacon, ham, ground beef, mozzarella",
      price: "$13.00+",
      category: "pizza",
      customizable: false,
      available: true
    },
    {
      name: "BBQ Chicken",
      description: "BBQ sauce, grilled chicken, red onions, cilantro, mozzarella",
      price: "$12.00+",
      category: "pizza", 
      customizable: false,
      available: true
    },
    {
      name: "Buffalo Chicken",
      description: "Buffalo sauce, grilled chicken, red onions, mozzarella, ranch drizzle",
      price: "$12.00+",
      category: "pizza",
      customizable: false,
      available: true
    },
    {
      name: "The Colony",
      description: "Grilled chicken, pesto, sun-dried tomatoes, shredded mozzarella & provolone",
      price: "$12.00+",
      category: "pizza",
      customizable: false,
      available: true
    },
    {
      name: "Four Cheese",
      description: "Mozzarella, cheddar, provolone, parmesan",
      price: "$10.00+",
      category: "pizza",
      customizable: false,
      available: true
    },
    {
      name: "Build Your Own Pizza",
      description: "Start with cheese and add your favorite toppings",
      price: "$8.00+",
      category: "pizza",
      customizable: true,
      available: true
    }
  ];
  
  const drinkItems = [
    {
      name: "Coke",
      description: "Coca-Cola 16oz",
      price: "$2.50",
      category: "drink",
      customizable: false,
      available: true
    },
    {
      name: "Diet Coke",
      description: "Diet Coca-Cola 16oz",
      price: "$2.50",
      category: "drink",
      customizable: false,
      available: true
    },
    {
      name: "Sprite",
      description: "Sprite 16oz",
      price: "$2.50",
      category: "drink",
      customizable: false,
      available: true
    },
    {
      name: "Sweet Tea",
      description: "Sweet iced tea 16oz",
      price: "$2.00", 
      category: "drink",
      customizable: false,
      available: true
    },
    {
      name: "Unsweetened Tea",
      description: "Unsweetened iced tea 16oz",
      price: "$2.00",
      category: "drink",
      customizable: false,
      available: true
    },
    {
      name: "Bottled Water",
      description: "16.9oz bottle", 
      price: "$1.50",
      category: "drink",
      customizable: false,
      available: true
    },
    {
      name: "Beer",
      description: "Ask server for selection", 
      price: "$5.00",
      category: "drink",
      customizable: false,
      available: true
    }
  ];
  
  // Insert all menu items
  await db.insert(menuItems).values([...pizzaItems, ...drinkItems]);
}

async function seedTables() {
  // Seed 20 tables
  const tableValues = Array.from({ length: 20 }, (_, i) => ({
    tableNumber: i + 1,
    seats: 4,
    location: i < 10 ? 'Main Dining' : 'Patio'
  }));
  
  await db.insert(tables).values(tableValues);
}

async function seedToppings() {
  const toppingsList = [
    // Meats
    { name: 'Pepperoni', price: '$1.50', category: 'meat', available: true },
    { name: 'Sausage', price: '$1.50', category: 'meat', available: true },
    { name: 'Bacon', price: '$1.50', category: 'meat', available: true },
    { name: 'Ham', price: '$1.50', category: 'meat', available: true },
    { name: 'Chicken', price: '$2.00', category: 'meat', available: true },
    { name: 'Beef', price: '$1.50', category: 'meat', available: true },
    
    // Veggies
    { name: 'Mushrooms', price: '$1.00', category: 'veggie', available: true },
    { name: 'Onions', price: '$1.00', category: 'veggie', available: true },
    { name: 'Bell Peppers', price: '$1.00', category: 'veggie', available: true },
    { name: 'Black Olives', price: '$1.00', category: 'veggie', available: true },
    { name: 'Tomatoes', price: '$1.00', category: 'veggie', available: true },
    { name: 'Pineapple', price: '$1.25', category: 'veggie', available: true },
    { name: 'Jalapeños', price: '$1.00', category: 'veggie', available: true },
    { name: 'Spinach', price: '$1.00', category: 'veggie', available: true },
    
    // Cheeses
    { name: 'Mozzarella', price: '$1.00', category: 'cheese', available: true },
    { name: 'Cheddar', price: '$1.00', category: 'cheese', available: true },
    { name: 'Provolone', price: '$1.00', category: 'cheese', available: true },
    { name: 'Parmesan', price: '$1.00', category: 'cheese', available: true },
    { name: 'Feta', price: '$1.25', category: 'cheese', available: true },
    { name: 'Blue Cheese', price: '$1.25', category: 'cheese', available: true },
  ];
  
  await db.insert(toppings).values(toppingsList);
  
  // Add preset toppings
  // First get the pizza items
  const pizzas = await db.select().from(menuItems).where(eq(menuItems.category, 'pizza'));
  const allToppings = await db.select().from(toppings);
  
  const getToppingByName = (name: string) => {
    return allToppings.find(t => t.name === name);
  };
  
  // Pepperoni Pizza
  const pepperoniPizza = pizzas.find(p => p.name === 'Classic Pepperoni');
  if (pepperoniPizza) {
    const pepperoniTopping = getToppingByName('Pepperoni');
    const mozzarellaTopping = getToppingByName('Mozzarella');
    
    if (pepperoniTopping && mozzarellaTopping) {
      await db.insert(menuItemToppings).values([
        { menuItemId: pepperoniPizza.id, toppingId: pepperoniTopping.id },
        { menuItemId: pepperoniPizza.id, toppingId: mozzarellaTopping.id }
      ]);
    }
  }
  
  // Margherita Pizza
  const margheritaPizza = pizzas.find(p => p.name === 'Margherita');
  if (margheritaPizza) {
    const mozzarellaTopping = getToppingByName('Mozzarella');
    const tomatoesTopping = getToppingByName('Tomatoes');
    
    if (mozzarellaTopping && tomatoesTopping) {
      await db.insert(menuItemToppings).values([
        { menuItemId: margheritaPizza.id, toppingId: mozzarellaTopping.id },
        { menuItemId: margheritaPizza.id, toppingId: tomatoesTopping.id }
      ]);
    }
  }
  
  // Wing T Pizza
  const wingTPizza = pizzas.find(p => p.name === 'Wing T');
  if (wingTPizza) {
    const chickenTopping = getToppingByName('Chicken');
    const onionsTopping = getToppingByName('Onions');
    const blueCheeseTopping = getToppingByName('Blue Cheese');
    const mozzarellaTopping = getToppingByName('Mozzarella');
    const provoloneTopping = getToppingByName('Provolone');
    
    if (chickenTopping && onionsTopping && blueCheeseTopping && mozzarellaTopping && provoloneTopping) {
      await db.insert(menuItemToppings).values([
        { menuItemId: wingTPizza.id, toppingId: chickenTopping.id },
        { menuItemId: wingTPizza.id, toppingId: onionsTopping.id },
        { menuItemId: wingTPizza.id, toppingId: blueCheeseTopping.id },
        { menuItemId: wingTPizza.id, toppingId: mozzarellaTopping.id },
        { menuItemId: wingTPizza.id, toppingId: provoloneTopping.id }
      ]);
    }
  }
  
  // Parked at State Farm Pizza
  const stateFarmPizza = pizzas.find(p => p.name === 'Parked at State Farm');
  if (stateFarmPizza) {
    const chickenTopping = getToppingByName('Chicken');
    const onionsTopping = getToppingByName('Onions');
    const spinachTopping = getToppingByName('Spinach');
    const mozzarellaTopping = getToppingByName('Mozzarella');
    const provoloneTopping = getToppingByName('Provolone');
    
    if (chickenTopping && onionsTopping && spinachTopping && mozzarellaTopping && provoloneTopping) {
      await db.insert(menuItemToppings).values([
        { menuItemId: stateFarmPizza.id, toppingId: chickenTopping.id },
        { menuItemId: stateFarmPizza.id, toppingId: onionsTopping.id },
        { menuItemId: stateFarmPizza.id, toppingId: spinachTopping.id },
        { menuItemId: stateFarmPizza.id, toppingId: mozzarellaTopping.id },
        { menuItemId: stateFarmPizza.id, toppingId: provoloneTopping.id }
      ]);
    }
  }
}

// Run the seeding function
seedDatabase()
  .then(() => {
    console.log('Database seeding completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error during database seeding:', error);
    process.exit(1);
  });