import { Router } from "express";
import { requireAuth } from "../middlewares/auth";
import { db, testResultsTable, profilesTable, certificatesTable } from "@workspace/db";
import { eq, desc, and } from "drizzle-orm";
import { SubmitTestBody } from "@workspace/api-zod";

const STAGE_NAMES = [
  "Yatmış",
  "Döyüşçü",
  "Kəşfiyyatçı",
  "Şəxsiyyət",
  "Oyunçu",
  "Sehrbaz",
  "Yaradıcı",
];

const RECOMMENDATIONS = [
  "Özünüzü daha yaxından tanımağa başlayın. Gündəlik meditasiya və özünü müşahidə praktikası avtopilot reaksiyalarınızı fərk etməyə kömək edəcək. Hər gün 5 dəqiqə özünüzə sual verin: 'Bu reaksiya şüurlu seçimdirmi?'",
  "Çətinliklərlə üzləşməyi öyrənin. Məsuliyyəti qəbul etmək sizin əsas inkişaf sahənizdir. Hər çətinliyi 'Bu mənə nə öyrədir?' sualı ilə qarşılayın.",
  "Yeni biliklər öyrənməyə davam edin. Kəşfiyyat ruhu sizin ən güclü tərəfinizdir. Hər gün öyrəndiklərinizi praktikada tətbiq edin — bilik tətbiqdə mənaya çevrilir.",
  "Öz dəyərlərinizi dərindən anlayın. Şəxsiyyətinizi formalaşdırmaq üzərində işləyin. Kimsiniz? Nə üçün burada olduğunuzu bilirsinizmi? Bu suallara cavab axtarın.",
  "Həyatı bir oyun kimi görün. Strategiya qurmaq bacarığınızı inkişaf etdirin. Hər vəziyyətin arxasındakı nümunələri görməyə çalışın — oyunun qaydalarını anlayan kəs oyunu idarə edir.",
  "Daxili transformasiyanı dərinləşdirin. Bilinç dəyişdikcə həyat da dəyişir. Niyyət qurmaq, diqqəti idarə etmək və daxili dünyaya bağlanmaq praktikalarını gündəlik həyatınıza daxil edin.",
  "Yaradıcı potansialınızı dünyaya paylaşın. Siz artıq başqalarına rəhbərlik edə bilərsiniz. Öz hədiyyənizi tapın, onu inkişaf etdirin və miras yaratmaq üçün addım atın.",
];

function calculateStage(answers: number[]): {
  stage: number; stageName: string; totalScore: number; scores: Record<string, number>;
} {
  const rawSections = [
    answers.slice(0, 5), answers.slice(5, 10), answers.slice(10, 15), answers.slice(15, 20),
    answers.slice(20, 25), answers.slice(25, 30), answers.slice(30, 35), answers.slice(35, 40),
  ];
  const sectionScores = rawSections.map((s, idx) =>
    idx === 0 ? s.reduce((acc, v) => acc + (6 - v), 0) : s.reduce((a, b) => a + b, 0),
  );
  const totalScore = sectionScores.reduce((a, b) => a + b, 0);
  const ratio = totalScore / 200;
  const weightedScore = sectionScores.reduce((acc, s, i) => acc + s * (i + 1), 0);
  const weightedRatio = weightedScore / (25 * (1 + 2 + 3 + 4 + 5 + 6 + 7 + 8));
  const blendedRatio = ratio * 0.5 + weightedRatio * 0.5;
  const stage = Math.min(7, Math.max(1, Math.ceil(blendedRatio * 7)));
  return {
    stage, stageName: STAGE_NAMES[stage - 1], totalScore,
    scores: { s1: sectionScores[0], s2: sectionScores[1], s3: sectionScores[2], s4: sectionScores[3], s5: sectionScores[4], s6: sectionScores[5], s7: sectionScores[6], s8: sectionScores[7] },
  };
}

const router = Router();

router.get("/", requireAuth, async (req, res) => {
  const userId = req.userId!;
  const results = await db.select().from(testResultsTable)
    .where(eq(testResultsTable.userId, userId)).orderBy(desc(testResultsTable.createdAt));
  res.json(results.map((r) => ({
    id: r.id, userId: r.userId, totalScore: r.totalScore, stage: r.stage,
    stageName: r.stageName, scores: r.scores, recommendations: r.recommendations,
    createdAt: r.createdAt.toISOString(),
  })));
});

router.post("/", requireAuth, async (req, res) => {
  const userId = req.userId!;
  const body = SubmitTestBody.safeParse(req.body);
  if (!body.success) { res.status(400).json({ error: "Invalid input" }); return; }
  const answers = body.data.answers;
  if (answers.length !== 40) { res.status(400).json({ error: "Exactly 40 answers required" }); return; }

  const { stage, stageName, totalScore, scores } = calculateStage(answers);
  const recommendations = RECOMMENDATIONS[stage - 1];

  const [result] = await db.insert(testResultsTable)
    .values({ userId, totalScore, stage, stageName, scores, recommendations }).returning();

  const [existing] = await db.select({ id: profilesTable.id }).from(profilesTable)
    .where(eq(profilesTable.userId, userId));
  if (existing) {
    await db.update(profilesTable)
      .set({ consciousnessLevel: stage, consciousnessStage: stageName })
      .where(eq(profilesTable.userId, userId));
  } else {
    await db.insert(profilesTable).values({
      userId, email: req.userEmail, consciousnessLevel: stage, consciousnessStage: stageName,
    });
  }

  try {
    const [existingCert] = await db.select({ id: certificatesTable.id }).from(certificatesTable)
      .where(and(eq(certificatesTable.userId, userId), eq(certificatesTable.stage, stage))).limit(1);
    if (!existingCert) {
      const certCode = `RZH-${stage}-${result.id.toString().padStart(5, "0")}-${Date.now().toString(36).slice(-4).toUpperCase()}`;
      await db.insert(certificatesTable).values({ userId, stage, stageName, certificateCode: certCode });
    }
  } catch (err) {
    req.log.warn({ err }, "Certificate auto-issue failed");
  }

  res.status(201).json({
    id: result.id, userId: result.userId, totalScore: result.totalScore, stage: result.stage,
    stageName: result.stageName, scores: result.scores, recommendations: result.recommendations,
    createdAt: result.createdAt.toISOString(),
  });
});

router.get("/latest", requireAuth, async (req, res) => {
  const userId = req.userId!;
  const [result] = await db.select().from(testResultsTable)
    .where(eq(testResultsTable.userId, userId))
    .orderBy(desc(testResultsTable.createdAt)).limit(1);
  if (!result) { res.status(404).json({ error: "No test results found" }); return; }
  res.json({
    id: result.id, userId: result.userId, totalScore: result.totalScore, stage: result.stage,
    stageName: result.stageName, scores: result.scores, recommendations: result.recommendations,
    createdAt: result.createdAt.toISOString(),
  });
});

router.get("/:id", requireAuth, async (req, res) => {
  const userId = req.userId!;
  const id = parseInt(req.params.id as string);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const [result] = await db.select().from(testResultsTable).where(eq(testResultsTable.id, id));
  if (!result) { res.status(404).json({ error: "Not found" }); return; }
  if (result.userId !== userId) { res.status(403).json({ error: "Forbidden" }); return; }
  res.json({
    id: result.id, userId: result.userId, totalScore: result.totalScore, stage: result.stage,
    stageName: result.stageName, scores: result.scores, recommendations: result.recommendations,
    createdAt: result.createdAt.toISOString(),
  });
});

export default router;
