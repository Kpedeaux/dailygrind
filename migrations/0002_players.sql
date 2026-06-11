-- ============================================================================
-- 0002_players.sql — Server-backed streak protection
--
-- Adds the `players` table used by /api/player to back up each player's
-- local stats (streaks above all), keyed by an anonymous cookie id.
--
-- Apply once, from the project root:
--   npx wrangler d1 execute dailygrind --remote --file=migrations/0002_players.sql
--
-- (0001 was schema.sql, applied at initial D1 setup.)
-- ============================================================================

CREATE TABLE IF NOT EXISTS players (
  pid         TEXT PRIMARY KEY,            -- anonymous UUID from the dg_pid cookie
  stats_json  TEXT NOT NULL,               -- validated stats blob (see functions/api/player.js)
  updated_at  TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
