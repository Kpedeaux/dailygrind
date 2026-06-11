/* ==========================================================================
 * overlays.js — Modal overlays: how-to-play, stats, settings
 *
 * Each function builds DOM, mounts it into #overlay, returns a Promise
 * that resolves when the player closes it.
 * ========================================================================== */

import { RESULT } from './game.js';
import {
  buildShareText, copyToClipboard, nativeShare,
  xShareUrl, threadsShareUrl, facebookShareUrl, whatsappShareUrl, smsShareUrl,
} from './share.js';
import { buildShareCardBlob, shareCardImage } from './sharecard.js';
import { trackShare, trackVisitCRClick } from './analytics.js';

const overlayEl = () => document.getElementById('overlay');

function clear() {
  const el = overlayEl();
  el.innerHTML = '';
  el.hidden = false;
}
function hide() {
  const el = overlayEl();
  el.hidden = true;
  el.innerHTML = '';
}

function makeCloseButton(onClose) {
  const btn = document.createElement('button');
  btn.className = 'overlay__close';
  btn.type = 'button';
  btn.setAttribute('aria-label', 'Close');
  btn.textContent = '×';
  btn.addEventListener('click', onClose);
  return btn;
}

function makeInner() {
  const inner = document.createElement('div');
  inner.className = 'overlay__inner';
  return inner;
}

/* ==========================================================================
 * How-to-play
 * ========================================================================== */
export function showHowTo() {
  return new Promise(resolve => {
    clear();
    const inner = makeInner();
    inner.appendChild(makeCloseButton(() => { hide(); resolve(); }));

    inner.innerHTML += `
      <p class="overlay__eyebrow">How to Play</p>
      <h2 class="overlay__title">Guess the word.</h2>
      <p class="overlay__subtitle">Six tries. Five letters.</p>
      <p class="overlay__body">
        Type any real five-letter word and hit <strong>Enter</strong>. After
        each guess, the tiles change color to tell you how close you got.
      </p>
      <div class="overlay__example">
        <div class="tile is-correct">B</div>
        <div class="tile">R</div>
        <div class="tile">E</div>
        <div class="tile">W</div>
        <div class="tile">S</div>
      </div>
      <p class="overlay__body"><strong>B</strong> is in the word and in the right spot.</p>
      <div class="overlay__example">
        <div class="tile">M</div>
        <div class="tile is-present">O</div>
        <div class="tile">C</div>
        <div class="tile">H</div>
        <div class="tile">A</div>
      </div>
      <p class="overlay__body"><strong>O</strong> is in the word but in the wrong spot.</p>
      <div class="overlay__example">
        <div class="tile">L</div>
        <div class="tile">A</div>
        <div class="tile">T</div>
        <div class="tile is-absent">T</div>
        <div class="tile">E</div>
      </div>
      <p class="overlay__body"><strong>T</strong> is not in the word at all.</p>
      <p class="overlay__body">
        A new puzzle drops every day at midnight Central time. Same word
        for everybody. Build a streak. Brag with the emoji share.
      </p>
    `;

    const btnRow = document.createElement('div');
    btnRow.className = 'btn-row';
    const startBtn = document.createElement('button');
    startBtn.className = 'btn';
    startBtn.type = 'button';
    startBtn.textContent = 'Start Today\'s Puzzle';
    startBtn.addEventListener('click', () => { hide(); resolve(); });
    btnRow.appendChild(startBtn);
    inner.appendChild(btnRow);

    overlayEl().appendChild(inner);
  });
}

/* ==========================================================================
 * Stats + share (shown on game complete + via the stats button)
 * ========================================================================== */
