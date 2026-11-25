// Dapur Kilat — tuning, recipes and ingredients.
// Everything the kitchen sells lives here, so balancing the game means
// editing this one file and nothing else.

export const CANVAS_W = 1280;
export const CANVAS_H = 800;

// One shift lasts two and a half minutes of real play.
export const SHIFT_SECONDS = 150;
export const MAX_HEARTS = 3;
export const MAX_ORDERS = 3;

// A plate holds at most three ingredients, exactly one recipe's worth.
export const PLATE_SLOTS = 3;

export const INGREDIENTS = [
  { id: 'nasi',   name: 'Nasi',    key: '1', color: '#fff7e0', dark: '#e8d9a8', price: 0 },
  { id: 'mie',    name: 'Mie',     key: '2', color: '#ffd94d', dark: '#d9a400', price: 0 },
  { id: 'ayam',   name: 'Ayam',    key: '3', color: '#e8a34c', dark: '#b06f1f', price: 0 },
  { id: 'telur',  name: 'Telur',   key: '4', color: '#fff3c4', dark: '#e0b93c', price: 0 },
  { id: 'sayur',  name: 'Sayur',   key: '5', color: '#7dc383', dark: '#3f8f4f', price: 0 },
  { id: 'sambal', name: 'Sambal',  key: '6', color: '#e0492f', dark: '#a92c17', price: 0 },
];

export const INGREDIENT_BY_ID = Object.fromEntries(
  INGREDIENTS.map((ing) => [ing.id, ing]),
);

// Four house recipes. Each is three ingredients; the order of the list is
// the order they are drawn on the ticket and on the plate.
export const RECIPES = [
  {
    id: 'nasi-ayam-sambal',
    name: 'Nasi Ayam Geprek',
    needs: ['nasi', 'ayam', 'sambal'],
    coins: 120,
    blurb: 'Nasi hangat, ayam geprek, sambal pedas.',
  },
  {
    id: 'nasi-telur-sayur',
    name: 'Nasi Telur Sayur',
    needs: ['nasi', 'telur', 'sayur'],
    coins: 100,
    blurb: 'Telur dadar dan sayur segar.',
  },
  {
    id: 'mie-ayam-sayur',
    name: 'Mie Ayam Komplit',
    needs: ['mie', 'ayam', 'sayur'],
    coins: 130,
    blurb: 'Mie kenyal, ayam suwir, sayur hijau.',
  },
  {
    id: 'mie-telur-sambal',
    name: 'Mie Telur Pedas',
    needs: ['mie', 'telur', 'sambal'],
    coins: 110,
    blurb: 'Mie telur dengan sambal nendang.',
  },
];

export const RECIPE_BY_ID = Object.fromEntries(
  RECIPES.map((recipe) => [recipe.id, recipe]),
);

// How fast the kitchen heats up as the shift goes on.
export const TUNING = {
  // Seconds between new orders arriving at the start of a shift.
  firstOrderDelay: 2,
  orderGapStart: 14,
  orderGapEnd: 7,
  // Seconds of patience a fresh ticket carries, start and end of shift.
  patienceStart: 48,
  patienceEnd: 30,
  // Serving fast pays more: a ticket served with most patience left earns
  // up to this bonus on top of the recipe price.
  fastBonusMax: 60,
  // Consecutive correct serves build a streak; each step adds this many coins.
  streakStep: 15,
  // A wrong serve costs this many coins (never below zero).
  wrongServePenalty: 10,
  // A ticket that runs out of patience costs a heart.
  heartsLostPerExpired: 1,
};

// Friendly names for the shift clock shown above the kitchen.
export const SHIFT_LABEL = 'Shift Makan Siang';
