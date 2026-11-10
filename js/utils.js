/* ==========================================================
   utils.js — small helpers used by several modules.
   ========================================================== */

export const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

export function shuffle(list) {
  const a = list.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const pickOne = list => list[Math.floor(Math.random() * list.length)];

// How many letters two words share (counting repeats once each)
export function sharedLetters(a, b) {
  const pool = [...b];
  let count = 0;
  for (const ch of a) {
    const i = pool.indexOf(ch);
    if (i >= 0) { count++; pool.splice(i, 1); }
  }
  return count;
}

export const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Center point of an element, measured inside a container
export function centerWithin(el, container) {
  const c = container.getBoundingClientRect();
  const r = el.getBoundingClientRect();
  return { x: r.left - c.left + r.width / 2, y: r.top - c.top + r.height / 2 };
}

// Gentle sway used for a wrong tap
export function wobble(el) {
  el.classList.remove('wobble');
  void el.offsetWidth; // restart the animation
  el.classList.add('wobble');
  setTimeout(() => el.classList.remove('wobble'), 520);
}
