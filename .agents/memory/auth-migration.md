---
name: Custom Auth Migration
description: Replaced Supabase Auth with custom username/password JWT auth in Rzahan Academy
---

## What changed
- Supabase Auth removed from both frontend and backend
- New `users` table and `password_reset_tokens` table in DB (pushed via drizzle-kit)
- JWT signed with SESSION_SECRET, 7-day expiry, payload: `{ sub, username, role }`
- Admin seeded on startup via `seedAdmin()` in `lib/seed.ts`

## Admin credentials
- username: Rzahan, role: admin (seeded with fixed UUID `00000000-0000-0000-0000-000000000001`)
- Admin gated by `req.userRole === "admin"` (NOT email)

## Key files
- New middleware: `artifacts/api-server/src/middlewares/auth.ts`
- Auth routes: `artifacts/api-server/src/routes/auth.ts` (register, login, forgot-password, reset-password, /me)
- Seed: `artifacts/api-server/src/lib/seed.ts`
- Frontend token storage: `artifacts/rzahan-academy/src/lib/api.ts` (localStorage key: `rzahan_token`)
- New AuthContext: `artifacts/rzahan-academy/src/contexts/AuthContext.tsx` (AppUser type, not Supabase User)

**Why:** Supabase Auth project was deleted; user requested username-based auth with no Google OAuth.
**How to apply:** All protected routes import `requireAuth` from `../middlewares/auth` (not supabaseAuth). Admin check is always `req.userRole === "admin"`.
