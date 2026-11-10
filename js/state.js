/* ==========================================================
   state.js — what the game remembers, and saving it in the
   browser so she picks up where she left off.
   ========================================================== */

import { STORAGE_KEY } from './config.js';

// Fields that are saved between visits
const SAVED_FIELDS = ['level', 'roundMarks', 'run', 'firstEver', 'seen', 'lastBank'];

export const state = {
  // Saved
  level: 0,           // 0-9; 10 means all levels are done
  roundMarks: [],     // this level so far: 'clean' or 'helped' per word
  run: 0,             // how many times she has played through all 10 levels
  firstEver: true,    // very first round: slower, with the next lantern glowing
  seen: [],           // words already used, so playthroughs differ
  lastBank: null,     // last word bank used, to vary themes

  // This round only
  phase: 'idle',      // idle | setup | watch | tap | pick | celebrate | finale
  word: '',
  pattern: [],        // lantern order for this round
  pos: 0,             // next step in the pattern
  pass: 1,            // 1 = tapping with letters, 2 = tapping again after they clear
  tapHelps: 0,        // glows needed while tapping
  wordHints: 0,       // hints needed while choosing the word
  wrongPicks: 0,
  freshLevel: true,   // show the pattern twice (new level or new visit)
  ease: false         // next round uses left-to-right lights after a hard round
};

export function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw);
    for (const key of SAVED_FIELDS) if (key in saved) state[key] = saved[key];
  } catch {
    // Storage can be blocked (private windows); the game still works without it
  }
}

export function saveProgress() {
  try {
    const data = {};
    for (const key of SAVED_FIELDS) data[key] = state[key];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Ignore; progress just won't carry over
  }
}

export function clearProgress() {
  try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
}
