import { pgTable, text, serial, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const profilesTable = pgTable("profiles", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  avatarUrl: text("avatar_url"),
  email: text("email"),
  consciousnessLevel: integer("consciousness_level"),
  consciousnessStage: text("consciousness_stage"),
  bio: text("bio"),
  streak: integer("streak").notNull().default(0),
  lastActiveAt: timestamp("last_active_at", { withTimezone: true }),
  isBlocked: boolean("is_blocked").notNull().default(false),
  tasksCompleted: integer("tasks_completed").notNull().default(0),
  currentPackageSlug: text("current_package_slug").notNull().default("baslanqic"),
  membershipExpiresAt: timestamp("membership_expires_at", { withTimezone: true }),
  currentMembershipId: integer("current_membership_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertProfileSchema = createInsertSchema(profilesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Profile = typeof profilesTable.$inferSelect;
