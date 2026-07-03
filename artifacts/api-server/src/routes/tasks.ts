import { Router } from "express";
import { requireAuth } from "../middlewares/auth";
import { db, dailyTasksTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

const router = Router();

function getTodayStr() {
  return new Date().toISOString().slice(0, 10);
}

router.get("/today", requireAuth, async (req, res) => {
  const userId = req.userId!;
  const date = getTodayStr();
  const rows = await db.select()
    .from(dailyTasksTable)
    .where(and(eq(dailyTasksTable.userId, userId), eq(dailyTasksTable.date, date)));
  const doneSlots = rows.filter((r) => r.done).map((r) => r.taskSlot);
  res.json({ date, doneSlots });
});

router.post("/:slot/toggle", requireAuth, async (req, res) => {
  const userId = req.userId!;
  const date = getTodayStr();
  const taskSlot = req.params.slot as string;
  if (!taskSlot || taskSlot.length > 20) {
    res.status(400).json({ error: "Invalid slot" });
    return;
  }

  const [existing] = await db.select()
    .from(dailyTasksTable)
    .where(and(eq(dailyTasksTable.userId, userId), eq(dailyTasksTable.date, date), eq(dailyTasksTable.taskSlot, taskSlot)));

  if (existing) {
    const [updated] = await db.update(dailyTasksTable)
      .set({ done: !existing.done })
      .where(eq(dailyTasksTable.id, existing.id))
      .returning();
    res.json({ done: updated.done });
  } else {
    const [created] = await db.insert(dailyTasksTable)
      .values({ userId, date, taskSlot, done: true })
      .returning();
    res.json({ done: created.done });
  }
});

export default router;
