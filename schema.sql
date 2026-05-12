-- ============================================================================
-- daily-grind — D1 schema for aggregate per-day stats
--
-- Apply this once after creating the D1 database. From the project root:
--   npx wrangler d1 execute dailygrind --remote --file=schema.sql
--
-- The binding name in the Pages project must be DB (env.DB) — match that
-- in Workers & Pages → dailygrind → Settings → Bindings.
-- ============================================================================

CREATE TABLE IF NOT EXISTS day_stats (
  day             INTEGER PRIMARY KEY,
  plays           INTEGER NOT NULL DEFAULT 0,
  wins            INTEGER NOT NULL DEFAULT 0,
  dist_1          INTEGER NOT NULL DEFAULT 0,
  dist_2          INTEGER NOT NULL DEFAULT 0,
  dist_3          INTEGER NOT NULL DEFAULT 0,
  dist_4          INTEGER NOT NULL DEFAULT 0,
  dist_5          INTEGER NOT NULL DEFAULT 0,
  dist_6          INTEGER NOT NULL DEFAULT 0,
  updated_at      TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- We additionally log each play with a hashed IP so we can detect and
-- soft-rate-limit obvious abuse. We never store the raw IP.
CREATE TABLE IF NOT EXISTS day_plays (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  day             INTEGER NOT NULL,
  won             INTEGER NOT NULL,
  guesses         INTEGER,
  hard_mode       INTEGER NOT NULL DEFAULT 0,
  ip_hash         TEXT,
  created_at      TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_day_plays_day_ip
  ON day_plays(day, ip_hash);
