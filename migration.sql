-- Rzahan Academy — Complete Database Migration
-- Run this SQL in your Supabase SQL Editor before first deployment.
-- Safe to run multiple times (uses IF NOT EXISTS / ON CONFLICT DO NOTHING).

-- ─── users ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,
  username      TEXT NOT NULL UNIQUE,
  full_name     TEXT NOT NULL,
  email         TEXT UNIQUE,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'user',
  is_blocked    BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_active_at TIMESTAMPTZ
);

-- ─── profiles ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id                  SERIAL PRIMARY KEY,
  user_id             TEXT NOT NULL UNIQUE,
  first_name          TEXT,
  last_name           TEXT,
  avatar_url          TEXT,
  email               TEXT,
  consciousness_level INTEGER,
  consciousness_stage TEXT,
  bio                 TEXT,
  streak              INTEGER NOT NULL DEFAULT 0,
  last_active_at      TIMESTAMPTZ,
  is_blocked          BOOLEAN NOT NULL DEFAULT false,
  tasks_completed     INTEGER NOT NULL DEFAULT 0,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── test_results ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS test_results (
  id              SERIAL PRIMARY KEY,
  user_id         TEXT NOT NULL,
  total_score     INTEGER NOT NULL,
  stage           INTEGER NOT NULL,
  stage_name      TEXT NOT NULL,
  scores          JSONB,
  recommendations TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── certificates ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS certificates (
  id               SERIAL PRIMARY KEY,
  user_id          TEXT NOT NULL,
  stage            INTEGER NOT NULL,
  stage_name       TEXT NOT NULL,
  certificate_code TEXT NOT NULL UNIQUE,
  issued_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── journal_entries ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS journal_entries (
  id         SERIAL PRIMARY KEY,
  user_id    TEXT NOT NULL,
  title      TEXT NOT NULL,
  content    TEXT NOT NULL,
  category   TEXT NOT NULL DEFAULT 'ümumi',
  mood       TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── daily_tasks ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS daily_tasks (
  id         SERIAL PRIMARY KEY,
  user_id    TEXT NOT NULL,
  date       TEXT NOT NULL,
  task_slot  TEXT NOT NULL,
  done       BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── comments ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS comments (
  id          SERIAL PRIMARY KEY,
  user_id     TEXT,
  author_name TEXT NOT NULL,
  avatar_url  TEXT,
  content     TEXT NOT NULL,
  stage       INTEGER,
  stage_name  TEXT,
  rating      INTEGER,
  approved    BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── audit_logs ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_logs (
  id          SERIAL PRIMARY KEY,
  admin_email TEXT NOT NULL,
  action      TEXT NOT NULL,
  target      TEXT,
  details     JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── site_settings ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS site_settings (
  key        TEXT PRIMARY KEY,
  value      TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── password_reset_tokens ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id         SERIAL PRIMARY KEY,
  user_id    TEXT NOT NULL,
  token      TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used       BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Indexes ──────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_test_results_user_id    ON test_results(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_user_id    ON certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id ON journal_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_tasks_user_id     ON daily_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_approved       ON comments(approved);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action       ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at   ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);

-- ─── Admin seed ───────────────────────────────────────────────────────────────
-- Seeds the default administrator account (username: Rzahan, password: Orxan919@).
-- The password_hash below is bcrypt(cost=12) of "Orxan919@".
-- CHANGE THE PASSWORD immediately after first login via the Profile page.
INSERT INTO users (id, username, full_name, email, password_hash, role, is_blocked)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Rzahan',
  'Orxan Rzayev',
  NULL,
  '$2b$12$Y5uidcEzkEsceoXaCCHhEuiLpqMhweuRICkcVNoIQwQpeXLVr68uu',
  'admin',
  false
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO profiles (user_id, first_name, last_name, email)
VALUES ('00000000-0000-0000-0000-000000000001', 'Orxan', 'Rzayev', NULL)
ON CONFLICT (user_id) DO NOTHING;
