// Dapur Kilat — mouse and keyboard input.
// Hit-testing uses the same layout rects render.js draws with, so a button
// is clickable exactly where it is painted. Input never touches the state
// directly: it calls the verbs in state.js and the sound hooks in audio.js.

import { INGREDIENTS } from './config.js';
import {
  binRect,
  clearRect,
  plateRect,
  restartButtonRect,
  serveRect,
  startButtonRect,
} from './render.js';
import { addIngredient, clearPlate, servePlate, startShift } from './state.js';

function inside(x, y, rect) {
  return x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h;
}

function canvasPoint(canvas, event) {
  const box = canvas.getBoundingClientRect();
  return {
    x: (event.clientX - box.left) * (canvas.width / box.width),
    y: (event.clientY - box.top) * (canvas.height / box.height),
  };
}

export function bindInput(canvas, getState, setState, sounds) {
  function clickAt(x, y) {
    const state = getState();
    if (state.phase === 'title') {
      if (inside(x, y, startButtonRect())) {
        setState(startShift(state));
        sounds.start();
      }
      return;
    }
    if (state.phase === 'over') {
      if (inside(x, y, restartButtonRect())) {
        setState(startShift(state));
        sounds.start();
      }
      return;
    }
    if (state.paused) return;
    for (let i = 0; i < INGREDIENTS.length; i++) {
      if (inside(x, y, binRect(i))) {
        if (addIngredient(state, INGREDIENTS[i].id)) sounds.pick();
        else sounds.error();
        return;
      }
    }
    if (inside(x, y, serveRect()) || inside(x, y, plateRect())) {
      const result = servePlate(state);
      if (result === 'served') sounds.served();
      else if (result === 'wrong') sounds.error();
      else sounds.pick();
      return;
    }
    if (inside(x, y, clearRect())) {
      if (clearPlate(state)) sounds.pick();
      return;
    }
  }

  canvas.addEventListener('pointerdown', (event) => {
    const point = canvasPoint(canvas, event);
    clickAt(point.x, point.y);
  });

  window.addEventListener('keydown', (event) => {
    const state = getState();
    const key = event.key.toLowerCase();
    if (key === 'enter' && state.phase === 'title') {
      setState(startShift(state));
      sounds.start();
      return;
    }
    if ((key === 'r' || key === 'enter') && state.phase === 'over') {
      setState(startShift(state));
      sounds.start();
      return;
    }
    if (state.phase !== 'playing') return;
    if (key === 'p') {
      state.paused = !state.paused;
      return;
    }
    if (key === 'm') {
      state.muted = !state.muted;
      return;
    }
    if (state.paused) return;
    const byKey = INGREDIENTS.find((ing) => ing.key === key);
    if (byKey) {
      if (addIngredient(state, byKey.id)) sounds.pick();
      else sounds.error();
      return;
    }
    if (key === ' ') {
      event.preventDefault();
      const result = servePlate(state);
      if (result === 'served') sounds.served();
      else if (result === 'wrong') sounds.error();
      return;
    }
    if (key === 'backspace' || key === 'delete') {
      if (clearPlate(state)) sounds.pick();
    }
  });
}
