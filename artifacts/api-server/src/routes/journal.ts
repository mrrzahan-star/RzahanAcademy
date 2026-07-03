import { Router } from "express";
import { requireAuth } from "../middlewares/auth";
import { db, journalEntriesTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";

const router = Router();

function parseBody(body: unknown): { title: string; content: string; category?: string; mood?: string } | null {
  if (typeof body !== "object" || body === null) return null;
  const b = body as Record<string, unknown>;
  if (typeof b.title !== "string" || b.title.trim().length === 0 || b.title.length > 200) return null;
  if (typeof b.content !== "string" || b.content.trim().length === 0) return null;
  return {
    title: b.title.trim(),
    content: b.content.trim(),
    category: typeof b.category === "string" ? b.category : undefined,
    mood: typeof b.mood === "string" ? b.mood : undefined,
  };
}

router.get("/", requireAuth, async (req, res) => {
  const userId = req.userId!;
  const entries = await db.select().from(journalEntriesTable)
    .where(eq(journalEntriesTable.userId, userId))
    .orderBy(desc(journalEntriesTable.createdAt));
  res.json(entries.map((e) => ({
    id: e.id, title: e.title, content: e.content, category: e.category, mood: e.mood,
    createdAt: e.createdAt.toISOString(), updatedAt: e.updatedAt.toISOString(),
  })));
});

router.post("/", requireAuth, async (req, res) => {
  const userId = req.userId!;
  const data = parseBody(req.body);
  if (!data) { res.status(400).json({ error: "Invalid input" }); return; }
  const [entry] = await db.insert(journalEntriesTable)
    .values({ userId, title: data.title, content: data.content, category: data.category || "ümumi", mood: data.mood })
    .returning();
  res.status(201).json({
    id: entry.id, title: entry.title, content: entry.content, category: entry.category,
    mood: entry.mood, createdAt: entry.createdAt.toISOString(), updatedAt: entry.updatedAt.toISOString(),
  });
});

router.put("/:id", requireAuth, async (req, res) => {
  const userId = req.userId!;
  const id = parseInt(req.params.id as string, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const data = parseBody(req.body);
  if (!data) { res.status(400).json({ error: "Invalid input" }); return; }
  const [entry] = await db.update(journalEntriesTable)
    .set({ title: data.title, content: data.content, category: data.category || "ümumi", mood: data.mood, updatedAt: new Date() })
    .where(and(eq(journalEntriesTable.id, id), eq(journalEntriesTable.userId, userId)))
    .returning();
  if (!entry) { res.status(404).json({ error: "Not found" }); return; }
  res.json({
    id: entry.id, title: entry.title, content: entry.content, category: entry.category,
    mood: entry.mood, createdAt: entry.createdAt.toISOString(), updatedAt: entry.updatedAt.toISOString(),
  });
});

router.delete("/:id", requireAuth, async (req, res) => {
  const userId = req.userId!;
  const id = parseInt(req.params.id as string, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  await db.delete(journalEntriesTable)
    .where(and(eq(journalEntriesTable.id, id), eq(journalEntriesTable.userId, userId)));
  res.status(204).send();
});

export default router;
