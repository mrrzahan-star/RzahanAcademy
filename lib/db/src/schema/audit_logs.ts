import { pgTable, text, serial, timestamp, jsonb } from "drizzle-orm/pg-core";

export const auditLogsTable = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  adminEmail: text("admin_email").notNull(),
  action: text("action").notNull(),
  target: text("target"),
  details: jsonb("details"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type AuditLog = typeof auditLogsTable.$inferSelect;
