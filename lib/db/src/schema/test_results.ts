import { pgTable, text, serial, timestamp, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const testResultsTable = pgTable("test_results", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  totalScore: integer("total_score").notNull(),
  stage: integer("stage").notNull(),
  stageName: text("stage_name").notNull(),
  scores: jsonb("scores"),
  recommendations: text("recommendations"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertTestResultSchema = createInsertSchema(testResultsTable).omit({ id: true, createdAt: true });
export type InsertTestResult = z.infer<typeof insertTestResultSchema>;
export type TestResult = typeof testResultsTable.$inferSelect;
