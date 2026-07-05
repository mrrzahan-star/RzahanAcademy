import { Router } from "express";
import { asc, desc, eq, and, count } from "drizzle-orm";
import {
  db,
  cmsLandingConfigTable,
  cmsProgramsTable,
  cmsArticlesTable,
  cmsLifeStoriesTable,
  cmsQuotesTable,
  cmsTestimonialsTable,
  cmsPackagesTable,
  cmsFaqsTable,
  cmsAnnouncementsTable,
  testResultsTable,
  certificatesTable,
  usersTable,
} from "@workspace/db";

const router = Router();

export const DEFAULT_LANDING_CONFIG = {
  hero: {
    badge: "Yeni Nəsil İnkişaf Platforması",
    headline: "İnsan Bilinç\nMexanizmi",
    subtitle: "Özünü Gör. Dəyiş. Oyanışa Keç. 7 mərhələli şüur transformasiyası ilə həqiqi potensialınızı kəşf edin.",
    btn1Text: "Testə Başla",
    btn1Url: "/test",
    btn2Text: "Kitabı Əldə Et",
    btn2Url: "https://wa.me/994559195001",
    visible: true,
  },
  about: {
    title: "Müəllif Haqqında & Kitab",
    body: '"İnsan Bilinç Mexanizmi" sadəcə bir kitab deyil, insanın özünü dərk etməsi üçün yazılmış bələdçidir. Bu əsər şüurun 7 mərhələsini elmi və fəlsəfi yanaşmalarla izah edir, oxucunu "Yatmış" vəziyyətindən "Yaradıcı" səviyyəsinə doğru addım-addım aparır.',
    authorName: "Rzahan",
    authorTitle1: "İnsan Bilinç Mexanizmi müəllifi",
    authorTitle2: "Rzahan Academy qurucusu",
    btnText: "MÜRACİƏT ET",
    btnUrl: "https://wa.me/994559195001",
    visible: true,
  },
  stats: {
    visible: true,
    label0: "İştirakçı sayı",
    label1: "Tamamlanan testlər",
    label2: "Verilmiş sertifikatlar",
    label3: "Aktiv istifadəçilər",
  },
  stages: { visible: true },
  howItWorks: { visible: true },
  programs: { visible: true, count: 3 },
  articles: { visible: true, count: 3 },
  stories: { visible: true, count: 3 },
  thought: { visible: true },
  testimonials: { visible: true, count: 6 },
  packages: { visible: false },
  faqs: { visible: true, count: 6 },
  announcements: { visible: true },
  cta: { visible: true },
  seo: {
    title: "Rzahan Academy — İnsan Bilinç Mexanizmi",
    description: "Özünü tanı. Dəyiş. Oyanışa keç. 7 mərhələli şüur transformasiyası platforması.",
    ogImage: "",
    keywords: "şüur, inkişaf, psixologiya, rzahan, academy",
  },
  footer: {
    tagline: "İnsan Bilinç Mexanizmi — Şüurun 7 mərhələli transformasiya proqramı və fərdi inkişaf platforması.",
    waUrl: "https://wa.me/994559195001",
    tgUrl: "https://t.me/rzahanacademy",
    ttUrl: "https://tiktok.com/@rzahan.academy",
    copyright: "Rzahan Academy. Bütün hüquqlar qorunur.",
  },
};

