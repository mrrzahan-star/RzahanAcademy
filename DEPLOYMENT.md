# Rzahan Academy — Deployment Guide

## Architecture

| Layer    | Technology                   | Notes                                      |
|----------|------------------------------|--------------------------------------------|
| Frontend | React 18 + Vite + Tailwind   | Served as static files or by Express       |
| Backend  | Express 5 (Node 24)          | REST API with JWT auth                     |
| Database | PostgreSQL (Supabase hosted) | Drizzle ORM, all tables via migration.sql  |
| Auth     | Custom JWT (bcrypt + jsonwebtoken) | No Supabase Auth, no Google OAuth     |

---

## Step 1 — Supabase Database Setup

1. Create a new Supabase project at https://supabase.com
2. Go to **SQL Editor** in the Supabase dashboard
3. Paste the entire contents of `migration.sql` and click **Run**
4. Confirm all 10 tables were created (no errors)
5. Copy your connection string: **Settings → Database → Connection string → URI**
   - It looks like: `postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres`

> **Note:** Supabase Auth is NOT used. Only the PostgreSQL database is used.
> Do NOT enable Supabase Row Level Security (RLS) — all access control is handled by the Express API.

---

## Step 2 — Environment Variables

Set the following environment variables in your deployment environment:

| Variable         | Required | Description                                              |
|------------------|----------|----------------------------------------------------------|
| `DATABASE_URL`   | ✅ Yes   | PostgreSQL connection string from Supabase               |
| `SESSION_SECRET` | ✅ Yes   | Long random string for JWT signing (min 32 chars)        |
| `SITE_URL`       | ✅ Yes   | Your production domain, e.g. `https://yourapp.replit.app` |
| `NODE_ENV`       | ✅ Yes   | Set to `production`                                       |
| `LOG_LEVEL`      | No       | Default: `info`. Options: `debug`, `info`, `warn`, `error` |

Generate a secure SESSION_SECRET:
```bash
openssl rand -base64 64
```

---

## Step 3 — Deploy on Replit (Recommended)

This project is built and configured for Replit deployment.

1. Open the project in Replit
2. Set environment variables via **Secrets** panel (the padlock icon):
   - `DATABASE_URL`
   - `SESSION_SECRET`
   - `SITE_URL` → set to your `.replit.app` domain
3. Click **Deploy** in the top-right corner
4. Replit will build and deploy both the API and frontend automatically

The admin account is **auto-seeded on first startup**:
- Username: `Rzahan`
- Password: `Orxan919@`

> **Change the admin password immediately after first login** via the Profile page.

---

## Step 4 — Verify Deployment

After deployment, test these endpoints:

```bash
# Health check
curl https://your-domain.replit.app/api/healthz

# Platform stats (public)
curl https://your-domain.replit.app/api/stats/platform

# Certificate verification (public, replace CODE)
curl https://your-domain.replit.app/api/certificates/verify/RZH-1-00001-XXXX
```

---

## Password Reset Setup

Password reset links are sent to users by email in production.
In development mode (`NODE_ENV != production`), the reset token is returned in the API response body for testing.

Set `SITE_URL` to your exact production domain:
```
SITE_URL=https://rzahanacademy.replit.app
```

Reset links will be formatted as:
```
https://rzahanacademy.replit.app/auth/reset-password?token=<token>
```

> **Email delivery**: The current implementation logs reset URLs to the API response in dev mode.
> For production email delivery, integrate an email provider (SendGrid, Resend, Mailgun)
> by adding an email-send call after the token is created in `artifacts/api-server/src/routes/auth.ts` line ~100.

---

## Alternative Deployment (VPS / Railway / Render / Fly.io)

The project is a standard Node.js monorepo. To deploy outside Replit:

### Build
```bash
pnpm install
pnpm --filter @workspace/db run push   # applies schema to your DB
PORT=3000 BASE_PATH=/ pnpm --filter @workspace/rzahan-academy run build
pnpm --filter @workspace/api-server run build
```

### Run
```bash
node artifacts/api-server/dist/index.js
```
The API server also serves the built frontend from `artifacts/rzahan-academy/dist/public`.

### Environment
Set all variables from Step 2 plus:
```
PORT=3000
BASE_PATH=/
```

---

## Google OAuth

**Google OAuth has been completely removed.**
The project uses username + password authentication only (custom JWT).
No Google Cloud Console configuration is required.

---

## Checklist Before Going Live

- [ ] `migration.sql` run in Supabase SQL Editor
- [ ] `DATABASE_URL` set to production Supabase connection string
- [ ] `SESSION_SECRET` set to a long random value (not the default)
- [ ] `SITE_URL` set to your exact production domain
- [ ] `NODE_ENV` set to `production`
- [ ] Admin password changed from `Orxan919@` to something secure
- [ ] WhatsApp Business link updated in `artifacts/rzahan-academy/src/pages/landing/index.tsx` → `WA_LINK`
- [ ] Email delivery configured if password recovery emails are needed in production
