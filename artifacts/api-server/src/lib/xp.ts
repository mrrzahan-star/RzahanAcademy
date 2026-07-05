import {
  db,
  profilesTable,
  xpRulesTable,
  xpEventsTable,
  levelsTable,
  achievementDefinitionsTable,
  userAchievementsTable,
  userNotificationsTable,
  userLessonProgressTable,
  userProgramProgressTable,
  testResultsTable,
  certificatesTable,
  siteSettingsTable,
  dailyTasksTable,
} from "@workspace/db";
import { eq, and, desc, count, gte, sql } from "drizzle-orm";
import { logger } from "./logger";

// ── Award XP ──────────────────────────────────────────────────────────────────

export async function awardXp(
  userId: string,
  actionType: string,
  refId?: string
): Promise<{ xpAwarded: number; levelUp: boolean; newLevelName: string | null }> {
  try {
    const [rule] = await db
      .select()
      .from(xpRulesTable)
      .where(and(eq(xpRulesTable.actionType, actionType), eq(xpRulesTable.isActive, true)));

    if (!rule || rule.xpAmount <= 0) return { xpAwarded: 0, levelUp: false, newLevelName: null };

    if (refId) {
      const [existing] = await db
        .select({ id: xpEventsTable.id })
        .from(xpEventsTable)
        .where(
          and(
            eq(xpEventsTable.userId, userId),
            eq(xpEventsTable.actionType, actionType),
            eq(xpEventsTable.refId, refId)
          )
        );
      if (existing) return { xpAwarded: 0, levelUp: false, newLevelName: null };
    }

    await db.insert(xpEventsTable).values({
      userId,
      actionType,
      xpAmount: rule.xpAmount,
      refId: refId ?? null,
      note: rule.label,
    });

    const [profile] = await db
      .select({ totalXp: profilesTable.totalXp, currentLevelName: profilesTable.currentLevelName })
      .from(profilesTable)
      .where(eq(profilesTable.userId, userId));

    if (!profile) return { xpAwarded: rule.xpAmount, levelUp: false, newLevelName: null };

    const newTotalXp = (profile.totalXp ?? 0) + rule.xpAmount;

    const levels = await db
      .select()
      .from(levelsTable)
      .where(eq(levelsTable.isActive, true))
      .orderBy(desc(levelsTable.requiredXp));

    const newLevel = levels.find((l) => newTotalXp >= l.requiredXp) ?? null;
    const levelUp = !!newLevel && newLevel.name !== (profile.currentLevelName ?? "Başlanğıc");

    await db
      .update(profilesTable)
      .set({
        totalXp: newTotalXp,
        ...(newLevel ? { currentLevelName: newLevel.name } : {}),
      })
      .where(eq(profilesTable.userId, userId));

    await db.insert(userNotificationsTable).values({
      userId,
      type: "xp",
      title: `+${rule.xpAmount} XP`,
      message: rule.label,
    });

    if (levelUp && newLevel) {
      await db.insert(userNotificationsTable).values({
        userId,
        type: "level_up",
        title: "Yeni Səviyyə! 🎉",
        message: `${newLevel.emoji ?? "⭐"} ${newLevel.name} səviyyəsinə yüksəldiniz`,
      });
    }

    checkAndGrantAchievements(userId, newTotalXp).catch((err) =>
      logger.warn({ err }, "Achievement check failed silently")
    );

    return { xpAwarded: rule.xpAmount, levelUp, newLevelName: newLevel?.name ?? null };
  } catch (err) {
    logger.error({ err }, "awardXp failed");
    return { xpAwarded: 0, levelUp: false, newLevelName: null };
  }
}

// ── Check & Grant Achievements ────────────────────────────────────────────────

