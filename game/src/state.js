// Dapur Kilat — the kitchen's state and its rules.
// This file owns every number that changes while playing: the clock, the
// tickets on the order board, the plate being assembled, coins, streak and
// hearts. Rendering never mutates anything here; input only calls the small
// verbs at the bottom (addIngredient, servePlate, clearPlate, startShift).

import {
  MAX_HEARTS,
  MAX_ORDERS,
  PLATE_SLOTS,
  RECIPES,
  RECIPE_BY_ID,
  SHIFT_SECONDS,
  TUNING,
} from './config.js';

export function makeRng(seed) {
  let s = seed >>> 0 || 1;
  return function next() {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export function pickRecipe(rng, avoidId) {
  const pool = RECIPES.filter((r) => r.id !== avoidId);
  const list = pool.length > 0 ? pool : RECIPES;
  return list[Math.floor(rng() * list.length)];
}

export function newShift(seed) {
  return {
    phase: 'title', // title | playing | over
    seed,
    rng: makeRng(seed),
    timeLeft: SHIFT_SECONDS,
    elapsed: 0,
    orders: [],
    nextOrderIn: TUNING.firstOrderDelay,
    plate: [], // ingredient ids, in the order they were added
    coins: 0,
    served: 0,
    streak: 0,
    bestStreak: 0,
    hearts: MAX_HEARTS,
    wrongServes: 0,
    expired: 0,
    message: '',
    messageUntil: 0,
    messageKind: 'info',
    plateFlash: 0, // >0 while the plate shakes after a wrong serve
    servedFlash: 0, // >0 while the "served!" banner shows
    lastServedName: '',
    muted: false,
    paused: false,
  };
}

export function startShift(state) {
  const fresh = newShift(state.seed);
  fresh.phase = 'playing';
  fresh.muted = state.muted;
  return fresh;
}

function orderPatience(state) {
  const progress = state.elapsed / SHIFT_SECONDS;
  return TUNING.patienceStart + (TUNING.patienceEnd - TUNING.patienceStart) * progress;
}

function orderGap(state) {
  const progress = state.elapsed / SHIFT_SECONDS;
  return TUNING.orderGapStart + (TUNING.orderGapEnd - TUNING.orderGapStart) * progress;
}

export function spawnOrder(state) {
  const avoid = state.orders.length > 0
    ? state.orders[state.orders.length - 1].recipeId
    : null;
  const recipe = pickRecipe(state.rng, avoid);
  const patience = orderPatience(state);
  state.orders.push({
    id: state.elapsed.toFixed(2) + '-' + state.orders.length + '-' + Math.floor(state.rng() * 1000),
    recipeId: recipe.id,
    patience,
    patienceMax: patience,
    bornAt: state.elapsed,
  });
}

export function plateMatchesOrder(plate, recipeId) {
  const recipe = RECIPE_BY_ID[recipeId];
  if (plate.length !== recipe.needs.length) return false;
  const sortedPlate = [...plate].sort();
  const sortedNeeds = [...recipe.needs].sort();
  return sortedPlate.every((id, i) => id === sortedNeeds[i]);
}

export function findMatchingOrder(state) {
  return state.orders.find((order) => plateMatchesOrder(state.plate, order.recipeId));
}

export function addIngredient(state, ingredientId) {
  if (state.phase !== 'playing' || state.paused) return false;
  if (state.plate.length >= PLATE_SLOTS) return false;
  state.plate.push(ingredientId);
  return true;
}

export function clearPlate(state) {
  if (state.phase !== 'playing' || state.paused) return false;
  if (state.plate.length === 0) return false;
  state.plate = [];
  return true;
}

export function servePlate(state) {
  if (state.phase !== 'playing' || state.paused) return 'idle';
  if (state.plate.length === 0) return 'empty';
  const order = findMatchingOrder(state);
  if (!order) {
    state.plate = [];
    state.streak = 0;
    state.wrongServes += 1;
    state.coins = Math.max(0, state.coins - TUNING.wrongServePenalty);
    state.plateFlash = 0.6;
    showMessage(state, 'Bukan pesanan! Piring dibuang.', 'bad');
    return 'wrong';
  }
  const recipe = RECIPE_BY_ID[order.recipeId];
  const patienceLeft = order.patience / order.patienceMax;
  const fastBonus = Math.round(TUNING.fastBonusMax * patienceLeft);
  const streakBonus = state.streak * TUNING.streakStep;
  const earned = recipe.coins + fastBonus + streakBonus;
  state.coins += earned;
  state.served += 1;
  state.streak += 1;
  state.bestStreak = Math.max(state.bestStreak, state.streak);
  state.orders = state.orders.filter((o) => o.id !== order.id);
  state.plate = [];
  state.lastServedName = recipe.name;
  state.servedFlash = 1.0;
  showMessage(
    state,
    recipe.name + ' disajikan! +' + earned + ' koin' + (streakBonus > 0 ? ' (streak x' + state.streak + ')' : ''),
    'good',
  );
  return 'served';
}

export function showMessage(state, text, kind) {
  state.message = text;
  state.messageKind = kind;
  state.messageUntil = state.elapsed + 2.2;
}

// Advance the shift by dt seconds. Returns 'over' the moment the shift ends.
export function tick(state, dt) {
  if (state.phase !== 'playing' || state.paused) return state.phase;
  state.elapsed += dt;
  state.timeLeft = Math.max(0, SHIFT_SECONDS - state.elapsed);
  if (state.plateFlash > 0) state.plateFlash = Math.max(0, state.plateFlash - dt);
  if (state.servedFlash > 0) state.servedFlash = Math.max(0, state.servedFlash - dt);

  for (const order of state.orders) order.patience -= dt;
  const expiredNow = state.orders.filter((order) => order.patience <= 0);
  if (expiredNow.length > 0) {
    state.orders = state.orders.filter((order) => order.patience > 0);
    state.expired += expiredNow.length;
    state.hearts = Math.max(0, state.hearts - TUNING.heartsLostPerExpired * expiredNow.length);
    state.streak = 0;
    showMessage(state, 'Pesanan hangus! Pelanggan pergi.', 'bad');
  }

  if (state.orders.length < MAX_ORDERS) {
    state.nextOrderIn -= dt;
    if (state.nextOrderIn <= 0) {
      spawnOrder(state);
      state.nextOrderIn = orderGap(state);
    }
  }

  if (state.timeLeft <= 0 || state.hearts <= 0) {
    state.phase = 'over';
    return 'over';
  }
  return 'playing';
}

export function shiftRating(state) {
  if (state.served >= 12) return 3;
  if (state.served >= 8) return 2;
  if (state.served >= 4) return 1;
  return 0;
}
