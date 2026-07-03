import { pgTable, text, serial, timestamp, boolean } from "drizzle-orm/pg-core";

export const dailyTasksTable = pgTable("daily_tasks", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  date: text("date").notNull(),
  taskSlot: text("task_slot").notNull(),
  done: boolean("done").notNull().default(false),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export type DailyTask = typeof dailyTasksTable.$inferSelect;
