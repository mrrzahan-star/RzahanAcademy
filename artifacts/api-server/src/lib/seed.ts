import bcrypt from "bcryptjs";
import { db, usersTable, profilesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
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
