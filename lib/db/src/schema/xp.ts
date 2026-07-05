import { pgTable, text, serial, timestamp, integer, boolean } from "drizzle-orm/pg-core";

export const xpRulesTable = pgTable("xp_rules", {
  id: serial("id").primaryKey(),
  actionType: text("action_type").notNull().unique(),
  label: text("label").notNull(),
  xpAmount: integer("xp_amount").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const xpEventsTable = pgTable("xp_events", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  actionType: text("action_type").notNull(),
  xpAmount: integer("xp_amount").notNull(),
  refId: text("ref_id"),
  note: text("note"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const levelsTable = pgTable("levels", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  requiredXp: integer("required_xp").notNull().default(0),
  emoji: text("emoji").default("⭐"),
  color: text("color").default("#6366f1"),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
});

export const achievementDefinitionsTable = pgTable("achievement_definitions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  emoji: text("emoji").default("🏆"),
  color: text("color").default("#f59e0b"),
  xpReward: integer("xp_reward").notNull().default(0),
  triggerType: text("trigger_type").notNull(),
  triggerValue: integer("trigger_value").notNull().default(1),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const userAchievementsTable = pgTable("user_achievements", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  achievementId: integer("achievement_id").notNull(),
  unlockedAt: timestamp("unlocked_at", { withTimezone: true }).notNull().defaultNow(),
});

export const userNotificationsTable = pgTable("user_notifications", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  type: text("type").notNull(),
  title: text("title").notNull(),
  message: text("message"),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type XpRule = typeof xpRulesTable.$inferSelect;
export type XpEvent = typeof xpEventsTable.$inferSelect;
export type Level = typeof levelsTable.$inferSelect;
export type AchievementDefinition = typeof achievementDefinitionsTable.$inferSelect;
export type UserAchievement = typeof userAchievementsTable.$inferSelect;
export type UserNotification = typeof userNotificationsTable.$inferSelect;
