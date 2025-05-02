import { NextRequest, NextResponse } from "next/server";
import { withDb } from "@/lib/db/middleware";
import { count } from "drizzle-orm";
import { users, projects, meetings, meetingTasks } from "@/lib/db/schema";
import { sql } from "drizzle-orm";

export const GET = async (req: NextRequest) => {
  return withDb(req, async (req, db) => {
    try {
      // Get users count
      const [usersCount] = await db.select({ value: count() }).from(users);

      // Get projects count
      const [projectsCount] = await db
        .select({ value: count() })
        .from(projects);

      // Get meetings count
      const [meetingsCount] = await db
        .select({ value: count() })
        .from(meetings);

      // Get tasks count
      const [tasksCount] = await db
        .select({ value: count() })
        .from(meetingTasks);

      // Get recent activity - last 5 meetings
      const recentMeetings = await db
        .select({
          id: meetings.id,
          title: meetings.title,
          meetingDate: meetings.meetingDate,
          createdAt: meetings.createdAt,
        })
        .from(meetings)
        .orderBy(sql`${meetings.createdAt} DESC`)
        .limit(5);

      // Get tasks by status
      const tasksByStatus = await db
        .select({
          status: meetingTasks.status,
          count: count(),
        })
        .from(meetingTasks)
        .groupBy(meetingTasks.status);

      // Get upcoming meetings for this week
      const today = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);

      const upcomingMeetings = await db
        .select({
          id: meetings.id,
          title: meetings.title,
          meetingDate: meetings.meetingDate,
        })
        .from(meetings)
        .where(
          sql`${meetings.meetingDate} >= CURRENT_DATE AND ${meetings.meetingDate} <= CURRENT_DATE + INTERVAL '7 days'`
        )
        .orderBy(meetings.meetingDate);

      return NextResponse.json({
        counts: {
          users: usersCount.value,
          projects: projectsCount.value,
          meetings: meetingsCount.value,
          tasks: tasksCount.value,
        },
        recentMeetings,
        tasksByStatus,
        upcomingMeetings,
      });
    } catch (error) {
      console.error("Dashboard API error:", error);
      return NextResponse.json(
        { error: "Failed to fetch dashboard data" },
        { status: 500 }
      );
    }
  });
};
