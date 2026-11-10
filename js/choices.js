/* ==========================================================
   choices.js — picks the wrong words for each level, and
   shows the word buttons (and the "Play again" button).
   ========================================================== */

import { ALL_WORDS, familyOf } from './words.js';
import { CHOICE_COUNT } from './config.js';
import { shuffle, sharedLetters, wobble } from './utils.js';

/**
 * The right word plus wrong words, shuffled.
 * kind: 'different' | 'lookalike' | 'same' (see config.js)
 */
export function optionsFor(word, kind) {
  const family = familyOf(word);
  const total = CHOICE_COUNT[kind] || 3;
  const others = ALL_WORDS.filter(w => !family.includes(w));
  const picks = [];

  // Same letters, different order (up to 2)
  if (kind === 'same') {
    picks.push(...shuffle(family.filter(w => w !== word)).slice(0, 2));
  }

  if (kind === 'different') {
    // Similar length, almost no shared letters
    const far = others.filter(w => Math.abs(w.length - word.length) <= 1 && sharedLetters(w, word) <= 1);
    picks.push(...shuffle(far).slice(0, total - 1));
  } else {
    // Same length, most shared letters, same first letter scores higher
    const near = others
      .filter(w => w.length === word.length)
      .map(w => ({ w, score: sharedLetters(w, word) + (w[0] === word[0] ? 1 : 0) + Math.random() * 0.8 }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map(x => x.w);
    picks.push(...shuffle(near).slice(0, total - 1 - picks.length));
  }

  // Fill any gap
  for (const w of shuffle(others)) {
    if (picks.length >= total - 1) break;
    if (!picks.includes(w)) picks.push(w);
  }

  return shuffle([word, ...picks.slice(0, total - 1)]);
}

export function showChoices(tray, options, onPick) {
  tray.innerHTML = '';
  options.forEach((word, i) => {
    const btn = makeButton(word, i);
    btn.addEventListener('click', () => onPick(btn, word));
    tray.appendChild(btn);
  });
  tray.classList.add('on');
}

// A wrong word sways and drifts away
export function rejectChoice(btn) {
  wobble(btn);
  btn.classList.add('fade');
}

// The right word was chosen: hide it (its letters fly) and fade the rest
export function settleChoices(tray, chosen) {
  tray.classList.remove('on');
  chosen.classList.add('picked');
  [...tray.children].forEach(btn => { if (btn !== chosen) btn.classList.add('fade'); });
}

export function clearTray(tray) {
  tray.innerHTML = '';
  tray.classList.remove('on');
}

export function showPlayAgain(tray, onClick) {
  tray.innerHTML = '';
  const btn = makeButton('Play again', 0);
  btn.classList.add('play-again');
  btn.addEventListener('click', onClick, { once: true });
  tray.appendChild(btn);
  tray.classList.add('on');
}

function makeButton(label, index) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'choice';
  btn.textContent = label;
  btn.style.animationDelay = `${index * 110}ms`;
  btn.addEventListener('animationend', e => {
    if (e.animationName === 'rise') btn.classList.add('risen');
  });
  return btn;
}
