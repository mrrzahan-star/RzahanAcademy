import { Router } from "express";
import { requireAuth } from "../middlewares/supabaseAuth";
import { db, testResultsTable, certificatesTable, profilesTable } from "@workspace/db";
import { eq, count, desc } from "drizzle-orm";

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

export default router;
