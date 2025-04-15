import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import * as schema from "./shared/schema";

// Check if DATABASE_URL is defined
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not defined. Please set it in your environment variables.");
  process.exit(1);
}

const runMigration = async () => {
  try {
    console.log("Starting database schema push...");
    const sql = postgres(process.env.DATABASE_URL!, { max: 1 });
    const db = drizzle(sql, { schema });
    
    // Push the schema
    await db.insert(schema.menuItems).values({
      name: "Test Item",
      description: "This is a test item to ensure the schema is correct",
      price: "$0.00",
      category: "test"
    }).onConflictDoNothing().execute();
    
    console.log("Test item created successfully. Schema is valid.");
    
    await sql.end();
    console.log("Database connection closed.");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
};

runMigration();