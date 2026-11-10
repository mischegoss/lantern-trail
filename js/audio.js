/* ==========================================================
   audio.js — soft chimes made in the browser (no sound files).
   Each lantern always plays the same note, rising left to
   right, so a left-to-right pattern sounds like a scale.
   ========================================================== */

const SCALE = [392.0, 440.0, 523.25, 587.33, 659.25, 783.99, 880.0, 1046.5, 1174.66, 1318.51];

let ctx = null;

// Browsers only allow sound after the first tap
export function unlockAudio() {
  if (!ctx) {
    try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch { ctx = null; }
  }
  if (ctx && ctx.state === 'suspended') ctx.resume();
}

export function tone(freq, { duration = 0.5, volume = 0.14, delay = 0, shimmer = true } = {}) {
  if (!ctx) return;
  const t = ctx.currentTime + delay;
  voice(freq, t, duration, volume);
  if (shimmer) voice(freq * 2, t, duration * 0.7, volume * 0.25);
}

function voice(freq, t, duration, volume) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(volume, t + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0005, t + duration);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + duration + 0.05);
}

export const noteFor = i => SCALE[Math.min(i, SCALE.length - 1)];

// The note for lantern i
export function chime(i, options) { tone(noteFor(i), options); }

// A quiet, neutral sound for a wrong tap. Never a buzzer.
export function softNo() { tone(330, { duration: 0.25, volume: 0.05, shimmer: false }); }

// Soft, non-musical "air" sounds (filtered noise), so they can never be
// mistaken for the lantern notes
function airSound({ duration, fromHz, toHz, peak, attack, q = 0.8 }) {
  if (!ctx) return;
  const t = ctx.currentTime;

  const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * duration), ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;

  const source = ctx.createBufferSource();
  source.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.Q.value = q;
  filter.frequency.setValueAtTime(fromHz, t);
  filter.frequency.exponentialRampToValueAtTime(toHz, t + duration * 0.6);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(peak, t + attack);
  gain.gain.exponentialRampToValueAtTime(0.0005, t + duration);

  source.connect(filter).connect(gain).connect(ctx.destination);
  source.start(t);
  source.stop(t + duration);
}

// The word arriving: one soft rising whoosh, like a breeze
export function entry() {
  airSound({ duration: 1.1, fromHz: 400, toHz: 1800, peak: 0.06, attack: 0.35 });
}

// "Your turn": the same two notes every time, so she learns the sound
export function yourTurn() {
  tone(659.25, { duration: 0.35, volume: 0.1 });
  tone(987.77, { duration: 0.6, volume: 0.1, delay: 0.16 });
}

// Blanks appearing: a short, soft falling "puff" (no notes, and
// different from the rising whoosh when the word arrives)
export function arrival() {
  airSound({ duration: 0.45, fromHz: 1400, toHz: 500, peak: 0.07, attack: 0.03, q: 1.2 });
}

// A rising chord; more notes = bigger moment
export function chord(count) {
  for (let i = 0; i < count; i++) tone(noteFor(i * 2), { duration: 0.9, volume: 0.1, delay: i * 0.09 });
}

// A small high note to go with a firework
export function sparkle() {
  tone(noteFor(Math.floor(Math.random() * 5)) * 2, { duration: 0.4, volume: 0.05 });
}