export function showStats({
  stats,             // local stats from storage
  globalToday,       // optional { plays, wins, distribution } from API
  finishedToday,     // 'win' | 'lose' | null
  todaysGuessCount,  // 1–6 if won today, else null
  day,
  rows,              // the guess rows for share text (only if finished)
  hardMode,
  msUntilNext,       // milliseconds until next puzzle
}) {
  return new Promise(resolve => {
    clear();
    const inner = makeInner();
    inner.appendChild(makeCloseButton(() => { hide(); resolve(); }));

    const eyebrow = document.createElement('p');
    eyebrow.className = 'overlay__eyebrow';
    eyebrow.textContent = `Puzzle #${day}`;
    inner.appendChild(eyebrow);

    const title = document.createElement('h2');
    title.className = 'overlay__title';
    if (finishedToday === 'win') title.textContent = 'Nice grind.';
    else if (finishedToday === 'lose') title.textContent = 'Tomorrow.';
    else title.textContent = 'Statistics';
    inner.appendChild(title);

    if (finishedToday === 'win' && todaysGuessCount) {
      const sub = document.createElement('p');
      sub.className = 'overlay__subtitle';
      sub.textContent = todaysGuessCount === 1
        ? 'In one. Are you cheating?'
        : `Solved in ${todaysGuessCount} ${todaysGuessCount === 1 ? 'guess' : 'guesses'}.`;
      inner.appendChild(sub);
    }

    // Player stats grid
    const winPct = stats.played > 0 ? Math.round((stats.wins / stats.played) * 100) : 0;
    const grid = document.createElement('div');
    grid.className = 'stats';
    grid.innerHTML = `
      <div class="stats__cell"><strong>${stats.played}</strong><span>Played</span></div>
      <div class="stats__cell"><strong>${winPct}</strong><span>Win %</span></div>
      <div class="stats__cell"><strong>${stats.currentStreak}</strong><span>Current</span></div>
      <div class="stats__cell"><strong>${stats.maxStreak}</strong><span>Max Streak</span></div>
    `;
    inner.appendChild(grid);

    // Guess distribution
    const distHeader = document.createElement('p');
    distHeader.className = 'overlay__eyebrow';
    distHeader.textContent = 'Guess Distribution';
    inner.appendChild(distHeader);

    const dist = document.createElement('div');
    dist.className = 'distribution';
    const max = Math.max(1, ...stats.distribution);
    for (let i = 0; i < 6; i++) {
      const count = stats.distribution[i];
      const pct = count > 0 ? Math.max(8, (count / max) * 100) : 4;
      const isCurrent = finishedToday === 'win' && todaysGuessCount === i + 1;
      const row = document.createElement('div');
      row.className = 'distribution__row';
      row.innerHTML = `
        <span class="distribution__label">${i + 1}</span>
        <div class="distribution__bar">
          <div class="distribution__fill ${isCurrent ? 'is-current' : ''}"
               style="width: ${pct}%">${count}</div>
        </div>
      `;
      dist.appendChild(row);
    }
    inner.appendChild(dist);

    // Global stats from the API
    if (globalToday && globalToday.plays > 0) {
      const globalHeader = document.createElement('p');
      globalHeader.className = 'overlay__eyebrow';
      globalHeader.textContent = "Today's Players";
      inner.appendChild(globalHeader);

      const globalWinPct = Math.round((globalToday.wins / globalToday.plays) * 100);
      const globalGrid = document.createElement('div');
      globalGrid.className = 'stats';
      globalGrid.innerHTML = `
        <div class="stats__cell"><strong>${globalToday.plays.toLocaleString()}</strong><span>Played</span></div>
        <div class="stats__cell" style="grid-column: span 3;"><strong>${globalWinPct}%</strong><span>Win rate today</span></div>
      `;
      inner.appendChild(globalGrid);
    }

    // Countdown + share (only if finished today)
    if (finishedToday) {
      const countdown = document.createElement('div');
      countdown.className = 'countdown';
      countdown.innerHTML = `
        <span class="countdown__label">Next puzzle in</span>
        <span class="countdown__time" data-countdown>--:--:--</span>
      `;
      inner.appendChild(countdown);

      // Live-update the countdown every second. When it hits zero, swap
      // in a "play now" button — never strand the player on a stale page
      // (that's how streaks die).
      const timeEl = countdown.querySelector('[data-countdown]');
      let remaining = msUntilNext;
      function tickCountdown() {
        if (remaining <= 0) {
          countdown.innerHTML = '';
          const playBtn = document.createElement('button');
          playBtn.className = 'btn';
          playBtn.type = 'button';
          playBtn.textContent = 'Play today’s puzzle →';
          playBtn.addEventListener('click', () => location.reload());
          countdown.appendChild(playBtn);
          return;
        }
        const h = Math.floor(remaining / 3600000);
        const m = Math.floor((remaining % 3600000) / 60000);
        const s = Math.floor((remaining % 60000) / 1000);
        timeEl.textContent = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
        remaining -= 1000;
      }
      tickCountdown();
      const interval = setInterval(() => {
        if (overlayEl().hidden) { clearInterval(interval); return; }
        tickCountdown();
      }, 1000);

      /* ----- Share section ----- */
      const won = finishedToday === 'win';
      const guesses = rows ? rows.length : 0;
      const streak = stats.currentStreak || 0;
      const shareText = buildShareText({ rows, won, day, hardMode, streak });

      // Pre-render the branded image card while the player reads their
      // stats, so the share click stays inside iOS's user-gesture window.
      const cardPromise = buildShareCardBlob({ rows, won, day, hardMode, streak })
        .catch(() => null);

      const shareHeader = document.createElement('p');
      shareHeader.className = 'overlay__eyebrow';
      shareHeader.textContent = 'Share Your Grind';
      inner.appendChild(shareHeader);

      // Primary row: native share + image card
      const btnRow = document.createElement('div');
      btnRow.className = 'btn-row';

      const shareBtn = document.createElement('button');
      shareBtn.className = 'btn';
      shareBtn.type = 'button';
      shareBtn.textContent = 'Share Result';
      shareBtn.addEventListener('click', async () => {
        const shared = await nativeShare(shareText);
        if (shared) {
          trackShare(day, 'native', won, guesses);
        } else {
          const copied = await copyToClipboard(shareText);
          if (copied) {
            shareBtn.textContent = 'Copied!';
            trackShare(day, 'clipboard', won, guesses);
            setTimeout(() => { shareBtn.textContent = 'Share Result'; }, 1800);
          } else {
            shareBtn.textContent = 'Copy failed';
            setTimeout(() => { shareBtn.textContent = 'Share Result'; }, 1800);
          }
        }
      });
      btnRow.appendChild(shareBtn);

      const imageBtn = document.createElement('button');
      imageBtn.className = 'btn';
      imageBtn.type = 'button';
      imageBtn.textContent = 'Share Image';
      imageBtn.addEventListener('click', async () => {
        imageBtn.disabled = true;
        const blob = await cardPromise;
        if (!blob) {
          imageBtn.textContent = 'Image failed';
          setTimeout(() => { imageBtn.textContent = 'Share Image'; imageBtn.disabled = false; }, 1800);
          return;
        }
        const result = await shareCardImage(blob, day);
        imageBtn.disabled = false;
        if (result === 'shared') {
          trackShare(day, 'image_native', won, guesses);
        } else if (result === 'downloaded') {
          trackShare(day, 'image_download', won, guesses);
          imageBtn.textContent = 'Saved! Post it ☕';
          setTimeout(() => { imageBtn.textContent = 'Share Image'; }, 2400);
        } else if (result === 'failed') {
          imageBtn.textContent = 'Share failed';
          setTimeout(() => { imageBtn.textContent = 'Share Image'; }, 1800);
        }
        // 'cancelled' → player closed the sheet; no feedback needed
      });
      btnRow.appendChild(imageBtn);
      inner.appendChild(btnRow);

      // One-tap platform chips
      const chips = document.createElement('div');
      chips.className = 'share-chips';
      const platforms = [
        {
          label: 'X', method: 'x',
          go: () => window.open(xShareUrl(shareText), '_blank', 'noopener'),
        },
        {
          label: 'Facebook', method: 'facebook',
          // FB can't pre-fill text — copy the grid first so it can be
          // pasted into the post, then open the sharer with the game URL.
          go: async chip => {
            const copied = await copyToClipboard(shareText);
            if (copied) {
              chip.textContent = 'Grid copied — paste it!';
              setTimeout(() => { chip.textContent = 'Facebook'; }, 2600);
            }
            window.open(facebookShareUrl(), '_blank', 'noopener');
          },
        },
        {
          label: 'Threads', method: 'threads',
          go: () => window.open(threadsShareUrl(shareText), '_blank', 'noopener'),
        },
        {
          label: 'WhatsApp', method: 'whatsapp',
          go: () => window.open(whatsappShareUrl(shareText), '_blank', 'noopener'),
        },
        {
          label: 'Text', method: 'sms',
          go: () => { window.location.href = smsShareUrl(shareText); },
        },
      ];
      for (const p of platforms) {
        const chip = document.createElement('button');
        chip.className = 'share-chip';
        chip.type = 'button';
        chip.textContent = p.label;
        chip.addEventListener('click', () => {
          trackShare(day, p.method, won, guesses);
          p.go(chip);
        });
        chips.appendChild(chip);
      }
      inner.appendChild(chips);

      // Visit CR ghost button
      const visitRow = document.createElement('div');
      visitRow.className = 'btn-row';
      const visitBtn = document.createElement('button');
      visitBtn.className = 'btn btn--ghost';
      visitBtn.type = 'button';
      visitBtn.textContent = 'Visit CR';
      visitBtn.addEventListener('click', () => {
        trackVisitCRClick('stats_overlay');
        window.open('https://crcoffeenola.com/', '_blank', 'noopener');
      });
      visitRow.appendChild(visitBtn);
      inner.appendChild(visitRow);
    }

    overlayEl().appendChild(inner);
  });
}

