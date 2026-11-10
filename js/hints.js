/* ==========================================================
   hints.js — help that arrives on its own, with no buttons.

   While tapping (errorless): if she pauses, the next lantern
   glows. game.js also makes it glow after a wrong tap.

   While choosing the word: after a pause the first letter
   comes back faintly; after a longer pause the whole word
   flickers back for a moment.
   ========================================================== */

import { state } from './state.js';
import { TAP_CUE, WORD_HINTS } from './config.js';
import { beckon, setLetter } from './lanterns.js';
import { chime } from './audio.js';
import { wait } from './utils.js';

/* ---------- Tapping ---------- */
let tapTimer = null;

export function scheduleTapCue() {
  cancelTapCue();
  const delay = state.firstEver
    ? 0
    : state.level < TAP_CUE.shortWaitThroughLevel ? TAP_CUE.shortWait : TAP_CUE.longWait;

  tapTimer = setTimeout(() => {
    if (state.phase !== 'tap') return;
    const isNew = beckon(state.pattern[state.pos]);
    if (isNew && !state.firstEver) state.tapHelps++;
  }, delay);
}

export function cancelTapCue() { clearTimeout(tapTimer); }

/* ---------- Choosing the word ---------- */
let pickTimer = null;
let idleSince = 0;
let busy = false;

export function startPickHints() {
  stopPickHints();
  idleSince = performance.now();
  busy = false;
  pickTimer = setInterval(checkPickHints, 250);
}

export function stopPickHints() { clearInterval(pickTimer); }

// Call on every tap so hints only come when she is stuck
export function noteActivity() { idleSince = performance.now(); }

async function checkPickHints() {
  if (state.phase !== 'pick' || busy) return;
  const idle = performance.now() - idleSince;

  if (state.wordHints === 0 && idle > WORD_HINTS.firstLetterAfter) {
    state.wordHints = 1;
    setLetter(0, state.word[0], 'ghost');
    chime(0, { volume: 0.1 });
    noteActivity();
    return;
  }

  if (state.wordHints === 1 && idle > WORD_HINTS.wholeWordAfter) {
    busy = true;
    state.wordHints = 2;
    for (let i = 0; i < state.word.length; i++) {
      if (state.phase !== 'pick') break;
      setLetter(i, state.word[i], 'ghost');
      chime(i, { volume: 0.08 });
      await wait(260);
    }
    await wait(WORD_HINTS.wholeWordShowFor);
    if (state.phase === 'pick') {
      for (let i = 1; i < state.word.length; i++) setLetter(i, '', 'blank');
    }
    noteActivity();
    busy = false;
  }
}
