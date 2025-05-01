import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "@/lib/env";

// For use in a Node.js environment (migrations/seeding)
export const migrationClient = postgres(env.DATABASE_URL);
export const db = drizzle(migrationClient);

// For use with Supabase authentication
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
