/* ==========================================================================
 * sharecard.js — Branded result-image generator (the Instagram path)
 *
 * Text shares can't reach Instagram at all — IG has no web intent and
 * strips clipboard text from Stories. The only way a web game gets onto
 * the platform where CR's audience actually lives is an IMAGE handed to
 * the native share sheet. So we draw a 1080×1080 CR-branded card on a
 * canvas — cream ground, hairline rules, Million Dollar Red accents,
 * the player's spoiler-free tile grid — and share it as a PNG file.
 *
 * Flow:
 *   navigator.canShare({files}) → native sheet (Instagram, FB, Messages…)
 *   otherwise                   → download the PNG + toast telling the
 *                                 player to post it
 *
 * The blob is pre-rendered when the stats overlay opens so the share
 * button click stays inside the user-gesture window iOS requires.
 * ========================================================================== */

import { RESULT } from './game.js';

const SIZE = 1080;

// Mirrors css/tokens.css — canvas can't read CSS custom properties from
// a detached context, so the palette is duplicated here on purpose.
const C = {
  cream:    '#FAF8F5',
  red:      '#A52639',
  charcoal: '#2A2A2A',
  muted:    '#555555',
  ink:      '#171717',
  hairline: 'rgba(42, 42, 42, 0.25)',
  correct:  '#6E8C56',
  present:  '#C49A3A',
  absent:   '#5C5751',
};

const TILE_FILL = {
  [RESULT.CORRECT]: C.correct,
  [RESULT.PRESENT]: C.present,
  [RESULT.ABSENT]:  C.absent,
};

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Wait for the brand webfonts so the card doesn't render in Times. Never
 *  throws — worst case the serif/sans fallbacks still look respectable. */
async function loadFonts() {
  try {
    await Promise.all([
      document.fonts.load('700 96px "Playfair Display"'),
      document.fonts.load('600 44px "Inter"'),
      document.fonts.load('500 30px "JetBrains Mono"'),
    ]);
  } catch { /* fall back to system fonts */ }
}

/** Render the card and resolve with a PNG Blob. */
export async function buildShareCardBlob({ rows, won, day, hardMode = false, streak = 0 }) {
  await loadFonts();

  const canvas = document.createElement('canvas');
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext('2d');

  // ----- ground -----
  ctx.fillStyle = C.cream;
  ctx.fillRect(0, 0, SIZE, SIZE);

  // ----- red rules top + bottom (the painted door) -----
  ctx.fillStyle = C.red;
  ctx.fillRect(0, 0, SIZE, 10);
  ctx.fillRect(0, SIZE - 10, SIZE, 10);

  // ----- hairline frame -----
  ctx.strokeStyle = C.hairline;
  ctx.lineWidth = 2;
  ctx.strokeRect(40, 50, SIZE - 80, SIZE - 100);

  ctx.textAlign = 'center';
  const cx = SIZE / 2;

  // ----- eyebrow -----
  ctx.fillStyle = C.red;
  ctx.font = '500 30px "JetBrains Mono", monospace';
  try { ctx.letterSpacing = '8px'; } catch { /* older engines */ }
  ctx.fillText('CR COFFEE SHOP · NEW ORLEANS', cx, 150);
  try { ctx.letterSpacing = '0px'; } catch { /* noop */ }

  // ----- title -----
  ctx.fillStyle = C.ink;
  ctx.font = '700 96px "Playfair Display", Georgia, serif';
  ctx.fillText('The Daily Grind', cx, 268);

  // ----- score line -----
  const guessCount = rows.length;
  const score = won ? `${guessCount}/6` : 'X/6';
  const star = hardMode ? '*' : '';
  ctx.fillStyle = C.charcoal;
  ctx.font = '600 44px "Inter", sans-serif';
  ctx.fillText(`Puzzle #${day}  ·  ${score}${star}`, cx, 348);

  // ----- streak flex -----
  if (won && streak >= 2) {
    ctx.fillStyle = C.red;
    ctx.font = '600 40px "Inter", sans-serif';
    ctx.fillText(`\u{1F525} ${streak}-day streak`, cx, 416);
  }

  // ----- tile grid, centered in the band between header and footer -----
  const tile = 70;
  const gap = 8;
  const gridW = 5 * tile + 4 * gap;
  const gridH = rows.length * tile + (rows.length - 1) * gap;
  const bandTop = 450;
  const bandBottom = 920;
  const gx = (SIZE - gridW) / 2;
  const gy = bandTop + Math.max(0, (bandBottom - bandTop - gridH) / 2);

  for (let r = 0; r < rows.length; r++) {
    for (let i = 0; i < rows[r].length; i++) {
      const x = gx + i * (tile + gap);
      const y = gy + r * (tile + gap);
      ctx.fillStyle = TILE_FILL[rows[r][i].result] || C.absent;
      roundRect(ctx, x, y, tile, tile, 10);
      ctx.fill();
    }
  }

  // ----- footer -----
  ctx.fillStyle = C.red;
  ctx.font = '700 40px "Inter", sans-serif';
  ctx.fillText('Play at dailygrind.crcoffeenola.com', cx, 990);
  ctx.fillStyle = C.muted;
  ctx.font = '400 30px "Inter", sans-serif';
  ctx.fillText('Serving Antique Roasted Coffee · Est. 2015', cx, 1040);

  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (blob) resolve(blob);
      else reject(new Error('canvas.toBlob returned null'));
    }, 'image/png');
  });
}

/** Share the card through the native sheet, or download it where the
 *  sheet can't take files (desktop). Returns one of:
 *  'shared' | 'downloaded' | 'cancelled' | 'failed'. */
export async function shareCardImage(blob, day) {
  const file = new File([blob], `daily-grind-${day}.png`, { type: 'image/png' });

  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: 'The Daily Grind' });
      return 'shared';
    } catch (err) {
      if (err && err.name === 'AbortError') return 'cancelled';
      // fall through to download
    }
  }

  try {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `daily-grind-${day}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 10000);
    return 'downloaded';
  } catch {
    return 'failed';
  }
}
