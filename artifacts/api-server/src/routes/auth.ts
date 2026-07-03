import { Router } from "express";
import { requireAuth } from "../middlewares/supabaseAuth";
import { createClient } from "@supabase/supabase-js";
import { db, profilesTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router = Router();

function getAdmin() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}

router.post("/signup", async (req, res) => {
  const { email, password, firstName, lastName } = req.body as {
    email?: string; password?: string; firstName?: string; lastName?: string;
  };
  if (!email || !password) {
    res.status(400).json({ error: "E-poçt və şifrə tələb olunur" });
    return;
  }
  if (password.length < 8) {
    res.status(400).json({ error: "Şifrə ən azı 8 simvol olmalıdır" });
    return;
  }

  const admin = getAdmin();
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      first_name: firstName ?? "",
      last_name: lastName ?? "",
    },
  });

  if (error) {
    const msg = error.message.includes("already been registered")
      ? "Bu e-poçt artıq qeydiyyatdan keçib"
      : error.message;
    res.status(400).json({ error: msg });
    return;
  }

  if (data.user) {
    await db.insert(profilesTable).values({
      userId: data.user.id,
      email,
      firstName: firstName ?? null,
      lastName: lastName ?? null,
    }).onConflictDoNothing();
  }

  res.json({ message: "ok" });
});

router.post("/sync-profile", requireAuth, async (req, res) => {
  const userId = req.userId!;
  const userEmail = req.userEmail ?? null;
  const { firstName, lastName, avatarUrl } = req.body as {
    firstName?: string; lastName?: string; avatarUrl?: string;
  };

  await db.insert(profilesTable).values({
    userId,
    email: userEmail,
    firstName: firstName ?? null,
    lastName: lastName ?? null,
    avatarUrl: avatarUrl ?? null,
  }).onConflictDoUpdate({
    target: profilesTable.userId,
    set: {
      email: sql`COALESCE(EXCLUDED.email, profiles.email)`,
      firstName: sql`COALESCE(NULLIF(EXCLUDED.first_name, ''), profiles.first_name)`,
      lastName: sql`COALESCE(NULLIF(EXCLUDED.last_name, ''), profiles.last_name)`,
      avatarUrl: sql`COALESCE(NULLIF(EXCLUDED.avatar_url, ''), profiles.avatar_url)`,
    },
  });

  res.json({ ok: true });
});

export default router;
