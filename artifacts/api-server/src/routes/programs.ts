import { Router } from "express";
import { requireAuth } from "../middlewares/auth";
import {
  db,
  cmsProgramsTable,
  cmsModulesTable,
  cmsLessonsTable,
  cmsPackagesTable,
  cmsProgramCategoriesTable,
  userLessonProgressTable,
  userProgramProgressTable,
} from "@workspace/db";
import { eq, and, asc, count, inArray, sql } from "drizzle-orm";
import { awardXp, computeAndSaveDevScore } from "../lib/xp";

const router = Router();

// ─── GET /api/programs ────────────────────────────────────────────────────────
// Public list of published programs with stats

router.get("/", async (req, res) => {
  try {
    const programs = await db
      .select()
      .from(cmsProgramsTable)
      .where(eq(cmsProgramsTable.status, "published"))
      .orderBy(asc(cmsProgramsTable.sortOrder), asc(cmsProgramsTable.createdAt));

    const programIds = programs.map((p) => p.id);
    if (programIds.length === 0) {
      res.json({ data: [] });
      return;
    }

    const moduleCounts = await db
      .select({ programId: cmsModulesTable.programId, c: count() })
      .from(cmsModulesTable)
      .where(inArray(cmsModulesTable.programId, programIds))
      .groupBy(cmsModulesTable.programId);

    const moduleIds = (
      await db
        .select({ id: cmsModulesTable.id })
        .from(cmsModulesTable)
        .where(inArray(cmsModulesTable.programId, programIds))
    ).map((m) => m.id);

    let lessonCountMap: Record<number, number> = {};
    if (moduleIds.length > 0) {
      const lessonCounts = await db
        .select({ moduleId: cmsLessonsTable.moduleId, c: count() })
        .from(cmsLessonsTable)
        .where(
          and(
            inArray(cmsLessonsTable.moduleId, moduleIds),
            eq(cmsLessonsTable.status, "published")
          )
        )
        .groupBy(cmsLessonsTable.moduleId);

      const moduleToProgram: Record<number, number> = {};
      const allModules = await db
        .select({ id: cmsModulesTable.id, programId: cmsModulesTable.programId })
        .from(cmsModulesTable)
        .where(inArray(cmsModulesTable.id, moduleIds));
      allModules.forEach((m) => { moduleToProgram[m.id] = m.programId; });

      lessonCounts.forEach((lc) => {
        const pId = moduleToProgram[lc.moduleId];
        if (pId) lessonCountMap[pId] = (lessonCountMap[pId] || 0) + Number(lc.c);
      });
    }

    const moduleCountMap: Record<number, number> = {};
    moduleCounts.forEach((mc) => { moduleCountMap[mc.programId] = Number(mc.c); });

    const userId = (req as any).userId as string | undefined;
    let progressMap: Record<number, { pct: number; lastLessonId: number | null }> = {};
    if (userId) {
      const progresses = await db
        .select()
        .from(userProgramProgressTable)
        .where(eq(userProgramProgressTable.userId, userId));
      progresses.forEach((p) => {
        progressMap[p.programId] = { pct: p.progressPct, lastLessonId: p.lastLessonId ?? null };
      });
    }

    const data = programs.map((p) => ({
      ...p,
      moduleCount: moduleCountMap[p.id] || 0,
      lessonCount: lessonCountMap[p.id] || 0,
      progress: progressMap[p.id] ?? null,
    }));

    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ─── GET /api/programs/:slug ──────────────────────────────────────────────────

router.get("/:slug", async (req, res) => {
  try {
    const [program] = await db
      .select()
      .from(cmsProgramsTable)
      .where(
        and(
          eq(cmsProgramsTable.slug, req.params.slug as string),
          eq(cmsProgramsTable.status, "published")
        )
      );

    if (!program) {
      res.status(404).json({ error: "Proqram tapılmadı" });
      return;
    }

    const modules = await db
      .select()
      .from(cmsModulesTable)
      .where(
        and(
          eq(cmsModulesTable.programId, program.id),
          eq(cmsModulesTable.isActive, true)
        )
      )
      .orderBy(asc(cmsModulesTable.sortOrder));

    const moduleIds = modules.map((m) => m.id);
    let lessonsMap: Record<number, typeof cmsLessonsTable.$inferSelect[]> = {};
    if (moduleIds.length > 0) {
      const lessons = await db
        .select()
        .from(cmsLessonsTable)
        .where(
          and(
            inArray(cmsLessonsTable.moduleId, moduleIds),
            eq(cmsLessonsTable.status, "published")
          )
        )
        .orderBy(asc(cmsLessonsTable.sortOrder));
      lessons.forEach((l) => {
        if (!lessonsMap[l.moduleId]) lessonsMap[l.moduleId] = [];
        lessonsMap[l.moduleId].push(l);
      });
    }

    const userId = (req as any).userId as string | undefined;
    let progress = null;
    let completedLessonIds: number[] = [];
    if (userId) {
      const [prog] = await db
        .select()
        .from(userProgramProgressTable)
        .where(
          and(
            eq(userProgramProgressTable.userId, userId),
            eq(userProgramProgressTable.programId, program.id)
          )
        );
      progress = prog ?? null;

      const completions = await db
        .select({ lessonId: userLessonProgressTable.lessonId })
        .from(userLessonProgressTable)
        .where(
          and(
            eq(userLessonProgressTable.userId, userId),
            eq(userLessonProgressTable.programId, program.id)
          )
        );
      completedLessonIds = completions.map((c) => c.lessonId);
    }

    const modulesWithLessons = modules.map((m) => ({
      ...m,
      lessons: (lessonsMap[m.id] || []).map((l) => ({
        ...l,
        completed: completedLessonIds.includes(l.id),
      })),
    }));

    res.json({ program, modules: modulesWithLessons, progress, completedLessonIds });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ─── GET /api/programs/:programId/progress ────────────────────────────────────

router.get("/:programId/progress", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId as string;
    const programId = parseInt(req.params.programId as string, 10);
    if (isNaN(programId)) { res.status(400).json({ error: "Invalid id" }); return; }

    const [progress] = await db
      .select()
      .from(userProgramProgressTable)
      .where(
        and(
          eq(userProgramProgressTable.userId, userId),
          eq(userProgramProgressTable.programId, programId)
        )
      );

    const completions = await db
      .select({ lessonId: userLessonProgressTable.lessonId })
      .from(userLessonProgressTable)
      .where(
        and(
          eq(userLessonProgressTable.userId, userId),
          eq(userLessonProgressTable.programId, programId)
        )
      );

    res.json({ progress: progress ?? null, completedLessonIds: completions.map((c) => c.lessonId) });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ─── POST /api/programs/lessons/:lessonId/complete ────────────────────────────

router.post("/lessons/:lessonId/complete", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId as string;
    const lessonId = parseInt(req.params.lessonId as string, 10);
    if (isNaN(lessonId)) { res.status(400).json({ error: "Invalid lesson id" }); return; }

    const [lesson] = await db
      .select()
      .from(cmsLessonsTable)
      .where(eq(cmsLessonsTable.id, lessonId));
    if (!lesson) { res.status(404).json({ error: "Dərs tapılmadı" }); return; }

    const [module] = await db
      .select()
      .from(cmsModulesTable)
      .where(eq(cmsModulesTable.id, lesson.moduleId));
    if (!module) { res.status(404).json({ error: "Modul tapılmadı" }); return; }

    const programId = module.programId;

    const existing = await db
      .select({ id: userLessonProgressTable.id })
      .from(userLessonProgressTable)
      .where(
        and(
          eq(userLessonProgressTable.userId, userId),
          eq(userLessonProgressTable.lessonId, lessonId),
          eq(userLessonProgressTable.programId, programId)
        )
      );

    const isNewCompletion = existing.length === 0;
    if (isNewCompletion) {
      await db.insert(userLessonProgressTable).values({ userId, lessonId, programId });
    }

    const moduleIds = (
      await db
        .select({ id: cmsModulesTable.id })
        .from(cmsModulesTable)
        .where(eq(cmsModulesTable.programId, programId))
    ).map((m) => m.id);

    const [totalRow] = await db
      .select({ c: count() })
      .from(cmsLessonsTable)
      .where(
        and(
          inArray(cmsLessonsTable.moduleId, moduleIds),
          eq(cmsLessonsTable.status, "published")
        )
      );
    const total = Number(totalRow?.c || 0);

    const [completedRow] = await db
      .select({ c: count() })
      .from(userLessonProgressTable)
      .where(
        and(
          eq(userLessonProgressTable.userId, userId),
          eq(userLessonProgressTable.programId, programId)
        )
      );
    const completed = Number(completedRow?.c || 0);
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

    const existing2 = await db
      .select({ id: userProgramProgressTable.id })
      .from(userProgramProgressTable)
      .where(
        and(
          eq(userProgramProgressTable.userId, userId),
          eq(userProgramProgressTable.programId, programId)
        )
      );

    if (existing2.length === 0) {
      await db.insert(userProgramProgressTable).values({
        userId,
        programId,
        lastLessonId: lessonId,
        completedLessonCount: completed,
        totalLessonCount: total,
        progressPct: pct,
        completedAt: pct === 100 ? new Date() : undefined,
      });
    } else {
      await db
        .update(userProgramProgressTable)
        .set({
          lastLessonId: lessonId,
          completedLessonCount: completed,
          totalLessonCount: total,
          progressPct: pct,
          completedAt: pct === 100 ? new Date() : undefined,
        })
        .where(
          and(
            eq(userProgramProgressTable.userId, userId),
            eq(userProgramProgressTable.programId, programId)
          )
        );
    }

    if (isNewCompletion) {
      awardXp(userId, "lesson_complete", `lesson_${lessonId}`).catch(() => {});
      if (pct === 100) {
        awardXp(userId, "program_complete", `program_${programId}`).catch(() => {});
      }
      computeAndSaveDevScore(userId).catch(() => {});
    }

    res.json({ success: true, completed, total, progressPct: pct });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
