# The Daily Grind

A coffee + New Orleans themed daily word puzzle from
[CR Coffee Shop](https://crcoffeenola.com). One five-letter word, six guesses,
fresh puzzle every day at midnight Central time. Streaks, shareable emoji
results, global solve stats backed by Cloudflare Pages Functions + D1.

Lives at https://dailygrind.crcoffeenola.com.

## One-time backend setup (D1)

The aggregate-stats endpoint reads/writes a Cloudflare D1 SQLite database
via `/functions/api/stats.js`. Until D1 is wired up, the endpoint returns
503 and the game falls back to per-device-only stats.

**1. Create the D1 database**

```bash
npx wrangler d1 create dailygrind
```

Copy the `database_id` from the output.

**2. Apply the schema**

```bash
npx wrangler d1 execute dailygrind --remote --file=schema.sql
```

**3. Bind the database in the Cloudflare Pages project**

Workers & Pages → `dailygrind` → Settings → Bindings → Add binding:

- Type: D1 database
- Variable name: `DB`
- D1 database: `dailygrind`

Save, then redeploy (push any commit) so the binding takes effect.

**4. Verify**

Hit `https://dailygrind.crcoffeenola.com/api/stats` — you should see
`{"today":{"plays":0,"wins":0,"distribution":[0,0,0,0,0,0]}}` (200 OK).

## Streak protection (one-time migration)

Streaks used to live only in localStorage, which iOS Safari purges after
~7 days without a visit (and "Clear History" kills instantly). Three
layers now protect them:

1. **Day-rollover detection** — the app re-checks the puzzle day on
   focus/visibility/every minute, so a tab left open overnight can no
   longer record a win under yesterday's puzzle number (the bug that ate
   streaks for players who never closed the tab).
2. **`navigator.storage.persist()`** — Chrome/Firefox exempt our storage
   from eviction.
3. **Server-side backup** — `/api/player` keeps a copy of each player's
   stats in D1, keyed by an anonymous UUID in a server-set HttpOnly
   cookie. HTTP-set cookies survive Safari's script-storage purge, so
   the game silently restores streaks after localStorage is wiped.
   No name/email/IP — just a random id and a stats blob.

Apply the migration once (same pattern as the original schema):

```bash
npx wrangler d1 execute dailygrind --remote --file=migrations/0002_players.sql
```

Until the table exists, `/api/player` returns 503 and the game behaves
exactly as before (local-only stats). Verify after deploy:
`https://dailygrind.crcoffeenola.com/api/player` should return
`{"stats":null}` (200) on a fresh device.

Known limit: clearing **cookies** AND site data nukes both copies — only
real accounts would survive that, which is overkill for a word game.

## Sharing

The stats overlay now has a full share kit aimed at spreading the game
(and CR's name) on social:

- **Share Result** — native share sheet on mobile, clipboard on desktop.
- **Share Image** — a 1080×1080 CR-branded result card (canvas-drawn:
  cream ground, Million Dollar Red rules, the player's tile grid, streak,
  game URL) handed to the share sheet as a PNG. This is the only viable
  path onto **Instagram**, which has no web share intent. Desktop falls
  back to downloading the PNG.
- **One-tap platform chips** — X and Threads (pre-filled post via their
  official web intents), Facebook (sharer; FB forbids pre-filled text, so
  the grid is auto-copied for pasting), WhatsApp (`wa.me`), and SMS.
- Share text now includes a `🔥 N-day streak` line at 2+ — streaks are
  the most shareable flex there is.

Every share method fires a distinct GA4 `puzzle_share` event (`method`
param: native / clipboard / image_native / image_download / x / facebook /
threads / whatsapp / sms), so you can see which channels actually spread.

## Quick start (local)

```bash
python3 -m http.server 8080
```

Open http://localhost:8080.

## Deploy

Same pattern as Becaffeined:

1. Push this folder to a new GitHub repo (`Kpedeaux/daily-grind`).
2. Cloudflare dashboard → Workers & Pages → Create application → Pages →
   Connect to Git → pick the repo. Branch `main`, no build command, output `/`.
3. Custom domain: `dailygrind.crcoffeenola.com`.

Every push to `main` auto-deploys.

## Architecture

```
daily-grind/
├── index.html              Single-page entry.
├── manifest.webmanifest    PWA install metadata.
├── _headers                Cloudflare cache rules.
├── /css
│   ├── tokens.css          CR brand tokens.
│   └── game.css            Board, keyboard, overlay styles.
├── /js
│   ├── main.js             App entry. Wires everything together.
│   ├── game.js             Guess evaluation (pure, no DOM).
│   ├── words.js            Daily-word selection + word lists.
│   ├── render.js           DOM rendering for board + keyboard.
│   ├── input.js            Physical + on-screen keyboard input.
│   ├── share.js            Spoiler-free emoji grid + platform share URLs.
│   ├── sharecard.js        Canvas-drawn branded result image (the IG path).
│   ├── storage.js          localStorage wrappers + stats.
│   ├── sync.js             Server-backed streak protection client.
│   └── analytics.js        GA4 event helpers.
├── /assets
│   └── /img                CR logos.
├── /functions
│   └── /api
│       ├── stats.js        D1-backed aggregate stats endpoint.
│       └── player.js       D1-backed per-player streak backup.
├── /migrations
│   └── 0002_players.sql    One-time D1 migration for streak backup.
└── schema.sql              D1 table definitions (full, for fresh installs).
```

### Why no build step

Same reason as Becaffeined. The game ships as the files you see — ES
modules, no transpiler, no bundler. Cloudflare Pages serves the repo
directly.

### Where the daily word comes from

`js/words.js` exports a curated answer list (~120 words mixing coffee
terms, NOLA culture, and common English for solvability). Today's word
is picked deterministically: `ANSWERS[daysSinceLaunch % ANSWERS.length]`,
where the day index is computed in America/Chicago time. Every player
worldwide gets the same word on the same day.

The valid-guesses list is broader: ~900 common English five-letter words
plus the answer list, so most reasonable guesses are accepted without a
"not in word list" rejection.

### Anti-cheat

Minimal. The word list ships client-side and a determined player can view
source. This is intentional — same tradeoff NYT Wordle made — because the
alternative is a server round-trip on every guess. Cheaters cheat
themselves; the game is for fun.

## License

All code © CR Coffee Shop / Kevin Pedeaux.
