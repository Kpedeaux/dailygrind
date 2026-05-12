/* ==========================================================================
 * storage.js — localStorage wrappers + per-player stats
 *
 * All keys namespaced under `dailygrind.`. Streak math runs entirely
 * client-side; the D1 backend aggregates global stats but doesn't track
 * any individual player.
 * ========================================================================== */

const NS = 'dailygrind.';

function safe(fn, fallback) {
  try { return fn(); } catch { return fallback; }
}

export function load(key, fallback = null) {
  return safe(() => {
    const raw = localStorage.getItem(NS + key);
    return raw == null ? fallback : JSON.parse(raw);
  }, fallback);
}

export function save(key, value) {
  return safe(() => {
    localStorage.setItem(NS + key, JSON.stringify(value));
    return true;
  }, false);
}

export function remove(key) {
  return safe(() => { localStorage.removeItem(NS + key); return true; }, false);
}

/* ----- Per-day game state -----
 * Saved every time the player adds a letter or submits a guess, so if
 * they refresh / close / come back later, today's progress is intact.
 *
 * Shape:
 *   { day: 42, guesses: ['BEANS', 'ROAST'], finished: 'win'|'lose'|null }
 */
export const GAME_KEY = day => `game.${day}`;

export function loadGame(day) {
  return load(GAME_KEY(day), { day, guesses: [], finished: null });
}

export function saveGame(state) {
  return save(GAME_KEY(state.day), state);
}

/* ----- Aggregate stats (per-player) ----- */
export const STATS_KEY = 'stats';

const DEFAULT_STATS = {
  played:        0,           // total games played
  wins:          0,           // total wins
  currentStreak: 0,           // current win streak (consecutive days)
  maxStreak:     0,           // best-ever streak
  lastWonDay:    null,        // day index of the most recent win
  lastPlayedDay: null,        // day index of the most recent game played
  distribution:  [0, 0, 0, 0, 0, 0], // wins by guess count (1–6)
};

export function getStats() {
  const raw = load(STATS_KEY, null);
  return raw ? { ...DEFAULT_STATS, ...raw } : { ...DEFAULT_STATS };
}

/** Record the outcome of today's puzzle. `guessCount` is 1–6 on a win,
 *  or null on a loss. */
export function recordResult(day, won, guessCount) {
  const stats = getStats();
  // Guard against double-counting if the user replays the same day.
  if (stats.lastPlayedDay === day) return stats;

  stats.played += 1;
  stats.lastPlayedDay = day;

  if (won) {
    stats.wins += 1;
    if (guessCount >= 1 && guessCount <= 6) {
      stats.distribution[guessCount - 1] += 1;
    }
    // Streak: consecutive ONLY if the last win was yesterday's puzzle.
    if (stats.lastWonDay === day - 1) {
      stats.currentStreak += 1;
    } else {
      stats.currentStreak = 1;
    }
    stats.lastWonDay = day;
    if (stats.currentStreak > stats.maxStreak) {
      stats.maxStreak = stats.currentStreak;
    }
  } else {
    // A loss breaks the streak immediately.
    stats.currentStreak = 0;
  }
  save(STATS_KEY, stats);
  return stats;
}

/* ----- Settings ----- */
export const SETTINGS_KEY = 'settings';
const DEFAULT_SETTINGS = { hardMode: false };

export function getSettings() {
  return { ...DEFAULT_SETTINGS, ...load(SETTINGS_KEY, {}) };
}
export function setSettings(patch) {
  const next = { ...getSettings(), ...patch };
  save(SETTINGS_KEY, next);
  return next;
}

/* ----- First-visit flag (for the how-to-play overlay) ----- */
export const HAS_PLAYED_KEY = 'hasPlayed';
export function getHasPlayed() { return !!load(HAS_PLAYED_KEY, false); }
export function setHasPlayed() { save(HAS_PLAYED_KEY, true); }
