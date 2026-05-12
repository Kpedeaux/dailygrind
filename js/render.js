/* ==========================================================================
 * render.js — DOM rendering for the board, keyboard, and toasts
 *
 * Pure rendering layer. State lives in main.js; render functions take
 * state and produce DOM. No game logic here.
 * ========================================================================== */

import { WORD_LENGTH, GUESSES_ALLOWED, RESULT, bestStatusByLetter } from './game.js';

/* ---------- Board ---------- */

/** Build the empty 6×5 board. Each row is `.row`, each cell is `.tile`.
 *  Tiles get `data-row` and `data-col` for later updates. */
export function mountBoard(boardEl) {
  boardEl.innerHTML = '';
  // We use grid layout so we don't actually need row wrappers, but for
  // the shake animation it's simpler to scope to the row. Use a flat
  // structure: 6 row elements, each containing 5 tiles.
  for (let r = 0; r < GUESSES_ALLOWED; r++) {
    const row = document.createElement('div');
    row.className = 'row';
    row.dataset.row = String(r);
    row.style.display = 'contents'; // let grid handle positioning
    for (let c = 0; c < WORD_LENGTH; c++) {
      const tile = document.createElement('div');
      tile.className = 'tile';
      tile.dataset.row = String(r);
      tile.dataset.col = String(c);
      tile.setAttribute('role', 'gridcell');
      row.appendChild(tile);
    }
    boardEl.appendChild(row);
  }
}

/** Update one tile's letter (typed state, before submission). */
export function setTileLetter(boardEl, row, col, letter) {
  const tile = boardEl.querySelector(`.tile[data-row="${row}"][data-col="${col}"]`);
  if (!tile) return;
  tile.textContent = letter || '';
  tile.classList.toggle('is-typed', !!letter);
}

/** Reveal a completed row with flip animations, staggered left-to-right.
 *  Returns a promise that resolves when the last flip finishes so the
 *  caller can fire the next thing (win bounce, advance row, etc). */
export function revealRow(boardEl, row, evaluation) {
  return new Promise(resolve => {
    const tiles = [...boardEl.querySelectorAll(`.tile[data-row="${row}"]`)];
    const stagger = 280;
    tiles.forEach((tile, i) => {
      setTimeout(() => {
        tile.classList.add('is-revealing');
      }, i * stagger);
      // Halfway through the flip, swap the color in
      setTimeout(() => {
        tile.classList.remove('is-typed');
        tile.classList.add(`is-${evaluation[i].result}`);
      }, i * stagger + 300);
    });
    setTimeout(() => {
      tiles.forEach(t => t.classList.remove('is-revealing'));
      resolve();
    }, (tiles.length - 1) * stagger + 600);
  });
}

/** Apply the bounce animation to a completed winning row. */
export function bounceRow(boardEl, row) {
  return new Promise(resolve => {
    const tiles = [...boardEl.querySelectorAll(`.tile[data-row="${row}"]`)];
    const stagger = 100;
    tiles.forEach((tile, i) => {
      setTimeout(() => tile.classList.add('is-win'), i * stagger);
    });
    setTimeout(resolve, (tiles.length - 1) * stagger + 700);
  });
}

/** Shake a row to indicate an invalid guess. */
export function shakeRow(boardEl, row) {
  return new Promise(resolve => {
    const rowEl = boardEl.querySelector(`.row[data-row="${row}"]`);
    if (!rowEl) { resolve(); return; }
    rowEl.classList.add('is-invalid');
    setTimeout(() => {
      rowEl.classList.remove('is-invalid');
      resolve();
    }, 450);
  });
}

/** Re-paint already-revealed rows (used when restoring a game in progress
 *  from localStorage on page load). */
export function paintCompletedRow(boardEl, row, evaluation) {
  const tiles = [...boardEl.querySelectorAll(`.tile[data-row="${row}"]`)];
  tiles.forEach((tile, i) => {
    tile.textContent = evaluation[i].letter;
    tile.classList.remove('is-typed');
    tile.classList.add(`is-${evaluation[i].result}`);
  });
}

/* ---------- Keyboard ---------- */

const KEY_ROWS = [
  ['Q','W','E','R','T','Y','U','I','O','P'],
  ['A','S','D','F','G','H','J','K','L'],
  ['ENTER','Z','X','C','V','B','N','M','BACK'],
];

/** Build the on-screen keyboard. Calls `onKey(key)` for each press.
 *  ENTER and BACK are special keys with wider hit targets. */
export function mountKeyboard(keyboardEl, onKey) {
  keyboardEl.innerHTML = '';
  for (const row of KEY_ROWS) {
    const rowEl = document.createElement('div');
    rowEl.className = 'keyboard__row';
    for (const k of row) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'key';
      btn.dataset.key = k;
      btn.setAttribute('aria-label', k === 'BACK' ? 'Backspace' : k);
      if (k === 'ENTER' || k === 'BACK') btn.classList.add('key--wide');
      btn.textContent = k === 'BACK' ? '⌫' : k;
      btn.addEventListener('click', () => onKey(k));
      rowEl.appendChild(btn);
    }
    keyboardEl.appendChild(rowEl);
  }
}

/** Recolor the keyboard from the rolled-up per-letter results. */
export function paintKeyboard(keyboardEl, rows) {
  const status = bestStatusByLetter(rows);
  for (const btn of keyboardEl.querySelectorAll('.key')) {
    const k = btn.dataset.key;
    if (k === 'ENTER' || k === 'BACK') continue;
    btn.classList.remove('is-correct', 'is-present', 'is-absent');
    const s = status[k];
    if (s === RESULT.CORRECT) btn.classList.add('is-correct');
    else if (s === RESULT.PRESENT) btn.classList.add('is-present');
    else if (s === RESULT.ABSENT) btn.classList.add('is-absent');
  }
}

/* ---------- Toast ---------- */

let toastTimer = null;

/** Briefly show a status message above the board. */
export function showToast(toastEl, message, ms = 1800) {
  if (!toastEl) return;
  toastEl.textContent = message;
  toastEl.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastEl.classList.remove('is-visible');
  }, ms);
}
