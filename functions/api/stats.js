/* ==========================================================================
 * /api/stats — Cloudflare Pages Function backed by D1
 *
 * GET  /api/stats?day=N  → aggregate stats for the requested day
 *                          (defaults to overall lifetime if day omitted)
 *                          Response: { today: { plays, wins, distribution[6] } }
 *
 * POST /api/stats        → submit one play's outcome. Idempotent per
 *                          (day, ip_hash) — a single device only counts
 *                          once per day.
 *
 * D1 binding: env.DB. Variable name DB. Set in Workers & Pages →
 * dailygrind → Settings → Bindings.
 * ========================================================================== */

const MAX_PLAYS_PER_IP_PER_DAY = 1;
const MAX_DAY_AGE = 365 * 5;  // sanity check on day index

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}

async function sha256Hex(text) {
  const enc = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest('SHA-256', enc);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

function distributionFromRow(row) {
  if (!row) return [0, 0, 0, 0, 0, 0];
  return [
    row.dist_1 || 0, row.dist_2 || 0, row.dist_3 || 0,
    row.dist_4 || 0, row.dist_5 || 0, row.dist_6 || 0,
  ];
}

export async function onRequestGet({ request, env }) {
  if (!env.DB) {
    return json({ today: { plays: 0, wins: 0, distribution: [0,0,0,0,0,0] }, error: 'D1 not bound' }, 503);
  }
  const url = new URL(request.url);
  const dayParam = url.searchParams.get('day');
  const day = dayParam == null ? null : parseInt(dayParam, 10);

  try {
    if (day == null || !Number.isFinite(day)) {
      return json({ today: { plays: 0, wins: 0, distribution: [0,0,0,0,0,0] } });
    }
    const row = await env.DB
      .prepare(`SELECT plays, wins, dist_1, dist_2, dist_3, dist_4, dist_5, dist_6
                  FROM day_stats WHERE day = ?`)
      .bind(day)
      .first();
    return json({
      today: {
        plays: row ? row.plays : 0,
        wins: row ? row.wins : 0,
        distribution: distributionFromRow(row),
      },
    });
  } catch (err) {
    return json({ today: { plays: 0, wins: 0, distribution: [0,0,0,0,0,0] }, error: String(err) }, 500);
  }
}

export async function onRequestPost({ request, env }) {
  if (!env.DB) return json({ error: 'D1 not bound' }, 503);

  let body;
  try { body = await request.json(); } catch { return json({ error: 'Bad JSON' }, 400); }

  // ----- validate -----
  const day = parseInt(body.day, 10);
  if (!Number.isFinite(day) || day < 0 || day > MAX_DAY_AGE) {
    return json({ error: 'Invalid day' }, 400);
  }
  const won = !!body.won;
  const hardMode = !!body.hardMode;
  let guesses = parseInt(body.guesses, 10);
  if (won) {
    if (!Number.isFinite(guesses) || guesses < 1 || guesses > 6) {
      return json({ error: 'Invalid guesses' }, 400);
    }
  } else {
    guesses = null;
  }

  // ----- hash IP for soft dedup -----
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const ipHash = await sha256Hex('dailygrind-salt-' + ip + '-' + day);

  // ----- soft rate limit: one play per (day, ip_hash) -----
  try {
    const existing = await env.DB
      .prepare(`SELECT COUNT(*) AS n FROM day_plays WHERE day = ? AND ip_hash = ?`)
      .bind(day, ipHash)
      .first();
    if (existing && existing.n >= MAX_PLAYS_PER_IP_PER_DAY) {
      return json({ ok: true, deduped: true });
    }
  } catch { /* fall through and try to insert */ }

  // ----- record the individual play -----
  try {
    await env.DB
      .prepare(`INSERT INTO day_plays (day, won, guesses, hard_mode, ip_hash)
                VALUES (?, ?, ?, ?, ?)`)
      .bind(day, won ? 1 : 0, guesses, hardMode ? 1 : 0, ipHash)
      .run();
  } catch (err) {
    return json({ error: 'Insert failed: ' + err.message }, 500);
  }

  // ----- update the aggregate row -----
  try {
    // Upsert: SQLite ON CONFLICT requires the PK constraint to be set
    const distCol = won && guesses >= 1 && guesses <= 6 ? `dist_${guesses}` : null;
    const sql = `
      INSERT INTO day_stats (day, plays, wins,
                             dist_1, dist_2, dist_3, dist_4, dist_5, dist_6,
                             updated_at)
        VALUES (?, 1, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(day) DO UPDATE SET
        plays = plays + 1,
        wins = wins + ?,
        dist_1 = dist_1 + ?,
        dist_2 = dist_2 + ?,
        dist_3 = dist_3 + ?,
        dist_4 = dist_4 + ?,
        dist_5 = dist_5 + ?,
        dist_6 = dist_6 + ?,
        updated_at = CURRENT_TIMESTAMP
    `;
    const isDist = i => (distCol === `dist_${i}` ? 1 : 0);
    await env.DB
      .prepare(sql)
      .bind(
        day, won ? 1 : 0,
        isDist(1), isDist(2), isDist(3), isDist(4), isDist(5), isDist(6),
        // ON CONFLICT params
        won ? 1 : 0,
        isDist(1), isDist(2), isDist(3), isDist(4), isDist(5), isDist(6),
      )
      .run();
  } catch (err) {
    return json({ error: 'Aggregate update failed: ' + err.message }, 500);
  }

  return json({ ok: true });
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
