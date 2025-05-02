/* eslint-disable @typescript-eslint/no-explicit-any */
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "@/lib/env";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";

// Declare variables that will be populated
let db: PostgresJsDatabase;
let supabase: SupabaseClient;

// For use in a Node.js environment (migrations/seeding)
try {
  // Configure postgres with better timeout and error handling
  const migrationClient = postgres(env.DATABASE_URL, {
    max: 1,
    idle_timeout: 20,
    connect_timeout: 10,
    onnotice: () => {}, // Suppress notice messages
  });

  db = drizzle(migrationClient);
} catch (error) {
  console.error("Database connection error:", error);
  // Provide a mock db if connection fails (for development only)
  if (process.env.NODE_ENV !== "production") {
    console.warn("Using mock database for development");
    const mockClient = {
      query: async () => Promise.resolve([]),
    };
    db = drizzle(mockClient as any);
  } else {
    throw error; // Re-throw in production
  }
}

// For use with Supabase authentication
try {
  supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
} catch (error) {
  console.error("Supabase client creation error:", error);
  if (process.env.NODE_ENV !== "production") {
    console.warn("Using mock Supabase client for development");
    supabase = {
      auth: {
        signIn: async () =>
          Promise.resolve({
            user: null,
            error: new Error("Mock Supabase client"),
          }),
        signOut: async () => Promise.resolve(),
      },
    } as unknown as SupabaseClient;
  } else {
    throw error; // Re-throw in production
  }
}

export { db, supabase };
