import { Router } from "express";
import { requireAuth } from "../middlewares/auth";
import { db, cmsArticlesTable, cmsArticleCategoriesTable } from "@workspace/db";
import { eq, desc, asc, ilike, and, or, sql } from "drizzle-orm";

const router = Router();

// GET /api/articles — public listing with filters
router.get("/", async (req, res) => {
  const { category, tag, search, featured, pinned, sort = "newest" } = req.query as Record<string, string>;

  const conditions: ReturnType<typeof eq>[] = [eq(cmsArticlesTable.status, "published")];

  if (category) conditions.push(eq(cmsArticlesTable.categoryId, Number(category)));
  if (featured === "true") conditions.push(eq(cmsArticlesTable.isFeatured, true));
  if (pinned === "true") conditions.push(eq(cmsArticlesTable.isPinned, true));
  if (search) conditions.push(
    or(
      ilike(cmsArticlesTable.title, `%${search}%`),
      ilike(cmsArticlesTable.excerpt, `%${search}%`),
    ) as ReturnType<typeof eq>
  );

  let orderBy;
  if (sort === "popular") orderBy = desc(cmsArticlesTable.viewCount);
  else if (sort === "featured") orderBy = desc(cmsArticlesTable.isFeatured);
  else orderBy = desc(cmsArticlesTable.createdAt);

  let rows = await db
    .select({
      id: cmsArticlesTable.id,
      title: cmsArticlesTable.title,
      subtitle: cmsArticlesTable.subtitle,
      slug: cmsArticlesTable.slug,
      excerpt: cmsArticlesTable.excerpt,
      coverImageUrl: cmsArticlesTable.coverImageUrl,
      author: cmsArticlesTable.author,
      readingTimeMinutes: cmsArticlesTable.readingTimeMinutes,
      viewCount: cmsArticlesTable.viewCount,
      categoryId: cmsArticlesTable.categoryId,
      packageId: cmsArticlesTable.packageId,
      isFeatured: cmsArticlesTable.isFeatured,
      isPinned: cmsArticlesTable.isPinned,
      tags: cmsArticlesTable.tags,
      createdAt: cmsArticlesTable.createdAt,
    })
    .from(cmsArticlesTable)
    .where(and(...conditions))
    .orderBy(orderBy)
    .limit(60);

  // Filter by tag in memory (tags stored as comma-separated string)
  if (tag) {
    rows = rows.filter(r => r.tags?.split(",").map(t => t.trim()).includes(tag));
  }

  res.json({ data: rows, total: rows.length });
});

// GET /api/articles/categories — all active article categories
router.get("/categories", async (_req, res) => {
  const cats = await db
    .select()
    .from(cmsArticleCategoriesTable)
    .where(eq(cmsArticleCategoriesTable.isActive, true))
    .orderBy(asc(cmsArticleCategoriesTable.sortOrder));
  res.json(cats);
});

// GET /api/articles/:slug — article detail (increments view count)
router.get("/:slug", async (req, res) => {
  const [article] = await db
    .select()
    .from(cmsArticlesTable)
    .where(and(
      eq(cmsArticlesTable.slug, req.params.slug),
      eq(cmsArticlesTable.status, "published"),
    ))
    .limit(1);

  if (!article) { res.status(404).json({ error: "Məqalə tapılmadı" }); return; }

  // Increment view count without blocking
  db.update(cmsArticlesTable)
    .set({ viewCount: sql`${cmsArticlesTable.viewCount} + 1` })
    .where(eq(cmsArticlesTable.id, article.id))
    .catch(() => {});

  // Related articles: same category, exclude current
  const related = await db
    .select({
      id: cmsArticlesTable.id,
      title: cmsArticlesTable.title,
      slug: cmsArticlesTable.slug,
      excerpt: cmsArticlesTable.excerpt,
      coverImageUrl: cmsArticlesTable.coverImageUrl,
      author: cmsArticlesTable.author,
      readingTimeMinutes: cmsArticlesTable.readingTimeMinutes,
    })
    .from(cmsArticlesTable)
    .where(and(
      eq(cmsArticlesTable.status, "published"),
      eq(cmsArticlesTable.categoryId, article.categoryId ?? -1),
    ))
    .orderBy(desc(cmsArticlesTable.createdAt))
    .limit(4);

  res.json({ ...article, related: related.filter(r => r.id !== article.id).slice(0, 3) });
});

export default router;
