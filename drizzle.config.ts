import "dotenv/config";
import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

export default defineConfig({
  schema: "./src/lib/db/schema/*",
  out: "./src/lib/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  // Make drizzle not use IF NOT EXISTS statements
  // This will cause migrations to fail if tables already exist
  // but will allow schema changes to be applied
  strict: true,
});