export async function checkAndGrantAchievements(userId: string, currentXp?: number): Promise<void> {
  try {
    const defs = await db
      .select()
      .from(achievementDefinitionsTable)
      .where(eq(achievementDefinitionsTable.isActive, true));

    const earned = await db
      .select({ achievementId: userAchievementsTable.achievementId })
      .from(userAchievementsTable)
      .where(eq(userAchievementsTable.userId, userId));

    const earnedIds = new Set(earned.map((e) => e.achievementId));

    const [profile] = await db
      .select({
        streak: profilesTable.streak,
        totalXp: profilesTable.totalXp,
      })
      .from(profilesTable)
      .where(eq(profilesTable.userId, userId));

    const xp = currentXp ?? profile?.totalXp ?? 0;
    const streak = profile?.streak ?? 0;

    const [lessonRow] = await db
      .select({ c: count() })
      .from(userLessonProgressTable)
      .where(eq(userLessonProgressTable.userId, userId));
    const lessonCount = Number(lessonRow?.c ?? 0);

    const [programRow] = await db
      .select({ c: count() })
      .from(userProgramProgressTable)
      .where(and(eq(userProgramProgressTable.userId, userId), gte(userProgramProgressTable.progressPct, 100)));
    const programCount = Number(programRow?.c ?? 0);

    const [testRow] = await db
      .select({ c: count() })
      .from(testResultsTable)
      .where(eq(testResultsTable.userId, userId));
    const testCount = Number(testRow?.c ?? 0);

    const [certRow] = await db
      .select({ c: count() })
      .from(certificatesTable)
      .where(eq(certificatesTable.userId, userId));
    const certCount = Number(certRow?.c ?? 0);

    const articleXpEvents = await db
      .select({ c: count() })
      .from(xpEventsTable)
      .where(and(eq(xpEventsTable.userId, userId), eq(xpEventsTable.actionType, "article_read")));
    const articleCount = Number(articleXpEvents[0]?.c ?? 0);

    const storyXpEvents = await db
      .select({ c: count() })
      .from(xpEventsTable)
      .where(and(eq(xpEventsTable.userId, userId), eq(xpEventsTable.actionType, "story_read")));
    const storyCount = Number(storyXpEvents[0]?.c ?? 0);

    for (const def of defs) {
      if (earnedIds.has(def.id)) continue;

      let conditionMet = false;
      switch (def.triggerType) {
        case "xp_milestone":
          conditionMet = xp >= def.triggerValue;
          break;
        case "lesson_count":
          conditionMet = lessonCount >= def.triggerValue;
          break;
        case "program_count":
          conditionMet = programCount >= def.triggerValue;
          break;
        case "test_count":
          conditionMet = testCount >= def.triggerValue;
          break;
        case "cert_count":
          conditionMet = certCount >= def.triggerValue;
          break;
        case "streak_days":
          conditionMet = streak >= def.triggerValue;
          break;
        case "article_count":
          conditionMet = articleCount >= def.triggerValue;
          break;
        case "story_count":
          conditionMet = storyCount >= def.triggerValue;
          break;
        case "first_login":
          conditionMet = true;
          break;
      }

      if (!conditionMet) continue;

      await db.insert(userAchievementsTable).values({ userId, achievementId: def.id });

      if (def.xpReward > 0) {
        await db.insert(xpEventsTable).values({
          userId,
          actionType: "achievement",
          xpAmount: def.xpReward,
          refId: `ach_${def.id}`,
          note: def.name,
        });
        await db
          .update(profilesTable)
          .set({ totalXp: sql`${profilesTable.totalXp} + ${def.xpReward}` })
          .where(eq(profilesTable.userId, userId));
      }

      await db.insert(userNotificationsTable).values({
        userId,
        type: "achievement",
        title: `${def.emoji ?? "🏆"} ${def.name}`,
        message: def.description ?? "Yeni nailiyyət qazandınız!",
      });
    }
  } catch (err) {
    logger.error({ err }, "checkAndGrantAchievements failed");
  }
}

// ── Compute Dev Score ─────────────────────────────────────────────────────────

interface DevScoreWeights {
  lessonMax: number;
  programMax: number;
  testMax: number;
  certMax: number;
  taskMax: number;
  articleMax: number;
  storyMax: number;
  streakMax: number;
}

const DEFAULT_WEIGHTS: DevScoreWeights = {
  lessonMax: 30,
  programMax: 20,
  testMax: 15,
  certMax: 15,
  taskMax: 10,
  articleMax: 5,
  storyMax: 3,
  streakMax: 2,
};

