/* ==========================================================================
 * share.js — Spoiler-free emoji grid, platform share URLs, clipboard copy
 *
 * Wordle's secret weapon is the shareable grid. Players post their
 * result on social without spoiling the word, friends try to decode the
 * shape, the game spreads itself. We mirror the format exactly — plus a
 * streak line, because a streak is the most shareable flex there is.
 *
 * The Daily Grind #42  4/6
 * 🔥 12-day streak
 *
 *   ⬛🟨⬛⬛⬛
 *   ⬛⬛🟨🟨⬛
 *   🟩🟩⬛🟩⬛
 *   🟩🟩🟩🟩🟩
 *
 *   dailygrind.crcoffeenola.com
 *
 * Platform intent URLs (verified June 2026):
 *   X:        https://x.com/intent/tweet?text=           (docs.x.com web intents)
 *   Threads:  https://www.threads.com/intent/post?text=  (Meta Threads web intents)
 *   Facebook: https://www.facebook.com/sharer/sharer.php?u=
 *             (FB does not allow pre-filled text — link only; we pre-copy
 *             the grid to the clipboard so the player can paste it.)
 *   WhatsApp: https://wa.me/?text=
 *   SMS:      sms:&body= on iOS, sms:?body= elsewhere
 * ========================================================================== */

import { RESULT } from './game.js';

export const GAME_URL = 'https://dailygrind.crcoffeenola.com';

const EMOJI = {
  [RESULT.CORRECT]: '\u{1F7E9}',  // 🟩
  [RESULT.PRESENT]: '\u{1F7E8}',  // 🟨
  [RESULT.ABSENT]:  '\u{2B1B}',   // ⬛
};

/** Build the share text from a finished game. `rows` is the array of
 *  evaluated guess results; `won` indicates win or loss; `day` is the
 *  puzzle number; `hardMode` adds a star to the score header; `streak`
 *  (current win streak) adds a flex line when it's 2+. */
export function buildShareText({ rows, won, day, hardMode = false, streak = 0 }) {
  const guessCount = rows.length;
  const score = won ? `${guessCount}/6` : 'X/6';
  const star = hardMode ? '*' : '';
  const lines = rows.map(row => row.map(cell => EMOJI[cell.result]).join(''));
  const header = [`The Daily Grind #${day}  ${score}${star}`];
  if (won && streak >= 2) header.push(`\u{1F525} ${streak}-day streak`);
  return [
    ...header,
    '',
    ...lines,
    '',
    'dailygrind.crcoffeenola.com',
  ].join('\n');
}

/* --------------------------------------------------------------------------
 * Platform share URLs
 * ------------------------------------------------------------------------ */

export function xShareUrl(text) {
  return 'https://x.com/intent/tweet?text=' + encodeURIComponent(text);
}

export function threadsShareUrl(text) {
  return 'https://www.threads.com/intent/post?text=' + encodeURIComponent(text);
}

/** Facebook's sharer only accepts a URL — pre-filled text was removed
 *  platform-wide. The OG card on the game URL does the talking. */
export function facebookShareUrl() {
  return 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(GAME_URL);
}

export function whatsappShareUrl(text) {
  return 'https://wa.me/?text=' + encodeURIComponent(text);
}

export function smsShareUrl(text) {
  // iOS expects `sms:&body=`, everything else `sms:?body=`. iPadOS 13+
  // masquerades as macOS, hence the maxTouchPoints check.
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const sep = isIOS ? '&' : '?';
  return `sms:${sep}body=` + encodeURIComponent(text);
}

/* --------------------------------------------------------------------------
 * Clipboard + native share
 * ------------------------------------------------------------------------ */

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
