/* ==========================================================
   game.js — the flow of play.

   Each round:  the word appears  →  the lights play a pattern
   →  she taps it back (each letter vanishes when tapped)
   →  the pattern plays again over the empty lanterns
   →  she taps it once more  →  blanks appear
   →  she picks the word  →  fireworks.

   Each level is ROUNDS_PER_LEVEL words. She moves up when
   CLEAN_ROUNDS_TO_PASS of them needed no hints; otherwise
   she plays the level again with new words.
   After level 10: celebration and "Play again".
   ========================================================== */

import {
  LEVELS, ROUNDS_PER_LEVEL, CLEAN_ROUNDS_TO_PASS, TIMING, FINALE_WORD, SKY_THEMES, REPLAY_AFTER_CLEAR
} from './config.js';
import { state, saveProgress } from './state.js';
import { pickTarget } from './words.js';
import { makePattern, easierOrder } from './pattern.js';
import { optionsFor, showChoices, rejectChoice, settleChoices, clearTray, showPlayAgain } from './choices.js';
import * as lanterns from './lanterns.js';
import { scheduleTapCue, cancelTapCue, startPickHints, stopPickHints, noteActivity } from './hints.js';
import { chime, softNo, arrival, chord, yourTurn, entry } from './audio.js';
import { fireworks, burst } from './sky.js';
import { renderLevelBar, celebrateLevel, levelMarker, showLevelBar, hideLevelBar } from './levelbar.js';
import { wait, centerWithin, prefersReducedMotion } from './utils.js';

let el = {};

export function initGame(elements) { el = elements; }

export async function begin() {
  applySkyTheme();
  renderLevelBar(state);
  showLevelBar();
  if (state.level >= LEVELS.length) return finale();
  await wait(TIMING.levelBarIntro);   // a moment to see her level before the first word
  startRound();
}

function applySkyTheme() {
  document.body.dataset.sky = SKY_THEMES[state.run % SKY_THEMES.length];
}

/* ---------- 1. Show the word ---------- */
async function startRound() {
  state.phase = 'setup';
  clearTray(el.tray);
  hideLevelBar();

  const level = LEVELS[state.level];
  let order = level.order;
  // First word of a level is a warm-up: one step easier
  if (state.roundMarks.length === 0) order = easierOrder(order);
  // After a round that needed a lot of help, ease one step for the next word
  if (state.ease) order = easierOrder(order);
  state.ease = false;

  const pick = pickTarget({
    length: level.len,
    needsSameLetters: level.choices === 'same',
    seen: state.seen,
    avoidBank: state.lastBank
  });
  state.word = pick.word;
  state.lastBank = pick.bank;
  state.seen = pick.seen;
  saveProgress();

  state.pattern = makePattern(state.word.length, order);
  state.tapHelps = 0;
  state.wordHints = 0;
  state.wrongPicks = 0;
  state.pass = 1;

  lanterns.buildLanterns(el.field, state.word.length, onLanternTap);
  lanterns.setTurn(false);
  await wait(60);

  // The word arrives with one soft whoosh. No lantern notes here:
  // those are saved for the pattern, so she only hears one pattern.
  entry();
  for (let i = 0; i < state.word.length; i++) {
    lanterns.showLantern(i);
    lanterns.setLetter(i, state.word[i]);
    await wait(TIMING.letterReveal);
  }
  await wait(state.firstEver ? TIMING.readPauseFirstTime : TIMING.readPause);

  /* ---------- 2. Play the pattern ---------- */
  await playPattern();
  if (state.freshLevel) {
    // New level or new visit: show it twice
    await wait(TIMING.repeatPause);
    await playPattern();
    state.freshLevel = false;
  }

  startTapping();
}

async function playPattern() {
  state.phase = 'watch';
  lanterns.setReady(false);
  lanterns.clearBeckon();
  await wait(500);

  const on = state.firstEver ? TIMING.lightOnFirstTime : TIMING.lightOn;
  const gap = state.firstEver ? TIMING.lightGapFirstTime : TIMING.lightGap;
  for (const i of state.pattern) {
    lanterns.setLit(i, true);
    chime(i, { duration: 0.7 });
    await wait(on);
    lanterns.setLit(i, false);
    await wait(gap);
  }
}

/* ---------- 3. Tap it back (errorless) ---------- */
function startTapping() {
  state.phase = 'tap';
  state.pos = 0;
  lanterns.setTurn(true);     // lanterns swing forward
  lanterns.setReady(true);    // and start breathing
  yourTurn();
  scheduleTapCue();
}

