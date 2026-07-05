import {
  pgTable, text, serial, timestamp, integer, boolean, uuid,
} from "drizzle-orm/pg-core";

// ── PACKAGES ──────────────────────────────────────────────────────────────────

export const cmsPackagesTable = pgTable("cms_packages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  emoji: text("emoji").default("📦"),
  description: text("description"),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export type CmsPackage = typeof cmsPackagesTable.$inferSelect;

// ── PROGRAM CATEGORIES ────────────────────────────────────────────────────────

export const cmsProgramCategoriesTable = pgTable("cms_program_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
});

export type CmsProgramCategory = typeof cmsProgramCategoriesTable.$inferSelect;

// ── PROGRAMS ──────────────────────────────────────────────────────────────────

export const cmsProgramsTable = pgTable("cms_programs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  fullDescription: text("full_description"),
  coverImageUrl: text("cover_image_url"),
  bannerImageUrl: text("banner_image_url"),
  iconUrl: text("icon_url"),
  categoryId: integer("category_id"),
  packageId: integer("package_id"),
  difficulty: text("difficulty").default("baslanqic"),
  instructor: text("instructor").default("Rzahan"),
  language: text("language").default("Azərbaycan"),
  certificateAvailable: boolean("certificate_available").notNull().default(false),
  featured: boolean("featured").notNull().default(false),
  status: text("status").notNull().default("draft"),
  sortOrder: integer("sort_order").notNull().default(0),
  durationHours: integer("duration_hours"),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export type CmsProgram = typeof cmsProgramsTable.$inferSelect;

// ── MODULES ───────────────────────────────────────────────────────────────────

export const cmsModulesTable = pgTable("cms_modules", {
  id: serial("id").primaryKey(),
  programId: integer("program_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  coverImageUrl: text("cover_image_url"),
  estimatedDurationMinutes: integer("estimated_duration_minutes"),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type CmsModule = typeof cmsModulesTable.$inferSelect;

// ── LESSONS ───────────────────────────────────────────────────────────────────

export const cmsLessonsTable = pgTable("cms_lessons", {
  id: serial("id").primaryKey(),
  moduleId: integer("module_id").notNull(),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  description: text("description"),
  contentHtml: text("content_html"),
  youtubeUrl: text("youtube_url"),
  audioUrl: text("audio_url"),
  pdfUrl: text("pdf_url"),
  thumbnailUrl: text("thumbnail_url"),
  externalResourcesUrl: text("external_resources_url"),
  homework: text("homework"),
  reflectionQuestions: text("reflection_questions"),
  notes: text("notes"),
  durationMinutes: integer("duration_minutes"),
  readingTimeMinutes: integer("reading_time_minutes"),
  packageId: integer("package_id"),
  freePreview: boolean("free_preview").notNull().default(false),
  status: text("status").notNull().default("draft"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export type CmsLesson = typeof cmsLessonsTable.$inferSelect;

// ── USER LESSON PROGRESS ──────────────────────────────────────────────────────

export const userLessonProgressTable = pgTable("user_lesson_progress", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").notNull(),
  lessonId: integer("lesson_id").notNull(),
  programId: integer("program_id").notNull(),
  completedAt: timestamp("completed_at", { withTimezone: true }).notNull().defaultNow(),
});

export type UserLessonProgress = typeof userLessonProgressTable.$inferSelect;

// ── USER PROGRAM PROGRESS ─────────────────────────────────────────────────────

export const userProgramProgressTable = pgTable("user_program_progress", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").notNull(),
  programId: integer("program_id").notNull(),
  lastLessonId: integer("last_lesson_id"),
  completedLessonCount: integer("completed_lesson_count").notNull().default(0),
  totalLessonCount: integer("total_lesson_count").notNull().default(0),
  progressPct: integer("progress_pct").notNull().default(0),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export type UserProgramProgress = typeof userProgramProgressTable.$inferSelect;

// ── ARTICLE CATEGORIES ────────────────────────────────────────────────────────

export const cmsArticleCategoriesTable = pgTable("cms_article_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
});

export type CmsArticleCategory = typeof cmsArticleCategoriesTable.$inferSelect;

// ── ARTICLES ──────────────────────────────────────────────────────────────────

export const cmsArticlesTable = pgTable("cms_articles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  contentHtml: text("content_html"),
  excerpt: text("excerpt"),
  coverImageUrl: text("cover_image_url"),
  categoryId: integer("category_id"),
  packageId: integer("package_id"),
  status: text("status").notNull().default("draft"),
  isFeatured: boolean("is_featured").notNull().default(false),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  tags: text("tags"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export type CmsArticle = typeof cmsArticlesTable.$inferSelect;

// ── STORY CATEGORIES ──────────────────────────────────────────────────────────

export const cmsStoryCategoriesTable = pgTable("cms_story_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
});

export type CmsStoryCategory = typeof cmsStoryCategoriesTable.$inferSelect;

// ── LIFE STORIES ──────────────────────────────────────────────────────────────

export const cmsLifeStoriesTable = pgTable("cms_life_stories", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  contentHtml: text("content_html"),
  imageUrl: text("image_url"),
  categoryId: integer("category_id"),
  packageId: integer("package_id"),
  status: text("status").notNull().default("draft"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export type CmsLifeStory = typeof cmsLifeStoriesTable.$inferSelect;

// ── QUOTES (Günün Fikri) ──────────────────────────────────────────────────────

export const cmsQuotesTable = pgTable("cms_quotes", {
  id: serial("id").primaryKey(),
  text: text("text").notNull(),
  author: text("author"),
  source: text("source"),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type CmsQuote = typeof cmsQuotesTable.$inferSelect;

// ── TASK DEFINITIONS (Günün Tapşırığı) ────────────────────────────────────────

export const cmsTaskDefinitionsTable = pgTable("cms_task_definitions", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export type CmsTaskDefinition = typeof cmsTaskDefinitionsTable.$inferSelect;

// ── FAQS ──────────────────────────────────────────────────────────────────────

export const cmsFaqsTable = pgTable("cms_faqs", {
  id: serial("id").primaryKey(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  category: text("category"),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type CmsFaq = typeof cmsFaqsTable.$inferSelect;

// ── ANNOUNCEMENTS ─────────────────────────────────────────────────────────────

export const cmsAnnouncementsTable = pgTable("cms_announcements", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content"),
  isActive: boolean("is_active").notNull().default(true),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export type CmsAnnouncement = typeof cmsAnnouncementsTable.$inferSelect;

// ── SLIDERS ───────────────────────────────────────────────────────────────────

export const cmsSlidersTable = pgTable("cms_sliders", {
  id: serial("id").primaryKey(),
  title: text("title"),
  subtitle: text("subtitle"),
  imageUrl: text("image_url"),
  linkUrl: text("link_url"),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type CmsSlider = typeof cmsSlidersTable.$inferSelect;

// ── MEDIA ─────────────────────────────────────────────────────────────────────

export const cmsMediaTable = pgTable("cms_media", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  fileType: text("file_type").notNull().default("image"),
  url: text("url").notNull(),
  altText: text("alt_text"),
  uploadedBy: text("uploaded_by"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type CmsMedia = typeof cmsMediaTable.$inferSelect;
