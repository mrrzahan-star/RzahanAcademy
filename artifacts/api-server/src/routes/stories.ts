import { Router } from "express";
import { db, cmsLifeStoriesTable, cmsStoryCategoriesTable } from "@workspace/db";
import { eq, desc, asc, ilike, and, or, sql } from "drizzle-orm";

const router = Router();

// GET /api/stories — public listing
router.get("/", async (req, res) => {
  const { category, tag, search, featured, pinned, sort = "newest" } = req.query as Record<string, string>;

  const conditions: ReturnType<typeof eq>[] = [eq(cmsLifeStoriesTable.status, "published")];

  if (category) conditions.push(eq(cmsLifeStoriesTable.categoryId, Number(category)));
  if (featured === "true") conditions.push(eq(cmsLifeStoriesTable.isFeatured, true));
  if (pinned === "true") conditions.push(eq(cmsLifeStoriesTable.isPinned, true));
  if (search) conditions.push(
    or(
      ilike(cmsLifeStoriesTable.title, `%${search}%`),
      ilike(cmsLifeStoriesTable.excerpt, `%${search}%`),
    ) as ReturnType<typeof eq>
  );

  let orderBy;
  if (sort === "popular") orderBy = desc(cmsLifeStoriesTable.viewCount);
  else if (sort === "featured") orderBy = desc(cmsLifeStoriesTable.isFeatured);
  else orderBy = desc(cmsLifeStoriesTable.createdAt);

  let rows = await db
    .select({
      id: cmsLifeStoriesTable.id,
      title: cmsLifeStoriesTable.title,
      slug: cmsLifeStoriesTable.slug,
      excerpt: cmsLifeStoriesTable.excerpt,
      imageUrl: cmsLifeStoriesTable.imageUrl,
      author: cmsLifeStoriesTable.author,
      readingTimeMinutes: cmsLifeStoriesTable.readingTimeMinutes,
      viewCount: cmsLifeStoriesTable.viewCount,
      categoryId: cmsLifeStoriesTable.categoryId,
      packageId: cmsLifeStoriesTable.packageId,
      isFeatured: cmsLifeStoriesTable.isFeatured,
      isPinned: cmsLifeStoriesTable.isPinned,
      tags: cmsLifeStoriesTable.tags,
      createdAt: cmsLifeStoriesTable.createdAt,
    })
    .from(cmsLifeStoriesTable)
    .where(and(...conditions))
    .orderBy(orderBy)
    .limit(60);

  if (tag) {
    rows = rows.filter(r => r.tags?.split(",").map(t => t.trim()).includes(tag));
  }

  res.json({ data: rows, total: rows.length });
});

// GET /api/stories/categories — active story categories
router.get("/categories", async (_req, res) => {
  const cats = await db
    .select()
    .from(cmsStoryCategoriesTable)
    .where(eq(cmsStoryCategoriesTable.isActive, true))
    .orderBy(asc(cmsStoryCategoriesTable.sortOrder));
  res.json(cats);
});

// GET /api/stories/:id — story detail (increments view count)
router.get("/:id", async (req, res) => {
  const idNum = Number(req.params.id);
  if (isNaN(idNum)) { res.status(400).json({ error: "Yanlış ID" }); return; }

  const [story] = await db
    .select()
    .from(cmsLifeStoriesTable)
    .where(and(
      eq(cmsLifeStoriesTable.id, idNum),
      eq(cmsLifeStoriesTable.status, "published"),
    ))
    .limit(1);

  if (!story) { res.status(404).json({ error: "Hekayə tapılmadı" }); return; }

  db.update(cmsLifeStoriesTable)
    .set({ viewCount: sql`${cmsLifeStoriesTable.viewCount} + 1` })
    .where(eq(cmsLifeStoriesTable.id, story.id))
    .catch(() => {});

  const related = await db
    .select({
      id: cmsLifeStoriesTable.id,
      title: cmsLifeStoriesTable.title,
      slug: cmsLifeStoriesTable.slug,
      excerpt: cmsLifeStoriesTable.excerpt,
      imageUrl: cmsLifeStoriesTable.imageUrl,
      author: cmsLifeStoriesTable.author,
      readingTimeMinutes: cmsLifeStoriesTable.readingTimeMinutes,
    })
    .from(cmsLifeStoriesTable)
    .where(and(
      eq(cmsLifeStoriesTable.status, "published"),
      eq(cmsLifeStoriesTable.categoryId, story.categoryId ?? -1),
    ))
    .orderBy(desc(cmsLifeStoriesTable.createdAt))
    .limit(4);

  res.json({ ...story, related: related.filter(r => r.id !== story.id).slice(0, 3) });
});

export default router;
