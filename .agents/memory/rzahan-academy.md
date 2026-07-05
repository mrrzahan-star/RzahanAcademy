---
name: Rzahan Academy stack
description: Key architecture decisions, DB layout, and push workflow for Rzahan Academy.
---

## Stack
- pnpm monorepo; Node 20; TypeScript 5.9; Express 5; Drizzle ORM + PostgreSQL (Supabase)
- Frontend: React + Vite SPA (`artifacts/rzahan-academy`)
- API: Express (`artifacts/api-server`) — served via Netlify Functions in production
- Build: `netlify/functions/api.mjs` (esbuild bundle); Vite SPA in `artifacts/rzahan-academy/dist/public`

## DB schema locations
- `lib/db/src/schema/` — all table definitions; run `pnpm --filter @workspace/db run push` to apply changes
- Progress tables: `user_lesson_progress`, `user_program_progress` (cms.ts)
- CMS tables: `cms_programs`, `cms_modules`, `cms_lessons`, + 12 other CMS tables (cms.ts)

## Key API routes
- `/api/admin/cms/*` — full CMS CRUD (requireAdmin)
- `/api/programs/*` — student-facing program/lesson/progress routes
- `/api/stats/home-widgets` — dashboard widgets (requireAuth)

## GitHub push
`git push "https://mrrzahan-star:${GH_PAT}@github.com/mrrzahan-star/RzahanAcademy.git" HEAD:main`
GH_PAT is in the session scratchpad (never commit it).

**Why:** Replit auto-commits but doesn't push; must push manually after each turn's auto-commit.

## Important constraint
- `certificates` table uses `issuedAt` (not `createdAt`) — caught this in stats.ts.
- All dashboard routes are ProtectedRoute (requireAuth) — screenshots always show sign-in page.
- Do NOT touch: auth, test/certificate flow, journal, tasks, leaderboard.
