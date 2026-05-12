/* ==========================================================================
 * game.js — Core guess evaluation (pure, no DOM)
 *
 * Wordle's signature trick is the duplicate-letter rule: if the answer is
 * BERRY and you guess EERIE, only the FIRST E gets marked yellow. The
 * second E gets gray because the answer has only one E left after
 * accounting for the green-or-yellow E.
 *
 * The right algorithm is two-pass:
 *   1. Mark all exact-position matches as 'correct'. Build a tally of
 *      the answer's letters minus those already matched.
 *   2. For each non-green position, if its letter is still in the tally,
 *      mark 'present' and decrement the tally. Otherwise mark 'absent'.
 * ========================================================================== */

export const GUESSES_ALLOWED = 6;
export const WORD_LENGTH = 5;

export const RESULT = Object.freeze({
  CORRECT: 'correct',  // letter and position both right (green)
  PRESENT: 'present',  // letter is in the word, wrong position (yellow)
  ABSENT:  'absent',   // letter is not in the word (gray)
});

/** Evaluate a single guess against the answer.
 *  Both inputs must be the same length and already uppercased.
 *  Returns an array of {letter, result} pairs, one per character. */
export function evaluateGuess(guess, answer) {
  if (guess.length !== answer.length) {
    throw new Error(`Length mismatch: ${guess.length} vs ${answer.length}`);
  }
  const len = guess.length;
  const out = new Array(len);
  const remaining = {};

  // Pass 1: marks greens. Tally any non-green letters from the answer.
  for (let i = 0; i < len; i++) {
    if (guess[i] === answer[i]) {
      out[i] = { letter: guess[i], result: RESULT.CORRECT };
    } else {
      remaining[answer[i]] = (remaining[answer[i]] || 0) + 1;
    }
  }
  // Pass 2: yellows + grays.
  for (let i = 0; i < len; i++) {
    if (out[i]) continue;
    const c = guess[i];
    if (remaining[c] > 0) {
      out[i] = { letter: c, result: RESULT.PRESENT };
      remaining[c]--;
    } else {
      out[i] = { letter: c, result: RESULT.ABSENT };
    }
  }
  return out;
}

/** Roll up a list of per-row results into the best status per letter.
 *  CORRECT > PRESENT > ABSENT. Used to color the on-screen keyboard. */
export function bestStatusByLetter(rows) {
  const rank = { [RESULT.CORRECT]: 3, [RESULT.PRESENT]: 2, [RESULT.ABSENT]: 1 };
  const out = {};
  for (const row of rows) {
    for (const cell of row) {
      const cur = out[cell.letter];
      if (!cur || rank[cell.result] > rank[cur]) {
        out[cell.letter] = cell.result;
      }
    }
  }
  return out;
}

/** Hard-mode validation. If any prior guess revealed a CORRECT letter at
 *  position i, the next guess MUST have the same letter at i. If any
 *  prior guess revealed a PRESENT letter, the next guess MUST contain
 *  that letter somewhere. Returns null if valid, or an error message. */
export function validateHardMode(priorRows, candidate) {
  // Required positions: { i: letter } — must match exactly
  const required = {};
  // Required letters: set — must appear somewhere
  const mustContain = new Map(); // letter -> min count

  for (const row of priorRows) {
    const need = {};
    for (let i = 0; i < row.length; i++) {
      const { letter, result } = row[i];
      if (result === RESULT.CORRECT) {
        required[i] = letter;
        need[letter] = (need[letter] || 0) + 1;
      } else if (result === RESULT.PRESENT) {
        need[letter] = (need[letter] || 0) + 1;
      }
    }
    for (const [l, c] of Object.entries(need)) {
      if (!mustContain.has(l) || mustContain.get(l) < c) {
        mustContain.set(l, c);
      }
    }
  }

  // Check fixed positions
  for (const [i, letter] of Object.entries(required)) {
    if (candidate[i] !== letter) {
      return `${ordinal(+i + 1)} letter must be ${letter}`;
    }
  }
  // Check letter counts
  const cand = {};
  for (const c of candidate) cand[c] = (cand[c] || 0) + 1;
  for (const [letter, count] of mustContain) {
    if ((cand[letter] || 0) < count) {
      return `Guess must contain ${letter}`;
    }
  }
  return null;
}

function ordinal(n) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
