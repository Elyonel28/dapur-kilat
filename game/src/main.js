// Dapur Kilat — the game loop and wiring.
// Boots the canvas, binds input and sound, advances the shift clock and
// paints every frame. When the page carries ?shot=..., the kitchen is frozen
// in that staged moment so a screenshot shows exactly what was staged.

import { CANVAS_H, CANVAS_W } from './config.js';
import { bindInput } from './input.js';
import { render } from './render.js';
import { applyShot, shotFromUrl } from './shots.js';
import { newShift, tick } from './state.js';
import { makeSounds } from './audio.js';

const canvas = document.getElementById('game');
canvas.width = CANVAS_W;
canvas.height = CANVAS_H;
const ctx = canvas.getContext('2d');

let state = shotFromUrl() || newShift(7);
const frozen = shotFromUrl() !== null;

// A handle for playtesting: the automated checks drive the real game
// through this object and read the real state back.
window.__dapur = {
  get state() {
    return state;
  },
  set state(next) {
    state = next;
  },
  restart(seed) {
    state = newShift(seed || 7);
  },
  stage(name, seed) {
    state = applyShot(name, seed || 7);
  },
};

const sounds = makeSounds(() => state.muted);
bindInput(canvas, () => state, (next) => { state = next; }, sounds);

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.1, (now - last) / 1000);
  last = now;
  if (!frozen) {
    const before = state.phase;
    tick(state, dt);
    if (before === 'playing' && state.phase === 'over') sounds.error();
  }
  render(ctx, state, now);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
