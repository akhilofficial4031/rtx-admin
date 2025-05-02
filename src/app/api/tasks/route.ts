import { NextRequest, NextResponse } from "next/server";
import { withDb } from "@/lib/db/middleware";
import { eq, and, gte, lte, sql } from "drizzle-orm";
import { meetingTasks, users } from "@/lib/db/schema";
import { addDays, format } from "date-fns";

// Define task type
interface Task {
  id: string;
  name: string;
  description: string | null;
  meetingId: string | null;
  dueDate: string | null;
  status: string;
  assigneeId: string | null;
  assigneeName: string | null;
  createdAt: Date;
}

// Helper function to group tasks by deadline days
function groupTasksByDeadline(tasks: Task[], referenceDate = new Date()) {
  // Initialize groups
  const groups = {
    today: [] as Task[], // Due today
    day1: [] as Task[], // Due tomorrow
    day2: [] as Task[], // Due in 2 days
    day3: [] as Task[], // Due in 3 days
  };

  // Group tasks
  tasks.forEach((task) => {
    if (!task.dueDate) return; // Skip tasks without due dates

    // Format task due date for comparison
    const taskDueDate = new Date(task.dueDate);
    const formattedDueDate = format(taskDueDate, "yyyy-MM-dd");

    // Calculate days from reference date
    const today = format(referenceDate, "yyyy-MM-dd");
    const day1 = format(addDays(referenceDate, 1), "yyyy-MM-dd");
    const day2 = format(addDays(referenceDate, 2), "yyyy-MM-dd");
    const day3 = format(addDays(referenceDate, 3), "yyyy-MM-dd");

    // Assign to groups
    if (formattedDueDate === today) {
      groups.today.push(task);
    } else if (formattedDueDate === day1) {
      groups.day1.push(task);
    } else if (formattedDueDate === day2) {
      groups.day2.push(task);
    } else if (formattedDueDate === day3) {
      groups.day3.push(task);
    }
  });

  return groups;
}

// Get tasks grouped by deadline
export async function GET(req: NextRequest) {
  return withDb(req, async (req, db) => {
    try {
      // Get URL parameters
      const url = new URL(req.url);
      const filter = url.searchParams.get("filter") || "all";

      // Calculate reference dates for filtering
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const threeDaysLater = new Date(today);
      threeDaysLater.setDate(today.getDate() + 3);

      // Format dates for SQL query
      const todayStr = format(today, "yyyy-MM-dd");
      const threeDaysLaterStr = format(threeDaysLater, "yyyy-MM-dd");

      // Query to join with users table to get assignee names
      const tasks = await db
        .select({
          id: meetingTasks.id,
          name: meetingTasks.name,
          description: meetingTasks.description,
          meetingId: meetingTasks.meetingId,
          dueDate: meetingTasks.dueDate,
          status: meetingTasks.status,
          assigneeId: meetingTasks.assigneeId,
          assigneeName: users.name,
          createdAt: meetingTasks.createdAt,
        })
        .from(meetingTasks)
        .leftJoin(users, eq(meetingTasks.assigneeId, users.id))
        .where(
          filter === "all"
            ? undefined
            : and(
                gte(meetingTasks.dueDate, sql`${todayStr}`),
                lte(meetingTasks.dueDate, sql`${threeDaysLaterStr}`)
              )
        );

      // Group tasks by deadline
      const groupedTasks = groupTasksByDeadline(tasks);

      return NextResponse.json(groupedTasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      return NextResponse.json(
        { error: "Failed to fetch tasks" },
        { status: 500 }
      );
    }
  });
}

// Create a new task
export async function POST(req: NextRequest) {
  return withDb(req, async (req, db) => {
    const taskData = await req.json();

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
