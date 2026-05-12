/* ==========================================================================
 * main.js — App entry, state machine, wiring
 *
 * State machine:
 *   BOOT → (first visit?) → HOW_TO → PLAYING → (win|lose) → STATS
 *                                 ↘ (returning visitor, already played today)
 *                                   → STATS (read-only, with countdown)
 *
 * Today's progress is restored from localStorage on load, so a refresh
 * mid-puzzle is a no-op. Stats only get recorded once per day.
 * ========================================================================== */

import {
  evaluateGuess, validateHardMode,
  WORD_LENGTH, GUESSES_ALLOWED, RESULT,
} from './game.js';
import {
  mountBoard, setTileLetter, revealRow, bounceRow, shakeRow,
  paintCompletedRow, mountKeyboard, paintKeyboard, showToast,
} from './render.js';
import { attachKeyboard } from './input.js';
import {
  loadGame, saveGame, getStats, recordResult,
  getSettings, setSettings, getHasPlayed, setHasPlayed,
} from './storage.js';
import { showHowTo, showStats, showSettings } from './overlays.js';
import {
  getTodaysWord, getDayIndex, msUntilNextPuzzle, VALID_WORDS,
} from './words.js';
import {
  setUserProperties,
  trackAppOpen, trackFirstVisit, trackTutorialComplete,
  trackPuzzleStart, trackGuess, trackWordRejected, trackWin, trackLoss,
  trackStatsOpened, trackSettingsOpened, trackHardModeToggle,
  trackVisitCRClick,
} from './analytics.js';

/* ---------- DOM lookup ---------- */
const $ = sel => document.querySelector(sel);
const els = {
  board:    () => $('#board'),
  keyboard: () => $('#keyboard'),
  toast:    () => $('#toast'),
  btnHelp:  () => $('#btn-help'),
  btnStats: () => $('#btn-stats'),
  btnSet:   () => $('#btn-settings'),
};

/* ---------- Game state ---------- */
const game = {
  day:        0,
  answer:     '',
  guesses:    [],          // array of evaluated guess rows ({letter, result}[])
  pending:    '',          // current in-progress guess string
  finished:   null,        // 'win' | 'lose' | null
  busy:       false,       // true during reveal animations
  hardMode:   false,
};

/* ---------- Boot ---------- */

window.addEventListener('DOMContentLoaded', async () => {
  game.day = getDayIndex();
  game.answer = getTodaysWord();
  game.hardMode = getSettings().hardMode;

  mountBoard(els.board());
  mountKeyboard(els.keyboard(), onKey);
  attachKeyboard(onKey);

  // Restore today's progress, if any
  const saved = loadGame(game.day);
  for (const word of saved.guesses) {
    const evaluation = evaluateGuess(word, game.answer);
    game.guesses.push(evaluation);
    paintCompletedRow(els.board(), game.guesses.length - 1, evaluation);
  }
  paintKeyboard(els.keyboard(), game.guesses);
  game.finished = saved.finished;

  // Wire toolbar buttons
  els.btnHelp().addEventListener('click', () => showHowTo());
  els.btnStats().addEventListener('click', () => {
    trackStatsOpened();
    openStats();
  });
  els.btnSet().addEventListener('click', () => {
    trackSettingsOpened();
    openSettings();
  });

  // Wire all "Visit CR Coffee Shop" links/buttons to fire the CR conversion event
  document.addEventListener('click', e => {
    const target = e.target.closest('a[href*="crcoffeenola.com"]');
    if (target) {
      const source = target.classList.contains('footer-cta') ? 'footer'
        : target.dataset.gaSource || 'inline';
      trackVisitCRClick(source);
    }
  });

  // GA user properties + lifecycle events
  const isFirstVisit = !getHasPlayed();
  const stats = getStats();
  const winRate = stats.played > 0 ? Math.round((stats.wins / stats.played) * 100) : 0;
  setUserProperties({
    current_streak: stats.currentStreak,
    max_streak:     stats.maxStreak,
    total_plays:    stats.played,
    total_wins:     stats.wins,
    win_rate_pct:   winRate,
    hard_mode_user: !!game.hardMode,
    visitor_type:   isFirstVisit ? 'new' : 'returning',
  });
  trackAppOpen({
    day: game.day,
    visitor_type: isFirstVisit ? 'new' : 'returning',
    current_streak: stats.currentStreak,
    finished_today: !!game.finished,
  });
  if (isFirstVisit) trackFirstVisit();

  // Boot routing
  if (isFirstVisit) {
    setHasPlayed();
    await showHowTo();
    trackTutorialComplete();
    trackPuzzleStart(game.day);
  } else if (game.finished) {
    openStats();
  } else if (game.guesses.length === 0) {
    trackPuzzleStart(game.day);
  }
});

/* ---------- Settings ---------- */

function openSettings() {
  showSettings({
    settings: { hardMode: game.hardMode },
    onChange: patch => {
      setSettings(patch);
      // Only allow flipping hard mode before any guess is submitted today
      if (game.guesses.length === 0) {
        game.hardMode = patch.hardMode;
        trackHardModeToggle(patch.hardMode);
      }
    },
    gameInProgress: game.guesses.length > 0 && !game.finished,
  });
}