// GET /api/landing — full landing page data in one request
router.get("/", async (_req, res) => {
  const [configRow] = await db.select().from(cmsLandingConfigTable).limit(1).catch(() => []);
  const config: typeof DEFAULT_LANDING_CONFIG = configRow?.configJson
    ? { ...DEFAULT_LANDING_CONFIG, ...JSON.parse(configRow.configJson) }
    : DEFAULT_LANDING_CONFIG;

  const programCount = Math.min(6, config.programs?.count ?? 3);
  const articleCount = Math.min(6, config.articles?.count ?? 3);
  const storyCount   = Math.min(6, config.stories?.count ?? 3);
  const faqCount     = Math.min(20, config.faqs?.count ?? 6);
  const testCount    = Math.min(12, config.testimonials?.count ?? 6);

  const [programs, articles, stories, allQuotes, testimonials, packages, faqs, announcements] = await Promise.all([
    db.select({
      id: cmsProgramsTable.id, title: cmsProgramsTable.title, slug: cmsProgramsTable.slug,
      description: cmsProgramsTable.description, coverImageUrl: cmsProgramsTable.coverImageUrl,
      difficulty: cmsProgramsTable.difficulty, instructor: cmsProgramsTable.instructor,
    }).from(cmsProgramsTable)
      .where(and(eq(cmsProgramsTable.status, "published"), eq(cmsProgramsTable.featured, true)))
      .orderBy(asc(cmsProgramsTable.sortOrder)).limit(programCount),

    db.select({
      id: cmsArticlesTable.id, title: cmsArticlesTable.title, slug: cmsArticlesTable.slug,
      excerpt: cmsArticlesTable.excerpt, coverImageUrl: cmsArticlesTable.coverImageUrl,
      author: cmsArticlesTable.author, readingTimeMinutes: cmsArticlesTable.readingTimeMinutes,
    }).from(cmsArticlesTable)
      .where(eq(cmsArticlesTable.status, "published"))
      .orderBy(desc(cmsArticlesTable.createdAt)).limit(articleCount),

    db.select({
      id: cmsLifeStoriesTable.id, title: cmsLifeStoriesTable.title,
      excerpt: cmsLifeStoriesTable.excerpt, imageUrl: cmsLifeStoriesTable.imageUrl,
      author: cmsLifeStoriesTable.author, readingTimeMinutes: cmsLifeStoriesTable.readingTimeMinutes,
    }).from(cmsLifeStoriesTable)
      .where(eq(cmsLifeStoriesTable.status, "published"))
      .orderBy(desc(cmsLifeStoriesTable.createdAt)).limit(storyCount),

    db.select({ text: cmsQuotesTable.text, author: cmsQuotesTable.author })
      .from(cmsQuotesTable)
      .where(eq(cmsQuotesTable.isActive, true))
      .orderBy(asc(cmsQuotesTable.sortOrder)).limit(31),

    db.select().from(cmsTestimonialsTable)
      .where(eq(cmsTestimonialsTable.isActive, true))
      .orderBy(asc(cmsTestimonialsTable.sortOrder)).limit(testCount),

    db.select().from(cmsPackagesTable)
      .where(eq(cmsPackagesTable.isActive, true))
      .orderBy(asc(cmsPackagesTable.sortOrder)),

    db.select().from(cmsFaqsTable)
      .where(eq(cmsFaqsTable.isActive, true))
      .orderBy(asc(cmsFaqsTable.sortOrder)).limit(faqCount),

    db.select({
      id: cmsAnnouncementsTable.id, title: cmsAnnouncementsTable.title,
      content: cmsAnnouncementsTable.content, bannerImageUrl: cmsAnnouncementsTable.bannerImageUrl,
      priority: cmsAnnouncementsTable.priority,
    }).from(cmsAnnouncementsTable)
      .where(and(eq(cmsAnnouncementsTable.status, "published"), eq(cmsAnnouncementsTable.isActive, true)))
      .orderBy(desc(cmsAnnouncementsTable.priority)),
  ]);

  const todaysThought = allQuotes.length > 0
    ? allQuotes[new Date().getDate() % allQuotes.length]
    : null;

  const [[{ c: memberCount }], [{ c: certCount }], [{ c: testResultCount }]] = await Promise.all([
    db.select({ c: count() }).from(usersTable),
    db.select({ c: count() }).from(certificatesTable),
    db.select({ c: count() }).from(testResultsTable),
  ]);

  res.json({
    config,
    programs,
    articles,
    stories,
    todaysThought,
    testimonials,
    packages,
    faqs,
    announcements,
    stats: {
      members: Number(memberCount),
      tests: Number(testResultCount),
      certificates: Number(certCount),
    },
  });
});

export default router;
