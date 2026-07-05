import { Router } from "express";
import { eq, desc, asc, and, lt, gte, count, sql } from "drizzle-orm";
import {
  db,
  profilesTable,
  userMembershipsTable,
  membershipRequestsTable,
  cmsPackagesTable,
  usersTable,
} from "@workspace/db";
import { requireAuth } from "../middlewares/auth";

// ── helpers ───────────────────────────────────────────────────────────────────

async function requireAdmin(req: any, res: any): Promise<string | null> {
  if (req.userRole !== "admin") { res.status(403).json({ error: "Forbidden" }); return null; }
  return req.userUsername ?? "admin";
}

/** Revert expired memberships to baslanqic (lazy expiration) */
async function checkAndExpireMembership(userId: string) {
  const [profile] = await db.select({ currentPackageSlug: profilesTable.currentPackageSlug, membershipExpiresAt: profilesTable.membershipExpiresAt, currentMembershipId: profilesTable.currentMembershipId })
    .from(profilesTable).where(eq(profilesTable.userId, userId)).limit(1);
  if (!profile) return;
  if (profile.currentPackageSlug === "baslanqic") return;
  if (profile.membershipExpiresAt && profile.membershipExpiresAt < new Date()) {
    // expire the active membership
    if (profile.currentMembershipId) {
      await db.update(userMembershipsTable)
        .set({ status: "expired", updatedAt: new Date() })
        .where(eq(userMembershipsTable.id, profile.currentMembershipId));
    }
    await db.update(profilesTable)
      .set({ currentPackageSlug: "baslanqic", membershipExpiresAt: null, currentMembershipId: null, updatedAt: new Date() })
      .where(eq(profilesTable.userId, userId));
  }
}

// ── public router ─────────────────────────────────────────────────────────────

export const publicMembershipRouter = Router();

/** POST /api/memberships/request — anyone can submit a package request */
publicMembershipRouter.post("/request", async (req: any, res) => {
  const { fullName, phone, email, packageSlug, notes } = req.body;
  if (!fullName || !phone || !packageSlug) {
    res.status(400).json({ error: "fullName, phone, packageSlug tələb olunur" });
    return;
  }
  const [pkg] = await db.select({ name: cmsPackagesTable.name })
    .from(cmsPackagesTable).where(eq(cmsPackagesTable.slug, packageSlug)).limit(1);
  if (!pkg) { res.status(404).json({ error: "Paket tapılmadı" }); return; }

  const [request] = await db.insert(membershipRequestsTable).values({
    userId: req.userId ?? null,
    fullName,
    phone,
    email: email ?? null,
    packageSlug,
    packageName: pkg.name,
    notes: notes ?? null,
    status: "new",
  }).returning();
  res.status(201).json(request);
});

/** GET /api/memberships/my — current user's membership status */
publicMembershipRouter.get("/my", requireAuth, async (req: any, res) => {
  await checkAndExpireMembership(req.userId);
  const [profile] = await db.select({
    currentPackageSlug: profilesTable.currentPackageSlug,
    membershipExpiresAt: profilesTable.membershipExpiresAt,
    currentMembershipId: profilesTable.currentMembershipId,
  }).from(profilesTable).where(eq(profilesTable.userId, req.userId)).limit(1);

  if (!profile) { res.json({ currentPackageSlug: "baslanqic", membershipExpiresAt: null, daysRemaining: null }); return; }

  let daysRemaining: number | null = null;
  if (profile.membershipExpiresAt) {
    const diff = profile.membershipExpiresAt.getTime() - Date.now();
    daysRemaining = Math.max(0, Math.ceil(diff / 86400000));
  }

  const [pkg] = await db.select({ name: cmsPackagesTable.name, emoji: cmsPackagesTable.emoji, color: cmsPackagesTable.color, requiredLevel: cmsPackagesTable.requiredLevel })
    .from(cmsPackagesTable).where(eq(cmsPackagesTable.slug, profile.currentPackageSlug)).limit(1);

  res.json({
    currentPackageSlug: profile.currentPackageSlug,
    packageName: pkg?.name ?? "Başlanğıc",
    packageEmoji: pkg?.emoji ?? "🌱",
    packageColor: pkg?.color ?? "#5b5fef",
    requiredLevel: pkg?.requiredLevel ?? 0,
    membershipExpiresAt: profile.membershipExpiresAt,
    daysRemaining,
    isExpiringSoon: daysRemaining !== null && daysRemaining <= 7,
  });
});

