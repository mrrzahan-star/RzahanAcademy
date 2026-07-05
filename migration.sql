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

-- ═══════════════════════════════════════════════════════════════════════════════
-- LMS / CMS TABLES  (Phase 2 — Content Management System)
-- Safe to run multiple times (IF NOT EXISTS).
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─── cms_packages ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cms_packages (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  emoji       TEXT DEFAULT '📦',
  description TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── cms_program_categories ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cms_program_categories (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  sort_order  INTEGER NOT NULL DEFAULT 0
);

-- ─── cms_programs ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cms_programs (
  id               SERIAL PRIMARY KEY,
  title            TEXT NOT NULL,
  slug             TEXT NOT NULL UNIQUE,
  description      TEXT,
  cover_image_url  TEXT,
  category_id      INTEGER,
  package_id       INTEGER,
  status           TEXT NOT NULL DEFAULT 'draft',
  sort_order       INTEGER NOT NULL DEFAULT 0,
  duration_hours   INTEGER,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── cms_modules ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cms_modules (
  id          SERIAL PRIMARY KEY,
  program_id  INTEGER NOT NULL,
  title       TEXT NOT NULL,
  description TEXT,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── cms_lessons ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cms_lessons (
  id                    SERIAL PRIMARY KEY,
  module_id             INTEGER NOT NULL,
  title                 TEXT NOT NULL,
  description           TEXT,
  content_html          TEXT,
  youtube_url           TEXT,
  audio_url             TEXT,
  pdf_url               TEXT,
  duration_minutes      INTEGER,
  reading_time_minutes  INTEGER,
  package_id            INTEGER,
  status                TEXT NOT NULL DEFAULT 'draft',
  sort_order            INTEGER NOT NULL DEFAULT 0,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── cms_article_categories ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cms_article_categories (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT true
);

-- ─── cms_articles ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cms_articles (
  id              SERIAL PRIMARY KEY,
  title           TEXT NOT NULL,
  slug            TEXT NOT NULL UNIQUE,
  content_html    TEXT,
  excerpt         TEXT,
  cover_image_url TEXT,
  category_id     INTEGER,
  package_id      INTEGER,
  status          TEXT NOT NULL DEFAULT 'draft',
  is_featured     BOOLEAN NOT NULL DEFAULT false,
  seo_title       TEXT,
  seo_description TEXT,
  tags            TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── cms_story_categories ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cms_story_categories (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT true
);

-- ─── cms_life_stories ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cms_life_stories (
  id           SERIAL PRIMARY KEY,
  title        TEXT NOT NULL,
  content_html TEXT,
  image_url    TEXT,
  category_id  INTEGER,
  package_id   INTEGER,
  status       TEXT NOT NULL DEFAULT 'draft',
  sort_order   INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── cms_quotes (Günün Fikri) ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cms_quotes (
  id          SERIAL PRIMARY KEY,
  text        TEXT NOT NULL,
  author      TEXT,
  source      TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── cms_task_definitions (Günün Tapşırığı) ──────────────────────────────────
CREATE TABLE IF NOT EXISTS cms_task_definitions (
  id          SERIAL PRIMARY KEY,
  title       TEXT NOT NULL,
  description TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── cms_faqs ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cms_faqs (
  id          SERIAL PRIMARY KEY,
  question    TEXT NOT NULL,
  answer      TEXT NOT NULL,
  category    TEXT,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── cms_announcements ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cms_announcements (
  id          SERIAL PRIMARY KEY,
  title       TEXT NOT NULL,
  content     TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  expires_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── cms_sliders ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cms_sliders (
  id          SERIAL PRIMARY KEY,
  title       TEXT,
  subtitle    TEXT,
  image_url   TEXT,
  link_url    TEXT,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── cms_media ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cms_media (
  id            SERIAL PRIMARY KEY,
  filename      TEXT NOT NULL,
  original_name TEXT NOT NULL,
  file_type     TEXT NOT NULL DEFAULT 'image',
  url           TEXT NOT NULL,
  alt_text      TEXT,
  uploaded_by   TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed default packages
INSERT INTO cms_packages (name, slug, emoji, description, is_active, sort_order)
VALUES
  ('Başlanğıc', 'baslanqic', '🌱', 'Əsas bilik və bacarıqlar üçün giriş paketi', true, 1),
  ('İnkişaf',   'inkisaf',   '🚀', 'Daha dərin öyrənmə və inkişaf üçün irəliləmiş paket', true, 2),
  ('Ustad',     'ustad',     '👑', 'Tam giriş və ekspert səviyyəsi üçün premium paket', true, 3)
ON CONFLICT (slug) DO NOTHING;
