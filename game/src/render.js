// Dapur Kilat — everything the player sees, drawn on one canvas.
// No images are loaded: every pot, plate and ingredient is drawn from
// shapes, so the game runs with zero network requests. The layout rects
// exported here are the same ones input.js hit-tests against.

import {
  CANVAS_H,
  CANVAS_W,
  INGREDIENTS,
  INGREDIENT_BY_ID,
  MAX_HEARTS,
  RECIPE_BY_ID,
  SHIFT_LABEL,
  SHIFT_SECONDS,
} from './config.js';
import { shiftRating } from './state.js';

export const LAYOUT = {
  topBar: { x: 0, y: 0, w: CANVAS_W, h: 64 },
  board: { x: 24, y: 84, w: CANVAS_W - 48, h: 120 },
  bins: { x: 24, y: 452, w: 800, h: 168 },
  plateStation: { x: 848, y: 452, w: 408, h: 168 },
  bottomBar: { x: 0, y: 640, w: CANVAS_W, h: 160 },
};

export function binRect(index) {
  const bins = LAYOUT.bins;
  const gap = 12;
  const w = (bins.w - gap * (INGREDIENTS.length - 1)) / INGREDIENTS.length;
  return { x: bins.x + index * (w + gap), y: bins.y, w, h: bins.h };
}

export function plateRect() {
  return { x: LAYOUT.plateStation.x + 16, y: LAYOUT.plateStation.y + 8, w: 190, h: 150 };
}

export function serveRect() {
  return { x: LAYOUT.plateStation.x + 222, y: LAYOUT.plateStation.y + 16, w: 168, h: 62 };
}

export function clearRect() {
  return { x: LAYOUT.plateStation.x + 222, y: LAYOUT.plateStation.y + 90, w: 168, h: 56 };
}

export function startButtonRect() {
  return { x: CANVAS_W / 2 - 150, y: 520, w: 300, h: 64 };
}

export function restartButtonRect() {
  return { x: CANVAS_W / 2 - 150, y: 560, w: 300, h: 64 };
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, str, x, y, size, color, align = 'left', weight = '700') {
  ctx.fillStyle = color;
  ctx.font = weight + ' ' + size + 'px "Trebuchet MS", Verdana, sans-serif';
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(str, x, y);
}

function formatClock(seconds) {
  const s = Math.max(0, Math.ceil(seconds));
  const m = Math.floor(s / 60);
  const rest = s % 60;
  return String(m).padStart(2, '0') + ':' + String(rest).padStart(2, '0');
}

