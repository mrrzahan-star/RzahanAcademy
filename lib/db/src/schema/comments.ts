import { pgTable, text, serial, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const commentsTable = pgTable("comments", {
  id: serial("id").primaryKey(),
  userId: text("user_id"),
  authorName: text("author_name").notNull(),
  avatarUrl: text("avatar_url"),
  content: text("content").notNull(),
  stage: integer("stage"),
  stageName: text("stage_name"),
  rating: integer("rating"),
  approved: boolean("approved").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertCommentSchema = createInsertSchema(commentsTable).omit({ id: true, createdAt: true });
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Comment = typeof commentsTable.$inferSelect;
