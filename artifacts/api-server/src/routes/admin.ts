import { Router } from "express";
import type { Response } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { requireAuth } from "../middlewares/auth";
import {
  db, profilesTable, testResultsTable, certificatesTable,
  commentsTable, journalEntriesTable, auditLogsTable, dailyTasksTable, siteSettingsTable,
  usersTable, passwordResetTokensTable,
} from "@workspace/db";
import { eq, desc, count, ilike, or, and, gte, sql, asc } from "drizzle-orm";

const router = Router();

async function logAction(adminUsername: string, action: string, target?: string, details?: object) {
  try { await db.insert(auditLogsTable).values({ adminEmail: adminUsername, action, target, details }); } catch { }
}

async function requireAdmin(req: any, res: any): Promise<string | null> {
  if (!req.userId) { res.status(401).json({ error: "Unauthorized" }); return null; }
  if (req.userRole !== "admin") { res.status(403).json({ error: "Forbidden" }); return null; }
  return req.username as string;
}

function parsePage(req: any) {
  const page = Math.max(1, parseInt(req.query.page as string || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string || "20", 10)));
  return { page, limit, offset: (page - 1) * limit };
}

function sendCsv(res: Response, filename: string, rows: Record<string, unknown>[], headers: string[]) {
  const escape = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const csv = [headers.join(","), ...rows.map(r => headers.map(h => escape(r[h])).join(","))].join("\n");
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.send(csv);
}

// ── STATS ─────────────────────────────────────────────────────────────────────

router.get("/stats", requireAuth, async (req, res) => {
  const adminUsername = await requireAdmin(req, res);
  if (!adminUsername) return;

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const [[u], [t], [c], [co], [pend], [bloc], [tdU], [tdT], [tdC], [jour], [dtask], [active]] =
    await Promise.all([
      db.select({ c: count() }).from(profilesTable),
      db.select({ c: count() }).from(testResultsTable),
      db.select({ c: count() }).from(certificatesTable),
      db.select({ c: count() }).from(commentsTable),
      db.select({ c: count() }).from(commentsTable).where(eq(commentsTable.approved, false)),
      db.select({ c: count() }).from(usersTable).where(eq(usersTable.isBlocked, true)),
      db.select({ c: count() }).from(usersTable).where(gte(usersTable.createdAt, today)),
      db.select({ c: count() }).from(testResultsTable).where(gte(testResultsTable.createdAt, today)),
      db.select({ c: count() }).from(certificatesTable).where(gte(certificatesTable.issuedAt, today)),
      db.select({ c: count() }).from(journalEntriesTable),
      db.select({ c: count() }).from(dailyTasksTable),
      db.select({ c: count() }).from(profilesTable).where(gte(profilesTable.lastActiveAt, today)),
    ]);

  res.json({
    totalUsers: Number(u.c), totalTests: Number(t.c), totalCertificates: Number(c.c),
    totalComments: Number(co.c), pendingComments: Number(pend.c), blockedUsers: Number(bloc.c),
    todayUsers: Number(tdU.c), todayTests: Number(tdT.c), todayCerts: Number(tdC.c),
    totalJournals: Number(jour.c), totalDailyTasks: Number(dtask.c),
    activeToday: Number(active.c),
  });
});

// ── USERS ─────────────────────────────────────────────────────────────────────

router.get("/users/export.csv", requireAuth, async (req, res) => {
  const adminUsername = await requireAdmin(req, res);
  if (!adminUsername) return;
  const rows = await db.select().from(profilesTable).orderBy(desc(profilesTable.createdAt));
  await logAction(adminUsername, "EXPORT_USERS_CSV");
  sendCsv(res, "users.csv", rows as unknown as Record<string, unknown>[], [
    "id", "userId", "firstName", "lastName", "email", "consciousnessLevel",
    "consciousnessStage", "streak", "tasksCompleted", "isBlocked", "createdAt",
  ]);
});