// ── admin router ──────────────────────────────────────────────────────────────

export const adminMembershipRouter = Router();

/** GET /api/admin/memberships/widgets */
adminMembershipRouter.get("/widgets", requireAuth, async (req: any, res) => {
  const admin = await requireAdmin(req, res); if (!admin) return;
  const now = new Date();
  const in7 = new Date(Date.now() + 7 * 86400000);
  const tomorrow = new Date(Date.now() + 86400000);

  const [[{ c: newRequests }], [{ c: expiringToday }], [{ c: expiring7d }], [{ c: expiredCount }], [{ c: activeCount }]] = await Promise.all([
    db.select({ c: count() }).from(membershipRequestsTable).where(eq(membershipRequestsTable.status, "new")),
    db.select({ c: count() }).from(userMembershipsTable).where(and(eq(userMembershipsTable.status, "active"), lt(userMembershipsTable.expiresAt, tomorrow), gte(userMembershipsTable.expiresAt, now))),
    db.select({ c: count() }).from(userMembershipsTable).where(and(eq(userMembershipsTable.status, "active"), lt(userMembershipsTable.expiresAt, in7), gte(userMembershipsTable.expiresAt, now))),
    db.select({ c: count() }).from(userMembershipsTable).where(eq(userMembershipsTable.status, "expired")),
    db.select({ c: count() }).from(userMembershipsTable).where(eq(userMembershipsTable.status, "active")),
  ]);

  const recentlyActivated = await db.select({
    id: userMembershipsTable.id, userId: userMembershipsTable.userId,
    packageName: userMembershipsTable.packageName, activatedAt: userMembershipsTable.activatedAt,
  }).from(userMembershipsTable).where(eq(userMembershipsTable.status, "active"))
    .orderBy(desc(userMembershipsTable.activatedAt)).limit(5);

  res.json({ newRequests: Number(newRequests), expiringToday: Number(expiringToday), expiring7d: Number(expiring7d), expiredCount: Number(expiredCount), activeCount: Number(activeCount), recentlyActivated });
});

/** GET /api/admin/memberships/requests */
adminMembershipRouter.get("/requests", requireAuth, async (req: any, res) => {
  const admin = await requireAdmin(req, res); if (!admin) return;
  const rows = await db.select().from(membershipRequestsTable).orderBy(desc(membershipRequestsTable.createdAt));
  res.json(rows);
});

/** PUT /api/admin/memberships/requests/:id */
adminMembershipRouter.put("/requests/:id", requireAuth, async (req: any, res) => {
  const admin = await requireAdmin(req, res); if (!admin) return;
  const { status, adminNotes } = req.body;
  const [row] = await db.update(membershipRequestsTable)
    .set({ status, adminNotes: adminNotes ?? undefined, updatedAt: new Date() })
    .where(eq(membershipRequestsTable.id, Number(req.params.id)))
    .returning();
  res.json(row);
});

/** GET /api/admin/memberships/users — users with their membership info */
adminMembershipRouter.get("/users", requireAuth, async (req: any, res) => {
  const admin = await requireAdmin(req, res); if (!admin) return;
  const rows = await db.select({
    userId: profilesTable.userId,
    firstName: profilesTable.firstName,
    lastName: profilesTable.lastName,
    email: profilesTable.email,
    currentPackageSlug: profilesTable.currentPackageSlug,
    membershipExpiresAt: profilesTable.membershipExpiresAt,
    username: usersTable.username,
  }).from(profilesTable)
    .leftJoin(usersTable, eq(profilesTable.userId, usersTable.id))
    .orderBy(desc(profilesTable.createdAt))
    .limit(200);
  res.json(rows);
});

