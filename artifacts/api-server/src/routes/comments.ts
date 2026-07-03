import { Router } from "express";
import { requireAuth } from "../middlewares/auth";
import { db, commentsTable, profilesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { CreateCommentBody } from "@workspace/api-zod";

const router = Router();

router.get("/", async (_req, res) => {
  const comments = await db.select().from(commentsTable)
    .where(eq(commentsTable.approved, true))
    .orderBy(commentsTable.createdAt);
  res.json(comments.map((c) => ({
    id: c.id, authorName: c.authorName, avatarUrl: c.avatarUrl, content: c.content,
    stage: c.stage, stageName: c.stageName, rating: c.rating, createdAt: c.createdAt.toISOString(),
  })));
});

router.post("/", requireAuth, async (req, res) => {
  const userId = req.userId!;
  const body = CreateCommentBody.safeParse(req.body);
  if (!body.success) { res.status(400).json({ error: "Invalid input" }); return; }

  const [profile] = await db.select().from(profilesTable)
    .where(eq(profilesTable.userId, userId));

  const authorName = profile
    ? `${profile.firstName ?? ""} ${profile.lastName ?? ""}`.trim() || "İstifadəçi"
    : "İstifadəçi";

  const [comment] = await db.insert(commentsTable).values({
    userId, authorName, avatarUrl: profile?.avatarUrl, content: body.data.content,
    rating: body.data.rating, stage: profile?.consciousnessLevel,
    stageName: profile?.consciousnessStage, approved: true,
  }).returning();

  res.status(201).json({
    id: comment.id, authorName: comment.authorName, avatarUrl: comment.avatarUrl,
    content: comment.content, stage: comment.stage, stageName: comment.stageName,
    rating: comment.rating, createdAt: comment.createdAt.toISOString(),
  });
});

export default router;