router.get("/users", requireAuth, async (req, res) => {
  const adminUsername = await requireAdmin(req, res);
  if (!adminUsername) return;

  const { page, limit, offset } = parsePage(req);
  const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
  const filter = typeof req.query.filter === "string" ? req.query.filter : "";
  const sortParam = typeof req.query.sort === "string" ? req.query.sort : "newest";

  let where: ReturnType<typeof and> | ReturnType<typeof eq> | ReturnType<typeof or> | undefined;
  if (filter === "blocked") where = eq(profilesTable.isBlocked, true);
  else if (filter === "active") where = eq(profilesTable.isBlocked, false);

  if (search) {
    const s = or(
      ilike(profilesTable.firstName, `%${search}%`),
      ilike(profilesTable.lastName, `%${search}%`),
      ilike(profilesTable.email, `%${search}%`),
    );
    where = where ? and(where, s) : s;
  }

  const sortOrder =
    sortParam === "oldest" ? asc(profilesTable.createdAt) :
    sortParam === "name-asc" ? asc(profilesTable.firstName) :
    sortParam === "name-desc" ? desc(profilesTable.firstName) :
    sortParam === "level-desc" ? desc(profilesTable.consciousnessLevel) :
    desc(profilesTable.createdAt);

  const [[totalRow], data] = await Promise.all([
    db.select({ c: count() }).from(profilesTable).where(where),
    db.select().from(profilesTable).where(where).orderBy(sortOrder).limit(limit).offset(offset),
  ]);

  res.json({ data, total: Number(totalRow.c), page, limit });
});

