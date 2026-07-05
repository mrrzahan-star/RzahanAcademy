import { Router } from "express";
import { requireAuth } from "../middlewares/auth";
import {
  db,
  cmsPackagesTable,
  cmsProgramCategoriesTable,
  cmsProgramsTable,
  cmsModulesTable,
  cmsLessonsTable,
  cmsArticleCategoriesTable,
  cmsArticlesTable,
  cmsStoryCategoriesTable,
  cmsLifeStoriesTable,
  cmsQuotesTable,
  cmsTaskDefinitionsTable,
  cmsFaqsTable,
  cmsAnnouncementsTable,
  cmsSlidersTable,
  cmsMediaTable,
  auditLogsTable,
} from "@workspace/db";
import { eq, desc, asc, count } from "drizzle-orm";

const router = Router();

async function requireAdmin(req: any, res: any): Promise<string | null> {
  if (!req.userId) { res.status(401).json({ error: "Unauthorized" }); return null; }
  if (req.userRole !== "admin") { res.status(403).json({ error: "Forbidden" }); return null; }
  return req.username as string;
}

async function logAction(admin: string, action: string, target?: string) {
  try { await db.insert(auditLogsTable).values({ adminEmail: admin, action, target }); } catch { }
}

function parsePage(req: any) {
  const page = Math.max(1, parseInt(req.query.page as string || "1", 10));
  const limit = Math.min(200, Math.max(1, parseInt(req.query.limit as string || "50", 10)));
  return { page, limit, offset: (page - 1) * limit };
}

function makeSlug(s: string) {
  return s.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").slice(0, 80);
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: build CRUD routes for a simple table (no relations)
// ─────────────────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function crudRoutes(path: string, table: any, label: string) {
  router.get(path, requireAuth, async (req, res) => {
    const admin = await requireAdmin(req, res); if (!admin) return;
    const { limit, offset } = parsePage(req);
    const orderCol = table.sortOrder ?? table.createdAt;
    const rows = await db.select().from(table).orderBy(asc(orderCol)).limit(limit).offset(offset);
    const countRows = await db.select({ c: count() }).from(table);
    res.json({ data: rows, total: Number(countRows[0].c) });
  });

  router.post(path, requireAuth, async (req, res) => {
    const admin = await requireAdmin(req, res); if (!admin) return;
    const body = req.body as Record<string, unknown>;
    if (!body.slug && typeof body.name === "string") body.slug = makeSlug(body.name);
    if (!body.slug && typeof body.title === "string") body.slug = makeSlug(body.title);
    const rows = await db.insert(table).values(body).returning() as any[];
    const row = rows[0];
    await logAction(admin, `CREATE_${label}`, String(row.id));
    res.json(row);
  });

  router.put(`${path}/:id`, requireAuth, async (req, res) => {
    const admin = await requireAdmin(req, res); if (!admin) return;
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
    const body = req.body as Record<string, unknown>;
    delete body.id; delete body.createdAt;
    const [row] = await db.update(table as any).set(body).where(eq((table as any).id, id)).returning() as any[];
    if (!row) { res.status(404).json({ error: "Not found" }); return; }
    await logAction(admin, `UPDATE_${label}`, String(id));
    res.json(row);
  });

  router.delete(`${path}/:id`, requireAuth, async (req, res) => {
    const admin = await requireAdmin(req, res); if (!admin) return;
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
    const [row] = await db.delete(table as any).where(eq((table as any).id, id)).returning() as any[];
    if (!row) { res.status(404).json({ error: "Not found" }); return; }
    await logAction(admin, `DELETE_${label}`, String(id));
    res.json({ ok: true });
  });
}

// ── PACKAGES ─────────────────────────────────────────────────────────────────
crudRoutes("/packages", cmsPackagesTable, "PACKAGE");

// ── PROGRAM CATEGORIES ────────────────────────────────────────────────────────
crudRoutes("/program-categories", cmsProgramCategoriesTable, "PROGRAM_CAT");

// ── PROGRAMS ─────────────────────────────────────────────────────────────────
crudRoutes("/programs", cmsProgramsTable, "PROGRAM");

// ── MODULES ──────────────────────────────────────────────────────────────────
crudRoutes("/modules", cmsModulesTable, "MODULE");

// ── LESSONS ──────────────────────────────────────────────────────────────────

router.get("/lessons", requireAuth, async (req, res) => {
  const admin = await requireAdmin(req, res); if (!admin) return;
  const { limit, offset } = parsePage(req);
  const moduleId = req.query.moduleId ? parseInt(req.query.moduleId as string, 10) : undefined;
  let rows, total;
  if (moduleId) {
    [rows, [{ c: total }]] = await Promise.all([
      db.select().from(cmsLessonsTable).where(eq(cmsLessonsTable.moduleId, moduleId)).orderBy(asc(cmsLessonsTable.sortOrder)).limit(limit).offset(offset),
      db.select({ c: count() }).from(cmsLessonsTable).where(eq(cmsLessonsTable.moduleId, moduleId)),
    ]);
  } else {
    [rows, [{ c: total }]] = await Promise.all([
      db.select().from(cmsLessonsTable).orderBy(desc(cmsLessonsTable.createdAt)).limit(limit).offset(offset),
      db.select({ c: count() }).from(cmsLessonsTable),
    ]);
  }
  res.json({ data: rows, total: Number(total) });
});

