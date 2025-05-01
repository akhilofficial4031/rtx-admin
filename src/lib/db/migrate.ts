import "dotenv/config";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { exec } from "child_process";
import util from "util";

const execPromise = util.promisify(exec);

// For migrations
const migrationClient = postgres(process.env.DATABASE_URL!, { max: 1 });
const db = drizzle(migrationClient);

// This is a flexible migration system that allows adding new tables easily
async function main() {
  try {
    console.log("🔄 Starting database migration process...");

    // Check if drizzle schema exists and create it if needed
    const schemaExists = await migrationClient`
      SELECT EXISTS (
        SELECT 1 FROM pg_namespace WHERE nspname = 'drizzle'
      )
    `;

    if (schemaExists[0].exists) {
      console.log("ℹ️ Drizzle schema already exists");
    } else {
      console.log("ℹ️ Creating drizzle schema...");
      await migrationClient`CREATE SCHEMA IF NOT EXISTS drizzle`;
      console.log("✅ Drizzle schema created");
    }

    // Get existing table list for reference
    const existingTables = await migrationClient`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    const existingTableNames = existingTables.map((t) => t.table_name);
    console.log("ℹ️ Existing tables:", existingTableNames);

    try {
      // Step 1: Create new migration files based on schema changes
      console.log("🔄 Generating new migration files...");
      const { stdout: genOutput, stderr: genError } = await execPromise(
        "npx drizzle-kit generate"
      );

      // If there were any changes to generate
      if (!genOutput.includes("No schema changes, nothing to migrate")) {
        console.log("✅ New migration files generated");
        console.log(genOutput);
      } else {
        console.log("ℹ️ No schema changes detected");
      }

      // If any errors
      if (genError) {
        console.warn("⚠️ Generation warnings:", genError);
      }

      // Step 2: Run the migrations
      console.log("🔄 Applying migrations to database...");
      try {
        await migrate(db, {
          migrationsFolder: "src/lib/db/migrations",
        });
        console.log("✅ Migrations completed successfully");
      } catch (migrateError) {
        // Handle common migration error - table already exists
        if (
          migrateError instanceof Error &&
          migrateError.message &&
          migrateError.message.includes("already exists")
        ) {
          console.log(
            "⚠️ Some tables already exist, continuing with other changes..."
          );

          // Get updated list of tables after attempted migration
          const updatedTables = await migrationClient`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
          `;

          // Find new tables added by the migration attempt
          const updatedTableNames = updatedTables.map((t) => t.table_name);
          const newTables = updatedTableNames.filter(
            (t) => !existingTableNames.includes(t)
          );

          if (newTables.length > 0) {
            console.log("✅ Successfully added these new tables:", newTables);
          } else {
            console.log("ℹ️ No new tables were added");
          }
        } else {
          // Other error types - rethrow
          throw migrateError;
        }
      }

      // Final verification
      const finalTables = await migrationClient`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `;
      console.log(
        "✅ Current database tables:",
        finalTables.map((t) => t.table_name)
      );

      console.log("🎉 Database migration process completed");
    } catch (error) {
      console.error("❌ Error during migration process:", error);
      throw error;
    }
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    await migrationClient.end();
  }
}

main();
