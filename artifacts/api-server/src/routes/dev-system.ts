import { Router, type Request, type Response, type NextFunction } from "express";
import { requireAuth } from "../middlewares/auth";
import {
  db, xpRulesTable, levelsTable, achievementDefinitionsTable,
  userAchievementsTable, profilesTable, xpEventsTable, siteSettingsTable,
} from "@workspace/db";
import { eq, desc, count } from "drizzle-orm";

const router = Router();

function adminOnly(req: Request, res: Response, next: NextFunction): void {
  if ((req as any).userRole !== "admin") { res.status(403).json({ error: "Forbidden" }); return; }
  next();
}

router.use(requireAuth, adminOnly);

// ── XP Rules ──────────────────────────────────────────────────────────────────

router.get("/xp-rules", async (_req, res) => {
  const rules = await db.select().from(xpRulesTable).orderBy(xpRulesTable.id);
  res.json(rules);
});

router.put("/xp-rules/:id", async (req, res) => {
  const id = parseInt(req.params.id as string, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const { xpAmount, isActive, label } = req.body as { xpAmount?: number; isActive?: boolean; label?: string };
  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (xpAmount !== undefined) updates.xpAmount = xpAmount;
  if (isActive !== undefined) updates.isActive = isActive;
  if (label !== undefined) updates.label = label;
  const [updated] = await db.update(xpRulesTable).set(updates).where(eq(xpRulesTable.id, id)).returning();
  res.json(updated);
});

// ── Levels ────────────────────────────────────────────────────────────────────

router.get("/levels", async (_req, res) => {
  const levels = await db.select().from(levelsTable).orderBy(levelsTable.sortOrder);
  res.json(levels);
});

router.post("/levels", async (req, res) => {
  const { name, description, requiredXp, emoji, color, sortOrder } = req.body as {
    name: string; description?: string; requiredXp: number;
    emoji?: string; color?: string; sortOrder?: number;
  };
  if (!name || requiredXp === undefined) { res.status(400).json({ error: "name and requiredXp are required" }); return; }
  const [created] = await db.insert(levelsTable).values({
    name, description: description ?? null,
    requiredXp, emoji: emoji ?? "⭐",
    color: color ?? "#6366f1",
    sortOrder: sortOrder ?? 0,
  }).returning();
  res.status(201).json(created);
});

router.put("/levels/:id", async (req, res) => {
  const id = parseInt(req.params.id as string, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const { name, description, requiredXp, emoji, color, sortOrder, isActive } = req.body as {
    name?: string; description?: string; requiredXp?: number;
    emoji?: string; color?: string; sortOrder?: number; isActive?: boolean;
  };
  const updates: Record<string, unknown> = {};
  if (name !== undefined) updates.name = name;
  if (description !== undefined) updates.description = description;
  if (requiredXp !== undefined) updates.requiredXp = requiredXp;
  if (emoji !== undefined) updates.emoji = emoji;
  if (color !== undefined) updates.color = color;
  if (sortOrder !== undefined) updates.sortOrder = sortOrder;
  if (isActive !== undefined) updates.isActive = isActive;
  const [updated] = await db.update(levelsTable).set(updates).where(eq(levelsTable.id, id)).returning();
  res.json(updated);
});

router.delete("/levels/:id", async (req, res) => {
  const id = parseInt(req.params.id as string, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  await db.delete(levelsTable).where(eq(levelsTable.id, id));
  res.json({ ok: true });
});

// ── Achievements ──────────────────────────────────────────────────────────────

router.get("/achievements", async (_req, res) => {
  const defs = await db.select().from(achievementDefinitionsTable).orderBy(achievementDefinitionsTable.sortOrder);
  res.json(defs);
});

router.post("/achievements", async (req, res) => {
  const { name, description, emoji, color, xpReward, triggerType, triggerValue, sortOrder } = req.body as {
    name: string; description?: string; emoji?: string; color?: string;
    xpReward?: number; triggerType: string; triggerValue: number; sortOrder?: number;
  };
  if (!name || !triggerType || triggerValue === undefined) {
    res.status(400).json({ error: "name, triggerType, triggerValue are required" });
    return;
  }
  const [created] = await db.insert(achievementDefinitionsTable).values({
    name, description: description ?? null,
    emoji: emoji ?? "🏆", color: color ?? "#f59e0b",
    xpReward: xpReward ?? 0, triggerType, triggerValue,
    sortOrder: sortOrder ?? 0,
  }).returning();
  res.status(201).json(created);
});

router.put("/achievements/:id", async (req, res) => {
  const id = parseInt(req.params.id as string, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const { name, description, emoji, color, xpReward, triggerType, triggerValue, isActive, sortOrder } = req.body as {
    name?: string; description?: string; emoji?: string; color?: string;
    xpReward?: number; triggerType?: string; triggerValue?: number;
    isActive?: boolean; sortOrder?: number;
  };
  const updates: Record<string, unknown> = {};
  if (name !== undefined) updates.name = name;
  if (description !== undefined) updates.description = description;
  if (emoji !== undefined) updates.emoji = emoji;
  if (color !== undefined) updates.color = color;
  if (xpReward !== undefined) updates.xpReward = xpReward;
  if (triggerType !== undefined) updates.triggerType = triggerType;
  if (triggerValue !== undefined) updates.triggerValue = triggerValue;
  if (isActive !== undefined) updates.isActive = isActive;
  if (sortOrder !== undefined) updates.sortOrder = sortOrder;
  const [updated] = await db.update(achievementDefinitionsTable).set(updates).where(eq(achievementDefinitionsTable.id, id)).returning();
  res.json(updated);
});

router.delete("/achievements/:id", async (req, res) => {
  const id = parseInt(req.params.id as string, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  await db.delete(achievementDefinitionsTable).where(eq(achievementDefinitionsTable.id, id));
  res.json({ ok: true });
});

// ── Dev Score Weights ─────────────────────────────────────────────────────────

router.get("/dev-score-weights", async (_req, res) => {
  const [setting] = await db
    .select({ value: siteSettingsTable.value })
    .from(siteSettingsTable)
    .where(eq(siteSettingsTable.key, "dev_score_weights"));

  const defaults = {
    lessonMax: 30, programMax: 20, testMax: 15, certMax: 15,
    taskMax: 10, articleMax: 5, storyMax: 3, streakMax: 2,
  };

  res.json(setting?.value ? { ...defaults, ...JSON.parse(setting.value) } : defaults);
});

router.put("/dev-score-weights", async (req, res) => {
  const weights = req.body as Record<string, number>;
  const value = JSON.stringify(weights);
  await db
    .insert(siteSettingsTable)
    .values({ key: "dev_score_weights", value })
    .onConflictDoUpdate({ target: siteSettingsTable.key, set: { value } });
  res.json({ ok: true, weights });
});

// ── Stats ─────────────────────────────────────────────────────────────────────

router.get("/stats", async (_req, res) => {
  const [totalXpRow] = await db.select({ total: count(xpEventsTable.id) }).from(xpEventsTable);
  const [achievementsRow] = await db.select({ total: count(userAchievementsTable.id) }).from(userAchievementsTable);
  const [levelsRow] = await db.select({ total: count(levelsTable.id) }).from(levelsTable).where(eq(levelsTable.isActive, true));
  const [achDefsRow] = await db.select({ total: count(achievementDefinitionsTable.id) }).from(achievementDefinitionsTable).where(eq(achievementDefinitionsTable.isActive, true));

  res.json({
    totalXpEvents: Number(totalXpRow?.total ?? 0),
    totalAchievementsUnlocked: Number(achievementsRow?.total ?? 0),
    activeLevels: Number(levelsRow?.total ?? 0),
    activeAchievementDefs: Number(achDefsRow?.total ?? 0),
  });
});

export default router;
