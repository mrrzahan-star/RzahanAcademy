import type { Request, Response, NextFunction } from "express";
import { createClient } from "@supabase/supabase-js";
import { db, profilesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userEmail?: string;
    }
  }
}

let _admin: ReturnType<typeof createClient> | null = null;

function getAdmin() {
  if (!_admin) {
    _admin = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } },
    );
  }
  return _admin;
}

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const token = req.headers.authorization?.startsWith("Bearer ")
    ? req.headers.authorization.slice(7)
    : null;

  if (!token) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const { data: { user }, error } = await getAdmin().auth.getUser(token);

  if (error || !user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const [profile] = await db
    .select({ isBlocked: profilesTable.isBlocked })
    .from(profilesTable)
    .where(eq(profilesTable.userId, user.id))
    .limit(1);

  if (profile?.isBlocked) {
    res.status(403).json({ error: "Hesabınız bloklanmışdır", code: "ACCOUNT_SUSPENDED" });
    return;
  }

  req.userId = user.id;
  req.userEmail = user.email;
  next();
}

export async function optionalAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  const token = req.headers.authorization?.startsWith("Bearer ")
    ? req.headers.authorization.slice(7)
    : null;

  if (!token) { next(); return; }

  try {
    const { data: { user } } = await getAdmin().auth.getUser(token);
    if (user) { req.userId = user.id; req.userEmail = user.email; }
  } catch { /* ignore */ }
  next();
}
