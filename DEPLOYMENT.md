# Rzahan Academy — Netlify Deployment Guide

## Architecture

```
Browser
   ↓
Netlify CDN  (React SPA — static files from artifacts/rzahan-academy/dist/public)
   ↓
Netlify Functions  (Express app bundled with serverless-http → netlify/functions/api.mjs)
   ↓
Supabase PostgreSQL  (Drizzle ORM, all tables in migration.sql)
```

No separate server. No Railway. No Render. No Fly.io. No Replit Deployment required.

---

## Step 1 — Supabase Database Setup

1. Create a new project at https://supabase.com
2. Go to **SQL Editor** in the Supabase dashboard
3. Paste the entire contents of `migration.sql` and click **Run**
4. Confirm: 10 tables created, 8 indexes created, admin user inserted — no errors

> **Supabase Auth is NOT used.** Only the PostgreSQL database is used.
> **Do NOT enable Row Level Security (RLS)** — all access control is in the Netlify Function.

### Connection string (for `DATABASE_URL`)

For best serverless performance use the **Transaction Pooler** URL:

**Supabase → Project Settings → Database → Connection Pooling → Transaction mode**

It looks like:
```
postgresql://postgres.YOURREF:[PASSWORD]@aws-0-REGION.pooler.supabase.com:6543/postgres
```

This uses pgBouncer in transaction mode, which is ideal for serverless functions.

---

## Step 2 — Netlify Setup

### Option A: Deploy from GitHub (recommended)

1. Push this repo to GitHub
2. Go to https://app.netlify.com → **Add new site → Import an existing project**
3. Connect your GitHub repository
4. Netlify auto-detects `netlify.toml` — the build settings are pre-configured:
   - **Build command:** `pnpm install --frozen-lockfile && pnpm --filter @workspace/api-server run build:netlify && BASE_PATH=/ pnpm --filter @workspace/rzahan-academy run build`
   - **Publish directory:** `artifacts/rzahan-academy/dist/public`
   - **Functions directory:** `netlify/functions`

### Option B: Manual deploy via Netlify CLI

```bash
npm install -g netlify-cli
netlify login
netlify init
netlify deploy --prod
```

---

## Step 3 — Environment Variables

Set these in **Netlify → Site configuration → Environment variables**:

| Variable         | Required | Description |
|------------------|----------|-------------|
| `DATABASE_URL`   | ✅ | Transaction Pooler URI from Supabase (port 6543) |
| `SESSION_SECRET` | ✅ | Long random string — signs JWT tokens. Generate: `openssl rand -base64 64` |
| `SITE_URL`       | ✅ | Your Netlify domain, e.g. `https://rzahanacademy.netlify.app` |
| `NODE_ENV`       | ✅ | Set to `production` |
| `LOG_LEVEL`      | No | Default: `info` |

> `NETLIFY=true` is set automatically by Netlify — do NOT set it manually.

---

## Step 4 — Verify Deployment

After deploy, test these public endpoints:

```bash
# Health check
curl https://your-site.netlify.app/api/healthz

# Public platform stats
curl https://your-site.netlify.app/api/stats/platform

# Certificate verification (replace CODE with a real code)
curl https://your-site.netlify.app/api/certificates/verify/RZH-1-00001-XXXX
```

---

## Admin Account

The default administrator is seeded by `migration.sql`:

- **Username:** `Rzahan`
- **Password:** `Orxan919@`

> ⚠️ **Change the admin password immediately after first login** via the Profile page.

---

## Password Reset

Password reset links are generated using `SITE_URL`. Set it to your exact production domain:

```
SITE_URL=https://rzahanacademy.netlify.app
```

Reset links will be:
```
https://rzahanacademy.netlify.app/auth/reset-password?token=<token>
```

In `NODE_ENV=production`, reset tokens are NOT returned in API responses.
To enable email delivery, add an email provider (Resend, SendGrid, etc.) in:
`artifacts/api-server/src/routes/auth.ts` around line 103.

---

## Google OAuth

**Completely removed.** Username + password only (custom JWT). No Google Cloud Console configuration required.

---

## Netlify Function Details

- Entry: `artifacts/api-server/src/api.ts`
- Build output: `netlify/functions/api.mjs` (pre-bundled with esbuild)
- Exposes: `/.netlify/functions/api`
- Redirect: all `/api/*` → `/.netlify/functions/api` (configured in `netlify.toml`)
- Runtime: Node.js 20 (Netlify default for functions)
- Size: ~2.4MB bundled

The function wraps the full Express app with `serverless-http`. All 28 API endpoints are tested and confirmed working.

---

## Pre-Deployment Checklist

- [ ] `migration.sql` run in Supabase SQL Editor without errors
- [ ] `DATABASE_URL` set to Transaction Pooler URL (port 6543)
- [ ] `SESSION_SECRET` set to a secure random value (not the example)
- [ ] `SITE_URL` set to your exact Netlify domain
- [ ] `NODE_ENV` set to `production`
- [ ] Admin password changed from `Orxan919@` after first login
- [ ] WhatsApp link updated if needed: `artifacts/rzahan-academy/src/pages/landing/index.tsx` line ~12
- [ ] Email delivery configured if password reset emails are needed in production
