import bcrypt from "bcryptjs";
import { db, usersTable, profilesTable, cmsArticleCategoriesTable, cmsStoryCategoriesTable } from "@workspace/db";
import { eq, count } from "drizzle-orm";
import { logger } from "./logger";

const ADMIN_ID = "00000000-0000-0000-0000-000000000001";
const ADMIN_USERNAME = "Rzahan";
const ADMIN_FULL_NAME = "Orxan Rzayev";
const ADMIN_PASSWORD = "Orxan919@";

export async function seedAdmin(): Promise<void> {
  try {
    const [existing] = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.username, ADMIN_USERNAME))
      .limit(1);

    if (existing) {
      logger.info("Admin user already exists, skipping seed");
      return;
    }

    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);

    await db.insert(usersTable).values({
      id: ADMIN_ID,
      username: ADMIN_USERNAME,
      fullName: ADMIN_FULL_NAME,
      email: null,
      passwordHash,
      role: "admin",
    }).onConflictDoNothing();

    await db.insert(profilesTable).values({
      userId: ADMIN_ID,
      firstName: "Orxan",
      lastName: "Rzayev",
      email: null,
    }).onConflictDoNothing();

    logger.info("Admin user seeded successfully");
  } catch (err) {
    logger.error({ err }, "Failed to seed admin user");
  }
}

const DEFAULT_ARTICLE_CATEGORIES = [
  "Psixologiya", "Şəxsi İnkişaf", "Fəlsəfə", "Həyat", "Şüur",
  "Münasibətlər", "Valideynlik", "Liderlik", "Ünsiyyət", "Motivasiya",
];

const DEFAULT_STORY_CATEGORIES = [
  "Qərarlar", "Ailə", "İş Həyatı", "Dostluq", "Asılılıq",
  "Valideynlik", "Şəxsi İnkişaf", "Psixologiya", "Həyat Dərsləri",
];

function toSlug(s: string) {
  return s.toLowerCase()
    .replace(/ş/g, "sh").replace(/ç/g, "ch").replace(/ğ/g, "gh")
    .replace(/ı/g, "i").replace(/ö/g, "o").replace(/ü/g, "u")
    .replace(/ə/g, "e").replace(/İ/g, "i")
    .replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

export async function seedCategories(): Promise<void> {
  try {
    const [{ c: artCount }] = await db.select({ c: count() }).from(cmsArticleCategoriesTable);
    if (Number(artCount) === 0) {
      await db.insert(cmsArticleCategoriesTable).values(
        DEFAULT_ARTICLE_CATEGORIES.map((name, i) => ({ name, slug: toSlug(name), sortOrder: i, isActive: true }))
      ).onConflictDoNothing();
      logger.info("Default article categories seeded");
    }

    const [{ c: storyCount }] = await db.select({ c: count() }).from(cmsStoryCategoriesTable);
    if (Number(storyCount) === 0) {
      await db.insert(cmsStoryCategoriesTable).values(
        DEFAULT_STORY_CATEGORIES.map((name, i) => ({ name, slug: toSlug(name), sortOrder: i, isActive: true }))
      ).onConflictDoNothing();
      logger.info("Default story categories seeded");
    }
  } catch (err) {
    logger.error({ err }, "Failed to seed categories");
  }
}