router.post("/lessons", requireAuth, async (req, res) => {
  const admin = await requireAdmin(req, res); if (!admin) return;
  const [row] = await db.insert(cmsLessonsTable).values(req.body as any).returning();
  await logAction(admin, "CREATE_LESSON", String(row.id));
  res.json(row);
});

router.put("/lessons/:id", requireAuth, async (req, res) => {
  const admin = await requireAdmin(req, res); if (!admin) return;
  const id = parseInt(req.params.id as string, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const body = req.body as Record<string, unknown>;
  delete body.id; delete body.createdAt;
  const [row] = await db.update(cmsLessonsTable).set(body as any).where(eq(cmsLessonsTable.id, id)).returning();
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  await logAction(admin, "UPDATE_LESSON", String(id));
  res.json(row);
});

router.delete("/lessons/:id", requireAuth, async (req, res) => {
  const admin = await requireAdmin(req, res); if (!admin) return;
  const id = parseInt(req.params.id as string, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const [row] = await db.delete(cmsLessonsTable).where(eq(cmsLessonsTable.id, id)).returning();
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  await logAction(admin, "DELETE_LESSON", String(id));
  res.json({ ok: true });
});

// ── ARTICLE CATEGORIES ────────────────────────────────────────────────────────
crudRoutes("/article-categories", cmsArticleCategoriesTable, "ARTICLE_CAT");

// ── ARTICLES ─────────────────────────────────────────────────────────────────
crudRoutes("/articles", cmsArticlesTable, "ARTICLE");

// ── STORY CATEGORIES ──────────────────────────────────────────────────────────
crudRoutes("/story-categories", cmsStoryCategoriesTable, "STORY_CAT");

// ── LIFE STORIES ──────────────────────────────────────────────────────────────
crudRoutes("/life-stories", cmsLifeStoriesTable, "LIFE_STORY");

// ── QUOTES ────────────────────────────────────────────────────────────────────
crudRoutes("/quotes", cmsQuotesTable, "QUOTE");

// ── TASK DEFINITIONS ─────────────────────────────────────────────────────────
crudRoutes("/task-definitions", cmsTaskDefinitionsTable, "TASK_DEF");

// ── FAQS ─────────────────────────────────────────────────────────────────────
crudRoutes("/faqs", cmsFaqsTable, "FAQ");

// ── ANNOUNCEMENTS ─────────────────────────────────────────────────────────────
crudRoutes("/announcements", cmsAnnouncementsTable, "ANNOUNCEMENT");

// ── SLIDERS ───────────────────────────────────────────────────────────────────
crudRoutes("/sliders", cmsSlidersTable, "SLIDER");

// ── MEDIA ─────────────────────────────────────────────────────────────────────

router.get("/media", requireAuth, async (req, res) => {
  const admin = await requireAdmin(req, res); if (!admin) return;
  const { limit, offset } = parsePage(req);
  const [rows, [{ c: total }]] = await Promise.all([
    db.select().from(cmsMediaTable).orderBy(desc(cmsMediaTable.createdAt)).limit(limit).offset(offset),
    db.select({ c: count() }).from(cmsMediaTable),
  ]);
  res.json({ data: rows, total: Number(total) });
});

router.post("/media", requireAuth, async (req, res) => {
  const admin = await requireAdmin(req, res); if (!admin) return;
  const body = req.body as Record<string, unknown>;
  if (!body.filename) body.filename = String(body.originalName || body.url || "file");
  body.uploadedBy = admin;
  const [row] = await db.insert(cmsMediaTable).values(body as any).returning();
  await logAction(admin, "ADD_MEDIA", String(row.id));
  res.json(row);
});

router.delete("/media/:id", requireAuth, async (req, res) => {
  const admin = await requireAdmin(req, res); if (!admin) return;
  const id = parseInt(req.params.id as string, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const [row] = await db.delete(cmsMediaTable).where(eq(cmsMediaTable.id, id)).returning();
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  await logAction(admin, "DELETE_MEDIA", String(id));
  res.json({ ok: true });
});

// ── COUNTS (dashboard) ────────────────────────────────────────────────────────

router.get("/counts", requireAuth, async (req, res) => {
  const admin = await requireAdmin(req, res); if (!admin) return;
  const results = await Promise.all([
    db.select({ c: count() }).from(cmsPackagesTable),
    db.select({ c: count() }).from(cmsProgramsTable),
    db.select({ c: count() }).from(cmsModulesTable),
    db.select({ c: count() }).from(cmsLessonsTable),
    db.select({ c: count() }).from(cmsArticlesTable),
    db.select({ c: count() }).from(cmsLifeStoriesTable),
    db.select({ c: count() }).from(cmsQuotesTable),
    db.select({ c: count() }).from(cmsFaqsTable),
    db.select({ c: count() }).from(cmsAnnouncementsTable),
    db.select({ c: count() }).from(cmsMediaTable),
    db.select({ c: count() }).from(cmsTaskDefinitionsTable),
  ]);
  const [pkgs, prgs, mods, lsns, arts, strs, qts, faqs, anns, mdia, tdef] = results.map(r => Number(r[0].c));
  res.json({ packages: pkgs, programs: prgs, modules: mods, lessons: lsns, articles: arts, lifeStories: strs, quotes: qts, faqs, announcements: anns, media: mdia, taskDefinitions: tdef });
});

export default router;
