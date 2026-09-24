// Pixel art RPG — mundo en baja resolución escalado sin suavizado, persona como sprite con dithering,
// ventanas y caja de diálogo de RPG (los subtítulos hablan como diálogo), HUD; transición en mosaico.
import * as L from '../engine/lib.js';
import { para } from '../engine/base.js';

const PX = 6; // one "game pixel" = 6 screen px at 1080p
const C = { night: '#1a1c2c', plum: '#5d275d', red: '#b13e53', orange: '#ef7d57', gold: '#ffcd75', lime: '#a7f070', green: '#38b764', teal: '#257179', navy: '#29366f', blue: '#3b5dc9', sky: '#41a6f6', cyan: '#73eff7', white: '#f4f4f4', silver: '#94b0c2', slate: '#566c86', dark: '#333c57' };
const SPRITE_PAL = ['#1a1c2c', '#262b44', '#333c57', '#2a1a1a', '#4a2a20', '#6b3b2e', '#a8664a', '#dd9a70', '#f6c7a0', '#fff1e0', '#257179', '#29366f', '#b13e53'].map(h => L.hexRgb(h));
const BAYER = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]];
let lo, lx, mos;
const snap = (v, u) => Math.round(v / (PX * u)) * PX * u;

// photo/character → low-res dithered sprite canvas (in game pixels)
const SPRITE = L.memo(gh => {
  const K = window.K, S = K.subject(gh * 4), c = L.canvas(Math.round(S.w / 4), gh), x = c.getContext('2d');
  x.imageSmoothingEnabled = true; x.drawImage(S.c, 0, 0, c.width, c.height);
  const d = x.getImageData(0, 0, c.width, c.height);
  for (let y = 0; y < c.height; y++) for (let xx = 0; xx < c.width; xx++) {
    const i = (y * c.width + xx) * 4; if (d.data[i + 3] < 140) { d.data[i + 3] = 0; continue; }
    const t = (BAYER[y % 4][xx % 4] / 16 - 0.5) * 34, r = d.data[i] * 1.08 + t, g = d.data[i + 1] * 1.04 + t, b = d.data[i + 2] + t;
    let best = 0, bd = 1e9; SPRITE_PAL.forEach((p, k) => { const dd = (p[0] - r) ** 2 * 0.35 + (p[1] - g) ** 2 * 0.5 + (p[2] - b) ** 2 * 0.15; if (dd < bd) { bd = dd; best = k; } });
    d.data[i] = SPRITE_PAL[best][0]; d.data[i + 1] = SPRITE_PAL[best][1]; d.data[i + 2] = SPRITE_PAL[best][2]; d.data[i + 3] = 255;
  }
  x.putImageData(d, 0, 0);
  // 1-px dark outline around the sprite (classic sprite read)
  const o = L.canvas(c.width + 2, c.height + 2), ox = o.getContext('2d');
  for (const [dx, dy] of [[0, 1], [2, 1], [1, 0], [1, 2]]) ox.drawImage(c, dx, dy);
  ox.globalCompositeOperation = 'source-in'; ox.fillStyle = C.night; ox.fillRect(0, 0, o.width, o.height); ox.globalCompositeOperation = 'source-over'; ox.drawImage(c, 1, 1);
  return o;
});
const MASC = L.memo((gw, gh, kind) => { const c = L.canvas(gw, gh), x = c.getContext('2d'); L.mascot(x, kind, { x: 1, y: 1, w: gw - 2, h: gh - 2 }, { color: C.orange, ink: C.night, eye: C.night, eyeStyle: 'square', outline: true }); const d = x.getImageData(0, 0, gw, gh); for (let i = 3; i < d.data.length; i += 4) d.data[i] = d.data[i] > 110 ? 255 : 0; x.putImageData(d, 0, 0); return c; });
const PIXIMG = L.memo((src, w, h) => { const img = window.K.images[src], c = L.canvas(w, h), x = c.getContext('2d'); x.drawImage(img, 0, 0, w, h); return c; });