/* ==========================================================================
 * Settings
 * ========================================================================== */
export function showSettings({ settings, onChange, gameInProgress }) {
  return new Promise(resolve => {
    clear();
    const inner = makeInner();
    inner.appendChild(makeCloseButton(() => { hide(); resolve(); }));

    inner.innerHTML += `
      <p class="overlay__eyebrow">Settings</p>
      <h2 class="overlay__title">Preferences</h2>
    `;

    // Hard mode toggle
    const hardRow = document.createElement('div');
    hardRow.className = 'settings-row';
    hardRow.innerHTML = `
      <div>
        <span class="settings-row__label">Hard mode</span>
        <span class="settings-row__hint">Revealed hints must be used in subsequent guesses.${gameInProgress ? ' Cannot change mid-game.' : ''}</span>
      </div>
    `;
    const toggle = document.createElement('button');
    toggle.className = 'toggle' + (settings.hardMode ? ' is-on' : '');
    toggle.type = 'button';
    toggle.setAttribute('aria-pressed', String(settings.hardMode));
    toggle.setAttribute('aria-label', 'Toggle hard mode');
    if (gameInProgress) toggle.disabled = true;
    toggle.addEventListener('click', () => {
      if (gameInProgress) return;
      const next = !settings.hardMode;
      settings.hardMode = next;
      toggle.classList.toggle('is-on', next);
      toggle.setAttribute('aria-pressed', String(next));
      onChange({ hardMode: next });
    });
    hardRow.appendChild(toggle);
    inner.appendChild(hardRow);

    overlayEl().appendChild(inner);
  });
}
