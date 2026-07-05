import { Router } from "express";
import { requireAuth } from "../middlewares/auth";
import { db, userNotificationsTable } from "@workspace/db";
import { eq, and, desc, count } from "drizzle-orm";

const router = Router();

// GET /api/notifications — user's notifications (latest 30)
router.get("/", requireAuth, async (req, res) => {
  const userId = req.userId!;
  const notifications = await db
    .select()
    .from(userNotificationsTable)
    .where(eq(userNotificationsTable.userId, userId))
    .orderBy(desc(userNotificationsTable.createdAt))
    .limit(30);

  const [unreadRow] = await db
    .select({ c: count() })
    .from(userNotificationsTable)
    .where(and(eq(userNotificationsTable.userId, userId), eq(userNotificationsTable.isRead, false)));

  res.json({
    notifications: notifications.map((n) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      message: n.message,
      isRead: n.isRead,
      createdAt: n.createdAt.toISOString(),
    })),
    unreadCount: Number(unreadRow?.c ?? 0),
  });
});

// POST /api/notifications/read-all — mark all as read
router.post("/read-all", requireAuth, async (req, res) => {
  const userId = req.userId!;
  await db
    .update(userNotificationsTable)
    .set({ isRead: true })
    .where(and(eq(userNotificationsTable.userId, userId), eq(userNotificationsTable.isRead, false)));
  res.json({ ok: true });
});

// POST /api/notifications/:id/read — mark one as read
router.post("/:id/read", requireAuth, async (req, res) => {
  const userId = req.userId!;
  const id = parseInt(req.params.id as string, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  await db
    .update(userNotificationsTable)
    .set({ isRead: true })
    .where(and(eq(userNotificationsTable.id, id), eq(userNotificationsTable.userId, userId)));

  res.json({ ok: true });
});

export default router;
