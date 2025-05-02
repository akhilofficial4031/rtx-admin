import { NextRequest, NextResponse } from "next/server";
import { withDb } from "@/lib/db/middleware";
import { eq } from "drizzle-orm";
import { users } from "@/lib/db/schema";

// Mock users data for fallback
const MOCK_USERS = [
  { id: "user1", name: "John Doe", email: "john@example.com", role: "admin" },
  { id: "user2", name: "Jane Smith", email: "jane@example.com", role: "user" },
  {
    id: "user3",
    name: "Alex Johnson",
    email: "alex@example.com",
    role: "user",
  },
  {
    id: "user4",
    name: "Sarah Williams",
    email: "sarah@example.com",
    role: "manager",
  },
  {
    id: "user5",
    name: "Michael Brown",
    email: "michael@example.com",
    role: "user",
  },
];

export async function GET(req: NextRequest) {
  try {
    // Check if DB connection is enabled (for testing)
    const url = new URL(req.url);
    const useDb = url.searchParams.get("useDb") !== "false";

    if (!useDb) {
      console.log("Database access skipped for users API, using mock data");
      return NextResponse.json({ users: MOCK_USERS });
    }

    return await withDb(req, async (req, db) => {
      try {
        // Get all users
        const allUsers = await db.select().from(users);
        console.log(`Found ${allUsers.length} users from database`);

        return NextResponse.json({ users: allUsers });
      } catch (error) {
        console.error("Error fetching users from database:", error);

        // Fallback to mock data
        console.log("Falling back to mock users data");
        return NextResponse.json({ users: MOCK_USERS });
      }
    });
  } catch (outerError) {
    console.error("Outer error in users API:", outerError);

    // Fallback to mock data
    return NextResponse.json({ users: MOCK_USERS });
  }
}

export async function POST(req: NextRequest) {
  return withDb(req, async (req, db) => {
    const userData = await req.json();

    try {
      const result = await db.insert(users).values(userData);
      return NextResponse.json(
        { success: true, data: result },
        { status: 201 }
      );
    } catch (error) {
      console.error("Error creating user:", error);
      return NextResponse.json(
        { error: "Failed to create user" },
        { status: 400 }
      );
    }
  });
}

export async function PUT(req: NextRequest) {
  return withDb(req, async (req, db) => {
    const { id, ...userData } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    try {
      await db.update(users).set(userData).where(eq(users.id, id));

      return NextResponse.json({ success: true });
    } catch (error) {
      console.error("Error updating user:", error);
      return NextResponse.json(
        { error: "Failed to update user" },
        { status: 400 }
      );
    }
  });
}

export async function DELETE(req: NextRequest) {
  return withDb(req, async (req, db) => {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    try {
      await db.delete(users).where(eq(users.id, id));
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error("Error deleting user:", error);
      return NextResponse.json(
        { error: "Failed to delete user" },
        { status: 400 }
      );
    }
  });
}
