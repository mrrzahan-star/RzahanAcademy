import { Router } from "express";
import { requireAuth } from "../middlewares/auth";
import { db, xpEventsTable, levelsTable, userAchievementsTable, achievementDefinitionsTable, profilesTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { awardXp } from "../lib/xp";

const router = Router();

// GET /api/xp/summary — current user XP, level, achievements
router.get("/summary", requireAuth, async (req, res) => {
  const userId = req.userId!;

  const [profile] = await db
    .select({
      totalXp: profilesTable.totalXp,
      currentLevelName: profilesTable.currentLevelName,
      devScore: profilesTable.devScore,
      streak: profilesTable.streak,
    })
    .from(profilesTable)
    .where(eq(profilesTable.userId, userId));

  const levels = await db
    .select()
    .from(levelsTable)
    .where(eq(levelsTable.isActive, true))
    .orderBy(desc(levelsTable.requiredXp));

  const totalXp = profile?.totalXp ?? 0;
  const currentLevel = levels.find((l) => totalXp >= l.requiredXp) ?? levels[levels.length - 1];
  const nextLevel = levels.slice().reverse().find((l) => totalXp < l.requiredXp && l.requiredXp > (currentLevel?.requiredXp ?? 0)) ?? null;

  const recentEvents = await db
    .select()
    .from(xpEventsTable)
    .where(eq(xpEventsTable.userId, userId))
    .orderBy(desc(xpEventsTable.createdAt))
    .limit(20);

  const userAchievements = await db
    .select({ achievementId: userAchievementsTable.achievementId, unlockedAt: userAchievementsTable.unlockedAt })
    .from(userAchievementsTable)
    .where(eq(userAchievementsTable.userId, userId));

  const achievementIds = userAchievements.map((a) => a.achievementId);
  const defs = achievementIds.length > 0
    ? await db.select().from(achievementDefinitionsTable)
    : [];

  const achievements = userAchievements.map((ua) => {
    const def = defs.find((d) => d.id === ua.achievementId);
    return {
      id: ua.achievementId,
      name: def?.name ?? "Nailiyyət",
      description: def?.description ?? null,
      emoji: def?.emoji ?? "🏆",
      color: def?.color ?? "#f59e0b",
      unlockedAt: ua.unlockedAt.toISOString(),
    };
  });

  res.json({
    totalXp,
    currentLevel: currentLevel
      ? { name: currentLevel.name, emoji: currentLevel.emoji, color: currentLevel.color, requiredXp: currentLevel.requiredXp }
      : null,
    nextLevel: nextLevel
      ? { name: nextLevel.name, requiredXp: nextLevel.requiredXp, xpNeeded: nextLevel.requiredXp - totalXp }
      : null,
    devScore: profile?.devScore ?? 0,
    streak: profile?.streak ?? 0,
    recentEvents: recentEvents.map((e) => ({
      id: e.id,
      actionType: e.actionType,
      xpAmount: e.xpAmount,
      note: e.note,
      createdAt: e.createdAt.toISOString(),
    })),
    achievements,
  });
});

// POST /api/xp/award — award XP for content reads (article, story)
router.post("/award", requireAuth, async (req, res) => {
  const userId = req.userId!;
  const { actionType, refId } = req.body as { actionType?: string; refId?: string };

  const ALLOWED = ["article_read", "story_read"];
  if (!actionType || !ALLOWED.includes(actionType)) {
    res.status(400).json({ error: "Invalid action type" });
    return;
  }

  const result = await awardXp(userId, actionType, refId);
  res.json(result);
});

// GET /api/xp/levels — public list of levels
router.get("/levels", async (_req, res) => {
  const levels = await db
    .select()
    .from(levelsTable)
    .where(eq(levelsTable.isActive, true))
    .orderBy(levelsTable.sortOrder);
  res.json(levels);
});

export default router;