function onLanternTap(i) {
  if (state.phase !== 'tap') return;
  const next = state.pattern[state.pos];

  if (i === next) {
    cancelTapCue();
    lanterns.clearBeckon();
    lanterns.markTapped(i);
    lanterns.setLit(i, true);
    lanterns.hideLetter(i);          // the letter vanishes when tapped
    chime(i, { duration: 0.6 });
    setTimeout(() => lanterns.setLit(i, false), 360);

    state.pos++;
    if (state.pos < state.pattern.length) scheduleTapCue();
    else if (state.pass === 1 && REPLAY_AFTER_CLEAR) replayPattern();
    else askForWord();
  } else if (!lanterns.isLit(i)) {
    // Wrong lantern: it sways, and the right one glows. No restart.
    lanterns.wobbleLantern(i);
    softNo();
    cancelTapCue();
    if (lanterns.beckon(next)) state.tapHelps++;
  }
}

/* ---------- 3b. Letters are gone: see it once more, tap it once more ---------- */
async function replayPattern() {
  state.phase = 'watch';
  cancelTapCue();
  lanterns.setTurn(false);    // lanterns step back: watch
  lanterns.setReady(false);
  await wait(TIMING.beforeReplay);
  await playPattern();
  state.pass = 2;
  startTapping();             // lanterns come forward: her turn again
}

/* ---------- 4. Pick the word ---------- */
async function askForWord() {
  state.phase = 'pick';
  lanterns.setReady(false);
  lanterns.setTurn(false);    // lanterns step back; the word buttons are next
  await wait(500);

  for (let i = 0; i < state.word.length; i++) lanterns.setLetter(i, '', 'blank');
  arrival();
  await wait(500);

  showChoices(el.tray, optionsFor(state.word, LEVELS[state.level].choices), onPick);
  startPickHints();
}

async function onPick(btn, word) {
  if (state.phase !== 'pick') return;
  noteActivity();

  if (word !== state.word) {
    softNo();
    rejectChoice(btn);
    state.wrongPicks++;
    return;
  }

  state.phase = 'celebrate';
  stopPickHints();
  settleChoices(el.tray, btn);

  // Letters fly back in the same order as the pattern, each lantern
  // playing its own note, so she hears the pattern's tune one last time
  for (const i of state.pattern) {
    const char = state.word[i];
    lanterns.flyLetterHome(btn, i, char).then(() => {
      lanterns.setLetter(i, char);
      lanterns.setLit(i, true);
      chime(i, { duration: 0.7 });
    });
    await wait(prefersReducedMotion() ? 250 : TIMING.letterReturn);
  }
  await wait(450);
  finishRound();
}

/* ---------- 5. Celebrate and move on ---------- */
async function finishRound() {
  const clean = state.tapHelps === 0 && state.wordHints === 0 && state.wrongPicks === 0;
  fireworks(clean ? Math.min(7, state.word.length + 2) : 2);
  if (clean) chord(4);

  state.roundMarks.push(clean ? 'clean' : 'helped');
  state.ease = state.tapHelps >= 2;
  state.firstEver = false;
  saveProgress();

  // The level bar slides back in, then this word's dot fills
  showLevelBar();
  await wait(500);
  renderLevelBar(state);

  await wait(TIMING.afterRound);
  clearTray(el.tray);

  if (state.roundMarks.length < ROUNDS_PER_LEVEL) return startRound();

  const cleanCount = state.roundMarks.filter(m => m === 'clean').length;
  state.roundMarks = [];
  state.freshLevel = true;

  if (cleanCount >= CLEAN_ROUNDS_TO_PASS) return levelComplete();

  // Not yet: same level, new words
  saveProgress();
  renderLevelBar(state);
  await wait(600);
  startRound();
}

async function levelComplete() {
  const cleared = state.level;
  state.level++;
  saveProgress();
  renderLevelBar(state);

  celebrateLevel(cleared);
  const marker = levelMarker(cleared);
  if (marker) {
    const p = centerWithin(marker, el.app);
    burst(p.x, p.y, 90, 1.2);
  }
  fireworks(5);
  chord(6);

  await wait(TIMING.afterLevel);
  if (state.level >= LEVELS.length) return finale();
  startRound();
}

/* ---------- After level 10 ---------- */
async function finale() {
  state.phase = 'finale';
  clearTray(el.tray);
  renderLevelBar(state);
  showLevelBar();

  lanterns.buildLanterns(el.field, FINALE_WORD.length, () => {});
  lanterns.setTurn(false);
  await wait(60);
  for (let i = 0; i < FINALE_WORD.length; i++) {
    lanterns.showLantern(i);
    lanterns.setLetter(i, FINALE_WORD[i]);
    lanterns.setLit(i, true);
    chime(i, { duration: 0.8 });
    await wait(350);
  }
  chord(6);
  fireworks(10);
  await wait(1600);
  fireworks(8);
  await wait(1400);

  showPlayAgain(el.tray, playAgain);
}

async function playAgain() {
  clearTray(el.tray);
  state.run++;
  state.level = 0;
  state.roundMarks = [];
  state.freshLevel = true;
  saveProgress();             // "seen" is kept, so the new run uses new words
  applySkyTheme();
  renderLevelBar(state);
  await wait(TIMING.levelBarIntro);
  startRound();
}
