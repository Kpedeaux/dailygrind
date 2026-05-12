/* ==========================================================================
 * share.js — Spoiler-free emoji-grid generator + clipboard copy
 *
 * Wordle's secret weapon is the shareable grid. Players post their
 * result on social without spoiling the word, friends try to decode the
 * shape, the game spreads itself. We mirror the format exactly.
 *
 * The Daily Grind #42  4/6
 *
 *   ⬛🟨⬛⬛⬛
 *   ⬛⬛🟨🟨⬛
 *   🟩🟩⬛🟩⬛
 *   🟩🟩🟩🟩🟩
 *
 *   dailygrind.crcoffeenola.com
 * ========================================================================== */

import { RESULT } from './game.js';

const EMOJI = {
  [RESULT.CORRECT]: '\u{1F7E9}',  // 🟩
  [RESULT.PRESENT]: '\u{1F7E8}',  // 🟨
  [RESULT.ABSENT]:  '\u{2B1B}',   // ⬛
};

/** Build the share text from a finished game. `rows` is the array of
 *  evaluated guess results; `won` indicates win or loss; `day` is the
 *  puzzle number; `hardMode` adds a star to the score header. */
export function buildShareText({ rows, won, day, hardMode = false }) {
  const guessCount = rows.length;
  const score = won ? `${guessCount}/6` : 'X/6';
  const star = hardMode ? '*' : '';
  const lines = rows.map(row => row.map(cell => EMOJI[cell.result]).join(''));
  return [
    `The Daily Grind #${day}  ${score}${star}`,
    '',
    ...lines,
    '',
    'dailygrind.crcoffeenola.com',
  ].join('\n');
}

/** Copy the share text to the clipboard. Tries the modern Clipboard API
 *  first; falls back to a hidden textarea + execCommand for old Safari.
 *  Returns true on success. */
export async function copyToClipboard(text) {
  // Try the async API first
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch { /* fall through */ }

  // Fallback: hidden textarea
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  ta.style.pointerEvents = 'none';
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  let ok = false;
  try { ok = document.execCommand('copy'); } catch { ok = false; }
  document.body.removeChild(ta);
  return ok;
}

/** If the device supports the native share sheet (iOS, modern Android),
 *  open it. Otherwise return false so the caller can fall back to
 *  clipboard. */
export async function nativeShare(text) {
  if (!navigator.share) return false;
  try {
    await navigator.share({ text });
    return true;
  } catch {
    // User canceled or share failed — don't treat as an error
    return false;
  }
}
