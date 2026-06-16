/* ==========================================================================
 * words.js — Daily-word selection + curated word lists
 *
 * ANSWERS is the pool of possible solutions. One is picked per day,
 * deterministically by the date index. Every player in the world gets
 * the same word on the same day.
 *
 * VALID_WORDS is the union of VALID_GUESSES (the comprehensive guess
 * dictionary in valid-guesses.js) and ANSWERS, so every daily solution is
 * always an acceptable guess and the "not in word list" rejection — the
 * single most frustrating UX failure in Wordle clones — is minimized.
 * Guess acceptance and answer selection are deliberately separate concerns.
 *
 * The launch date is the day-zero anchor: ANSWERS[0] is what plays on
 * LAUNCH_DATE in America/Chicago time. Day N = ANSWERS[N % ANSWERS.length].
 * ========================================================================== */

import { VALID_GUESSES } from './valid-guesses.js';

// First day of the game. ANSWERS[0] plays on this date (Chicago time).
export const LAUNCH_DATE = '2026-05-12';

/* --------------------------------------------------------------------------
 * ANSWERS — daily solutions
 *
 * Curated mix:
 *   - ~40% coffee, drinks, brewing vocabulary
 *   - ~25% New Orleans / Louisiana culture
 *   - ~35% common English (so the puzzle is actually beatable)
 *
 * All words are five letters, all real, all in standard dictionaries.
 * Keep entries unique and uppercase.
 * -------------------------------------------------------------------------- */
// Themes are interleaved (coffee → NOLA → general → coffee → ...) so a
// player who plays every day can't lean on the theme to narrow guesses.
// Day 0 is BAYOU on purpose: it hints at the New Orleans angle without
// being a giveaway, and the unusual letter pattern is a good first puzzle.
// GRIND is reserved for ~day 30 as a "of course, the daily grind" wink.
export const ANSWERS = [
  // Day 0 — the launch puzzle
  'BAYOU',

  // ----- Days 1–60 (mixed themes, every third or so is a coffee word) -----
  'HEART', 'ROAST', 'NIGHT', 'BEANS', 'PORCH', 'STORM', 'BLEND', 'MUSIC',
  'GUMBO', 'COAST', 'MOCHA', 'EARTH', 'LEVEE', 'CREAM', 'DREAM', 'JAZZY',
  'BREWS', 'PEARL', 'FRESH', 'LIGHT', 'BLUES', 'STEAM', 'RIVER', 'CRACK',
  'SHORE', 'FLOAT', 'PRESS', 'BRAVE', 'BEADS', 'TOAST', 'CLOUD', 'BRASS',
  'GRIND',  // ~day 30 — the wink
  'SMOKE', 'SAINT', 'WORLD', 'CRUMB', 'TRACE', 'BERRY', 'GRACE', 'CREMA',
  'BLOOM', 'FROTH', 'SHADE', 'PEACE', 'DRUMS', 'AROMA', 'HOUSE', 'CACAO',
  'NOBLE', 'LATTE', 'HAPPY', 'DECAF', 'FRAME', 'MASKS', 'SHARP', 'BANJO',
  'SUGAR', 'PRIDE',

  // ----- Days 61–120 -----
  'POURS', 'SOUND', 'CIDER', 'EIGHT', 'FOAMY', 'SHELL', 'BREAD', 'PIANO',
  'SHINE', 'WHEAT', 'TRUST', 'HONEY', 'OCEAN', 'COCOA', 'CRAFT', 'JUICE',
  'NORTH', 'WHISK', 'PROUD', 'SPICE', 'SOUTH', 'TASTE', 'EARLY', 'GLASS',
  'TEACH', 'MELON', 'BEACH', 'GRAPE', 'CHIEF', 'PEACH', 'CLEAR', 'SCONE',
  'SWEET', 'FLOOD', 'POWER', 'PEARS', 'PLACE', 'STAGE', 'QUIET', 'YEAST',
  'TIGHT', 'APPLE', 'TODAY', 'PASTE', 'LEMON', 'WHITE', 'CABLE', 'BRING',
  'BUILD', 'WALTZ', 'CARRY', 'BLOCK', 'CATCH', 'CHART', 'CHAIR', 'CHILD',
  'CLEAN', 'CLIMB',

  // ----- Days 121–180 -----
  'CLOSE', 'COLOR', 'COULD', 'COUNT', 'COVER', 'DOZEN', 'DRINK', 'DRIVE',
  'ENJOY', 'EVERY', 'FAITH', 'FIELD', 'FIGHT', 'FINAL', 'FIRST', 'FLAME',
  'FLOOR', 'FORTH', 'FOUND', 'GIANT', 'GIVEN', 'GLOBE', 'GREAT', 'GREEN',
  'GROUP', 'GUARD', 'GUESS', 'GUEST', 'HEAVY', 'HOTEL', 'HUMAN', 'IDEAS',
  'IMAGE', 'JOINT', 'JUDGE', 'KNOWN', 'LARGE', 'LATER', 'LEARN', 'LEAVE',
  'LEGAL', 'LEVEL', 'LIVES', 'LOCAL', 'LUCKY', 'MAJOR', 'MAYBE', 'MEANT',
  'MEDIA', 'METAL', 'MIGHT', 'MINOR', 'MODEL', 'MONEY', 'MOUNT', 'MOUTH',
  'MOVED', 'NEEDS',

  // ----- Days 181–240 -----
  'NEVER', 'NEWER', 'NOISE', 'NURSE', 'OFFER', 'ORDER', 'OTHER', 'OUGHT',
  'OWNER', 'PAINT', 'PAPER', 'PARTY', 'PHASE', 'PHONE', 'PHOTO', 'PIECE',
  'PLAIN', 'PLANE', 'PLANT', 'PLATE', 'POINT', 'POUND', 'PRICE', 'PRIME',
  'PRINT', 'PRIOR', 'PROOF', 'QUITE', 'RADIO', 'RAISE', 'RANGE', 'RAPID',
  'READY', 'REFER', 'REACH', 'REALM', 'RIGHT', 'ROUND', 'ROUTE', 'RURAL',
  'ROYAL', 'SCALE', 'SCENE', 'SCOPE', 'SCORE', 'SENSE', 'SERVE', 'SEVEN',
  'SHALL', 'SHAPE', 'SHARE', 'SHEET', 'SHELF', 'SHIFT', 'SHIRT', 'SHOCK',
  'SHOOT', 'SHORT',

  // ----- Days 241–300 -----
  'SHOWN', 'SIGHT', 'SINCE', 'SIXTH', 'SIXTY', 'SIZED', 'SKILL', 'SLEEP',
  'SLIDE', 'SMALL', 'SMART', 'SMITH', 'SOLID', 'SOLVE', 'SORRY', 'SPACE',
  'SPARE', 'SPEAK', 'SPEND', 'SPENT', 'SPLIT', 'SPOKE', 'SPORT', 'STAFF',
  'STAKE', 'STAND', 'START', 'STATE', 'STEEL', 'STEEP', 'STERN', 'STICK',
  'STILL', 'STOCK', 'STONE', 'STOOD', 'STORE', 'STORY', 'STRIP', 'STUCK',
  'STUDY', 'STUFF', 'STYLE', 'SUITE', 'SUPER', 'TABLE', 'TAKEN', 'TAXES',
  'TERMS', 'THANK', 'THEFT', 'THEIR', 'THEME', 'THERE', 'THESE', 'THICK',
  'THING', 'THINK',

  // ----- Days 301–397 -----
  'THIRD', 'THOSE', 'THREE', 'THREW', 'THROW', 'TIMER', 'TOTAL', 'TOUCH',
  'TOUGH', 'TOWER', 'TRACK', 'TRADE', 'TRAIN', 'TREAT', 'TREND', 'TRIAL',
  'TRIBE', 'TRICK', 'TRIED', 'TRIES', 'TRUCK', 'TRULY', 'TRUTH', 'TWICE',
  'UNDER', 'UNDUE', 'UNION', 'UNTIL', 'UPPER', 'URBAN', 'USAGE', 'USUAL',
  'VALID', 'VALUE', 'VIDEO', 'VITAL', 'VOICE', 'WASTE', 'WATCH', 'WATER',
  'WHEEL', 'WHERE', 'WHICH', 'WHILE', 'WHOLE', 'WHOSE', 'WOMAN', 'WORRY',
  'WORSE', 'WORST', 'WORTH', 'WOULD', 'WOUND', 'WRITE', 'WRONG', 'WROTE',
  'YIELD', 'YOUNG', 'YOUTH', 'TANGO', 'STIRS', 'ICING', 'SHOTS', 'TRUMP',
  'HONOR', 'DAILY', 'CHOSE', 'CROWN', 'BLAZE', 'DRIFT', 'GHOST',
  'OASIS', 'MERIT', 'FEAST',
];

