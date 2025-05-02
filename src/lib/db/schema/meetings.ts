import {
  pgTable,
  text,
  timestamp,
  varchar,
  uuid,
  boolean,
  date,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { projects } from "./projects";

export const meetings = pgTable("meetings", {
  id: uuid("id").defaultRandom().primaryKey(),
  coordinatorId: uuid("coordinator_id").references(() => users.id),
  title: varchar("title", { length: 255 }).notNull(),
  projectId: uuid("project_id").references(() => projects.projectId),
  minutes: text("minutes"),
  meetingDate: date("meeting_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const meetingAttendees = pgTable(
  "meeting_attendees",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    meetingId: uuid("meeting_id").references(() => meetings.id),
    userId: uuid("user_id").references(() => users.id),
    attended: boolean("attended").default(true),
  },
  (table) => {
    return {
      meetingUserIdx: {
        name: "idx_meeting_user",
        unique: true,
        columns: [table.meetingId, table.userId],
      },
    };
  }
);

export const meetingTasks = pgTable("meeting_tasks", {
  id: uuid("id").defaultRandom().primaryKey(),
  meetingId: uuid("meeting_id").references(() => meetings.id),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  assigneeId: uuid("assignee_id").references(() => users.id),
  dueDate: date("due_date"),
  status: varchar("status", { length: 20 }).default("not_started").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Define types based on the schema
export type Meeting = typeof meetings.$inferSelect;
export type MeetingAttendee = typeof meetingAttendees.$inferSelect;
export type MeetingTask = typeof meetingTasks.$inferSelect;
