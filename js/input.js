/* ==========================================================================
 * input.js — Physical keyboard listener
 *
 * The on-screen keyboard is wired in render.js (its buttons call onKey
 * directly). This file handles the physical keyboard so desktop players
 * can type. The two paths converge on the same onKey(key) handler.
 *
 * We translate raw event keys to the canonical strings the game uses:
 *   'A'..'Z'    letters
 *   'ENTER'     submit
 *   'BACK'      delete last letter
 *
 * Repeats are allowed (holding backspace deletes letter-by-letter), but
 * modifier-laden combos (Cmd+R, Ctrl+L) pass through to the browser.
 * ========================================================================== */

export function attachKeyboard(onKey) {
  function handler(e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const k = e.key;
    if (k === 'Enter') {
      e.preventDefault();
      onKey('ENTER');
    } else if (k === 'Backspace' || k === 'Delete') {
      e.preventDefault();
      onKey('BACK');
    } else if (/^[a-zA-Z]$/.test(k)) {
      onKey(k.toUpperCase());
    }
  }
  window.addEventListener('keydown', handler);
  return () => window.removeEventListener('keydown', handler);
}
