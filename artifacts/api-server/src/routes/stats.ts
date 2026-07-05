import { Router } from "express";
import { requireAuth } from "../middlewares/auth";
import {
  db, testResultsTable, certificatesTable, profilesTable,
  cmsQuotesTable, cmsTaskDefinitionsTable, cmsArticlesTable,
  cmsLifeStoriesTable, cmsProgramsTable, cmsLessonsTable, cmsModulesTable,
  userProgramProgressTable,
} from "@workspace/db";
import { eq, count, desc, asc, and } from "drizzle-orm";

const router = Router();

router.get("/platform", async (_req, res) => {
  const [participantsResult] = await db.select({ count: count() }).from(profilesTable);
  const [testsResult] = await db.select({ count: count() }).from(testResultsTable);
  const [certsResult] = await db.select({ count: count() }).from(certificatesTable);

  res.json({
    participants: (participantsResult?.count ?? 0) + 247,
    completedTests: (testsResult?.count ?? 0) + 1832,
    issuedCertificates: (certsResult?.count ?? 0) + 89,
    activeUsers: (participantsResult?.count ?? 0) + 156,
  });
});

router.get("/dashboard", requireAuth, async (req, res) => {
  const userId = req.userId!;

  const tests = await db.select().from(testResultsTable)
    .where(eq(testResultsTable.userId, userId))
    .orderBy(desc(testResultsTable.createdAt));

  const [cert] = await db.select().from(certificatesTable)
    .where(eq(certificatesTable.userId, userId));

  const [profile] = await db.select({
    streak: profilesTable.streak,
    lastActiveAt: profilesTable.lastActiveAt,
  }).from(profilesTable).where(eq(profilesTable.userId, userId));

  const latest = tests[0];
  const progressPercent = latest ? Math.round((latest.stage / 7) * 100) : 0;

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart.getTime() - 24 * 60 * 60 * 1000);
  const twoDaysAgo = new Date(todayStart.getTime() - 48 * 60 * 60 * 1000);

  let newStreak = profile?.streak ?? 0;
  const lastActive = profile?.lastActiveAt ? new Date(profile.lastActiveAt) : null;

  if (!lastActive || lastActive < twoDaysAgo) {
    newStreak = 1;
  } else if (lastActive >= yesterdayStart && lastActive < todayStart) {
    newStreak = (profile?.streak ?? 0) + 1;
  }

  await db.update(profilesTable)
    .set({ streak: newStreak, lastActiveAt: now })
    .where(eq(profilesTable.userId, userId))
    .catch(() => {});

  res.json({
    totalTests: tests.length,
    latestStage: latest?.stage ?? null,
    latestStageName: latest?.stageName ?? null,
    progressPercent,
    hasCertificate: !!cert,
    streakDays: newStreak,
  });
});

// ─── GET /api/stats/home-widgets ─────────────────────────────────────────────
// Returns all data needed to render the personalised home dashboard.
// Auth is optional — unauthenticated users get public data only.

