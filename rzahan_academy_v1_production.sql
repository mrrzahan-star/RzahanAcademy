-- ============================================================
-- Rzahan Academy v1.0 — Production SQL
-- Supabase PostgreSQL — Run on a fresh project
-- Generated: 2026-07-05
-- NOTE: The admin user is seeded automatically by the API
--       server on first boot (see app.ts → seedAdmin).
--       Set ADMIN_USERNAME / ADMIN_PASSWORD env vars before
--       first boot, OR register manually and promote to admin.
-- ============================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. USERS
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
  id              TEXT PRIMARY KEY,
  username        TEXT NOT NULL UNIQUE,
  full_name       TEXT NOT NULL,
  email           TEXT UNIQUE,
  password_hash   TEXT NOT NULL,
  role            TEXT NOT NULL DEFAULT 'user',
  is_blocked      BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_active_at  TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- ============================================================
-- 2. PROFILES
-- ============================================================

CREATE TABLE IF NOT EXISTS profiles (
  id                      SERIAL PRIMARY KEY,
  user_id                 TEXT NOT NULL UNIQUE,
  first_name              TEXT,
  last_name               TEXT,
  avatar_url              TEXT,
  email                   TEXT,
  consciousness_level     INTEGER,
  consciousness_stage     TEXT,
  bio                     TEXT,
  streak                  INTEGER NOT NULL DEFAULT 0,
  last_active_at          TIMESTAMPTZ,
  is_blocked              BOOLEAN NOT NULL DEFAULT false,
  tasks_completed         INTEGER NOT NULL DEFAULT 0,
  current_package_slug    TEXT NOT NULL DEFAULT 'baslanqic',
  membership_expires_at   TIMESTAMPTZ,
  current_membership_id   INTEGER,
  total_xp                INTEGER NOT NULL DEFAULT 0,
  dev_score               INTEGER NOT NULL DEFAULT 0,
  current_level_name      TEXT NOT NULL DEFAULT 'Başlanğıc',
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_total_xp ON profiles(total_xp DESC);

-- ============================================================
-- 3. PASSWORD RESET TOKENS
-- ============================================================

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id          SERIAL PRIMARY KEY,
  user_id     TEXT NOT NULL,
  token       TEXT NOT NULL UNIQUE,
  expires_at  TIMESTAMPTZ NOT NULL,
  used        BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prt_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_prt_user_id ON password_reset_tokens(user_id);

-- ============================================================
-- 4. TEST RESULTS
-- ============================================================

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

CREATE INDEX IF NOT EXISTS idx_test_results_user_id ON test_results(user_id);
CREATE INDEX IF NOT EXISTS idx_test_results_created_at ON test_results(created_at DESC);

-- ============================================================
-- 5. CERTIFICATES
-- ============================================================

CREATE TABLE IF NOT EXISTS certificates (
  id                SERIAL PRIMARY KEY,
  user_id           TEXT NOT NULL,
  stage             INTEGER NOT NULL,
  stage_name        TEXT NOT NULL,
  certificate_code  TEXT NOT NULL UNIQUE,
  issued_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_certificates_user_id ON certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_code ON certificates(certificate_code);

-- ============================================================
-- 6. JOURNAL ENTRIES
-- ============================================================

CREATE TABLE IF NOT EXISTS journal_entries (
  id          SERIAL PRIMARY KEY,
  user_id     TEXT NOT NULL,
  title       TEXT NOT NULL,
  content     TEXT NOT NULL,
  category    TEXT NOT NULL DEFAULT 'ümumi',
  mood        TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_journal_user_id ON journal_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_created_at ON journal_entries(created_at DESC);

-- ============================================================
-- 7. DAILY TASKS
-- ============================================================

CREATE TABLE IF NOT EXISTS daily_tasks (
  id          SERIAL PRIMARY KEY,
  user_id     TEXT NOT NULL,
  date        TEXT NOT NULL,
  task_slot   TEXT NOT NULL,
  done        BOOLEAN NOT NULL DEFAULT false,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_daily_tasks_user_date ON daily_tasks(user_id, date);

-- ============================================================
-- 8. AUDIT LOGS
-- ============================================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id           SERIAL PRIMARY KEY,
  admin_email  TEXT NOT NULL,
  action       TEXT NOT NULL,
  target       TEXT,
  details      JSONB,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- ============================================================
-- 9. COMMENTS / REVIEWS
-- ============================================================

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

CREATE INDEX IF NOT EXISTS idx_comments_approved ON comments(approved);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);

-- ============================================================
-- 10. SITE SETTINGS
-- ============================================================

CREATE TABLE IF NOT EXISTS site_settings (
  key         TEXT PRIMARY KEY,
  value       TEXT,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 11. MEMBERSHIPS
-- ============================================================

CREATE TABLE IF NOT EXISTS user_memberships (
  id            SERIAL PRIMARY KEY,
  user_id       TEXT NOT NULL,
  package_slug  TEXT NOT NULL,
  package_name  TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'active',
  duration_days INTEGER,
  activated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at    TIMESTAMPTZ,
  activated_by  TEXT,
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_memberships_user_id ON user_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_user_memberships_status ON user_memberships(status);

CREATE TABLE IF NOT EXISTS membership_requests (
  id            SERIAL PRIMARY KEY,
  user_id       TEXT,
  full_name     TEXT NOT NULL,
  phone         TEXT NOT NULL,
  email         TEXT,
  package_slug  TEXT NOT NULL,
  package_name  TEXT NOT NULL,
  notes         TEXT,
  status        TEXT NOT NULL DEFAULT 'new',
  admin_notes   TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_membership_requests_status ON membership_requests(status);

-- ============================================================
-- 12. CMS — PACKAGES
-- ============================================================

CREATE TABLE IF NOT EXISTS cms_packages (
  id               SERIAL PRIMARY KEY,
  name             TEXT NOT NULL,
  slug             TEXT NOT NULL UNIQUE,
  emoji            TEXT DEFAULT '📦',
  description      TEXT,
  long_description TEXT,
  color            TEXT DEFAULT '#5b5fef',
  features         TEXT,
  monthly_price    TEXT,
  yearly_price     TEXT,
  is_recommended   BOOLEAN NOT NULL DEFAULT false,
  required_level   INTEGER NOT NULL DEFAULT 0,
  btn_text         TEXT,
  btn_url          TEXT,
  is_active        BOOLEAN NOT NULL DEFAULT true,
  sort_order       INTEGER NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 13. CMS — PROGRAM CATEGORIES
-- ============================================================

CREATE TABLE IF NOT EXISTS cms_program_categories (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  sort_order  INTEGER NOT NULL DEFAULT 0
);

-- ============================================================
-- 14. CMS — PROGRAMS
-- ============================================================

CREATE TABLE IF NOT EXISTS cms_programs (
  id                      SERIAL PRIMARY KEY,
  title                   TEXT NOT NULL,
  slug                    TEXT NOT NULL UNIQUE,
  description             TEXT,
  full_description        TEXT,
  cover_image_url         TEXT,
  banner_image_url        TEXT,
  icon_url                TEXT,
  category_id             INTEGER,
  package_id              INTEGER,
  difficulty              TEXT DEFAULT 'baslanqic',
  instructor              TEXT DEFAULT 'Rzahan',
  language                TEXT DEFAULT 'Azərbaycan',
  certificate_available   BOOLEAN NOT NULL DEFAULT false,
  featured                BOOLEAN NOT NULL DEFAULT false,
  status                  TEXT NOT NULL DEFAULT 'draft',
  sort_order              INTEGER NOT NULL DEFAULT 0,
  duration_hours          INTEGER,
  seo_title               TEXT,
  seo_description         TEXT,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cms_programs_slug ON cms_programs(slug);
CREATE INDEX IF NOT EXISTS idx_cms_programs_status ON cms_programs(status);

-- ============================================================
-- 15. CMS — MODULES
-- ============================================================

CREATE TABLE IF NOT EXISTS cms_modules (
  id                          SERIAL PRIMARY KEY,
  program_id                  INTEGER NOT NULL,
  title                       TEXT NOT NULL,
  description                 TEXT,
  cover_image_url             TEXT,
  estimated_duration_minutes  INTEGER,
  sort_order                  INTEGER NOT NULL DEFAULT 0,
  is_active                   BOOLEAN NOT NULL DEFAULT true,
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cms_modules_program_id ON cms_modules(program_id);

-- ============================================================
-- 16. CMS — LESSONS
-- ============================================================

CREATE TABLE IF NOT EXISTS cms_lessons (
  id                      SERIAL PRIMARY KEY,
  module_id               INTEGER NOT NULL,
  title                   TEXT NOT NULL,
  subtitle                TEXT,
  description             TEXT,
  content_html            TEXT,
  youtube_url             TEXT,
  audio_url               TEXT,
  pdf_url                 TEXT,
  thumbnail_url           TEXT,
  external_resources_url  TEXT,
  homework                TEXT,
  reflection_questions    TEXT,
  notes                   TEXT,
  duration_minutes        INTEGER,
  reading_time_minutes    INTEGER,
  package_id              INTEGER,
  free_preview            BOOLEAN NOT NULL DEFAULT false,
  status                  TEXT NOT NULL DEFAULT 'draft',
  sort_order              INTEGER NOT NULL DEFAULT 0,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cms_lessons_module_id ON cms_lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_cms_lessons_status ON cms_lessons(status);

-- ============================================================
-- 17. USER LESSON PROGRESS
-- ============================================================

CREATE TABLE IF NOT EXISTS user_lesson_progress (
  id           SERIAL PRIMARY KEY,
  user_id      UUID NOT NULL,
  lesson_id    INTEGER NOT NULL,
  program_id   INTEGER NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_ulp_user_lesson ON user_lesson_progress(user_id, lesson_id);
CREATE INDEX IF NOT EXISTS idx_ulp_user_program ON user_lesson_progress(user_id, program_id);

-- ============================================================
-- 18. USER PROGRAM PROGRESS
-- ============================================================

CREATE TABLE IF NOT EXISTS user_program_progress (
  id                    SERIAL PRIMARY KEY,
  user_id               UUID NOT NULL,
  program_id            INTEGER NOT NULL,
  last_lesson_id        INTEGER,
  completed_lesson_count INTEGER NOT NULL DEFAULT 0,
  total_lesson_count    INTEGER NOT NULL DEFAULT 0,
  progress_pct          INTEGER NOT NULL DEFAULT 0,
  started_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at          TIMESTAMPTZ,
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_upp_user_program ON user_program_progress(user_id, program_id);

-- ============================================================
-- 19. CMS — ARTICLE CATEGORIES
-- ============================================================

CREATE TABLE IF NOT EXISTS cms_article_categories (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT true
);

-- ============================================================
-- 20. CMS — ARTICLES
-- ============================================================

CREATE TABLE IF NOT EXISTS cms_articles (
  id                    SERIAL PRIMARY KEY,
  title                 TEXT NOT NULL,
  subtitle              TEXT,
  slug                  TEXT NOT NULL UNIQUE,
  content_html          TEXT,
  excerpt               TEXT,
  cover_image_url       TEXT,
  author                TEXT DEFAULT 'Rzahan',
  reading_time_minutes  INTEGER,
  view_count            INTEGER NOT NULL DEFAULT 0,
  category_id           INTEGER,
  package_id            INTEGER,
  status                TEXT NOT NULL DEFAULT 'draft',
  is_featured           BOOLEAN NOT NULL DEFAULT false,
  is_pinned             BOOLEAN NOT NULL DEFAULT false,
  seo_title             TEXT,
  seo_description       TEXT,
  tags                  TEXT,
  scheduled_at          TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cms_articles_slug ON cms_articles(slug);
CREATE INDEX IF NOT EXISTS idx_cms_articles_status ON cms_articles(status);

-- ============================================================
-- 21. CMS — STORY CATEGORIES
-- ============================================================

CREATE TABLE IF NOT EXISTS cms_story_categories (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT true
);

-- ============================================================
-- 22. CMS — LIFE STORIES
-- ============================================================

CREATE TABLE IF NOT EXISTS cms_life_stories (
  id                    SERIAL PRIMARY KEY,
  title                 TEXT NOT NULL,
  slug                  TEXT UNIQUE,
  excerpt               TEXT,
  content_html          TEXT,
  image_url             TEXT,
  author                TEXT DEFAULT 'Rzahan',
  reading_time_minutes  INTEGER,
  view_count            INTEGER NOT NULL DEFAULT 0,
  tags                  TEXT,
  category_id           INTEGER,
  package_id            INTEGER,
  status                TEXT NOT NULL DEFAULT 'draft',
  is_featured           BOOLEAN NOT NULL DEFAULT false,
  is_pinned             BOOLEAN NOT NULL DEFAULT false,
  scheduled_at          TIMESTAMPTZ,
  sort_order            INTEGER NOT NULL DEFAULT 0,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cms_life_stories_status ON cms_life_stories(status);

-- ============================================================
-- 23. CMS — QUOTES (Günün Fikri)
-- ============================================================

CREATE TABLE IF NOT EXISTS cms_quotes (
  id          SERIAL PRIMARY KEY,
  text        TEXT NOT NULL,
  author      TEXT,
  source      TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 24. CMS — TASK DEFINITIONS (Günün Tapşırığı)
-- ============================================================

CREATE TABLE IF NOT EXISTS cms_task_definitions (
  id          SERIAL PRIMARY KEY,
  title       TEXT NOT NULL,
  description TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 25. CMS — FAQs
-- ============================================================

CREATE TABLE IF NOT EXISTS cms_faqs (
  id          SERIAL PRIMARY KEY,
  question    TEXT NOT NULL,
  answer      TEXT NOT NULL,
  category    TEXT,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 26. CMS — ANNOUNCEMENTS
-- ============================================================

CREATE TABLE IF NOT EXISTS cms_announcements (
  id               SERIAL PRIMARY KEY,
  title            TEXT NOT NULL,
  content          TEXT,
  banner_image_url TEXT,
  start_date       TIMESTAMPTZ,
  end_date         TIMESTAMPTZ,
  expires_at       TIMESTAMPTZ,
  priority         INTEGER NOT NULL DEFAULT 0,
  package_id       INTEGER,
  status           TEXT NOT NULL DEFAULT 'draft',
  is_active        BOOLEAN NOT NULL DEFAULT true,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 27. CMS — SLIDERS
-- ============================================================

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

-- ============================================================
-- 28. CMS — TESTIMONIALS
-- ============================================================

CREATE TABLE IF NOT EXISTS cms_testimonials (
  id           SERIAL PRIMARY KEY,
  author_name  TEXT NOT NULL,
  author_title TEXT,
  avatar_url   TEXT,
  content      TEXT NOT NULL,
  rating       INTEGER NOT NULL DEFAULT 5,
  stage_name   TEXT,
  is_active    BOOLEAN NOT NULL DEFAULT true,
  is_featured  BOOLEAN NOT NULL DEFAULT false,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 29. CMS — LANDING CONFIG
-- ============================================================

CREATE TABLE IF NOT EXISTS cms_landing_config (
  id           SERIAL PRIMARY KEY,
  config_json  TEXT NOT NULL DEFAULT '{}',
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 30. CMS — MEDIA
-- ============================================================

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

-- ============================================================
-- 31. XP RULES
-- ============================================================

CREATE TABLE IF NOT EXISTS xp_rules (
  id           SERIAL PRIMARY KEY,
  action_type  TEXT NOT NULL UNIQUE,
  label        TEXT NOT NULL,
  xp_amount    INTEGER NOT NULL DEFAULT 0,
  is_active    BOOLEAN NOT NULL DEFAULT true,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 32. XP EVENTS
-- ============================================================

CREATE TABLE IF NOT EXISTS xp_events (
  id           SERIAL PRIMARY KEY,
  user_id      TEXT NOT NULL,
  action_type  TEXT NOT NULL,
  xp_amount    INTEGER NOT NULL,
  ref_id       TEXT,
  note         TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_xp_events_user_id ON xp_events(user_id);
CREATE INDEX IF NOT EXISTS idx_xp_events_created_at ON xp_events(created_at DESC);

-- ============================================================
-- 33. LEVELS
-- ============================================================

CREATE TABLE IF NOT EXISTS levels (
  id           SERIAL PRIMARY KEY,
  name         TEXT NOT NULL,
  description  TEXT,
  required_xp  INTEGER NOT NULL DEFAULT 0,
  emoji        TEXT DEFAULT '⭐',
  color        TEXT DEFAULT '#6366f1',
  sort_order   INTEGER NOT NULL DEFAULT 0,
  is_active    BOOLEAN NOT NULL DEFAULT true
);

-- ============================================================
-- 34. ACHIEVEMENT DEFINITIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS achievement_definitions (
  id             SERIAL PRIMARY KEY,
  name           TEXT NOT NULL,
  description    TEXT,
  emoji          TEXT DEFAULT '🏆',
  color          TEXT DEFAULT '#f59e0b',
  xp_reward      INTEGER NOT NULL DEFAULT 0,
  trigger_type   TEXT NOT NULL,
  trigger_value  INTEGER NOT NULL DEFAULT 1,
  is_active      BOOLEAN NOT NULL DEFAULT true,
  sort_order     INTEGER NOT NULL DEFAULT 0
);

-- ============================================================
-- 35. USER ACHIEVEMENTS
-- ============================================================

CREATE TABLE IF NOT EXISTS user_achievements (
  id              SERIAL PRIMARY KEY,
  user_id         TEXT NOT NULL,
  achievement_id  INTEGER NOT NULL,
  unlocked_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_achievements_unique ON user_achievements(user_id, achievement_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);

-- ============================================================
-- 36. USER NOTIFICATIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS user_notifications (
  id          SERIAL PRIMARY KEY,
  user_id     TEXT NOT NULL,
  type        TEXT NOT NULL,
  title       TEXT NOT NULL,
  message     TEXT,
  is_read     BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_notifications_user_id ON user_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_is_read ON user_notifications(user_id, is_read);

-- ============================================================
-- SEED DATA — XP RULES (12 rules)
-- ============================================================

INSERT INTO xp_rules (action_type, label, xp_amount, is_active) VALUES
  ('lesson_complete',    'Dərs tamamlandı',            25,  true),
  ('program_complete',   'Proqram tamamlandı',          200, true),
  ('test_complete',      'Test tamamlandı',             50,  true),
  ('certificate_earned', 'Sertifikat qazanıldı',        100, true),
  ('task_complete',      'Tapşırıq tamamlandı',         10,  true),
  ('article_read',       'Məqalə oxundu',               5,   true),
  ('story_read',         'Hekayə oxundu',               5,   true),
  ('journal_entry',      'Gündəlik yazıldı',            10,  true),
  ('daily_login',        'Günlük giriş',                5,   true),
  ('streak_7',           '7 günlük ardıcıllıq',         50,  true),
  ('streak_30',          '30 günlük ardıcıllıq',        150, true),
  ('first_test',         'İlk test tamamlandı',         20,  true)
ON CONFLICT (action_type) DO NOTHING;

-- ============================================================
-- SEED DATA — LEVELS (5 levels)
-- ============================================================

INSERT INTO levels (name, description, required_xp, emoji, color, sort_order, is_active) VALUES
  ('Başlanğıc',    'İnkişaf yolunun başlanğıcı',         0,    '🌱', '#22c55e', 1, true),
  ('Araşdıran',    'Biliklərini genişləndirir',           100,  '🔍', '#3b82f6', 2, true),
  ('İnkişaf Edən', 'Sistemli öyrənmə mərhələsi',          500,  '📈', '#6366f1', 3, true),
  ('Şüurlu',       'Dərin şüur anlayışı qazandı',         1500, '💡', '#8b5cf6', 4, true),
  ('Yaradıcı',     'Transformasiya tamamlandı, irəlilir', 5000, '⭐', '#f59e0b', 5, true)
ON CONFLICT DO NOTHING;

-- ============================================================
-- SEED DATA — ACHIEVEMENT DEFINITIONS (10 achievements)
-- ============================================================

INSERT INTO achievement_definitions (name, description, emoji, color, xp_reward, trigger_type, trigger_value, is_active, sort_order) VALUES
  ('İlk Addım',          'İlk dərsini tamamladın',               '🌱', '#22c55e', 10,  'lesson_count',   1,  true, 1),
  ('Öyrənən',            '5 dərs tamamladın',                    '📚', '#3b82f6', 20,  'lesson_count',   5,  true, 2),
  ('Səylı Tələbə',       '10 dərs tamamladın',                   '🎒', '#6366f1', 30,  'lesson_count',   10, true, 3),
  ('Proqram Qalib',      'Birinci proqramı tamamladın',          '🏅', '#f59e0b', 50,  'program_count',  1,  true, 4),
  ('Test Pioneri',       'İlk testi tamamladın',                 '🧪', '#8b5cf6', 20,  'test_count',     1,  true, 5),
  ('Sertifikatlı',       'Sertifikat qazandın',                  '🎓', '#10b981', 50,  'cert_count',     1,  true, 6),
  ('Ardıcıl 7',          '7 gün ardıcıl giriş etdin',            '🔥', '#ef4444', 30,  'streak_days',    7,  true, 7),
  ('Ardıcıl 30',         '30 gün ardıcıl giriş etdin',           '💪', '#f97316', 100, 'streak_days',    30, true, 8),
  ('XP Milyonçusu',      '1000 XP topladın',                     '⚡', '#6366f1', 50,  'xp_milestone',   1000, true, 9),
  ('Məzmun Aşiqi',       '10 məqalə oxudun',                     '❤️', '#ec4899', 25,  'article_count',  10, true, 10)
ON CONFLICT DO NOTHING;

-- ============================================================
-- SEED DATA — DEFAULT SITE SETTINGS
-- ============================================================

INSERT INTO site_settings (key, value) VALUES
  ('dev_score_weights', '{"lessonMax":30,"programMax":20,"testMax":15,"certMax":15,"taskMax":10,"articleMax":5,"storyMax":3,"streakMax":2}'),
  ('whatsapp_url',      'https://wa.me/994XXXXXXXXX'),
  ('telegram_url',      'https://t.me/rzahanacademy'),
  ('tiktok_url',        'https://tiktok.com/@rzahan'),
  ('book_cover_path',   '/book-cover.webp')
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- SEED DATA — DEFAULT CMS LANDING CONFIG
-- ============================================================

INSERT INTO cms_landing_config (config_json) VALUES ('{}')
ON CONFLICT DO NOTHING;

-- ============================================================
-- SEED DATA — DEFAULT CMS PACKAGES (3 tiers)
-- ============================================================

INSERT INTO cms_packages (name, slug, emoji, description, monthly_price, yearly_price, is_recommended, required_level, btn_text, sort_order) VALUES
  ('Başlanğıc',  'baslanqic', '🌱', 'Platformaya pulsuz giriş. Əsas məzmunlara çıxış.',   NULL,   NULL,   false, 0, 'Pulsuz Başla',     1),
  ('İnkişaf',    'inkisaf',   '🚀', 'Bütün proqramlar, dərslər və məqalələrə tam giriş.', '29₼',  '290₼', true,  1, 'Ətraflı Məlumat',  2),
  ('Usta',       'usta',      '⭐', 'Hər şey daxil. VIP dəstək, özel sessiyalar.',         '79₼',  '790₼', false, 2, 'Ətraflı Məlumat',  3)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- SEED DATA — DEFAULT PROGRAM CATEGORIES
-- ============================================================

INSERT INTO cms_program_categories (name, slug, sort_order) VALUES
  ('Şüur İnkişafı',    'shuur-inkisafi',   1),
  ('Emosional İntellekt', 'emosional-intellekt', 2),
  ('Liderlik',         'liderlik',          3),
  ('Münasibətlər',     'munasibetler',      4)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- SEED DATA — DEFAULT ARTICLE CATEGORIES
-- ============================================================

INSERT INTO cms_article_categories (name, slug, sort_order) VALUES
  ('Şüur',        'shuur',        1),
  ('Psixologiya', 'psixologiya',  2),
  ('İnkişaf',     'inkisaf',      3),
  ('Motivasiya',  'motivasiya',   4)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- SEED DATA — DEFAULT STORY CATEGORIES
-- ============================================================

INSERT INTO cms_story_categories (name, slug, sort_order) VALUES
  ('Transformasiya', 'transformasiya', 1),
  ('Müvəffəqiyyət',  'muveffequyyet',  2),
  ('Ailə',           'aile',           3)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- SEED DATA — SAMPLE FAQs
-- ============================================================

INSERT INTO cms_faqs (question, answer, sort_order, is_active) VALUES
  ('Rzahan Academy nədir?',
   'Rzahan Academy, İnsan Bilinç Mexanizmi kitabına əsaslanan Azərbaycanın ilk şüur inkişafı platformasıdır. 7 mərhələli test, proqramlar, dərslər, gündəlik tapşırıqlar və sertifikatlarla şüurunuzu sistemli inkişaf etdirin.',
   1, true),
  ('Testə başlamaq üçün nə etməliyəm?',
   'Sağ üst küncdəki "Testə Başla" düyməsinə klikləyin. Qeydiyyat lazım deyil — ilk testi anonim keçə bilərsiniz. Nəticəni saxlamaq üçün hesab yaradın.',
   2, true),
  ('Sertifikat alıram?',
   'Bəli. Hər mərhələni uğurla tamamladıqda rəqəmsal sertifikat verilir. Sertifikat PDF formatda yüklənə bilər.',
   3, true),
  ('Ödənişsiz plan var?',
   'Bəli. Başlanğıc paketi tamamilə ödənişsizdir. Əsas testlər, seçilmiş dərslər və məqalələr ücretsiz əldə edilə bilər.',
   4, true),
  ('Mobil tətbiqdən istifadə edə bilərəm?',
   'Platforma tam mobil uyğundur. Brauzerdən istənilən cihazda istifadə edə bilərsiniz.',
   5, true)
ON CONFLICT DO NOTHING;

-- ============================================================
-- SEED DATA — SAMPLE QUOTES (Günün Fikri)
-- ============================================================

INSERT INTO cms_quotes (text, author, is_active, sort_order) VALUES
  ('Özünü tanımaq — bütün müdrikliyinin başlanğıcıdır.',                               'Sokrat',        true, 1),
  ('İnsan dəyişə bilər, əgər dəyişmək istəyirsə.',                                    'Rzahan',        true, 2),
  ('Şüur — həyatın sükanıdır. Onu idarə etməyi öyrən.',                               'Rzahan',        true, 3),
  ('Hər gün kiçik addım at. Böyük dəyişikliklər kiçik addımlardan başlayır.',          'Rzahan',        true, 4),
  ('Düşüncələrin dünyanı formalaşdırır. Düşüncələrini formalaşdır.',                   'Rzahan',        true, 5)
ON CONFLICT DO NOTHING;

-- ============================================================
-- SEED DATA — SAMPLE TASK DEFINITIONS (Günün Tapşırığı)
-- ============================================================

INSERT INTO cms_task_definitions (title, description, is_active, sort_order) VALUES
  ('Günlük Meditasiya',          '10 dəqiqə səssiz oturun, nəfəsinizə diqqət yetirin.',                       true, 1),
  ('Minnətdarlıq Siyahısı',      'Bu gün minnətdar olduğunuz 3 şeyi yazın.',                                  true, 2),
  ('Bir Yaxşılıq Et',            'Gün ərzində başqasına gözlənilmədən yaxşılıq edin.',                        true, 3),
  ('Kitab Oxu',                  'Şəxsi inkişaf kitabından ən az 10 səhifə oxuyun.',                          true, 4),
  ('Hərəkət Et',                 '30 dəqiqə gəzinti, idman və ya hər hansı fiziki fəaliyyət.',                true, 5),
  ('Gündəlik Yaz',               'Bu gün baş verən bir hadisəni hissləriniziə birlikdə gündəliyə yazın.',     true, 6)
ON CONFLICT DO NOTHING;

-- ============================================================
-- NOTE: The admin user is created automatically on first API
-- server boot. Set ADMIN_USERNAME and ADMIN_PASSWORD env vars,
-- or the server defaults to username=Rzahan with a preset hash.
-- ============================================================

-- ============================================================
-- END OF Rzahan Academy v1.0 Production SQL
-- ============================================================
