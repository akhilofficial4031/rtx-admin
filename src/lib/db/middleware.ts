import { NextRequest, NextResponse } from "next/server";
import { db, supabase } from "@/lib/db";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { SupabaseClient } from "@supabase/supabase-js";

/**
 * Middleware function for handling database connections in API routes
 * This allows you to use the same db instance across API routes
 */
export async function withDb(
  req: NextRequest,
  handler: (
    req: NextRequest,
    db: PostgresJsDatabase<Record<string, never>>,
    supabase: SupabaseClient
  ) => Promise<NextResponse>
) {
  try {
    return await handler(req, db, supabase);
  } catch (error) {
    console.error("[Database Error]:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