/** GET /api/admin/memberships/expiring */
adminMembershipRouter.get("/expiring", requireAuth, async (req: any, res) => {
  const admin = await requireAdmin(req, res); if (!admin) return;
  const in7 = new Date(Date.now() + 7 * 86400000);
  const rows = await db.select().from(userMembershipsTable)
    .where(and(eq(userMembershipsTable.status, "active"), lt(userMembershipsTable.expiresAt, in7), gte(userMembershipsTable.expiresAt, new Date())))
    .orderBy(asc(userMembershipsTable.expiresAt));
  res.json(rows);
});

/** GET /api/admin/memberships — all memberships */
adminMembershipRouter.get("/", requireAuth, async (req: any, res) => {
  const admin = await requireAdmin(req, res); if (!admin) return;
  const rows = await db.select().from(userMembershipsTable).orderBy(desc(userMembershipsTable.createdAt)).limit(200);
  res.json(rows);
});

/** POST /api/admin/memberships/activate — activate/assign membership to a user */
adminMembershipRouter.post("/activate", requireAuth, async (req: any, res) => {
  const admin = await requireAdmin(req, res); if (!admin) return;
  const { userId, packageSlug, durationDays, notes } = req.body;
  if (!userId || !packageSlug) { res.status(400).json({ error: "userId, packageSlug tələb olunur" }); return; }

  const [pkg] = await db.select({ name: cmsPackagesTable.name }).from(cmsPackagesTable).where(eq(cmsPackagesTable.slug, packageSlug)).limit(1);
  if (!pkg) { res.status(404).json({ error: "Paket tapılmadı" }); return; }

  // expire any current active membership
  await db.update(userMembershipsTable)
    .set({ status: "expired", updatedAt: new Date() })
    .where(and(eq(userMembershipsTable.userId, userId), eq(userMembershipsTable.status, "active")));

  const activatedAt = new Date();
  const expiresAt = durationDays && packageSlug !== "baslanqic"
    ? new Date(Date.now() + Number(durationDays) * 86400000) : null;

  const [membership] = await db.insert(userMembershipsTable).values({
    userId, packageSlug, packageName: pkg.name, status: "active",
    durationDays: durationDays ? Number(durationDays) : null,
    activatedAt, expiresAt,
    activatedBy: admin, notes: notes ?? null,
  }).returning();

  await db.update(profilesTable).set({
    currentPackageSlug: packageSlug,
    membershipExpiresAt: expiresAt,
    currentMembershipId: membership.id,
    updatedAt: new Date(),
  }).where(eq(profilesTable.userId, userId));

  res.json(membership);
});

/** PUT /api/admin/memberships/:id — update membership (extend/pause/cancel) */
adminMembershipRouter.put("/:id", requireAuth, async (req: any, res) => {
  const admin = await requireAdmin(req, res); if (!admin) return;
  const { status, expiresAt, notes } = req.body;
  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (status !== undefined) updates.status = status;
  if (expiresAt !== undefined) updates.expiresAt = expiresAt ? new Date(expiresAt) : null;
  if (notes !== undefined) updates.notes = notes;

  const [row] = await db.update(userMembershipsTable).set(updates as any)
    .where(eq(userMembershipsTable.id, Number(req.params.id))).returning();

  // sync profile if this membership is the user's current one
  if (row) {
    const [profile] = await db.select({ currentMembershipId: profilesTable.currentMembershipId })
      .from(profilesTable).where(eq(profilesTable.userId, row.userId)).limit(1);
    if (profile?.currentMembershipId === row.id) {
      const profileUpdates: Record<string, unknown> = { updatedAt: new Date() };
      if (status === "cancelled" || status === "expired") {
        profileUpdates.currentPackageSlug = "baslanqic";
        profileUpdates.membershipExpiresAt = null;
        profileUpdates.currentMembershipId = null;
      } else if (expiresAt !== undefined) {
        profileUpdates.membershipExpiresAt = expiresAt ? new Date(expiresAt) : null;
      }
      await db.update(profilesTable).set(profileUpdates as any).where(eq(profilesTable.userId, row.userId));
    }
  }
  res.json(row);
});

export default publicMembershipRouter;
