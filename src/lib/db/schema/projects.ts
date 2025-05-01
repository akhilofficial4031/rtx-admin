import { pgTable, text, timestamp, varchar, uuid } from "drizzle-orm/pg-core";

export const projects = pgTable("projects", {
  projectId: uuid("project_id").defaultRandom().primaryKey(),
  projectName: varchar("project_name", { length: 255 }).notNull(),
  description: text("description"),
  startingDate: timestamp("starting_date"),
  pocName: varchar("poc_name", { length: 255 }),
  pocEmail: varchar("poc_email", { length: 255 }),
  pocPhone: varchar("poc_phone", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Define Project type based on the schema
export type Project = typeof projects.$inferSelect;