// Combined valid-guess set (O(1) lookup). VALID_GUESSES is the broad,
// permissive dictionary; ANSWERS is unioned in so every daily solution is
// always itself an acceptable guess.
export const VALID_WORDS = new Set([...VALID_GUESSES, ...ANSWERS]);

/* --------------------------------------------------------------------------
 * Day index — number of days elapsed since LAUNCH_DATE, computed in
 * America/Chicago time so a player in NOLA at 11pm and one in LA at
 * 8pm get the same puzzle.
 * -------------------------------------------------------------------------- */
export function getDayIndex(now = new Date()) {
  const today = chicagoYMD(now);
  const launch = LAUNCH_DATE;
  const diffMs = ymdToUtc(today) - ymdToUtc(launch);
  return Math.max(0, Math.floor(diffMs / 86400000));
}

/** Return today's puzzle word for the current Chicago date. */
export function getTodaysWord(now = new Date()) {
  const idx = getDayIndex(now);
  return ANSWERS[idx % ANSWERS.length];
}

/** Number of milliseconds until the next Chicago midnight. */
export function msUntilNextPuzzle(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Chicago',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now);
  const get = type => parts.find(p => p.type === type).value;
  const wallNow = new Date(`${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}:${get('second')}`);
  const wallMidnight = new Date(wallNow);
  wallMidnight.setHours(24, 0, 0, 0);
  return wallMidnight - wallNow;
}

/* -------- internal -------- */

function chicagoYMD(date) {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Chicago',
    year: 'numeric', month: '2-digit', day: '2-digit',
  });
  return fmt.format(date);
}

function ymdToUtc(ymd) {
  const [y, m, d] = ymd.split('-').map(Number);
  return Date.UTC(y, m - 1, d, 12, 0, 0);
}