// One ingredient, drawn as a little dish. Used on the counter bins, on the
// order tickets and on the plate, so the player learns each icon once.
export function drawIngredient(ctx, id, cx, cy, r) {
  ctx.save();
  ctx.translate(cx, cy);
  if (id === 'nasi') {
    ctx.fillStyle = '#fff7e0';
    ctx.beginPath();
    ctx.ellipse(0, 2, r, r * 0.72, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#e8d9a8';
    for (let i = 0; i < 7; i++) {
      const a = -0.9 + i * 0.3;
      ctx.beginPath();
      ctx.arc(Math.cos(a) * r * 0.55, -r * 0.25 + Math.sin(a) * r * 0.2, r * 0.09, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (id === 'mie') {
    ctx.strokeStyle = '#ffd94d';
    ctx.lineWidth = r * 0.28;
    ctx.lineCap = 'round';
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(0, -r * 0.35 + i * r * 0.35, r * 0.55, Math.PI * 0.15, Math.PI * 0.85);
      ctx.stroke();
    }
  } else if (id === 'ayam') {
    ctx.fillStyle = '#c97e2e';
    ctx.beginPath();
    ctx.ellipse(-r * 0.1, r * 0.1, r * 0.8, r * 0.62, -0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#8a5a1d';
    ctx.beginPath();
    ctx.ellipse(-r * 0.1, r * 0.1, r * 0.45, r * 0.3, -0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#f3e2c2';
    ctx.lineWidth = r * 0.22;
    ctx.beginPath();
    ctx.moveTo(r * 0.45, -r * 0.35);
    ctx.lineTo(r * 0.85, -r * 0.75);
    ctx.stroke();
    ctx.fillStyle = '#f3e2c2';
    ctx.beginPath();
    ctx.arc(r * 0.9, -r * 0.8, r * 0.18, 0, Math.PI * 2);
    ctx.fill();
  } else if (id === 'telur') {
    ctx.fillStyle = '#fffdf4';
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.95, r * 0.75, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffb703';
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.45, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffcf4d';
    ctx.beginPath();
    ctx.arc(-r * 0.12, -r * 0.12, r * 0.16, 0, Math.PI * 2);
    ctx.fill();
  } else if (id === 'sayur') {
    ctx.fillStyle = '#4caf50';
    for (let i = 0; i < 3; i++) {
      const a = -Math.PI / 2 + (i - 1) * 0.7;
      ctx.beginPath();
      ctx.ellipse(Math.cos(a) * r * 0.4, Math.sin(a) * r * 0.4 + r * 0.15, r * 0.42, r * 0.7, a, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = '#2e7d32';
    ctx.lineWidth = r * 0.1;
    ctx.beginPath();
    ctx.moveTo(0, r * 0.7);
    ctx.lineTo(0, r * 0.1);
    ctx.stroke();
  } else if (id === 'sambal') {
    ctx.fillStyle = '#c62828';
    ctx.beginPath();
    ctx.moveTo(-r * 0.7, -r * 0.5);
    ctx.quadraticCurveTo(0, -r * 1.1, r * 0.7, -r * 0.5);
    ctx.quadraticCurveTo(r * 0.55, r * 0.55, 0, r * 0.75);
    ctx.quadraticCurveTo(-r * 0.55, r * 0.55, -r * 0.7, -r * 0.5);
    ctx.fill();
    ctx.fillStyle = '#ff7043';
    ctx.beginPath();
    ctx.arc(-r * 0.2, -r * 0.1, r * 0.16, 0, Math.PI * 2);
    ctx.arc(r * 0.25, r * 0.15, r * 0.12, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#2e7d32';
    ctx.lineWidth = r * 0.14;
    ctx.beginPath();
    ctx.moveTo(r * 0.55, -r * 0.55);
    ctx.quadraticCurveTo(r * 0.8, -r * 0.9, r * 0.6, -r * 1.05);
    ctx.stroke();
  }
  ctx.restore();
}

function drawTopBar(ctx, state) {
  const bar = LAYOUT.topBar;
  ctx.fillStyle = '#3d2b1f';
  ctx.fillRect(bar.x, bar.y, bar.w, bar.h);
  drawIngredient(ctx, 'telur', 42, 33, 15);
  text(ctx, 'DAPUR KILAT', 66, 33, 28, '#ffd94d');
  text(ctx, SHIFT_LABEL, CANVAS_W / 2, 20, 13, '#d8c3a5', 'center', '600');
  const clock = formatClock(state.timeLeft);
  const urgent = state.timeLeft <= 30 && state.phase === 'playing';
  text(ctx, clock, CANVAS_W / 2, 44, 24, urgent ? '#ff6b5e' : '#ffffff', 'center');
  const barW = 220;
  const barX = CANVAS_W / 2 - barW / 2;
  ctx.fillStyle = '#5d4632';
  roundRect(ctx, barX, 58, barW, 5, 2);
  ctx.fill();
  ctx.fillStyle = urgent ? '#ff6b5e' : '#7dc383';
  const frac = state.timeLeft / SHIFT_SECONDS;
  roundRect(ctx, barX, 58, Math.max(4, barW * frac), 5, 2);
  ctx.fill();

  text(ctx, '🪙 ' + state.coins, CANVAS_W - 24, 22, 22, '#ffd94d', 'right');
  let hearts = '';
  for (let i = 0; i < MAX_HEARTS; i++) hearts += i < state.hearts ? '❤' : '♡';
  text(ctx, hearts, CANVAS_W - 24, 48, 18, '#ff6b5e', 'right');
  text(ctx, 'Disajikan: ' + state.served + '   Streak: x' + state.streak, CANVAS_W - 96, 48, 13, '#d8c3a5', 'right', '600');
}

function drawOrderBoard(ctx, state) {
  const board = LAYOUT.board;
  text(ctx, 'PESANAN', board.x + 4, board.y - 12, 15, '#5d4632');
  text(ctx, 'Sajikan sesuai resep — makin cepat, makin banyak koin!', board.x + 110, board.y - 12, 13, '#8a6f55', 'left', '600');
  const gap = 16;
  const w = (board.w - gap * 2) / 3;
  for (let i = 0; i < 3; i++) {
    const x = board.x + i * (w + gap);
    const y = board.y;
    const order = state.orders[i];
    ctx.fillStyle = order ? '#fff8e7' : '#efe6d4';
    roundRect(ctx, x, y, w, board.h, 12);
    ctx.fill();
    ctx.strokeStyle = order ? '#d9b36c' : '#d8cbb2';
    ctx.lineWidth = 2;
    ctx.stroke();
    if (!order) {
      text(ctx, '— menunggu pesanan —', x + w / 2, y + board.h / 2, 14, '#a08b6d', 'center', '600');
      continue;
    }
    const recipe = RECIPE_BY_ID[order.recipeId];
    const patienceFrac = Math.max(0, order.patience / order.patienceMax);
    const urgent = patienceFrac < 0.35;
    text(ctx, recipe.name, x + 16, y + 22, 19, '#3d2b1f');
    text(ctx, '🪙 ' + recipe.coins, x + w - 16, y + 22, 15, '#b06f1f', 'right');
    recipe.needs.forEach((id, j) => {
      const ix = x + 44 + j * 64;
      ctx.fillStyle = '#f3e8d2';
      ctx.beginPath();
      ctx.arc(ix, y + 66, 26, 0, Math.PI * 2);
      ctx.fill();
      drawIngredient(ctx, id, ix, y + 66, 20);
      const done = state.plate.includes(id) && state.plate.filter((p) => p === id).length > 0;
      if (done) {
        ctx.strokeStyle = '#4caf50';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(ix, y + 66, 26, 0, Math.PI * 2);
        ctx.stroke();
      }
    });
    ctx.fillStyle = '#e5d9bd';
    roundRect(ctx, x + 16, y + 102, w - 32, 10, 5);
    ctx.fill();
    ctx.fillStyle = urgent ? '#e0492f' : patienceFrac < 0.65 ? '#ffb703' : '#4caf50';
    roundRect(ctx, x + 16, y + 102, Math.max(6, (w - 32) * patienceFrac), 10, 5);
    ctx.fill();
  }
}

function drawWall(ctx, now) {
  // Warm tiled wall, a sunny window, a shelf of jars and a steaming wok.
  ctx.fillStyle = '#f6e7c8';
  ctx.fillRect(0, 204, CANVAS_W, 248);
  ctx.strokeStyle = '#ecd9ae';
  ctx.lineWidth = 2;
  for (let x = 0; x <= CANVAS_W; x += 64) {
    ctx.beginPath();
    ctx.moveTo(x, 204);
    ctx.lineTo(x, 452);
    ctx.stroke();
  }
  for (let y = 204; y <= 452; y += 62) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(CANVAS_W, y);
    ctx.stroke();
  }
  // Window with sun and hills.
  ctx.fillStyle = '#bfe3f0';
  roundRect(ctx, 60, 232, 220, 150, 10);
  ctx.fill();
  ctx.fillStyle = '#ffd94d';
  ctx.beginPath();
  ctx.arc(110, 272, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#7dc383';
  ctx.beginPath();
  ctx.moveTo(60, 382);
  ctx.quadraticCurveTo(140, 330, 220, 366);
  ctx.lineTo(280, 382);
  ctx.lineTo(60, 382);
  ctx.fill();
  ctx.strokeStyle = '#8a6f55';
  ctx.lineWidth = 6;
  ctx.strokeRect(60, 232, 220, 150);
  ctx.beginPath();
  ctx.moveTo(170, 232);
  ctx.lineTo(170, 382);
  ctx.moveTo(60, 307);
  ctx.lineTo(280, 307);
  ctx.stroke();

  // Shelf with jars.
  ctx.fillStyle = '#8a5a2b';
  ctx.fillRect(330, 300, 300, 12);
  const jarColors = ['#e0492f', '#7dc383', '#ffd94d'];
  jarColors.forEach((color, i) => {
    const jx = 360 + i * 90;
    ctx.fillStyle = color;
    roundRect(ctx, jx, 252, 52, 48, 8);
    ctx.fill();
    ctx.fillStyle = '#5d4632';
    ctx.fillRect(jx + 8, 240, 36, 12);
  });

  // Stove with a wok and rising steam.
  ctx.fillStyle = '#4a4a52';
  roundRect(ctx, 700, 330, 260, 122, 10);
  ctx.fill();
  ctx.fillStyle = '#2e2e33';
  ctx.fillRect(716, 346, 96, 10);
  ctx.fillRect(848, 346, 96, 10);
  ctx.fillStyle = '#3a3a40';
  ctx.beginPath();
  ctx.ellipse(830, 330, 62, 18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#7dc383';
  ctx.beginPath();
  ctx.ellipse(830, 326, 44, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  for (let i = 0; i < 3; i++) {
    const phase = (now / 900 + i * 0.33) % 1;
    const sx = 800 + i * 30;
    const sy = 318 - phase * 70;
    ctx.strokeStyle = 'rgba(255,255,255,' + (0.55 * (1 - phase)).toFixed(2) + ')';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.quadraticCurveTo(sx + 8, sy - 12, sx - 4, sy - 22);
    ctx.stroke();
  }
  text(ctx, 'Wajan panas — masak cepat!', 700, 300, 14, '#8a6f55', 'left', '600');

  // Hanging lamp and a menu poster on the right.
  ctx.fillStyle = '#ffd94d';
  ctx.beginPath();
  ctx.arc(1150, 260, 26, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff3c4';
  ctx.beginPath();
  ctx.arc(1150, 260, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff8e7';
  roundRect(ctx, 1060, 300, 180, 120, 10);
  ctx.fill();
  ctx.strokeStyle = '#d9b36c';
  ctx.lineWidth = 2;
  ctx.stroke();
  text(ctx, 'MENU HARI INI', 1150, 322, 13, '#b06f1f', 'center');
  text(ctx, 'Nasi Ayam Geprek', 1150, 348, 13, '#3d2b1f', 'center', '600');
  text(ctx, 'Mie Ayam Komplit', 1150, 370, 13, '#3d2b1f', 'center', '600');
  text(ctx, 'Nasi Telur Sayur', 1150, 392, 13, '#3d2b1f', 'center', '600');
}

function drawCounter(ctx, state, now) {
  const bins = LAYOUT.bins;
  ctx.fillStyle = '#a9743f';
  roundRect(ctx, 0, bins.y - 14, CANVAS_W, bins.h + 28, 6);
  ctx.fill();
  ctx.fillStyle = '#8a5a2b';
  ctx.fillRect(0, bins.y - 14, CANVAS_W, 10);
  text(ctx, 'BAHAN DI MEJA — klik atau tekan 1–6', bins.x, bins.y - 26, 14, '#5d4632');

  INGREDIENTS.forEach((ing, i) => {
    const r = binRect(i);
    const onPlate = state.plate.includes(ing.id);
    ctx.fillStyle = onPlate ? '#ffe9a8' : '#fff8e7';
    roundRect(ctx, r.x, r.y, r.w, r.h, 14);
    ctx.fill();
    ctx.strokeStyle = onPlate ? '#ffb703' : '#d9b36c';
    ctx.lineWidth = onPlate ? 3 : 2;
    ctx.stroke();
    // Bowl.
    ctx.fillStyle = '#e8e0cf';
    ctx.beginPath();
    ctx.ellipse(r.x + r.w / 2, r.y + 78, 52, 40, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#c9bda1';
    ctx.beginPath();
    ctx.ellipse(r.x + r.w / 2, r.y + 66, 52, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    drawIngredient(ctx, ing.id, r.x + r.w / 2, r.y + 62, 34);
    text(ctx, ing.name, r.x + r.w / 2, r.y + 132, 17, '#3d2b1f', 'center');
    ctx.fillStyle = '#8a6f55';
    roundRect(ctx, r.x + r.w / 2 - 13, r.y + 144, 26, 20, 6);
    ctx.fill();
    text(ctx, ing.key, r.x + r.w / 2, r.y + 155, 13, '#ffffff', 'center');
    if (onPlate) text(ctx, '✓ di piring', r.x + r.w / 2, r.y + 22, 12, '#3f8f4f', 'center');
  });

  // Plate station.
  const station = LAYOUT.plateStation;
  ctx.fillStyle = '#fff8e7';
  roundRect(ctx, station.x, station.y, station.w, station.h, 14);
  ctx.fill();
  ctx.strokeStyle = '#d9b36c';
  ctx.lineWidth = 2;
  ctx.stroke();
  text(ctx, 'PIRING', station.x + 16, station.y + 20, 13, '#8a6f55');
  const plate = plateRect();
  const shake = state.plateFlash > 0 ? Math.sin(now / 30) * 4 * state.plateFlash : 0;
  ctx.save();
  ctx.translate(shake, 0);
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.ellipse(plate.x + plate.w / 2, plate.y + plate.h / 2 + 8, 88, 62, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#d9b36c';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = '#f3e8d2';
  ctx.beginPath();
  ctx.ellipse(plate.x + plate.w / 2, plate.y + plate.h / 2 + 8, 62, 42, 0, 0, Math.PI * 2);
  ctx.fill();
  for (let s = 0; s < 3; s++) {
    const sx = plate.x + 38 + s * 58;
    const sy = plate.y + plate.h / 2 + 8;
    const id = state.plate[s];
    if (id) {
      drawIngredient(ctx, id, sx, sy, 24);
    } else {
      ctx.strokeStyle = '#d8cbb2';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.arc(sx, sy, 24, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }
  ctx.restore();

  const serve = serveRect();
  const ready = state.plate.length === 3;
  const pulse = ready ? 0.75 + Math.sin(now / 220) * 0.25 : 1;
  ctx.fillStyle = ready ? '#4caf50' : '#9db89a';
  ctx.globalAlpha = pulse;
  roundRect(ctx, serve.x, serve.y, serve.w, serve.h, 12);
  ctx.fill();
  ctx.globalAlpha = 1;
  text(ctx, 'SAJIKAN', serve.x + serve.w / 2, serve.y + 24, 20, '#ffffff', 'center');
  text(ctx, 'Spasi', serve.x + serve.w / 2, serve.y + 46, 12, '#e8f5e9', 'center', '600');

  const clear = clearRect();
  ctx.fillStyle = '#b0a18a';
  roundRect(ctx, clear.x, clear.y, clear.w, clear.h, 12);
  ctx.fill();
  text(ctx, '🗑 Buang piring', clear.x + clear.w / 2, clear.y + 20, 15, '#ffffff', 'center');
  text(ctx, 'Backspace', clear.x + clear.w / 2, clear.y + 40, 11, '#f3e8d2', 'center', '600');

  if (state.servedFlash > 0 && state.lastServedName) {
    ctx.globalAlpha = Math.min(1, state.servedFlash);
    ctx.fillStyle = '#2e7d32';
    roundRect(ctx, station.x + 8, station.y + station.h - 34, station.w - 16, 26, 8);
    ctx.fill();
    text(ctx, '✓ ' + state.lastServedName + ' tersaji!', station.x + station.w / 2, station.y + station.h - 20, 14, '#ffffff', 'center');
    ctx.globalAlpha = 1;
  }
}

function drawBottomBar(ctx, state) {
  const bar = LAYOUT.bottomBar;
  ctx.fillStyle = '#f6e7c8';
  ctx.fillRect(bar.x, bar.y, bar.w, bar.h);
  const msg = state.phase === 'playing' && state.message && state.elapsed < state.messageUntil
    ? state.message
    : '';
  if (msg) {
    ctx.fillStyle = state.messageKind === 'good' ? '#e8f5e9' : state.messageKind === 'bad' ? '#fdecea' : '#fff8e7';
    roundRect(ctx, 24, bar.y + 16, CANVAS_W - 48, 40, 10);
    ctx.fill();
    text(ctx, msg, CANVAS_W / 2, bar.y + 37, 18, state.messageKind === 'good' ? '#2e7d32' : state.messageKind === 'bad' ? '#a92c17' : '#3d2b1f', 'center');
  }
  text(ctx, 'Cara main: klik bahan (atau tekan 1–6) untuk merakit piring sesuai resep di papan pesanan, lalu tekan SAJIKAN (Spasi).', CANVAS_W / 2, bar.y + 84, 15, '#5d4632', 'center', '600');
  text(ctx, 'Sajikan sebelum kesabaran pelanggan habis. Tiga pesanan hangus = shift berakhir. P = jeda   •   M = suara   •   R = mulai lagi', CANVAS_W / 2, bar.y + 112, 13, '#8a6f55', 'center', '600');
  text(ctx, 'Dapur Kilat — game masak orisinal. Dibuat untuk kompetisi make.fun "Make the best cooking game".', CANVAS_W / 2, bar.y + 140, 12, '#a08b6d', 'center', '600');
}

function drawTitleScreen(ctx, state) {
  ctx.fillStyle = 'rgba(61,43,31,0.72)';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.fillStyle = '#fff8e7';
  roundRect(ctx, CANVAS_W / 2 - 380, 90, 760, 560, 20);
  ctx.fill();
  ctx.strokeStyle = '#d9b36c';
  ctx.lineWidth = 3;
  ctx.stroke();
  drawIngredient(ctx, 'telur', CANVAS_W / 2, 158, 36);
  text(ctx, 'DAPUR KILAT', CANVAS_W / 2, 220, 52, '#3d2b1f', 'center');
  text(ctx, 'Warung cepat saji — masak, sajikan, jangan sampai pelanggan kabur!', CANVAS_W / 2, 262, 18, '#8a6f55', 'center', '600');
  const lines = [
    '1. Pesanan muncul di papan — tiap hidangan butuh 3 bahan.',
    '2. Klik bahan di meja (atau tekan 1–6) untuk merakit piring.',
    '3. Tekan SAJIKAN (Spasi) saat piring cocok dengan pesanan.',
    '4. Sajikan cepat: makin cepat makin banyak koin. Pesanan',
    '    yang kehabisan kesabaran membuat pelanggan pergi.',
  ];
  lines.forEach((line, i) => text(ctx, line, CANVAS_W / 2, 312 + i * 30, 17, '#3d2b1f', 'center', '600'));
  const btn = startButtonRect();
  ctx.fillStyle = '#4caf50';
  roundRect(ctx, btn.x, btn.y, btn.w, btn.h, 14);
  ctx.fill();
  text(ctx, '▶  MULAI MASAK', CANVAS_W / 2, btn.y + 33, 24, '#ffffff', 'center');
  text(ctx, 'atau tekan Enter', CANVAS_W / 2, btn.y + 84, 13, '#8a6f55', 'center', '600');
}

function drawGameOver(ctx, state) {
  ctx.fillStyle = 'rgba(61,43,31,0.72)';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.fillStyle = '#fff8e7';
  roundRect(ctx, CANVAS_W / 2 - 380, 110, 760, 520, 20);
  ctx.fill();
  ctx.strokeStyle = '#d9b36c';
  ctx.lineWidth = 3;
  ctx.stroke();
  const stars = shiftRating(state);
  text(ctx, state.hearts <= 0 ? '😢 Pelanggan kabur semua!' : '⏰ Shift selesai!', CANVAS_W / 2, 180, 34, '#3d2b1f', 'center');
  let starText = '';
  for (let i = 0; i < 3; i++) starText += i < stars ? '★' : '☆';
  text(ctx, starText, CANVAS_W / 2, 236, 44, '#ffb703', 'center');
  const rows = [
    ['Koin didapat', '🪙 ' + state.coins],
    ['Pesanan disajikan', String(state.served)],
    ['Streak terbaik', 'x' + state.bestStreak],
    ['Pesanan hangus', String(state.expired)],
  ];
  rows.forEach((row, i) => {
    const y = 300 + i * 40;
    text(ctx, row[0], CANVAS_W / 2 - 200, y, 19, '#5d4632', 'left', '600');
    text(ctx, row[1], CANVAS_W / 2 + 200, y, 19, '#3d2b1f', 'right');
  });
  const btn = restartButtonRect();
  ctx.fillStyle = '#4caf50';
  roundRect(ctx, btn.x, btn.y, btn.w, btn.h, 14);
  ctx.fill();
  text(ctx, '↻  MAIN LAGI', CANVAS_W / 2, btn.y + 33, 24, '#ffffff', 'center');
  text(ctx, 'atau tekan R', CANVAS_W / 2, btn.y + 84, 13, '#8a6f55', 'center', '600');
}

function drawPaused(ctx) {
  ctx.fillStyle = 'rgba(61,43,31,0.55)';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  text(ctx, '⏸ JEDA — tekan P untuk lanjut', CANVAS_W / 2, CANVAS_H / 2, 30, '#ffffff', 'center');
}

export function render(ctx, state, now) {
  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.fillStyle = '#f6e7c8';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  drawTopBar(ctx, state);
  drawOrderBoard(ctx, state);
  drawWall(ctx, now);
  drawCounter(ctx, state, now);
  drawBottomBar(ctx, state);
  if (state.phase === 'title') drawTitleScreen(ctx, state);
  if (state.phase === 'over') drawGameOver(ctx, state);
  if (state.phase === 'playing' && state.paused) drawPaused(ctx);
}
