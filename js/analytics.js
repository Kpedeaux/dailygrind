/* ==========================================================================
 * analytics.js — GA4 event helpers
 *
 * Thin wrappers around window.gtag so call sites don't have to check it
 * exists. Events use snake_case names per GA4 convention.
 * ========================================================================== */

function track(name, params = {}) {
  if (typeof window.gtag !== 'function') return;
  try { window.gtag('event', name, params); } catch { /* ignore */ }
}

export function trackPuzzleStart(day) { track('puzzle_start', { day }); }
export function trackGuess(day, n)    { track('puzzle_guess', { day, guess_number: n }); }
export function trackWin(day, guesses, hardMode) {
  track('puzzle_win', { day, guesses, hard_mode: hardMode });
}
export function trackLoss(day, hardMode) {
  track('puzzle_loss', { day, hard_mode: hardMode });
}
export function trackShare(day, method) {
  track('puzzle_share', { day, method });
}
export function trackHardModeToggle(on) {
  track('hard_mode_toggle', { on });
}
