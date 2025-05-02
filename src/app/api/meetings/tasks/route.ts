import { NextRequest, NextResponse } from "next/server";
import { withDb } from "@/lib/db/middleware";
import { eq } from "drizzle-orm";
import { meetingTasks } from "@/lib/db/schema";

// Create a new task for a meeting
export async function POST(req: NextRequest) {
  return withDb(req, async (req, db) => {
    const taskData = await req.json();

    if (!taskData.meetingId) {
      return NextResponse.json(
        { error: "Meeting ID is required" },
        { status: 400 }
      );
    }

    try {
      const result = await db.insert(meetingTasks).values(taskData);

      return NextResponse.json(
        { success: true, data: result },
        { status: 201 }
      );
    } catch (error) {
      console.error("Error creating task:", error);
      return NextResponse.json(
        { error: "Failed to create task" },
        { status: 400 }
      );
    }
  });
}

// Update a task
export async function PUT(req: NextRequest) {
  return withDb(req, async (req, db) => {
    const { id, ...taskData } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "Task ID is required" },
        { status: 400 }
      );
    }

    try {
      await db
        .update(meetingTasks)
        .set(taskData)
        .where(eq(meetingTasks.id, id));
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error("Error updating task:", error);
      return NextResponse.json(
        { error: "Failed to update task" },
        { status: 400 }
      );
    }
  });
}

// Delete a task
export async function DELETE(req: NextRequest) {
  return withDb(req, async (req, db) => {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "Task ID is required" },
        { status: 400 }
      );
    }

    try {
      await db.delete(meetingTasks).where(eq(meetingTasks.id, id));
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error("Error deleting task:", error);
      return NextResponse.json(
        { error: "Failed to delete task" },
        { status: 400 }
      );
    }
  });
}
