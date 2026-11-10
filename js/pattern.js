/* ==========================================================
   pattern.js — the order the lanterns light up.
   Every lantern lights exactly once, so every letter
   disappears by the end of the round.

   Orders, easiest to hardest:
   'in'    left to right (spells the word, a rising scale)
   'swap'  nearly in order: left to right with one pair of
           neighbors swapped
   'swap2' left to right with two pairs of neighbors swapped
   'mix'   a truly mixed order (never just one swap)
   ========================================================== */

import { shuffle } from './utils.js';

export const ORDER_STEPS = ['in', 'swap', 'swap2', 'mix'];

// One step easier (used for the warm-up word and after a hard round)
export function easierOrder(order) {
  const i = ORDER_STEPS.indexOf(order);
  return ORDER_STEPS[Math.max(0, i - 1)];
}

export function makePattern(count, order) {
  const leftToRight = Array.from({ length: count }, (_, i) => i);
  if (count < 2 || order === 'in') return leftToRight;
  if (order === 'swap') return swapNeighbors(leftToRight, 1);
  if (order === 'swap2') return swapNeighbors(leftToRight, count >= 4 ? 2 : 1);

  let mixed;
  do { mixed = shuffle(leftToRight); } while (isNearlyInOrder(mixed));
  return mixed;
}

// Swap `pairs` non-overlapping pairs of neighbors
function swapNeighbors(list, pairs) {
  const a = list.slice();
  const used = new Set();
  let done = 0;
  for (const start of shuffle([...Array(a.length - 1).keys()])) {
    if (done >= pairs) break;
    if (used.has(start) || used.has(start + 1)) continue;
    [a[start], a[start + 1]] = [a[start + 1], a[start]];
    used.add(start);
    used.add(start + 1);
    done++;
  }
  return a;
}

// True for left to right, or left to right with a single neighbor swap
function isNearlyInOrder(a) {
  const off = a.map((v, i) => (v === i ? -1 : i)).filter(i => i >= 0);
  return off.length === 0 || (off.length === 2 && off[1] === off[0] + 1);
}
