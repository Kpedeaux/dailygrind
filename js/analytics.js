const GTAG_AVAILABLE = () => typeof window.gtag === 'function';
function track(name, params) {
  if (!GTAG_AVAILABLE()) return;
  try { window.gtag('event', name, params || {}); } catch (e) {}
}
export function setUserProperties(props) {
  if (!GTAG_AVAILABLE()) return;
  try { window.gtag('set', 'user_properties', props || {}); } catch (e) {}
}
export function trackAppOpen(meta) { track('app_open', meta); }
export function trackFirstVisit() { track('first_visit_game'); }
export function trackTutorialComplete() { track('tutorial_complete'); }
export function trackPuzzleStart(day) { track('puzzle_start', { day: day }); }
export function trackGuess(day, guessNumber, guess) {
  track('puzzle_guess', { day: day, guess_number: guessNumber, guess_word: guess });
}
export function trackWordRejected(day, word, reason) {
  track('puzzle_word_rejected', { day: day, rejected_word: word, reason: reason || 'not_in_list' });
}
export function trackWin(day, guesses, hardMode) {
  track('puzzle_win', { day: day, guesses: guesses, hard_mode: hardMode });
}
export function trackLoss(day, answer, hardMode) {
  track('puzzle_loss', { day: day, answer: answer, hard_mode: hardMode });
}
export function trackShare(day, method, won, guesses) {
  track('puzzle_share', { day: day, method: method, won: won, guesses: guesses });
}
export function trackStatsOpened() { track('stats_opened'); }
export function trackSettingsOpened() { track('settings_opened'); }
export function trackHardModeToggle(on) { track('hard_mode_toggle', { on: on }); }
export function trackVisitCRClick(source) {
  track('cta_click_visit_cr', { source: source || 'unknown' });
}
export function trackHighScore() {}
export function trackGameOver() {}