/* ---------- Stats overlay (game-over + manual open) ---------- */

async function openStats() {
  const stats = getStats();
  const todaysGuessCount = game.finished === 'win' ? game.guesses.length : null;
  let globalToday = null;
  // Fire-and-forget global stats fetch; render with whatever we have.
  // If you want this to block, await it before showStats. Right now we
  // don't block because we want stats to render instantly.
  try {
    const res = await fetch(`/api/stats?day=${game.day}`, { method: 'GET' });
    if (res.ok) {
      const data = await res.json();
      globalToday = data.today || null;
    }
  } catch { /* network error — stats overlay still works */ }

  showStats({
    stats,
    globalToday,
    finishedToday: game.finished,
    todaysGuessCount,
    day: game.day,
    rows: game.guesses,
    hardMode: game.hardMode,
    msUntilNext: msUntilNextPuzzle(),
  });
}

/* ---------- Input handler ---------- */

async function onKey(key) {
  if (game.busy || game.finished) return;
  if (key === 'ENTER') return submit();
  if (key === 'BACK') return backspace();
  if (/^[A-Z]$/.test(key)) return typeLetter(key);
}

function typeLetter(letter) {
  if (game.pending.length >= WORD_LENGTH) return;
  game.pending += letter;
  setTileLetter(els.board(), game.guesses.length, game.pending.length - 1, letter);
}

function backspace() {
  if (game.pending.length === 0) return;
  game.pending = game.pending.slice(0, -1);
  setTileLetter(els.board(), game.guesses.length, game.pending.length, '');
}

async function submit() {
  if (game.pending.length !== WORD_LENGTH) {
    showToast(els.toast(), 'Not enough letters');
    shakeRow(els.board(), game.guesses.length);
    return;
  }
  if (!VALID_WORDS.has(game.pending)) {
    trackWordRejected(game.day, game.pending, 'not_in_list');
    showToast(els.toast(), 'Not in word list — backspace to try again', 2400);
    shakeRow(els.board(), game.guesses.length);
    return;
  }
  if (game.hardMode && game.guesses.length > 0) {
    const err = validateHardMode(game.guesses, game.pending);
    if (err) {
      trackWordRejected(game.day, game.pending, 'hard_mode');
      showToast(els.toast(), err);
      shakeRow(els.board(), game.guesses.length);
      return;
    }
  }

  game.busy = true;
  const evaluation = evaluateGuess(game.pending, game.answer);
  const rowIndex = game.guesses.length;
  game.guesses.push(evaluation);
  const guessedWord = game.pending;
  game.pending = '';

  await revealRow(els.board(), rowIndex, evaluation);
  paintKeyboard(els.keyboard(), game.guesses);

  // Persist progress
  saveGame({
    day: game.day,
    guesses: game.guesses.map(row => row.map(c => c.letter).join('')),
    finished: null,
  });

  const won = evaluation.every(c => c.result === RESULT.CORRECT);
  const lost = !won && game.guesses.length >= GUESSES_ALLOWED;
  trackGuess(game.day, game.guesses.length, guessedWord);

  if (won) {
    await bounceRow(els.board(), rowIndex);
    finishGame('win');
  } else if (lost) {
    finishGame('lose');
  } else {
    game.busy = false;
  }
}

async function finishGame(outcome) {
  game.finished = outcome;
  game.busy = false;

  // Persist final state
  saveGame({
    day: game.day,
    guesses: game.guesses.map(row => row.map(c => c.letter).join('')),
    finished: outcome,
  });

  // Update per-player stats
  const guessCount = outcome === 'win' ? game.guesses.length : null;
  recordResult(game.day, outcome === 'win', guessCount);

  // Track + submit to global aggregate, and refresh GA user properties
  // with the freshly-updated streak so subsequent events are bucketed
  // by the new value.
  const updatedStats = getStats();
  const updatedWinRate = updatedStats.played > 0
    ? Math.round((updatedStats.wins / updatedStats.played) * 100) : 0;
  setUserProperties({
    current_streak: updatedStats.currentStreak,
    max_streak:     updatedStats.maxStreak,
    total_plays:    updatedStats.played,
    total_wins:     updatedStats.wins,
    win_rate_pct:   updatedWinRate,
  });

  if (outcome === 'win') trackWin(game.day, guessCount, game.hardMode);
  else trackLoss(game.day, game.answer, game.hardMode);

  submitGlobalResult(outcome === 'win', guessCount);

  // Brief pause so the player sees the final row, then open stats
  if (outcome === 'lose') {
    showToast(els.toast(), `The word was ${game.answer}`, 3200);
  }
  setTimeout(openStats, outcome === 'win' ? 1400 : 1800);
}

/** Best-effort POST to the aggregate-stats endpoint. Fire and forget. */
function submitGlobalResult(won, guessCount) {
  try {
    fetch('/api/stats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        day: game.day,
        won,
        guesses: guessCount,
        hardMode: game.hardMode,
      }),
      keepalive: true,
    }).catch(() => {});
  } catch { /* ignore */ }
}
