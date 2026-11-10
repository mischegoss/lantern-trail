/* ==========================================================
   levelbar.js — the row of 10 numbered lanterns at the top,
   and the 5 dots under it for words in the current level.
   Gold dot = no hints needed. Pale dot = finished with help.
   ========================================================== */

import { LEVELS, ROUNDS_PER_LEVEL } from './config.js';

let bar = null;
let row = null;
let dots = null;

export function buildLevelBar(container) {
  bar = container;
  container.innerHTML = '';

  row = document.createElement('ol');
  row.className = 'level-row';
  LEVELS.forEach((_, i) => {
    const item = document.createElement('li');
    item.className = 'mini';
    item.textContent = i + 1;
    item.setAttribute('aria-label', `Level ${i + 1}`);
    row.appendChild(item);
  });

  dots = document.createElement('div');
  dots.className = 'round-dots';
  dots.setAttribute('aria-hidden', 'true');
  for (let i = 0; i < ROUNDS_PER_LEVEL; i++) {
    const dot = document.createElement('span');
    dot.className = 'dot';
    dots.appendChild(dot);
  }

  container.append(row, dots);
}

export function renderLevelBar({ level, roundMarks }) {
  [...row.children].forEach((item, i) => {
    item.classList.toggle('done', i < level);
    item.classList.toggle('current', i === level);
    if (i === level) item.setAttribute('aria-current', 'step');
    else item.removeAttribute('aria-current');
  });
  [...dots.children].forEach((dot, i) => {
    dot.className = roundMarks[i] ? `dot ${roundMarks[i]}` : 'dot';
  });
  dots.hidden = level >= LEVELS.length;
}

// The bar shows between words and hides while she plays
export function showLevelBar() { bar?.classList.remove('away'); }
export function hideLevelBar() { bar?.classList.add('away'); }

export function levelMarker(i) { return row ? row.children[i] : null; }

export function celebrateLevel(i) {
  const item = levelMarker(i);
  if (!item) return;
  item.classList.remove('pop');
  void item.offsetWidth;
  item.classList.add('pop');
}
