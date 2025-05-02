import { NextRequest, NextResponse } from "next/server";
import { withDb } from "@/lib/db/middleware";
import { sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    // Attempt to connect to the database
    return await withDb(req, async (req, db) => {
      try {
        // Try a simple query to verify database connection
        const result = await db.execute(sql`SELECT 1 as connected`);

        console.log("Database connection test result:", result);

        // Check database table info
        const tablesQuery = await db.execute(sql`
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public'
        `);

        console.log("Available tables:", tablesQuery);

        return NextResponse.json({
          status: "success",
          message: "Database connection successful",
          dbInfo: {
            connected: true,
            tables: tablesQuery.rows || [],
          },
        });
      } catch (dbError) {
        console.error("Database connection test failed:", dbError);
        return NextResponse.json(
          {
            status: "error",
            message: "Database connection failed",
            error:
              dbError instanceof Error
                ? dbError.message
                : "Unknown database error",
          },
          { status: 500 }
        );
      }
    });
  } catch (outerError) {
    console.error("Error in database connection test route:", outerError);
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to test database connection",
        error:
          outerError instanceof Error
            ? outerError.message
            : "Unknown middleware error",
      },
      { status: 500 }
    );
  }
}
