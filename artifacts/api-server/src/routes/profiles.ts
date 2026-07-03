import { Router } from "express";
import { requireAuth } from "../middlewares/supabaseAuth";
import { db, profilesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { UpsertProfileBody } from "@workspace/api-zod";

const router = Router();

router.get("/me", requireAuth, async (req, res) => {
  const userId = req.userId!;
  const [profile] = await db
    .select()
    .from(profilesTable)
    .where(eq(profilesTable.userId, userId));
  if (!profile) {
    res.status(404).json({ error: "Profile not found" });
    return;
  }
  res.json({
    id: profile.id,
    userId: profile.userId,
    firstName: profile.firstName,
    lastName: profile.lastName,
    avatarUrl: profile.avatarUrl,
    email: profile.email,
    consciousnessLevel: profile.consciousnessLevel,
    consciousnessStage: profile.consciousnessStage,
    bio: profile.bio,
    createdAt: profile.createdAt.toISOString(),
  });
});

router.put("/me", requireAuth, async (req, res) => {
  const userId = req.userId!;
  const body = UpsertProfileBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const data = body.data;
  const [existing] = await db
    .select()
    .from(profilesTable)
    .where(eq(profilesTable.userId, userId));

  let profile;
  if (existing) {
    [profile] = await db
      .update(profilesTable)
      .set({
        firstName: data.firstName ?? existing.firstName,
        lastName: data.lastName ?? existing.lastName,
        avatarUrl: data.avatarUrl ?? existing.avatarUrl,
        bio: data.bio ?? existing.bio,
      })
      .where(eq(profilesTable.userId, userId))
      .returning();
  } else {
    [profile] = await db
      .insert(profilesTable)
      .values({
        userId,
        email: req.userEmail,
        firstName: data.firstName,
        lastName: data.lastName,
        avatarUrl: data.avatarUrl,
        bio: data.bio,
      })
      .returning();
  }

  res.json({
    id: profile.id,
    userId: profile.userId,
    firstName: profile.firstName,
    lastName: profile.lastName,
    avatarUrl: profile.avatarUrl,
    email: profile.email,
    consciousnessLevel: profile.consciousnessLevel,
    consciousnessStage: profile.consciousnessStage,
    bio: profile.bio,
    createdAt: profile.createdAt.toISOString(),
  });
});

export default router;
