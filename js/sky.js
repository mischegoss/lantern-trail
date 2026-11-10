/* ==========================================================
   sky.js — the twinkling stars and the fireworks, drawn on
   one canvas behind everything else.
   ========================================================== */

import { prefersReducedMotion } from './utils.js';
import { sparkle } from './audio.js';

const COLORS = ['#ffd96e', '#ffb44d', '#ff8fa3', '#b9d4ff', '#fff3c2', '#c9a7ff'];

let canvas, ctx, host;
let width = 0, height = 0;
const stars = [];
const sparks = [];

export function initSky(canvasEl, hostEl) {
  canvas = canvasEl;
  host = hostEl;
  ctx = canvas.getContext('2d');
  resize();
  window.addEventListener('resize', resize);
  requestAnimationFrame(draw);
}

function resize() {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  width = host.clientWidth;
  height = host.clientHeight;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  stars.length = 0;
  const count = Math.round((width * height) / 5200);
  for (let i = 0; i < count; i++) {
    stars.push({
      x: Math.random() * width,
      y: Math.random() * height * 0.8,
      r: Math.random() * 1.3 + 0.3,
      phase: Math.random() * Math.PI * 2,
      speed: 0.5 + Math.random() * 1.5
    });
  }
}

// One burst of sparks at a point
export function burst(x, y, count = 60, power = 1) {
  if (prefersReducedMotion()) count = Math.round(count / 3);
  const a = COLORS[Math.floor(Math.random() * COLORS.length)];
  const b = COLORS[Math.floor(Math.random() * COLORS.length)];
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = (1.5 + Math.random() * 3.5) * power;
    sparks.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      decay: 0.010 + Math.random() * 0.012,
      color: Math.random() < 0.6 ? a : b,
      r: 1.6 + Math.random() * 1.8
    });
  }
}

// Several bursts across the upper sky; more = bigger celebration
export function fireworks(count) {
  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      burst(
        width * (0.15 + Math.random() * 0.7),
        height * (0.18 + Math.random() * 0.25),
        55 + count * 6,
        0.9 + count * 0.06
      );
      sparkle();
    }, i * 260);
  }
}

function draw(time) {
  ctx.clearRect(0, 0, width, height);

  for (const s of stars) {
    const alpha = 0.35 + 0.35 * Math.sin((time / 1000) * s.speed + s.phase);
    ctx.fillStyle = `rgba(230, 228, 255, ${alpha})`;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
  }

  for (let i = sparks.length - 1; i >= 0; i--) {
    const p = sparks[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.045;
    p.vx *= 0.985;
    p.vy *= 0.985;
    p.life -= p.decay;
    if (p.life <= 0) { sparks.splice(i, 1); continue; }
    ctx.globalAlpha = p.life;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  requestAnimationFrame(draw);
}
