/* ==========================================================================
 * sync.js — Server-backed streak protection
 *
 * The streak's enemy is localStorage eviction: iOS Safari purges a
 * site's script-writable storage after ~7 days of Safari use without a
 * visit, and "Clear History" / private mode kill it instantly. So we
 * keep a backup copy of the player's stats in D1, keyed by an anonymous
 * id that lives in an HTTP-set, HttpOnly cookie — which SURVIVES
 * Safari's script-storage purge precisely because no script wrote it.
 *
 * Boot:   GET /api/player → merge server copy into local → save → push
 *         the merged copy back up.
 * Finish: POST the fresh stats after every recorded result.
 *
 * Everything is best-effort. If D1 isn't bound, the network is down, or
 * cookies are blocked, every call no-ops and the game behaves exactly
 * as it did before this file existed.
 *
 * Privacy: the id is a random UUID, set first-party, never joined with
 * anything. No name, no email, no fingerprinting. It exists so a coffee
 * shop word game doesn't eat someone's 40-day streak.
 * ========================================================================== */

import { getStats, save, STATS_KEY } from './storage.js';

const ENDPOINT = '/api/player';

function num(v, fallback = 0) {
  return Number.isFinite(v) ? v : fallback;
}

/** Merge two stats objects without ever making the player worse off.
 *
 *  Counters (played / wins / maxStreak / distribution) take the max of
 *  each side — exact reconciliation is impossible without a per-day
 *  log, and max never understates a player's record.
 *
 *  The streak trio (currentStreak / lastWonDay / lastPlayedDay) must
 *  stay internally consistent, so it's taken as a unit from whichever
 *  side played most recently. Ties go to local (it has this session's
 *  data). Exported for unit tests. */
export function mergeStats(local, server) {
  if (!server || typeof server !== 'object') return local;

  const localDay = num(local.lastPlayedDay, -1);
  const serverDay = num(server.lastPlayedDay, -1);
  const fresher = serverDay > localDay ? server : local;

  const distribution = Array.from({ length: 6 }, (_, i) => Math.max(
    num(local.distribution && local.distribution[i]),
    num(server.distribution && server.distribution[i]),
  ));

  return {
    played:        Math.max(num(local.played), num(server.played)),
    wins:          Math.max(num(local.wins), num(server.wins)),
    currentStreak: num(fresher.currentStreak),
    maxStreak:     Math.max(num(local.maxStreak), num(server.maxStreak), num(fresher.currentStreak)),
    lastWonDay:    Number.isFinite(fresher.lastWonDay) ? fresher.lastWonDay : null,
    lastPlayedDay: Number.isFinite(fresher.lastPlayedDay) ? fresher.lastPlayedDay : null,
    distribution,
  };
}

/** Pull the server copy, merge it into local stats, persist, and push
 *  the merged result back. Resolves with the merged stats, or null if
 *  the backup isn't reachable (offline, D1 unbound, cookies blocked). */
export async function syncStatsWithServer() {
  let serverStats = null;
  try {
    const res = await fetch(ENDPOINT, { method: 'GET' });
    if (!res.ok) return null;
    const data = await res.json();
    serverStats = data && data.stats ? data.stats : null;
  } catch {
    return null;
  }

  // Read local AFTER the network round-trip so we merge against the
  // newest local state (the player may have finished a game meanwhile).
  const local = getStats();
  const merged = mergeStats(local, serverStats);
  save(STATS_KEY, merged);
  pushStatsToServer(merged);
  return merged;
}

/** Best-effort POST of the player's stats. Fire and forget. */
export function pushStatsToServer(stats) {
  try {
    fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stats: stats || getStats() }),
      keepalive: true,
    }).catch(() => {});
  } catch { /* ignore */ }
}
