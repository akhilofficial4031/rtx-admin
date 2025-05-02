import { NextRequest, NextResponse } from "next/server";
import { withDb } from "@/lib/db/middleware";
import { eq } from "drizzle-orm";
import { meetingTasks } from "@/lib/db/schema";

// Get a task by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return withDb(req, async (req, db) => {
    try {
      const task = await db
        .select()
        .from(meetingTasks)
        .where(eq(meetingTasks.id, params.id))
        .limit(1);

      if (!task || task.length === 0) {
        return NextResponse.json({ error: "Task not found" }, { status: 404 });
      }

      return NextResponse.json(task[0]);
    } catch (error) {
      console.error("Error fetching task:", error);
      return NextResponse.json(
        { error: "Failed to fetch task" },
        { status: 500 }
      );
    }
  });
}

// Update a task
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return withDb(req, async (req, db) => {
    try {
      const updates = await req.json();

      // Validate the status if it's being updated
      if (updates.status) {
        const validStatuses = ["not_started", "in_progress", "completed"];
        if (!validStatuses.includes(updates.status)) {
          return NextResponse.json(
            { error: "Invalid status value" },
            { status: 400 }
          );
        }
      }

      const result = await db
        .update(meetingTasks)
        .set({
          ...updates,
          updatedAt: new Date(),
        })
        .where(eq(meetingTasks.id, params.id))
        .returning();

      if (!result || result.length === 0) {
        return NextResponse.json(
          { error: "Task not found or no changes made" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: result[0],
      });
    } catch (error) {
      console.error("Error updating task:", error);
      return NextResponse.json(
        { error: "Failed to update task" },
        { status: 500 }
      );
    }
  });
}

// Delete a task
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return withDb(req, async (req, db) => {
    try {
      const result = await db
        .delete(meetingTasks)
        .where(eq(meetingTasks.id, params.id))
        .returning({ id: meetingTasks.id });

      if (!result || result.length === 0) {
        return NextResponse.json({ error: "Task not found" }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        message: "Task deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting task:", error);
      return NextResponse.json(
        { error: "Failed to delete task" },
        { status: 500 }
      );
    }
  });
}
