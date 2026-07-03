import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { db, profilesTable, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userEmail?: string | null;
      userRole?: string;
      username?: string;
    }
  }
}

function getJwtSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is not set");
  return secret;
}

export interface JwtPayload {
  sub: string;
  username: string;
  role: string;
  iat?: number;
  exp?: number;
}

export function signToken(payload: Omit<JwtPayload, "iat" | "exp">): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: "7d" });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, getJwtSecret()) as JwtPayload;
  } catch {
    return null;
  }
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

  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const [user] = await db
    .select({ isBlocked: usersTable.isBlocked, email: usersTable.email })
    .from(usersTable)
    .where(eq(usersTable.id, payload.sub))
    .limit(1);

  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  if (user.isBlocked) {
    res.status(403).json({ error: "Hesabınız bloklanmışdır", code: "ACCOUNT_SUSPENDED" });
    return;
  }

  req.userId = payload.sub;
  req.userEmail = user.email ?? null;
  req.userRole = payload.role;
  req.username = payload.username;
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

  const payload = verifyToken(token);
  if (payload) {
    req.userId = payload.sub;
    req.userRole = payload.role;
    req.username = payload.username;
  }
  next();
}