export async function computeAndSaveDevScore(userId: string): Promise<number> {
  try {
    let weights = DEFAULT_WEIGHTS;
    try {
      const [setting] = await db
        .select({ value: siteSettingsTable.value })
        .from(siteSettingsTable)
        .where(eq(siteSettingsTable.key, "dev_score_weights"));
      if (setting?.value) {
        weights = { ...DEFAULT_WEIGHTS, ...JSON.parse(setting.value) };
      }
    } catch {
      // use defaults
    }

    const [profile] = await db
      .select({ streak: profilesTable.streak })
      .from(profilesTable)
      .where(eq(profilesTable.userId, userId));

    const [lessonRow] = await db
      .select({ c: count() })
      .from(userLessonProgressTable)
      .where(eq(userLessonProgressTable.userId, userId));
    const lessons = Number(lessonRow?.c ?? 0);

    const [programRow] = await db
      .select({ c: count() })
      .from(userProgramProgressTable)
      .where(and(eq(userProgramProgressTable.userId, userId), gte(userProgramProgressTable.progressPct, 100)));
    const programs = Number(programRow?.c ?? 0);

    const [testRow] = await db
      .select({ c: count() })
      .from(testResultsTable)
      .where(eq(testResultsTable.userId, userId));
    const tests = Number(testRow?.c ?? 0);

    const [certRow] = await db
      .select({ c: count() })
      .from(certificatesTable)
      .where(eq(certificatesTable.userId, userId));
    const certs = Number(certRow?.c ?? 0);

    const [taskRow] = await db
      .select({ c: count() })
      .from(dailyTasksTable)
      .where(and(eq(dailyTasksTable.userId, userId), eq(dailyTasksTable.done, true)));
    const tasks = Number(taskRow?.c ?? 0);

    const [articleRow] = await db
      .select({ c: count() })
      .from(xpEventsTable)
      .where(and(eq(xpEventsTable.userId, userId), eq(xpEventsTable.actionType, "article_read")));
    const articles = Number(articleRow?.c ?? 0);

    const [storyRow] = await db
      .select({ c: count() })
      .from(xpEventsTable)
      .where(and(eq(xpEventsTable.userId, userId), eq(xpEventsTable.actionType, "story_read")));
    const stories = Number(storyRow?.c ?? 0);

    const streak = profile?.streak ?? 0;

    const score =
      Math.min(lessons * 3, weights.lessonMax) +
      Math.min(programs * 10, weights.programMax) +
      Math.min(tests * 5, weights.testMax) +
      Math.min(certs * 15, weights.certMax) +
      Math.min(tasks * 0.5, weights.taskMax) +
      Math.min(articles * 1, weights.articleMax) +
      Math.min(stories * 1, weights.storyMax) +
      Math.min(streak * 0.1, weights.streakMax);

    const devScore = Math.min(100, Math.round(score));

    await db
      .update(profilesTable)
      .set({ devScore })
      .where(eq(profilesTable.userId, userId));

    return devScore;
  } catch (err) {
    logger.error({ err }, "computeAndSaveDevScore failed");
    return 0;
  }
}

// ── Daily Login XP ────────────────────────────────────────────────────────────

export async function maybeTriggerDailyLogin(userId: string): Promise<void> {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const [profile] = await db
      .select({ lastActiveAt: profilesTable.lastActiveAt, streak: profilesTable.streak })
      .from(profilesTable)
      .where(eq(profilesTable.userId, userId));

    if (!profile) return;

    const lastDate = profile.lastActiveAt
      ? profile.lastActiveAt.toISOString().slice(0, 10)
      : null;

    if (lastDate === today) return;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);

    const newStreak = lastDate === yesterdayStr ? (profile.streak ?? 0) + 1 : 1;

    await db
      .update(profilesTable)
      .set({ lastActiveAt: new Date(), streak: newStreak })
      .where(eq(profilesTable.userId, userId));

    await awardXp(userId, "daily_login", `login_${today}`);

    if (newStreak === 7) {
      await awardXp(userId, "streak_7day", `streak7_${userId}`);
      await db.insert(userNotificationsTable).values({
        userId,
        type: "streak",
        title: "🔥 7 Gün Ardıcıllıq!",
        message: "Fasiləsiz 7 gün aktiv oldunuz — əla nəticə!",
      });
    } else if (newStreak === 30) {
      await awardXp(userId, "streak_30day", `streak30_${userId}`);
      await db.insert(userNotificationsTable).values({
        userId,
        type: "streak",
        title: "🔥 30 Gün Ardıcıllıq!",
        message: "30 gün fasiləsiz aktivlik — inanılmaz irəliləyiş!",
      });
    }

    checkAndGrantAchievements(userId).catch(() => {});
  } catch (err) {
    logger.error({ err }, "maybeTriggerDailyLogin failed");
  }
}
