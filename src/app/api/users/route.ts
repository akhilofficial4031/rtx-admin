import { NextRequest, NextResponse } from "next/server";
import { withDb } from "@/lib/db/middleware";
import { eq } from "drizzle-orm";
import { users } from "@/lib/db/schema";

export async function GET(req: NextRequest) {
  return withDb(req, async (req, db) => {
    const allUsers = await db.select().from(users);
    return NextResponse.json(allUsers);
  });
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
