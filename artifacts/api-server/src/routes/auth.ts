import { Router } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { db, usersTable, profilesTable, passwordResetTokensTable } from "@workspace/db";
import { eq, and, gt } from "drizzle-orm";
import { signToken, requireAuth } from "../middlewares/auth";

const router = Router();

router.post("/register", async (req, res) => {
  const { fullName, username, password, confirmPassword, email } = req.body as {
    fullName?: string; username?: string; password?: string;
    confirmPassword?: string; email?: string;
  };

  if (!fullName?.trim()) { res.status(400).json({ error: "Ad Soyad tələb olunur" }); return; }
  if (!username?.trim()) { res.status(400).json({ error: "İstifadəçi adı tələb olunur" }); return; }
  if (!/^[a-zA-Z0-9_]{3,30}$/.test(username.trim())) {
    res.status(400).json({ error: "İstifadəçi adı 3-30 simvol, yalnız hərf, rəqəm və _ ola bilər" }); return;
  }
  if (!password || password.length < 8) { res.status(400).json({ error: "Şifrə ən azı 8 simvol olmalıdır" }); return; }
  if (password !== confirmPassword) { res.status(400).json({ error: "Şifrələr uyğun gəlmir" }); return; }

  const normalizedUsername = username.trim();
  const normalizedEmail = email?.trim() || null;

  const [existing] = await db.select({ id: usersTable.id }).from(usersTable)
    .where(eq(usersTable.username, normalizedUsername)).limit(1);
  if (existing) { res.status(400).json({ error: "Bu istifadəçi adı artıq mövcuddur" }); return; }

  if (normalizedEmail) {
    const [emailExists] = await db.select({ id: usersTable.id }).from(usersTable)
      .where(eq(usersTable.email, normalizedEmail)).limit(1);
    if (emailExists) { res.status(400).json({ error: "Bu e-poçt artıq qeydiyyatdan keçib" }); return; }
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const userId = crypto.randomUUID();
  const nameParts = fullName.trim().split(" ");
  const firstName = nameParts[0] ?? "";
  const lastName = nameParts.slice(1).join(" ") || null;

  await db.insert(usersTable).values({
    id: userId, username: normalizedUsername, fullName: fullName.trim(),
    email: normalizedEmail, passwordHash, role: "user",
  });

  await db.insert(profilesTable).values({
    userId, email: normalizedEmail, firstName, lastName,
  }).onConflictDoNothing();

  const token = signToken({ sub: userId, username: normalizedUsername, role: "user" });
  res.status(201).json({
    token,
    user: { id: userId, username: normalizedUsername, fullName: fullName.trim(), email: normalizedEmail, role: "user" },
  });
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body as { username?: string; password?: string };
  if (!username?.trim() || !password) {
    res.status(400).json({ error: "İstifadəçi adı və şifrə tələb olunur" }); return;
  }

  const [user] = await db.select().from(usersTable)
    .where(eq(usersTable.username, username.trim())).limit(1);

  if (!user) { res.status(401).json({ error: "İstifadəçi adı və ya şifrə yanlışdır" }); return; }
  if (user.isBlocked) { res.status(403).json({ error: "Hesabınız bloklanmışdır", code: "ACCOUNT_SUSPENDED" }); return; }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) { res.status(401).json({ error: "İstifadəçi adı və ya şifrə yanlışdır" }); return; }

  const token = signToken({ sub: user.id, username: user.username, role: user.role });
  res.json({
    token,
    user: { id: user.id, username: user.username, fullName: user.fullName, email: user.email, role: user.role },
  });
});

router.post("/forgot-password", async (req, res) => {
  const { usernameOrEmail } = req.body as { usernameOrEmail?: string };
  if (!usernameOrEmail?.trim()) {
    res.status(400).json({ error: "İstifadəçi adı və ya e-poçt tələb olunur" }); return;
  }

  const val = usernameOrEmail.trim();
  const isEmail = val.includes("@");

  const [user] = await db.select({ id: usersTable.id, email: usersTable.email })
    .from(usersTable)
    .where(isEmail ? eq(usersTable.email, val) : eq(usersTable.username, val))
    .limit(1);

  const genericMsg = { message: "Əgər bu hesabda e-poçt varsa, bərpa məlumatı göndərildi" };
  if (!user?.email) { res.json(genericMsg); return; }

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
  await db.insert(passwordResetTokensTable).values({ userId: user.id, token, expiresAt });

  const basePath = (process.env.BASE_PATH || "").replace(/\/$/, "");
  const resetUrl = `${process.env.SITE_URL || ""}${basePath}/auth/reset-password?token=${token}`;

  res.json({
    ...genericMsg,
    _devResetUrl: process.env.NODE_ENV !== "production" ? resetUrl : undefined,
    _devToken: process.env.NODE_ENV !== "production" ? token : undefined,
  });
});

router.post("/reset-password", async (req, res) => {
  const { token, password, confirmPassword } = req.body as {
    token?: string; password?: string; confirmPassword?: string;
  };
  if (!token || !password) { res.status(400).json({ error: "Token və şifrə tələb olunur" }); return; }
  if (password.length < 8) { res.status(400).json({ error: "Şifrə ən azı 8 simvol olmalıdır" }); return; }
  if (password !== confirmPassword) { res.status(400).json({ error: "Şifrələr uyğun gəlmir" }); return; }

  const [record] = await db.select().from(passwordResetTokensTable)
    .where(and(
      eq(passwordResetTokensTable.token, token),
      eq(passwordResetTokensTable.used, false),
      gt(passwordResetTokensTable.expiresAt, new Date()),
    )).limit(1);

  if (!record) { res.status(400).json({ error: "Token etibarsız və ya vaxtı keçib" }); return; }

  const passwordHash = await bcrypt.hash(password, 12);
  await Promise.all([
    db.update(usersTable).set({ passwordHash }).where(eq(usersTable.id, record.userId)),
    db.update(passwordResetTokensTable).set({ used: true }).where(eq(passwordResetTokensTable.id, record.id)),
  ]);

  res.json({ message: "Şifrə uğurla yeniləndi" });
});

router.get("/me", requireAuth, async (req, res) => {
  const [user] = await db
    .select({ id: usersTable.id, username: usersTable.username, fullName: usersTable.fullName, email: usersTable.email, role: usersTable.role })
    .from(usersTable).where(eq(usersTable.id, req.userId!)).limit(1);
  if (!user) { res.status(404).json({ error: "Not found" }); return; }
  res.json(user);
});

export default router;