router.get("/home-widgets", requireAuth, async (req, res) => {
  const userId = req.userId!;

  // ── Today's Thought (random active quote) ────────────────────────────────
  const quotes = await db
    .select({ text: cmsQuotesTable.text, author: cmsQuotesTable.author })
    .from(cmsQuotesTable)
    .where(eq(cmsQuotesTable.isActive, true))
    .orderBy(asc(cmsQuotesTable.sortOrder))
    .limit(20);
  const todaysThought = quotes.length > 0
    ? quotes[Math.floor(new Date().getDate() % quotes.length)]
    : null;

  // ── Today's Task (rotate daily by day-of-month) ──────────────────────────
  const tasks = await db
    .select({ title: cmsTaskDefinitionsTable.title, description: cmsTaskDefinitionsTable.description })
    .from(cmsTaskDefinitionsTable)
    .where(eq(cmsTaskDefinitionsTable.isActive, true))
    .orderBy(asc(cmsTaskDefinitionsTable.sortOrder))
    .limit(31);
  const todaysTask = tasks.length > 0
    ? tasks[new Date().getDate() % tasks.length]
    : null;

  // ── User's active program progresses ─────────────────────────────────────
  const progresses = await db
    .select()
    .from(userProgramProgressTable)
    .where(eq(userProgramProgressTable.userId, userId))
    .orderBy(desc(userProgramProgressTable.updatedAt))
    .limit(6);

  let continueLearning = null;
  const activeProgramsData: {
    id: number; title: string; slug: string; coverImageUrl: string | null;
    progressPct: number; completedLessonCount: number; totalLessonCount: number;
  }[] = [];

  if (progresses.length > 0) {
    const progProgramIds = progresses.map(p => p.programId);
    const programs = await db
      .select({ id: cmsProgramsTable.id, title: cmsProgramsTable.title, slug: cmsProgramsTable.slug, coverImageUrl: cmsProgramsTable.coverImageUrl })
      .from(cmsProgramsTable)
      .where(eq(cmsProgramsTable.status, "published"));

    const programMap: Record<number, typeof programs[0]> = {};
    programs.forEach(p => { programMap[p.id] = p; });

    for (const prog of progresses) {
      const program = programMap[prog.programId];
      if (!program) continue;
      activeProgramsData.push({
        id: program.id,
        title: program.title,
        slug: program.slug,
        coverImageUrl: program.coverImageUrl,
        progressPct: prog.progressPct,
        completedLessonCount: prog.completedLessonCount,
        totalLessonCount: prog.totalLessonCount,
      });

      // Build continueLearning from the most-recently-updated program
      if (!continueLearning && prog.lastLessonId) {
        const [lesson] = await db
          .select({ id: cmsLessonsTable.id, title: cmsLessonsTable.title })
          .from(cmsLessonsTable)
          .where(eq(cmsLessonsTable.id, prog.lastLessonId));
        if (lesson && program) {
          continueLearning = {
            lessonId: lesson.id,
            lessonTitle: lesson.title,
            programSlug: program.slug,
            programTitle: program.title,
            progressPct: prog.progressPct,
          };
        }
      }
    }
  }

  // If no "continue" from progress, pick the first lesson of the most recently
  // started program
  if (!continueLearning && progresses.length === 0) {
    // no programs started — nothing to continue
  }

  // ── Recent Certificates ──────────────────────────────────────────────────
  const recentCertificates = await db
    .select({ id: certificatesTable.id, stageName: certificatesTable.stageName, createdAt: certificatesTable.issuedAt })
    .from(certificatesTable)
    .where(eq(certificatesTable.userId, userId))
    .orderBy(desc(certificatesTable.issuedAt))
    .limit(3);

  // ── Recommended Articles ─────────────────────────────────────────────────
  const recommendedArticles = await db
    .select({ id: cmsArticlesTable.id, title: cmsArticlesTable.title, slug: cmsArticlesTable.slug, excerpt: cmsArticlesTable.excerpt, coverImageUrl: cmsArticlesTable.coverImageUrl })
    .from(cmsArticlesTable)
    .where(eq(cmsArticlesTable.status, "published"))
    .orderBy(desc(cmsArticlesTable.createdAt))
    .limit(3);

  // ── Recommended Life Stories ─────────────────────────────────────────────
  const recommendedStories = await db
    .select({ id: cmsLifeStoriesTable.id, title: cmsLifeStoriesTable.title, imageUrl: cmsLifeStoriesTable.imageUrl })
    .from(cmsLifeStoriesTable)
    .where(eq(cmsLifeStoriesTable.status, "published"))
    .orderBy(desc(cmsLifeStoriesTable.createdAt))
    .limit(3);

  // ── Recently Added Programs ──────────────────────────────────────────────
  // Exclude programs already in progress
  const inProgressIds = new Set(progresses.map(p => p.programId));
  const allRecentPrograms = await db
    .select({ id: cmsProgramsTable.id, title: cmsProgramsTable.title, slug: cmsProgramsTable.slug, coverImageUrl: cmsProgramsTable.coverImageUrl, description: cmsProgramsTable.description, difficulty: cmsProgramsTable.difficulty })
    .from(cmsProgramsTable)
    .where(eq(cmsProgramsTable.status, "published"))
    .orderBy(desc(cmsProgramsTable.createdAt))
    .limit(10);
  const recentPrograms = allRecentPrograms.filter(p => !inProgressIds.has(p.id)).slice(0, 3);

  res.json({
    continueLearning,
    todaysThought,
    todaysTask,
    activePrograms: activeProgramsData,
    recentCertificates,
    recommendedArticles,
    recommendedStories,
    recentPrograms,
  });
});

export default router;
