import { Router } from "express";
import { requireAuth } from "../middlewares/supabaseAuth";
import { db, certificatesTable, profilesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { CreateCertificateBody } from "@workspace/api-zod";
import { randomBytes } from "crypto";

const STAGE_NAMES = [
  "Yatmış", "Döyüşçü", "Kəşfiyyatçı", "Şəxsiyyət", "Oyunçu", "Sehrbaz", "Yaradıcı",
];

const router = Router();

router.get("/", requireAuth, async (req, res) => {
  const userId = req.userId!;
  const certs = await db.select().from(certificatesTable)
    .where(eq(certificatesTable.userId, userId));
  res.json(certs.map((c) => ({
    id: c.id, userId: c.userId, stage: c.stage, stageName: c.stageName,
    certificateCode: c.certificateCode, issuedAt: c.issuedAt.toISOString(),
  })));
});

router.post("/", requireAuth, async (req, res) => {
  const userId = req.userId!;
  const body = CreateCertificateBody.safeParse(req.body);
  if (!body.success) { res.status(400).json({ error: "Invalid input" }); return; }
  const stage = body.data.stage;
  const stageName = STAGE_NAMES[stage - 1] ?? "Naməlum";
  const certificateCode = `RZH-${stage}-${randomBytes(4).toString("hex").toUpperCase()}`;
  const [cert] = await db.insert(certificatesTable)
    .values({ userId, stage, stageName, certificateCode }).returning();
  res.status(201).json({
    id: cert.id, userId: cert.userId, stage: cert.stage, stageName: cert.stageName,
    certificateCode: cert.certificateCode, issuedAt: cert.issuedAt.toISOString(),
  });
});

router.get("/verify/:code", async (req, res) => {
  const code = req.params.code as string;
  if (!code || code.length > 60) { res.status(400).json({ error: "Invalid code" }); return; }

  const [cert] = await db.select().from(certificatesTable)
    .where(eq(certificatesTable.certificateCode, code));

  if (!cert) { res.status(404).json({ error: "Certificate not found" }); return; }

  const [profile] = await db.select({
    firstName: profilesTable.firstName,
    lastName: profilesTable.lastName,
    email: profilesTable.email,
  }).from(profilesTable).where(eq(profilesTable.userId, cert.userId));

  res.json({
    valid: true,
    certificateCode: cert.certificateCode,
    stage: cert.stage,
    stageName: cert.stageName,
    issuedAt: cert.issuedAt.toISOString(),
    ownerName: profile
      ? `${profile.firstName ?? ""} ${profile.lastName ?? ""}`.trim() || profile.email?.split("@")[0] || "İstifadəçi"
      : "İstifadəçi",
  });
});

export default router;
