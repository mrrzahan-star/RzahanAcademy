import { pgTable, serial, text, integer, timestamp, boolean } from "drizzle-orm/pg-core";

// ── USER MEMBERSHIPS (history) ────────────────────────────────────────────────

export const userMembershipsTable = pgTable("user_memberships", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  packageSlug: text("package_slug").notNull(),
  packageName: text("package_name").notNull(),
  status: text("status").notNull().default("active"), // active | expired | cancelled | paused
  durationDays: integer("duration_days"),             // null = unlimited (free plan)
  activatedAt: timestamp("activated_at", { withTimezone: true }).notNull().defaultNow(),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  activatedBy: text("activated_by"),                  // admin username
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export type UserMembership = typeof userMembershipsTable.$inferSelect;

// ── MEMBERSHIP REQUESTS ───────────────────────────────────────────────────────

export const membershipRequestsTable = pgTable("membership_requests", {
  id: serial("id").primaryKey(),
  userId: text("user_id"),                             // nullable — guest can request too
  fullName: text("full_name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  packageSlug: text("package_slug").notNull(),
  packageName: text("package_name").notNull(),
  notes: text("notes"),
  status: text("status").notNull().default("new"),     // new | contacted | payment_pending | activated | cancelled
  adminNotes: text("admin_notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export type MembershipRequest = typeof membershipRequestsTable.$inferSelect;
