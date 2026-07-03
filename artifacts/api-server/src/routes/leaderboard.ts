import { Router } from "express";
import { db, profilesTable, testResultsTable, journalEntriesTable, certificatesTable } from "@workspace/db";
import { eq, count, max } from "drizzle-orm";

const router = Router();

router.get("/", async (_req, res) => {
  const profiles = await db.select({
    userId: profilesTable.userId,
    firstName: profilesTable.firstName,
    lastName: profilesTable.lastName,
    avatarUrl: profilesTable.avatarUrl,
    consciousnessLevel: profilesTable.consciousnessLevel,
    consciousnessStage: profilesTable.consciousnessStage,
    streak: profilesTable.streak,
    tasksCompleted: profilesTable.tasksCompleted,
    isBlocked: profilesTable.isBlocked,
  }).from(profilesTable).where(eq(profilesTable.isBlocked, false));

  const testCounts = await db.select({
    userId: testResultsTable.userId,
    testCount: count(testResultsTable.id),
    latestStage: max(testResultsTable.stage),
  }).from(testResultsTable).groupBy(testResultsTable.userId);

  const journalCounts = await db.select({
    userId: journalEntriesTable.userId,
    noteCount: count(journalEntriesTable.id),
  }).from(journalEntriesTable).groupBy(journalEntriesTable.userId);

  const certCounts = await db.select({
    userId: certificatesTable.userId,
    certCount: count(certificatesTable.id),
  }).from(certificatesTable).groupBy(certificatesTable.userId);

  const testMap = new Map(testCounts.map((t) => [t.userId, t]));
  const journalMap = new Map(journalCounts.map((j) => [j.userId, Number(j.noteCount)]));
  const certMap = new Map(certCounts.map((c) => [c.userId, Number(c.certCount)]));

  const leaderboard = profiles.map((p) => {
    const tests = testMap.get(p.userId);
    const testCount = Number(tests?.testCount ?? 0);
    const notes = journalMap.get(p.userId) ?? 0;
    const certs = certMap.get(p.userId) ?? 0;
    const stage = p.consciousnessLevel ?? 0;
    const progressPercent = Math.round((stage / 7) * 100);
    const streak = p.streak ?? 0;
    const tasks = p.tasksCompleted ?? 0;

    // Real activity score: streak×10 + certs(badges)×20 + tests×15 + tasks×5 + journal×3 + progress×2
    const activityScore =
      streak * 10 +
      certs * 20 +
      testCount * 15 +
      tasks * 5 +
      notes * 3 +
      progressPercent * 2;

    return {
      userId: p.userId,
      firstName: p.firstName,
      lastName: p.lastName,
      avatarUrl: p.avatarUrl,
      consciousnessLevel: p.consciousnessLevel,
      consciousnessStage: p.consciousnessStage,
      streak,
      tasksCompleted: tasks,
      testCount,
      noteCount: notes,
      badgeCount: certs,
      progressPercent,
      activityScore,
    };
  });

  leaderboard.sort((a, b) => b.activityScore - a.activityScore);
  res.json(leaderboard.slice(0, 100));
});

export default router;
