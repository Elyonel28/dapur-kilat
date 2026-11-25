// Dapur Kilat — staged states for the entry's screenshots.
// ?shot=start|play|serve|rush (with an optional &seed=) puts the kitchen
// into a fixed, readable moment: the title screen, a dish mid-assembly, a
// plate ready to serve, or the late-shift rush. These are the same game
// states a player reaches by playing; nothing here draws anything the game
// cannot draw on its own. shots.json lists the four shots the entry ships.

import { newShift } from './state.js';

function stagedOrder(recipeId, patience, patienceMax, bornAt) {
  return { id: 'shot-' + recipeId, recipeId, patience, patienceMax, bornAt };
}

function basePlaying(seed, elapsed, coins, served, streak, hearts) {
  const state = newShift(seed);
  state.phase = 'playing';
  state.elapsed = elapsed;
  state.timeLeft = 150 - elapsed;
  state.coins = coins;
  state.served = served;
  state.streak = streak;
  state.bestStreak = streak;
  state.hearts = hearts;
  state.nextOrderIn = 9;
  return state;
}

export function applyShot(name, seed) {
  if (name === 'start') {
    const state = newShift(seed);
    state.phase = 'title';
    return state;
  }
  if (name === 'play') {
    const state = basePlaying(seed, 63, 240, 2, 2, 3);
    state.orders = [
      stagedOrder('nasi-ayam-sambal', 30, 44, 20),
      stagedOrder('mie-ayam-sayur', 18, 40, 34),
      stagedOrder('nasi-telur-sayur', 40, 46, 55),
    ];
    // Two of the three ingredients of the first ticket are already on the
    // plate: the dish is visibly mid-assembly.
    state.plate = ['nasi', 'ayam'];
    state.message = 'Nasi Ayam Geprek hampir jadi — tambah sambal!';
    state.messageKind = 'info';
    state.messageUntil = 999;
    return state;
  }
  if (name === 'serve') {
    const state = basePlaying(seed, 41, 360, 3, 3, 3);
    state.orders = [
      stagedOrder('mie-ayam-sayur', 26, 42, 12),
      stagedOrder('mie-telur-sambal', 34, 44, 28),
      stagedOrder('nasi-telur-sayur', 12, 40, 33),
    ];
    // The plate holds the whole first recipe: it is ready to serve.
    state.plate = ['mie', 'ayam', 'sayur'];
    state.message = 'Mie Ayam Komplit siap disajikan!';
    state.messageKind = 'good';
    state.messageUntil = 999;
    return state;
  }
  if (name === 'rush') {
    const state = basePlaying(seed, 126, 780, 7, 4, 1);
    state.orders = [
      stagedOrder('nasi-ayam-sambal', 9, 32, 100),
      stagedOrder('mie-telur-sambal', 14, 32, 112),
      stagedOrder('nasi-telur-sayur', 5, 30, 120),
    ];
    state.plate = ['nasi'];
    state.message = 'Rush! Selesaikan pesanan sebelum pelanggan pergi.';
    state.messageKind = 'bad';
    state.messageUntil = 999;
    return state;
  }
  return newShift(seed);
}

export function shotFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const shot = params.get('shot');
  if (!shot) return null;
  const seed = Number(params.get('seed') || '7');
  return applyShot(shot, Number.isFinite(seed) ? seed : 7);
}