function win(K, b, p, o = {}) { // RPG window: navy fill, double white border, pops in by rows
  if (p <= 0) return null; const { ctx, u } = K, q = PX * u, x = snap(b.x, u), y = snap(b.y, u), w = snap(b.w, u), h = snap(b.h * L.E.step(L.clamp(p * 1.4), 5), u) || q * 2;
  ctx.fillStyle = C.night; ctx.fillRect(x - q, y - q, w + 2 * q, h + 2 * q);
  ctx.fillStyle = o.border || C.white; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = o.fill || '#202a55'; ctx.fillRect(x + q, y + q, w - 2 * q, h - 2 * q);
  if (o.shine !== false) { ctx.fillStyle = 'rgba(255,255,255,.08)'; ctx.fillRect(x + q, y + q, w - 2 * q, q); }
  return { x, y, w, h };
}

export default {
  id: 'pixel', name: 'Pixel art RPG',
  fonts: 'Press+Start+2P&family=Silkscreen:wght@400;700',
  fontLoads: ['400 20px "Press Start 2P"', '400 20px Silkscreen', '700 20px Silkscreen'],
  palette: { bg: C.night, ink: C.white, accent: C.gold, muted: C.silver, panel: '#202a55', line: C.white, good: C.lime, bad: C.red, mascot: C.orange },
  type: { display: s => `700 ${s}px Silkscreen`, em: s => `700 ${s}px Silkscreen`, body: s => `700 ${s}px Silkscreen`, bodyEm: s => `700 ${s}px Silkscreen`, label: s => `700 ${s}px Silkscreen`, mono: s => `400 ${s}px "Press Start 2P"` },
  ls: 0, lh: 1.08, upper: true,
  sfx: 'retro', transDur: 0.6, camera: false,
  music: 'chiptune 16-bit adventure theme, square wave lead, arpeggiated chords, punchy noise drums, heroic and upbeat, 120 BPM, instrumental, retro game',
  async setup(K) {
    const lw = Math.round(K.W / (PX * K.u)), lh = Math.round(K.H / (PX * K.u));
    lo = L.canvas(lw, lh); lx = lo.getContext('2d'); lx.imageSmoothingEnabled = false;
    mos = L.canvas(K.W, K.H);
  },
  background(K, s) {
    const g = lx, W = lo.width, H = lo.height, R = (c, x, y, w, h) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); }, v = s.i % 3, f = K.frame;
    const floorY = Math.round(H * (K.vertical ? 0.78 : 0.74));
    if (v === 0) { // cozy room at night
      R(C.navy, 0, 0, W, floorY); for (let x = 0; x < W; x += 16) R('#2f3d7a', x, 0, 1, floorY);
      const wx = Math.round(W * 0.62), wy = Math.round(H * 0.1), ww = Math.round(W * 0.3), wh = Math.round(H * 0.34);
      R(C.night, wx - 3, wy - 3, ww + 6, wh + 6); R(C.teal, wx, wy, ww, wh); R(C.night, wx + ww / 2 - 1, wy, 3, wh); R(C.night, wx, wy + wh / 2 - 1, ww, 3);
      const r = L.rng(3); for (let k = 0; k < 9; k++) { const x = wx + 2 + r() * (ww - 4), y = wy + 2 + r() * (wh - 4); if ((f >> 3) % 3 !== k % 3) R(C.gold, x, y, 1, 1); }
      R(C.white, wx + ww * 0.7, wy + wh * 0.15, 5, 5);
      R(C.dark, 0, floorY, W, H - floorY); for (let x = 0; x < W; x += 12) R('#3b4566', x, floorY, 6, 1);
          } else if (v === 1) { // city skyline dusk
      for (let y = 0; y < floorY; y++) { const t = y / floorY; g.fillStyle = t < 0.35 ? C.plum : t < 0.6 ? C.red : t < 0.8 ? C.orange : C.gold; g.fillRect(0, y, W, 1); }
      const r = L.rng(8); let x = 0; while (x < W) { const bw = 10 + Math.floor(r() * 18), bh = 18 + Math.floor(r() * (floorY * 0.45)); R(C.night, x, floorY - bh, bw, bh); for (let yy = floorY - bh + 3; yy < floorY - 3; yy += 5) for (let xx = x + 2; xx < x + bw - 2; xx += 4) if (r() > 0.55 && ((f >> 4) + xx + yy) % 7) R(C.gold, xx, yy, 2, 2); x += bw + 1; }
      R(C.dark, 0, floorY, W, H - floorY); R(C.slate, 0, floorY, W, 1);
    } else { // meadow with scrolling clouds
      R(C.sky, 0, 0, W, floorY); R('#6fc3ff', 0, floorY * 0.6, W, floorY * 0.4);
      const off = (f * 0.25) % (W + 60);
      [[0.1, 0.12], [0.45, 0.22], [0.8, 0.1]].forEach(([cx, cy], k) => { const x = ((cx * W + off * (0.6 + k * 0.2)) % (W + 60)) - 30, y = cy * H; R(C.white, x, y, 26, 6); R(C.white, x + 5, y - 4, 14, 4); R('#cfe3f5', x, y + 5, 26, 1); });
      R(C.green, 0, floorY - 6, W, 6); for (let x = 0; x < W; x += 5) R(C.lime, x + ((x * 7) % 3), floorY - 7, 2, 2);
      R('#257135', 0, floorY, W, H - floorY); for (let x = 0; x < W; x += 9) R(C.green, x, floorY + 3 + (x % 4), 3, 1);
    }
    const { ctx } = K; ctx.imageSmoothingEnabled = false; ctx.drawImage(lo, 0, 0, K.W, K.H); ctx.imageSmoothingEnabled = true;
    // dim the world behind text-heavy scenes so it reads
    if (!['hook', 'cta'].includes(s.type)) { ctx.fillStyle = 'rgba(26,28,44,.55)'; ctx.fillRect(0, 0, K.W, K.H); }
    // HUD
    const u = K.u, hud = `ESCENA ${String(s.i + 1).padStart(2, '0')}   ♥♥♥   XP ${String(Math.floor(K.t * 37)).padStart(4, '0')}`;
    L.text(ctx, hud, K.W - 30 * u, 44 * u, { font: `400 ${16 * u}px "Press Start 2P"`, color: C.silver, align: 'right' });
  },
  headline(K, str, box, p, s, o = {}) {
    const b = { ...box }; if (b.y < 70 * K.u) { b.h -= 70 * K.u - b.y; b.y = 70 * K.u; }
    para(K, str, b, p, { font: sz => K.S.type.display(sz), emFont: sz => K.S.type.display(sz), max: o.size === 'm' ? 96 : 150, min: 18, lh: 1.05, upper: true, color: C.white, emColor: C.gold, reveal: 'type', align: o.align === 'center' ? 'center' : 'left', valign: 'top', shadow: C.night, shadowX: 6 * K.u, shadowY: 6 * K.u });
  },
  text(K, str, box, p, role, s, o = {}) {
    const u = K.u;
    if (role === 'kicker' || role === 'label') return para(K, str, box, p, { font: sz => K.S.type.label(sz), color: C.lime, upper: true, max: 22, lh: 1.5, align: o.align || 'left', reveal: 'type', shadow: C.night, shadowX: 3 * u, shadowY: 3 * u });
    if (role === 'headGood' || role === 'headBad') return para(K, str, box, p, { font: sz => K.S.type.display(sz), color: role === 'headGood' ? C.lime : C.red, max: 64, upper: true, reveal: 'type', valign: 'top', shadow: C.night, shadowX: 4 * u, shadowY: 4 * u });
    const map = { body: [C.silver, 44], item: [C.white, 40], step: [C.white, 34], good: [C.white, 32], bad: [C.silver, 32] }[role] || [C.white, 40];
    return para(K, str, box, p, { font: sz => K.S.type.body(sz), color: map[0], max: map[1], lh: 1.2, align: o.align || 'left', reveal: 'type', shadow: C.night, shadowX: 3 * u, shadowY: 3 * u });
  },
  panel(K, b, p, s, kind) { win(K, b, p, { border: kind === 'good' ? C.lime : kind === 'bad' ? C.red : C.white, fill: kind === 'good' ? '#1d3b3a' : kind === 'bad' ? '#3a1f33' : '#202a55' }); },
  bullet(K, i, b, p, s) {
    if (p <= 0) return; const { ctx, u } = K, q = PX * u, x = snap(b.x, u), y = snap(b.y + b.h * 0.15, u), n = Math.max(3, Math.round(b.h * 0.7 / q));
    // pixel gem that blinks
    const col = [C.gold, C.cyan, C.lime, C.orange, C.sky][i % 5];
    for (let r = 0; r < n; r++) { const half = Math.round((r < n / 2 ? r + 1 : n - r) * 0.9); ctx.fillStyle = r < n / 2 ? col : L.mix(col, '#000000', 0.3); ctx.fillRect(x + (n / 2 - half) * q, y + r * q, half * 2 * q, q); }
    if ((K.frame >> 4) % 4 === i % 4) { ctx.fillStyle = C.white; ctx.fillRect(x + (n / 2 - 1) * q, y + q, q, q); }
    L.text(ctx, String(i + 1), x + n * q + 6 * u, y + n * q * 0.8, { font: `400 ${Math.max(12, n * q * 0.45)}px "Press Start 2P"`, color: C.white, alpha: L.clamp(p * 2) });
  },
  number(K, str, box, p, s, o = {}) {
    para(K, str, box, p, { font: sz => K.S.type.display(sz), max: o.small ? 110 : 250, min: 20, color: o.small ? C.lime : C.gold, align: 'center', reveal: 'type', shadow: C.plum, shadowX: 10 * K.u, shadowY: 10 * K.u, valign: 'middle' });
    if (!o.small && o.final) { const { ctx, u } = K, q = PX * u; for (let k = 0; k < 6; k++) { const a = K.t * 3 + k, x = snap(box.x + box.w / 2 + Math.cos(a) * box.w * 0.42, u), y = snap(box.y + box.h / 2 + Math.sin(a * 1.3) * box.h * 0.45, u); ctx.fillStyle = C.gold; ctx.fillRect(x, y, q * 2, q * 2); ctx.fillStyle = C.white; ctx.fillRect(x, y, q, q); } }
  },
  quote(K, str, box, p, s) { const b = win(K, box, L.clamp(p * 3), { fill: '#202a55' }); if (b) para(K, '"' + str + '"', L.inset(b, 40 * K.u, 30 * K.u), p, { font: sz => K.S.type.display(sz), max: 80, color: C.white, upper: true, reveal: 'type', lh: 1.15, shadow: C.night, shadowX: 4 * K.u, shadowY: 4 * K.u }); },
  portrait(K, box, p, s) {
    if (p <= 0) return; const { ctx, u } = K, q = PX * u, gh = Math.round(box.h * 0.9 / q), sp = SPRITE(gh);
    const w = sp.width * q, h = sp.height * q, x = snap(box.x + (box.w - w) / 2, u), y0 = snap(box.y + box.h - h, u);
    const hop = p < 1 ? -Math.round(Math.sin(p * Math.PI) * 6) * q : (Math.floor(K.t * 2) % 2 ? 0 : -q); // idle bob in 2 frames
    ctx.imageSmoothingEnabled = false; ctx.save(); ctx.beginPath(); ctx.rect(x - q, y0 + h * (1 - L.E.step(L.clamp(p * 1.3), 8)) + hop - q, w + 2 * q, h + 2 * q); ctx.clip();
    ctx.drawImage(sp, x, y0 + hop, w, h); ctx.restore(); ctx.imageSmoothingEnabled = true;
    // name tag
    if (p > 0.7) { const name = (K.person?.name || 'TÚ').toUpperCase(); ctx.font = `700 ${22 * u}px Silkscreen`; const tw = ctx.measureText(name).width + 24 * u; ctx.fillStyle = C.night; ctx.fillRect(x + w / 2 - tw / 2, y0 - 44 * u + hop, tw, 32 * u); L.text(ctx, name, x + w / 2, y0 - 20 * u + hop, { font: `700 ${22 * u}px Silkscreen`, color: C.gold, align: 'center' }); }
  },
  mascot(K, box, p, s) {
    if (p <= 0) return; const { ctx, u } = K, q = PX * u, gw = Math.round(box.w / q), gh = Math.round(box.h / q), m = MASC(gw, gh, K.spec.mascot);
    const hop = Math.floor(K.t * 3 + 1) % 2 ? 0 : -q; ctx.imageSmoothingEnabled = false; ctx.globalAlpha = L.clamp(p * 3); ctx.drawImage(m, snap(box.x, u), snap(box.y, u) + hop + (1 - L.E.step(p, 4)) * 4 * q, gw * q, gh * q); ctx.globalAlpha = 1; ctx.imageSmoothingEnabled = true;
  },
  media(K, img, box, p, s, frame) {
    if (p <= 0) return; const { ctx, u } = K, r = Math.min(box.w / img.width, (box.h - 30 * u) / img.height), w = img.width * r, h = img.height * r, x = box.x + (box.w - w) / 2, y = box.y + (box.h - h) / 2;
    const b = win(K, { x: x - 18 * u, y: y - 18 * u, w: w + 36 * u, h: h + 36 * u }, L.clamp(p * 2)); if (!b) return;
    const pw = Math.round(w / (2 * u)), ph = Math.round(h / (2 * u)); ctx.imageSmoothingEnabled = false; ctx.globalAlpha = L.clamp(p * 2 - 0.6); ctx.drawImage(PIXIMG(s.d.src, pw, ph), b.x + 18 * u, b.y + 18 * u, b.w - 36 * u, (b.h - 36 * u)); ctx.globalAlpha = 1; ctx.imageSmoothingEnabled = true;
    L.text(ctx, '★ OBJETO OBTENIDO', b.x, b.y + b.h + 34 * u, { font: `700 ${22 * u}px Silkscreen`, color: C.gold, alpha: L.clamp(p * 2 - 1) });
  },
  prompt(K, str, box, p, s, tp) {
    const b = win(K, box, p); if (!b) return; const u = K.u;
    para(K, '▶ ' + str.slice(0, Math.ceil(str.length * tp)) + (tp < 1 || (K.frame >> 3) % 2 ? '_' : ''), L.inset(b, 22 * u, 14 * u), 1, { font: sz => `700 ${sz}px Silkscreen`, max: 30, lh: 1.3, color: C.white, valign: 'middle' });
  },
  caption(K, words, act, box, p) { // RPG dialogue box, text advances with the narration
    const { ctx, u } = K, b = win(K, { x: box.x, y: box.y - 10 * u, w: box.w, h: box.h + 20 * u }, 1, { fill: C.night, shine: false }); if (!b) return;
    const shown = words.slice(0, Math.max(0, act + 1)).join(' '), full = words.join(' ');
    ctx.font = `700 ${32 * u}px Silkscreen`; const fw = ctx.measureText(full).width, x = b.x + (b.w - fw) / 2;
    L.text(ctx, shown, x, b.y + b.h * 0.64, { font: `700 ${32 * u}px Silkscreen`, color: C.white });
    if (act >= words.length - 1 && (K.frame >> 3) % 2) L.text(ctx, '▼', b.x + b.w - 30 * u, b.y + b.h - 10 * u, { font: `400 ${16 * u}px "Press Start 2P"`, color: C.gold });
  },
  connector(K, a, b, p) { if (p <= 0) return; const { ctx, u } = K, q = PX * u, n = Math.floor(Math.hypot(b[0] - a[0], b[1] - a[1]) / (q * 3) * p); ctx.fillStyle = C.silver; for (let k = 1; k < n; k++) { const t = k / (Math.hypot(b[0] - a[0], b[1] - a[1]) / (q * 3)); ctx.fillRect(snap(a[0] + (b[0] - a[0]) * t, u), snap(a[1] + (b[1] - a[1]) * t, u), q, q); } },
  button(K, str, b, p) {
    const bb = win(K, b, p, { border: C.gold, fill: C.red }); if (!bb) return;
    para(K, ((K.frame >> 3) % 2 ? '▶ ' : '  ') + str, L.inset(bb, 20 * K.u, 10 * K.u), 1, { font: sz => `700 ${sz}px Silkscreen`, max: 30, color: C.white, align: 'center', upper: true });
  },
  transition(K, A, B, p, info) { // mosaic: A pixelates up, B resolves down
    const { ctx, W, H } = K, r = info.raw, src = r < 0.5 ? A : B, k = r < 0.5 ? r * 2 : (1 - r) * 2, bs = Math.max(1, Math.round(1 + L.E.in(k) * 48));
    const w = Math.max(2, Math.round(W / bs)), h = Math.max(2, Math.round(H / bs)), mx = mos.getContext('2d');
    mx.imageSmoothingEnabled = true; mx.clearRect(0, 0, W, H); mx.drawImage(src, 0, 0, w, h);
    ctx.imageSmoothingEnabled = false; ctx.drawImage(mos, 0, 0, w, h, 0, 0, W, H); ctx.imageSmoothingEnabled = true;
  },
  overlay(K) { const { ctx, W, H } = K; ctx.fillStyle = 'rgba(0,0,0,.06)'; for (let y = 0; y < H; y += 3 * K.u) ctx.fillRect(0, y, W, K.u); },
};
