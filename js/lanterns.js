/* ==========================================================
   lanterns.js — creates the row of lanterns and changes how
   they look. No game rules here; game.js decides what happens.
   ========================================================== */

import { centerWithin, prefersReducedMotion, wobble } from './utils.js';

// Layout, as % of the screen: a gentle arc across the middle
const ROW_CENTER_Y = 42;  // height of the middle lanterns
const ARC_DROP = 6;       // how much lower the end lanterns hang
const MAX_STEP = 18;      // most space between lanterns
const SPAN = 80;          // width the whole row may use

let field = null;
let lanterns = [];

export function buildLanterns(container, count, onTap) {
  field = container;
  field.innerHTML = '';
  lanterns = [];

  const step = count > 1 ? Math.min(MAX_STEP, SPAN / (count - 1)) : 0;
  for (let i = 0; i < count; i++) {
    const offset = i - (count - 1) / 2;
    const t = count > 1 ? offset / ((count - 1) / 2) : 0;

    const el = document.createElement('button');
    el.type = 'button';
    el.className = 'lantern';
    el.setAttribute('aria-label', `Lantern ${i + 1}`);
    el.style.left = `${50 + offset * step}%`;
    el.style.top = `${ROW_CENTER_Y + ARC_DROP * t * t}%`;
    el.innerHTML = '<span class="cap"></span><span class="body"><span class="letter gone"></span></span><span class="tassel"></span>';
    el.addEventListener('click', () => onTap(i));

    field.appendChild(el);
    lanterns.push(el);
  }
}

const letterEl = i => lanterns[i].querySelector('.letter');

export function showLantern(i) { lanterns[i].classList.add('shown'); }

// look: '' (visible), 'gone', 'blank' (underline), 'ghost' (faint)
export function setLetter(i, char, look = '') {
  const el = letterEl(i);
  el.textContent = char;
  el.className = look ? `letter ${look}` : 'letter';
}

export function hideLetter(i) { letterEl(i).classList.add('gone'); }

export function setLit(i, on) { lanterns[i].classList.toggle('lit', on); }
export function isLit(i) { return lanterns[i].classList.contains('lit'); }

// Her turn: lanterns come forward and can be tapped. Otherwise they only show.
export function setTurn(on) {
  field?.classList.toggle('turn', on);
  lanterns.forEach(el => el.setAttribute('aria-disabled', String(!on)));
}

// All lanterns gently breathe while waiting for taps
export function setReady(on) { lanterns.forEach(el => el.classList.toggle('ready', on)); }
export function markTapped(i) { lanterns[i].classList.remove('ready'); }

// Hint glow. Returns true only if the glow is new.
export function beckon(i) {
  const el = lanterns[i];
  if (el.classList.contains('beckon')) return false;
  el.classList.add('beckon');
  return true;
}
export function clearBeckon() { lanterns.forEach(el => el.classList.remove('beckon')); }

export function wobbleLantern(i) { wobble(lanterns[i]); }

// A letter flies from the chosen word button into lantern i
export async function flyLetterHome(fromEl, i, char) {
  const from = centerWithin(fromEl, field);
  const to = centerWithin(letterEl(i), field);
  const flyer = document.createElement('div');
  flyer.className = 'flyer';
  flyer.textContent = char;
  flyer.style.fontSize = getComputedStyle(letterEl(i)).fontSize;
  field.appendChild(flyer);

  await flyer.animate(
    [
      { left: `${from.x}px`, top: `${from.y}px`, opacity: 0.7 },
      { left: `${to.x}px`, top: `${to.y}px`, opacity: 1 }
    ],
    { duration: prefersReducedMotion() ? 150 : 380, easing: 'cubic-bezier(.3,.7,.3,1)', fill: 'forwards' }
  ).finished;
  flyer.remove();
}