router.get("/users/:id/profile", requireAuth, async (req, res) => {
  const adminUsername = await requireAdmin(req, res);
  if (!adminUsername) return;
  const id = parseInt(req.params.id as string, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [profile] = await db.select().from(profilesTable).where(eq(profilesTable.id, id));
  if (!profile) { res.status(404).json({ error: "User not found" }); return; }

  const [tests, certs, journals, tasks, [rankRow]] = await Promise.all([
    db.select().from(testResultsTable).where(eq(testResultsTable.userId, profile.userId))
      .orderBy(desc(testResultsTable.createdAt)).limit(20),
    db.select().from(certificatesTable).where(eq(certificatesTable.userId, profile.userId))
      .orderBy(desc(certificatesTable.issuedAt)),
    db.select().from(journalEntriesTable).where(eq(journalEntriesTable.userId, profile.userId))
      .orderBy(desc(journalEntriesTable.createdAt)).limit(20),
    db.select().from(dailyTasksTable).where(eq(dailyTasksTable.userId, profile.userId))
      .orderBy(desc(dailyTasksTable.date)).limit(30),
    db.select({ c: count() }).from(profilesTable)
      .where(sql`consciousness_level > ${profile.consciousnessLevel ?? 0}`),
  ]);

  res.json({ profile, tests, certificates: certs, journals, dailyTasks: tasks, leaderboardRank: Number(rankRow.c) + 1 });
});

router.put("/users/:id", requireAuth, async (req, res) => {
  const adminUsername = await requireAdmin(req, res);
  if (!adminUsername) return;
  const id = parseInt(req.params.id as string, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const { firstName, lastName, email, bio, consciousnessLevel, consciousnessStage } = req.body as {
    firstName?: string; lastName?: string; email?: string; bio?: string;
    consciousnessLevel?: number; consciousnessStage?: string;
  };

  const [updated] = await db.update(profilesTable).set({
    ...(firstName !== undefined && { firstName }),
    ...(lastName !== undefined && { lastName }),
    ...(email !== undefined && { email }),
    ...(bio !== undefined && { bio }),
    ...(consciousnessLevel !== undefined && { consciousnessLevel }),
    ...(consciousnessStage !== undefined && { consciousnessStage }),
  }).where(eq(profilesTable.id, id)).returning({ id: profilesTable.id, firstName: profilesTable.firstName });

  if (!updated) { res.status(404).json({ error: "User not found" }); return; }
  await logAction(adminUsername, "UPDATE_USER", `profile:${id}`, { firstName: updated.firstName });
  res.json({ ok: true });
});

router.post("/users/:id/reset-password", requireAuth, async (req, res) => {
  const adminUsername = await requireAdmin(req, res);
  if (!adminUsername) return;
  const id = parseInt(req.params.id as string, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [profile] = await db.select({ email: profilesTable.email, userId: profilesTable.userId })
    .from(profilesTable).where(eq(profilesTable.id, id));
  if (!profile) { res.status(404).json({ error: "User not found" }); return; }
  if (!profile.email) { res.status(400).json({ error: "Bu istifadəçinin e-poçtu yoxdur" }); return; }

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
  await db.insert(passwordResetTokensTable).values({ userId: profile.userId, token, expiresAt });

  await logAction(adminUsername, "RESET_PASSWORD", `profile:${id}`, { email: profile.email });
  const basePath = (process.env.BASE_PATH || "").replace(/\/$/, "");
  res.json({ link: `${process.env.SITE_URL || ""}${basePath}/auth/reset-password?token=${token}` });
});

router.post("/users/:id/block", requireAuth, async (req, res) => {
  const adminUsername = await requireAdmin(req, res);
  if (!adminUsername) return;
  const id = parseInt(req.params.id as string, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [profile] = await db.update(profilesTable).set({ isBlocked: true })
    .where(eq(profilesTable.id, id)).returning({ firstName: profilesTable.firstName, userId: profilesTable.userId });
  if (!profile) { res.status(404).json({ error: "User not found" }); return; }

  await db.update(usersTable).set({ isBlocked: true }).where(eq(usersTable.id, profile.userId));
  await logAction(adminUsername, "BLOCK_USER", `profile:${id}`, { firstName: profile.firstName });
  res.json({ ok: true });
});

router.post("/users/:id/unblock", requireAuth, async (req, res) => {
  const adminUsername = await requireAdmin(req, res);
  if (!adminUsername) return;
  const id = parseInt(req.params.id as string, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [profile] = await db.update(profilesTable).set({ isBlocked: false })
    .where(eq(profilesTable.id, id)).returning({ firstName: profilesTable.firstName, userId: profilesTable.userId });
  if (!profile) { res.status(404).json({ error: "User not found" }); return; }

  await db.update(usersTable).set({ isBlocked: false }).where(eq(usersTable.id, profile.userId));
  await logAction(adminUsername, "UNBLOCK_USER", `profile:${id}`, { firstName: profile.firstName });
  res.json({ ok: true });
});

router.delete("/users/:id", requireAuth, async (req, res) => {
  const adminUsername = await requireAdmin(req, res);
  if (!adminUsername) return;
  const id = parseInt(req.params.id as string, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [deleted] = await db.delete(profilesTable).where(eq(profilesTable.id, id))
    .returning({ firstName: profilesTable.firstName, userId: profilesTable.userId });
  if (!deleted) { res.status(404).json({ error: "User not found" }); return; }

  await db.delete(usersTable).where(eq(usersTable.id, deleted.userId)).catch(() => {});
  await logAction(adminUsername, "DELETE_USER", `profile:${id}`, { firstName: deleted.firstName });
  res.json({ ok: true });
});

// ── TESTS ─────────────────────────────────────────────────────────────────────

router.get("/tests/export.csv", requireAuth, async (req, res) => {
  const adminUsername = await requireAdmin(req, res);
  if (!adminUsername) return;
  const rows = await db.select().from(testResultsTable).orderBy(desc(testResultsTable.createdAt));
  await logAction(adminUsername, "EXPORT_TESTS_CSV");
  sendCsv(res, "tests.csv", rows as unknown as Record<string, unknown>[], [
    "id", "userId", "totalScore", "stage", "stageName", "createdAt",
  ]);
});

router.get("/tests", requireAuth, async (req, res) => {
  const adminUsername = await requireAdmin(req, res);
  if (!adminUsername) return;
  const { page, limit, offset } = parsePage(req);
  const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
  const stageFilter = typeof req.query.stage === "string" ? req.query.stage.trim() : "";

  let where: ReturnType<typeof and> | ReturnType<typeof or> | ReturnType<typeof eq> | ReturnType<typeof ilike> | undefined;
  if (stageFilter) where = eq(testResultsTable.stage, parseInt(stageFilter, 10));
  if (search) {
    const s = or(
      ilike(profilesTable.firstName, `%${search}%`),
      ilike(profilesTable.lastName, `%${search}%`),
      ilike(profilesTable.email, `%${search}%`),
      ilike(testResultsTable.stageName, `%${search}%`),
    );
    where = where ? and(where, s) : s;
  }

  const [[totalRow], rows] = await Promise.all([
    db.select({ c: count() }).from(testResultsTable)
      .leftJoin(profilesTable, eq(testResultsTable.userId, profilesTable.userId)).where(where),
    db.select({
      id: testResultsTable.id, userId: testResultsTable.userId,
      totalScore: testResultsTable.totalScore, stage: testResultsTable.stage,
      stageName: testResultsTable.stageName, createdAt: testResultsTable.createdAt,
      firstName: profilesTable.firstName, lastName: profilesTable.lastName,
      email: profilesTable.email, avatarUrl: profilesTable.avatarUrl,
    }).from(testResultsTable)
      .leftJoin(profilesTable, eq(testResultsTable.userId, profilesTable.userId))
      .where(where).orderBy(desc(testResultsTable.createdAt)).limit(limit).offset(offset),
  ]);

  res.json({ data: rows, total: Number(totalRow.c), page, limit });
});

router.delete("/tests/:id", requireAuth, async (req, res) => {
  const adminUsername = await requireAdmin(req, res);
  if (!adminUsername) return;
  const id = parseInt(req.params.id as string, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const [deleted] = await db.delete(testResultsTable).where(eq(testResultsTable.id, id))
    .returning({ id: testResultsTable.id });
  if (!deleted) { res.status(404).json({ error: "Not found" }); return; }
  await logAction(adminUsername, "DELETE_TEST", `test:${id}`);
  res.json({ ok: true });
});

// ── CERTIFICATES ──────────────────────────────────────────────────────────────

router.get("/certificates/export.csv", requireAuth, async (req, res) => {
  const adminUsername = await requireAdmin(req, res);
  if (!adminUsername) return;
  const rows = await db.select().from(certificatesTable).orderBy(desc(certificatesTable.issuedAt));
  await logAction(adminUsername, "EXPORT_CERTS_CSV");
  sendCsv(res, "certificates.csv", rows as unknown as Record<string, unknown>[], [
    "id", "userId", "stage", "stageName", "certificateCode", "issuedAt",
  ]);
});

router.get("/certificates", requireAuth, async (req, res) => {
  const adminUsername = await requireAdmin(req, res);
  if (!adminUsername) return;
  const { page, limit, offset } = parsePage(req);
  const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
  const stageFilter = typeof req.query.stage === "string" ? req.query.stage.trim() : "";

  let where: ReturnType<typeof and> | ReturnType<typeof or> | ReturnType<typeof eq> | ReturnType<typeof ilike> | undefined;
  if (stageFilter) where = eq(certificatesTable.stage, parseInt(stageFilter, 10));
  if (search) {
    const s = or(
      ilike(profilesTable.firstName, `%${search}%`),
      ilike(profilesTable.lastName, `%${search}%`),
      ilike(profilesTable.email, `%${search}%`),
      ilike(certificatesTable.stageName, `%${search}%`),
      ilike(certificatesTable.certificateCode, `%${search}%`),
    );
    where = where ? and(where, s) : s;
  }

  const [[totalRow], rows] = await Promise.all([
    db.select({ c: count() }).from(certificatesTable)
      .leftJoin(profilesTable, eq(certificatesTable.userId, profilesTable.userId)).where(where),
    db.select({
      id: certificatesTable.id, userId: certificatesTable.userId,
      stage: certificatesTable.stage, stageName: certificatesTable.stageName,
      certificateCode: certificatesTable.certificateCode, issuedAt: certificatesTable.issuedAt,
      firstName: profilesTable.firstName, lastName: profilesTable.lastName, email: profilesTable.email,
    }).from(certificatesTable)
      .leftJoin(profilesTable, eq(certificatesTable.userId, profilesTable.userId))
      .where(where).orderBy(desc(certificatesTable.issuedAt)).limit(limit).offset(offset),
  ]);

  res.json({ data: rows, total: Number(totalRow.c), page, limit });
});

router.delete("/certificates/:id", requireAuth, async (req, res) => {
  const adminUsername = await requireAdmin(req, res);
  if (!adminUsername) return;
  const id = parseInt(req.params.id as string, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const [deleted] = await db.delete(certificatesTable).where(eq(certificatesTable.id, id))
    .returning({ id: certificatesTable.id, certificateCode: certificatesTable.certificateCode });
  if (!deleted) { res.status(404).json({ error: "Not found" }); return; }
  await logAction(adminUsername, "DELETE_CERT", `cert:${id}`, { code: deleted.certificateCode });
  res.json({ ok: true });
});

// ── JOURNALS ──────────────────────────────────────────────────────────────────

router.get("/journals/export.csv", requireAuth, async (req, res) => {
  const adminUsername = await requireAdmin(req, res);
  if (!adminUsername) return;
  const rows = await db.select().from(journalEntriesTable).orderBy(desc(journalEntriesTable.createdAt));
  await logAction(adminUsername, "EXPORT_JOURNALS_CSV");
  sendCsv(res, "journals.csv", rows as unknown as Record<string, unknown>[], [
    "id", "userId", "title", "category", "mood", "createdAt",
  ]);
});

router.get("/journals", requireAuth, async (req, res) => {
  const adminUsername = await requireAdmin(req, res);
  if (!adminUsername) return;
  const { page, limit, offset } = parsePage(req);
  const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
  const userSearch = typeof req.query.userSearch === "string" ? req.query.userSearch.trim() : "";

  const titleWhere = search ? ilike(journalEntriesTable.title, `%${search}%`) : undefined;
  const userWhere = userSearch ? or(
    ilike(profilesTable.email, `%${userSearch}%`),
    ilike(profilesTable.firstName, `%${userSearch}%`),
    ilike(profilesTable.lastName, `%${userSearch}%`),
  ) : undefined;
  const combinedWhere = titleWhere && userWhere ? and(titleWhere, userWhere) : titleWhere ?? userWhere;

  const [[totalRow], rows] = await Promise.all([
    db.select({ c: count() }).from(journalEntriesTable)
      .leftJoin(profilesTable, eq(journalEntriesTable.userId, profilesTable.userId)).where(combinedWhere),
    db.select({
      id: journalEntriesTable.id, userId: journalEntriesTable.userId,
      title: journalEntriesTable.title, category: journalEntriesTable.category,
      mood: journalEntriesTable.mood, createdAt: journalEntriesTable.createdAt,
      firstName: profilesTable.firstName, lastName: profilesTable.lastName, email: profilesTable.email,
    }).from(journalEntriesTable)
      .leftJoin(profilesTable, eq(journalEntriesTable.userId, profilesTable.userId))
      .where(combinedWhere).orderBy(desc(journalEntriesTable.createdAt)).limit(limit).offset(offset),
  ]);

  res.json({ data: rows, total: Number(totalRow.c), page, limit });
});

router.delete("/journals/:id", requireAuth, async (req, res) => {
  const adminUsername = await requireAdmin(req, res);
  if (!adminUsername) return;
  const id = parseInt(req.params.id as string, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const [deleted] = await db.delete(journalEntriesTable).where(eq(journalEntriesTable.id, id))
    .returning({ id: journalEntriesTable.id, title: journalEntriesTable.title });
  if (!deleted) { res.status(404).json({ error: "Not found" }); return; }
  await logAction(adminUsername, "DELETE_JOURNAL", `journal:${id}`, { title: deleted.title });
  res.json({ ok: true });
});

// ── DAILY TASKS ───────────────────────────────────────────────────────────────

router.get("/daily-tasks", requireAuth, async (req, res) => {
  const adminUsername = await requireAdmin(req, res);
  if (!adminUsername) return;
  const { page, limit, offset } = parsePage(req);
  const userSearch = typeof req.query.userSearch === "string" ? req.query.userSearch.trim() : "";

  const userWhere = userSearch ? or(
    ilike(profilesTable.firstName, `%${userSearch}%`),
    ilike(profilesTable.lastName, `%${userSearch}%`),
    ilike(profilesTable.email, `%${userSearch}%`),
  ) : undefined;

  const [aggregates, [totalRow]] = await Promise.all([
    db.select({
      userId: dailyTasksTable.userId,
      profileId: profilesTable.id,
      totalSlots: count(),
      completedSlots: sql<number>`sum(case when ${dailyTasksTable.done} then 1 else 0 end)::int`,
      daysLogged: sql<number>`count(distinct ${dailyTasksTable.date})::int`,
      firstName: profilesTable.firstName, lastName: profilesTable.lastName,
      email: profilesTable.email, avatarUrl: profilesTable.avatarUrl, streak: profilesTable.streak,
    }).from(dailyTasksTable)
      .leftJoin(profilesTable, eq(dailyTasksTable.userId, profilesTable.userId))
      .where(userWhere)
      .groupBy(dailyTasksTable.userId, profilesTable.id, profilesTable.firstName, profilesTable.lastName,
        profilesTable.email, profilesTable.avatarUrl, profilesTable.streak)
      .orderBy(sql`sum(case when ${dailyTasksTable.done} then 1 else 0 end) desc`)
      .limit(limit).offset(offset),
    db.select({ c: sql<number>`count(distinct ${dailyTasksTable.userId})::int` })
      .from(dailyTasksTable)
      .leftJoin(profilesTable, eq(dailyTasksTable.userId, profilesTable.userId))
      .where(userWhere),
  ]);

  res.json({ data: aggregates, total: Number(totalRow.c), page, limit });
});

// ── LEADERBOARD ───────────────────────────────────────────────────────────────

router.get("/leaderboard", requireAuth, async (req, res) => {
  const adminUsername = await requireAdmin(req, res);
  if (!adminUsername) return;
  const { page, limit, offset } = parsePage(req);

  const [profiles, testCounts, certCounts, [totalRow]] = await Promise.all([
    db.select().from(profilesTable)
      .orderBy(desc(profilesTable.consciousnessLevel), desc(profilesTable.streak))
      .limit(limit).offset(offset),
    db.select({ userId: testResultsTable.userId, c: count() }).from(testResultsTable)
      .groupBy(testResultsTable.userId),
    db.select({ userId: certificatesTable.userId, c: count() }).from(certificatesTable)
      .groupBy(certificatesTable.userId),
    db.select({ c: count() }).from(profilesTable),
  ]);

  const testMap = Object.fromEntries(testCounts.map(r => [r.userId, Number(r.c)]));
  const certMap = Object.fromEntries(certCounts.map(r => [r.userId, Number(r.c)]));

  const data = profiles.map((p, i) => ({
    rank: offset + i + 1,
    profile: p,
    testCount: testMap[p.userId] ?? 0,
    certCount: certMap[p.userId] ?? 0,
  }));

  res.json({ data, total: Number(totalRow.c), page, limit });
});

// ── COMMENTS ──────────────────────────────────────────────────────────────────

router.get("/comments", requireAuth, async (req, res) => {
  const adminUsername = await requireAdmin(req, res);
  if (!adminUsername) return;
  const { page, limit, offset } = parsePage(req);
  const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
  const statusFilter = typeof req.query.status === "string" ? req.query.status : "";

  let where: any;
  if (statusFilter === "pending") where = eq(commentsTable.approved, false);
  else if (statusFilter === "approved") where = eq(commentsTable.approved, true);

  if (search) {
    const s = or(
      ilike(commentsTable.content, `%${search}%`),
      ilike(commentsTable.authorName, `%${search}%`),
    );
    where = where ? and(where, s) : s;
  }

  const [[totalRow], rows] = await Promise.all([
    db.select({ c: count() }).from(commentsTable).where(where),
    db.select().from(commentsTable).where(where)
      .orderBy(desc(commentsTable.createdAt)).limit(limit).offset(offset),
  ]);

  res.json({ data: rows, total: Number(totalRow.c), page, limit });
});

router.post("/comments/:id/approve", requireAuth, async (req, res) => {
  const adminUsername = await requireAdmin(req, res);
  if (!adminUsername) return;
  const id = parseInt(req.params.id as string, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const [updated] = await db.update(commentsTable).set({ approved: true })
    .where(eq(commentsTable.id, id)).returning({ id: commentsTable.id, authorName: commentsTable.authorName });
  if (!updated) { res.status(404).json({ error: "Not found" }); return; }
  await logAction(adminUsername, "APPROVE_COMMENT", `comment:${id}`, { author: updated.authorName });
  res.json({ ok: true });
});

router.delete("/comments/:id", requireAuth, async (req, res) => {
  const adminUsername = await requireAdmin(req, res);
  if (!adminUsername) return;
  const id = parseInt(req.params.id as string, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const [deleted] = await db.delete(commentsTable).where(eq(commentsTable.id, id))
    .returning({ id: commentsTable.id, authorName: commentsTable.authorName });
  if (!deleted) { res.status(404).json({ error: "Not found" }); return; }
  await logAction(adminUsername, "DELETE_COMMENT", `comment:${id}`, { author: deleted.authorName });
  res.json({ ok: true });
});

// ── AUDIT LOG ─────────────────────────────────────────────────────────────────

async function auditLogHandler(req: any, res: any) {
  const adminUsername = await requireAdmin(req, res);
  if (!adminUsername) return;
  const { page, limit, offset } = parsePage(req);
  const actionFilter = typeof req.query.action === "string" ? req.query.action.trim() : "";

  const where = actionFilter ? eq(auditLogsTable.action, actionFilter) : undefined;
  const [[totalRow], rows] = await Promise.all([
    db.select({ c: count() }).from(auditLogsTable).where(where),
    db.select().from(auditLogsTable).where(where)
      .orderBy(desc(auditLogsTable.createdAt)).limit(limit).offset(offset),
  ]);
  res.json({ data: rows, total: Number(totalRow.c), page, limit });
}

router.get("/audit-log", requireAuth, auditLogHandler);
router.get("/audit-logs", requireAuth, auditLogHandler);

router.get("/audit-logs/export.csv", requireAuth, async (req, res) => {
  const adminUsername = await requireAdmin(req, res);
  if (!adminUsername) return;
  const rows = await db.select().from(auditLogsTable).orderBy(desc(auditLogsTable.createdAt));
  await logAction(adminUsername, "EXPORT_AUDIT_CSV");
  sendCsv(res, "audit-log.csv", rows as unknown as Record<string, unknown>[], [
    "id", "adminEmail", "action", "target", "details", "createdAt",
  ]);
});

// ── SITE SETTINGS ─────────────────────────────────────────────────────────────

async function getSettingsHandler(req: any, res: any) {
  const adminUsername = await requireAdmin(req, res);
  if (!adminUsername) return;
  const settings = await db.select().from(siteSettingsTable);
  const obj = Object.fromEntries(settings.map(s => [s.key, s.value]));
  res.json(obj);
}

async function putSettingsHandler(req: any, res: any) {
  const adminUsername = await requireAdmin(req, res);
  if (!adminUsername) return;
  const updates = req.body as Record<string, string>;
  await Promise.all(
    Object.entries(updates).map(([key, value]) =>
      db.insert(siteSettingsTable).values({ key, value })
        .onConflictDoUpdate({ target: siteSettingsTable.key, set: { value } })
    )
  );
  await logAction(adminUsername, "UPDATE_SETTINGS", undefined, { keys: Object.keys(updates) });
  res.json({ ok: true });
}

router.get("/settings", requireAuth, getSettingsHandler);
router.put("/settings", requireAuth, putSettingsHandler);
router.get("/site-settings", requireAuth, getSettingsHandler);
router.put("/site-settings", requireAuth, putSettingsHandler);

// ── ADMIN NOTIFICATIONS ───────────────────────────────────────────────────────

router.get("/notifications", requireAuth, async (req, res) => {
  const adminUsername = await requireAdmin(req, res);
  if (!adminUsername) return;

  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [newUsers, recentTests, recentCerts, pendingComments] = await Promise.all([
    db.select({ id: usersTable.id, username: usersTable.username, createdAt: usersTable.createdAt })
      .from(usersTable)
      .where(gte(usersTable.createdAt, since))
      .orderBy(desc(usersTable.createdAt))
      .limit(5),
    db.select({ id: testResultsTable.id, userId: testResultsTable.userId, stageName: testResultsTable.stageName, createdAt: testResultsTable.createdAt })
      .from(testResultsTable)
      .where(gte(testResultsTable.createdAt, since))
      .orderBy(desc(testResultsTable.createdAt))
      .limit(5),
    db.select({ id: certificatesTable.id, stageName: certificatesTable.stageName, issuedAt: certificatesTable.issuedAt })
      .from(certificatesTable)
      .where(gte(certificatesTable.issuedAt, since))
      .orderBy(desc(certificatesTable.issuedAt))
      .limit(5),
    db.select({ id: commentsTable.id, authorName: commentsTable.authorName, createdAt: commentsTable.createdAt })
      .from(commentsTable)
      .where(and(eq(commentsTable.approved, false), gte(commentsTable.createdAt, since)))
      .orderBy(desc(commentsTable.createdAt))
      .limit(5),
  ]);

  const notifications: { type: string; title: string; at: string | null }[] = [];

  for (const u of newUsers) {
    notifications.push({ type: "user", title: `Yeni istifadəçi: @${u.username}`, at: u.createdAt?.toISOString() ?? null });
  }
  for (const t of recentTests) {
    notifications.push({ type: "test", title: `Test nəticəsi: ${t.stageName} mərhələsi`, at: t.createdAt?.toISOString() ?? null });
  }
  for (const c of recentCerts) {
    notifications.push({ type: "cert", title: `Sertifikat verildi: ${c.stageName}`, at: c.issuedAt?.toISOString() ?? null });
  }
  for (const cm of pendingComments) {
    notifications.push({ type: "block", title: `Təsdiqlənməmiş rəy: ${cm.authorName}`, at: cm.createdAt?.toISOString() ?? null });
  }

  notifications.sort((a, b) => (b.at ?? "").localeCompare(a.at ?? ""));

  res.json(notifications);
});

export default router;
