import { NextRequest, NextResponse } from "next/server";
import { withDb } from "@/lib/db/middleware";
import { eq } from "drizzle-orm";
import { meetings, meetingAttendees, meetingTasks } from "@/lib/db/schema";
import { users } from "@/lib/db/schema/users";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return withDb(req, async (req, db) => {
    const id = params.id;

    if (!id) {
      return NextResponse.json(
        { error: "Meeting ID is required" },
        { status: 400 }
      );
    }

    try {
      // Get the meeting with coordinator name
      const [meetingData] = await db
        .select({
          id: meetings.id,
          title: meetings.title,
          minutes: meetings.minutes,
          meetingDate: meetings.meetingDate,
          createdAt: meetings.createdAt,
          coordinatorId: meetings.coordinatorId,
          coordinatorName: users.name,
          projectId: meetings.projectId,
        })
        .from(meetings)
        .leftJoin(users, eq(meetings.coordinatorId, users.id))
        .where(eq(meetings.id, id))
        .limit(1);

      if (!meetingData) {
        return NextResponse.json(
          { error: "Meeting not found" },
          { status: 404 }
        );
      }

      // Get all attendees for this meeting
      const attendees = await db
        .select({
          id: meetingAttendees.id,
          userId: meetingAttendees.userId,
          userName: users.name,
          attended: meetingAttendees.attended,
        })
        .from(meetingAttendees)
        .leftJoin(users, eq(meetingAttendees.userId, users.id))
        .where(eq(meetingAttendees.meetingId, id));

      // Get all tasks for this meeting
      const tasks = await db
        .select({
          id: meetingTasks.id,
          name: meetingTasks.name,
          description: meetingTasks.description,
          assigneeId: meetingTasks.assigneeId,
          assigneeName: users.name,
          dueDate: meetingTasks.dueDate,
          status: meetingTasks.status,
          createdAt: meetingTasks.createdAt,
        })
        .from(meetingTasks)
        .leftJoin(users, eq(meetingTasks.assigneeId, users.id))
        .where(eq(meetingTasks.meetingId, id));

      return NextResponse.json({
        meeting: meetingData,
        attendees,
        tasks,
      });
    } catch (error) {
      console.error("Error fetching meeting details:", error);
      return NextResponse.json(
        { error: "Failed to fetch meeting details" },
        { status: 500 }
      );
    }
  });
}
