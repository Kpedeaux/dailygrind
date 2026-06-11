/* ==========================================================================
 * /api/player — Server-backed streak protection (Cloudflare Pages Function)
 *
 * Why this exists: the streak lives in localStorage, and localStorage is
 * mortal — iOS Safari purges script-writable storage after ~7 days of
 * Safari use without visiting the site, and "Clear History" kills it
 * instantly. This endpoint keeps a backup copy of each player's stats
 * in D1, keyed by an anonymous random id stored in an HTTP-set,
 * HttpOnly cookie. Because the cookie is set by the server (not by
 * script), Safari's ITP does NOT cap its lifetime — it survives the
 * purge that wipes localStorage, so the game can silently restore the
 * player's streak.
 *
 * GET  /api/player → { stats: {...} | null }
 *                    Sets/refreshes the dg_pid cookie.
 * POST /api/player → { ok: true }
 *                    Body: { stats: {...} }. Validated, merged with the
 *                    stored copy (never downgrades a player), upserted.
 *
 * Privacy: dg_pid is a random UUID. No name, no email, no IP stored
 * here, nothing joinable. It exists so a word game doesn't eat a
 * 40-day streak.
 *
 * D1 binding: env.DB (same binding as /api/stats). Requires the
 * `players` table — apply migrations/0002_players.sql once:
 *   npx wrangler d1 execute dailygrind --remote --file=migrations/0002_players.sql
 * Until then this endpoint returns 503 and the client no-ops.
 * ========================================================================== */

const COOKIE_NAME = 'dg_pid';
const COOKIE_MAX_AGE = 400 * 24 * 60 * 60;  // 400 days — Chrome's hard cap
const MAX_COUNTER = 100000;                 // sanity bound on any stat
const MAX_DAY = 365 * 5;
const MAX_BODY_BYTES = 4096;

function json(body, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      ...extraHeaders,
    },
  });
}

function parseCookies(header) {
  const out = {};
  if (!header) return out;
  for (const part of header.split(';')) {
    const eq = part.indexOf('=');
    if (eq === -1) continue;
    out[part.slice(0, eq).trim()] = part.slice(eq + 1).trim();
  }
  return out;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Read the player id from the cookie, or mint a new one. Returns
 *  { pid, setCookie } — setCookie is always sent to refresh expiry. */
function resolvePid(request) {
  const cookies = parseCookies(request.headers.get('Cookie'));
  let pid = cookies[COOKIE_NAME];
  if (!pid || !UUID_RE.test(pid)) pid = crypto.randomUUID();
  const setCookie =
    `${COOKIE_NAME}=${pid}; Max-Age=${COOKIE_MAX_AGE}; Path=/; Secure; HttpOnly; SameSite=Lax`;
  return { pid, setCookie };
}

function boundedInt(v, max = MAX_COUNTER) {
  const n = typeof v === 'number' ? Math.floor(v) : NaN;
  if (!Number.isFinite(n) || n < 0 || n > max) return 0;
  return n;
}

/** Whitelist + bound every field. Never store a raw client blob. */
function cleanStats(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const dist = Array.isArray(raw.distribution) ? raw.distribution : [];
  const dayOrNull = v => {
    const n = typeof v === 'number' ? Math.floor(v) : NaN;
    return Number.isFinite(n) && n >= 0 && n <= MAX_DAY ? n : null;
  };
  return {
    played:        boundedInt(raw.played),
    wins:          boundedInt(raw.wins),
    currentStreak: boundedInt(raw.currentStreak, 10000),
    maxStreak:     boundedInt(raw.maxStreak, 10000),
    lastWonDay:    dayOrNull(raw.lastWonDay),
    lastPlayedDay: dayOrNull(raw.lastPlayedDay),
    distribution:  Array.from({ length: 6 }, (_, i) => boundedInt(dist[i])),
  };
}

/** Same merge rules as js/sync.js (duplicated on purpose — the Pages
 *  Functions bundle is built separately from the client modules).
 *  Guarantees a wiped client posting zeros can never erase a backup. */
function mergeStats(stored, incoming) {
  if (!stored) return incoming;
  if (!incoming) return stored;
  const storedDay = stored.lastPlayedDay ?? -1;
  const incomingDay = incoming.lastPlayedDay ?? -1;
  const fresher = incomingDay >= storedDay ? incoming : stored;
  return {
    played:        Math.max(stored.played, incoming.played),
    wins:          Math.max(stored.wins, incoming.wins),
    currentStreak: fresher.currentStreak,
    maxStreak:     Math.max(stored.maxStreak, incoming.maxStreak, fresher.currentStreak),
    lastWonDay:    fresher.lastWonDay,
    lastPlayedDay: fresher.lastPlayedDay,
    distribution:  Array.from({ length: 6 }, (_, i) =>
      Math.max(stored.distribution[i] || 0, incoming.distribution[i] || 0)),
  };
}

async function readStored(env, pid) {
  const row = await env.DB
    .prepare(`SELECT stats_json FROM players WHERE pid = ?`)
    .bind(pid)
    .first();
  if (!row || !row.stats_json) return null;
  try { return cleanStats(JSON.parse(row.stats_json)); } catch { return null; }
}

export async function onRequestGet({ request, env }) {
  if (!env.DB) return json({ error: 'D1 not bound' }, 503);
  const { pid, setCookie } = resolvePid(request);
  try {
    const stats = await readStored(env, pid);
    return json({ stats }, 200, { 'Set-Cookie': setCookie });
  } catch (err) {
    // Most likely the players table doesn't exist yet (migration not
    // applied). Tell the client "no backup available" and move on.
    return json({ stats: null, error: String(err && err.message || err) }, 503,
      { 'Set-Cookie': setCookie });
  }
}

export async function onRequestPost({ request, env }) {
  if (!env.DB) return json({ error: 'D1 not bound' }, 503);

  // Bound the body size before parsing
  const text = await request.text();
  if (text.length > MAX_BODY_BYTES) return json({ error: 'Body too large' }, 413);
  let body;
  try { body = JSON.parse(text); } catch { return json({ error: 'Bad JSON' }, 400); }

  const incoming = cleanStats(body && body.stats);
  if (!incoming) return json({ error: 'Invalid stats' }, 400);

  const { pid, setCookie } = resolvePid(request);
  try {
    const stored = await readStored(env, pid);
    const merged = mergeStats(stored, incoming);
    await env.DB
      .prepare(`INSERT INTO players (pid, stats_json, updated_at)
                VALUES (?, ?, CURRENT_TIMESTAMP)
                ON CONFLICT(pid) DO UPDATE SET
                  stats_json = excluded.stats_json,
                  updated_at = CURRENT_TIMESTAMP`)
      .bind(pid, JSON.stringify(merged))
      .run();
    return json({ ok: true }, 200, { 'Set-Cookie': setCookie });
  } catch (err) {
    return json({ error: String(err && err.message || err) }, 503,
      { 'Set-Cookie': setCookie });
  }
}
