/* ==========================================================
   main.js — starts the game. Connects the page to the modules.
   ========================================================== */

import { SHOW_RESET_BUTTON } from './config.js';
import { state, loadProgress, clearProgress } from './state.js';
import { initSky } from './sky.js';
import { unlockAudio } from './audio.js';
import { buildLevelBar } from './levelbar.js';
import { initGame, begin } from './game.js';

const app = document.getElementById('app');

loadProgress();
initSky(document.getElementById('sky'), app);
buildLevelBar(document.getElementById('levels'));
initGame({
  app,
  field: document.getElementById('field'),
  tray: document.getElementById('tray')
});

// Sound can only start after the first tap
window.addEventListener('pointerdown', unlockAudio, { passive: true });

// Testing helpers
const reset = document.getElementById('reset');
if (SHOW_RESET_BUTTON) {
  reset.hidden = false;
  reset.addEventListener('click', () => { clearProgress(); location.reload(); });
}
if (new URLSearchParams(location.search).has('debug')) {
  window.lanternTrail = { state };   // inspect in the browser console
}

begin();
