// Cartografía antigua — pergamino con curvas de nivel, retícula de meridianos, rosa de los vientos y rutas punteadas en rojo;
// la persona aparece grabada en sepia dentro de un cartucho ovalado, como el retrato de un explorador.
import * as L from '../engine/lib.js';
import { BASE, title, para, fitSubject, drawFrame } from '../engine/base.js';

const INK = '#3B2A1A', RED = '#9B2F1F', PARCH = '#E9D9B3', SEA = '#6F958D', SEPIA = '#5A3E22';
const maps = {};
let grain;
const SEPIA_ENGRAVED = L.memo(h => {
  const S = window.K.subject(h), Lb = L.blurL(S.L, S.w, S.h, 1), c = L.canvas(S.w, S.h);
  for (let i = 0; i < Lb.length; i++) Lb[i] = L.clamp((Lb[i] - 0.04) * 1.75);
  L.engrave(c.getContext('2d'), Lb, S.A, S.w, S.h, 0, 0, { step: Math.max(4, h / 145), maxW: Math.max(3.4, h / 165), color: SEPIA, wave: 3, freq: 0.025, angle: 0.5 });
  return c;
});
// marching squares contour lines of a noise field
function contours(ctx, W, H, seed, { cell = 14, levels = 9, scale = 380, color = 'rgba(90,60,30,.35)', width = 1, land = null } = {}) {
  const n = L.noise2(seed), cols = Math.ceil(W / cell) + 1, rows = Math.ceil(H / cell) + 1, v = new Float32Array(cols * rows);
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) { const x = i * cell, y = j * cell; v[j * cols + i] = n(x / scale, y / scale) * 0.7 + n(x / (scale / 3), y / (scale / 3)) * 0.3; }
  if (land) { // fill "sea" below a level
    ctx.save(); ctx.fillStyle = land; for (let j = 0; j < rows - 1; j++) for (let i = 0; i < cols - 1; i++) if (v[j * cols + i] < 0.36) ctx.fillRect(i * cell, j * cell, cell + 1, cell + 1); ctx.restore();
  }
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = width; ctx.beginPath();
  for (let lv = 1; lv <= levels; lv++) {
    const t = 0.25 + lv * 0.055;
    for (let j = 0; j < rows - 1; j++) for (let i = 0; i < cols - 1; i++) {
      const a = v[j * cols + i], b = v[j * cols + i + 1], c = v[(j + 1) * cols + i + 1], d = v[(j + 1) * cols + i];
      const x = i * cell, y = j * cell, pts = [];
      const e = (p, q, x1, y1, x2, y2) => { if ((p < t) !== (q < t)) { const k = (t - p) / (q - p); pts.push([x1 + (x2 - x1) * k, y1 + (y2 - y1) * k]); } };
      e(a, b, x, y, x + cell, y); e(b, c, x + cell, y, x + cell, y + cell); e(d, c, x, y + cell, x + cell, y + cell); e(a, d, x, y, x, y + cell);
      if (pts.length >= 2) { ctx.moveTo(...pts[0]); ctx.lineTo(...pts[1]); } if (pts.length === 4) { ctx.moveTo(...pts[2]); ctx.lineTo(...pts[3]); }
    }
  }
  ctx.stroke(); ctx.restore();
}
function rose(ctx, x, y, r, rot, u) {
  ctx.save(); ctx.translate(x, y); ctx.strokeStyle = INK; ctx.lineWidth = 1 * u;
  ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.arc(0, 0, r * 0.86, 0, 7); ctx.stroke();
  for (let k = 0; k < 32; k++) { const a = k / 32 * Math.PI * 2, l = k % 4 === 0 ? 0.14 : 0.07; ctx.beginPath(); ctx.moveTo(Math.cos(a) * r * 0.86, Math.sin(a) * r * 0.86); ctx.lineTo(Math.cos(a) * r * (0.86 - l), Math.sin(a) * r * (0.86 - l)); ctx.stroke(); }
  ctx.rotate(rot);
  for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4 - Math.PI / 2, big = k % 2 === 0, L1 = r * (big ? 0.8 : 0.5), w = r * (big ? 0.13 : 0.09);
    for (const side of [-1, 1]) { ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * L1, Math.sin(a) * L1); ctx.lineTo(Math.cos(a + side * Math.PI / 2) * w, Math.sin(a + side * Math.PI / 2) * w); ctx.closePath(); ctx.fillStyle = side > 0 ? (k === 0 ? RED : INK) : PARCH; ctx.fill(); ctx.stroke(); } }
  ctx.rotate(-rot); ctx.font = `600 ${r * 0.24}px Cinzel`; ctx.fillStyle = INK; ctx.textAlign = 'center'; ctx.fillText('N', 0, -r * 1.06);
  ctx.restore();
}
const below = (K, b) => { const m = (K.vertical ? 120 : 96) * K.u; return b.y < m ? { ...b, y: m, h: Math.max(b.h - (m - b.y), b.h * 0.65) } : b; };
// a wiggly red dotted route between two points
function route(ctx, a, b, p, seed, u) {
  const r = L.rng(seed), m1 = [L.lerp(a[0], b[0], 0.33) + (r() - 0.5) * 60 * u, L.lerp(a[1], b[1], 0.33) - 40 * u], m2 = [L.lerp(a[0], b[0], 0.66) + (r() - 0.5) * 60 * u, L.lerp(a[1], b[1], 0.66) + 40 * u];
  const pts = []; for (let k = 0; k <= 60 * p; k++) { const t = k / 60, it = 1 - t; pts.push([it ** 3 * a[0] + 3 * it * it * t * m1[0] + 3 * it * t * t * m2[0] + t ** 3 * b[0], it ** 3 * a[1] + 3 * it * it * t * m1[1] + 3 * it * t * t * m2[1] + t ** 3 * b[1]]); }
  if (pts.length < 2) return; ctx.save(); ctx.strokeStyle = RED; ctx.lineWidth = 2.4 * u; ctx.setLineDash([9 * u, 7 * u]); ctx.lineCap = 'round'; ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke(); ctx.restore();
}

export default {
  id: 'cartografia', name: 'Cartografía antigua',
  fonts: 'Cinzel:wght@500;600;700&family=IM+Fell+English:ital@0;1',
  fontLoads: ['600 80px Cinzel', '700 40px Cinzel', '500 40px Cinzel', '400 40px "IM Fell English"', 'italic 400 40px "IM Fell English"'],
  palette: { bg: PARCH, ink: INK, accent: RED, muted: '#6A5236', panel: '#EFE2C2', line: 'rgba(59,42,26,.35)', good: '#4F6B3A', bad: '#7A6248', mascot: '#C9A36B' },
  type: { display: s => `600 ${s}px Cinzel`, em: s => `italic 400 ${s * 1.12}px "IM Fell English"`, body: s => `400 ${s}px "IM Fell English"`, bodyEm: s => `italic 400 ${s}px "IM Fell English"`, label: s => `700 ${s}px Cinzel`, mono: s => `italic 400 ${s}px "IM Fell English"` },
  lh: 1.06, ls: 0.02,
  sfx: 'paper', transDur: 0.85, push: 0.03,
  music: 'adventurous orchestral folk, hand drums, fiddle and hammered dulcimer, sense of journey and discovery, warm strings, 100 BPM, instrumental, old world explorer mood',
  async setup(K) {
    const { W, H, u } = K;
    for (let v = 0; v < 3; v++) {
      const c = L.canvas(W, H), x = c.getContext('2d');
      L.paper(x, PARCH, { seed: 40 + v, grain: 0.06, blotch: 0.14, fibers: 700 });
      contours(x, W, H, 70 + v * 13, { cell: 12 * u, levels: 10, scale: 420 * u, color: 'rgba(96,66,34,.3)', width: 1 * u, land: 'rgba(111,149,141,.11)' });
      // meridians / parallels
      x.save(); x.strokeStyle = 'rgba(59,42,26,.22)'; x.lineWidth = 1 * u; x.setLineDash([3 * u, 6 * u]);
      const st = 240 * u; for (let k = st / 2; k < W; k += st) { x.beginPath(); x.moveTo(k, 0); x.lineTo(k + 40 * u, H); x.stroke(); } for (let k = st / 2; k < H; k += st) { x.beginPath(); x.moveTo(0, k); x.quadraticCurveTo(W / 2, k - 30 * u, W, k); x.stroke(); }
      x.restore();
      // aging: burnt edges
      const g = x.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.3, W / 2, H / 2, Math.max(W, H) * 0.72); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.8, 'rgba(120,80,30,.18)'); g.addColorStop(1, 'rgba(70,40,10,.5)'); x.fillStyle = g; x.fillRect(0, 0, W, H);
      // double border with degree ticks
      x.strokeStyle = INK; x.lineWidth = 2.5 * u; x.strokeRect(26 * u, 26 * u, W - 52 * u, H - 52 * u); x.lineWidth = 1 * u; x.strokeRect(36 * u, 36 * u, W - 72 * u, H - 72 * u);
      x.fillStyle = INK; for (let k = 36 * u; k < W - 36 * u; k += 40 * u) if (Math.round(k / (40 * u)) % 2) { x.fillRect(k, 26 * u, 40 * u, 10 * u); x.fillRect(k, H - 36 * u, 40 * u, 10 * u); }
      for (let k = 36 * u; k < H - 36 * u; k += 40 * u) if (Math.round(k / (40 * u)) % 2) { x.fillRect(26 * u, k, 10 * u, 40 * u); x.fillRect(W - 36 * u, k, 10 * u, 40 * u); }
      maps[v] = c;
    }
    grain = L.grainTiles(4, 256, 0.5, 44);
  },
  background(K, s) {
    const { ctx, W, H, u, t } = K; ctx.drawImage(maps[s.i % 3], 0, 0);
    const r = (K.vertical ? 80 : 90) * u, cx = W - (K.vertical ? 130 : 160) * u, cy = K.vertical ? H * 0.74 : H - 230 * u;
    if (!['hook', 'cta', 'quote'].includes(s.type) || K.vertical) rose(ctx, K.vertical ? 130 * u : cx, K.vertical ? H - 330 * u : cy, r, Math.sin(t * 0.8 + s.i) * 0.06, u);
  },
  headline(K, str, box, p, s, o = {}) { title(K, str, below(K, box), p, { align: o.align, size: o.size, color: INK, emColor: RED, reveal: 'wipe', valign: 'middle' }); },
  text(K, str, box, p, role, s, o = {}) {
    box = below(K, box);
    if (role === 'kicker' || role === 'label') return para(K, str, box, p, { font: sz => K.S.type.label(sz), color: RED, upper: true, ls: 0.22, max: 24, align: o.align || 'left' });
    if (role === 'headBad' || role === 'headGood') return title(K, str, box, p, { color: role === 'headGood' ? '#4F6B3A' : INK, max: 60, reveal: 'wipe', valign: 'top' });
    return BASE.text(K, str, box, p, role, s, { color: role === 'bad' ? '#7A6248' : role === 'body' ? '#4E3A24' : INK, max: role === 'item' ? 48 : 44, ...o });
  },
  panel(K, b, p, s, kind, j = 0) { // cartouche label with notched corners
    if (p <= 0) return; const { ctx, u } = K, e = L.E.out(p), n = 14 * u; ctx.save(); ctx.globalAlpha = L.clamp(p * 1.4);
    ctx.translate(0, (1 - e) * 16 * u);
    const path = new Path2D(); path.moveTo(b.x + n, b.y); path.lineTo(b.x + b.w - n, b.y); path.lineTo(b.x + b.w, b.y + n); path.lineTo(b.x + b.w, b.y + b.h - n); path.lineTo(b.x + b.w - n, b.y + b.h); path.lineTo(b.x + n, b.y + b.h); path.lineTo(b.x, b.y + b.h - n); path.lineTo(b.x, b.y + n); path.closePath();
    ctx.fillStyle = kind === 'good' ? 'rgba(239,226,194,.94)' : kind === 'bad' ? 'rgba(226,210,178,.9)' : 'rgba(239,226,194,.82)'; ctx.fill(path);
    ctx.strokeStyle = kind === 'good' ? RED : INK; ctx.lineWidth = 1.6 * u; ctx.stroke(path);
    if (kind !== 'row') { ctx.lineWidth = 0.8 * u; ctx.strokeRect(b.x + 8 * u, b.y + 8 * u, b.w - 16 * u, b.h - 16 * u); }
    ctx.restore();
  },
  bullet(K, i, b, p) { // numbered waypoint pin
    if (p <= 0) return; const { ctx, u } = K, [cx, cy] = L.center(b), r = Math.min(b.w, b.h) * 0.4, e = L.E.back(p);
    ctx.save(); ctx.translate(cx, cy); ctx.scale(e, e); ctx.fillStyle = RED; ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 1.4 * u; ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, r * 1.25, 0, 7); ctx.setLineDash([3 * u, 4 * u]); ctx.stroke(); ctx.setLineDash([]);
    L.text(ctx, String(i + 1), 0, r * 0.36, { font: K.S.type.label(r * 1.0), color: PARCH, align: 'center' }); ctx.restore();
  },
  number(K, str, box, p, s, o) { title(K, str, box, p, { align: 'center', color: o?.small ? RED : INK, reveal: 'wipe', max: o?.small ? 120 : 260 }); },
  quote(K, str, box, p) { title(K, '“' + str + '”', below(K, box), p, { size: 'm', max: 90, color: INK, reveal: 'wipe', font: sz => K.S.type.em(sz) }); },
  portrait(K, box, p, s) {
    if (p <= 0) return; const { ctx, u } = K, f = fitSubject(K, { ...box, y: box.y + box.h * 0.1, h: box.h * 0.9 }), img = SEPIA_ENGRAVED(f.subj.h);
    const cx = f.x + f.w / 2, cy = f.y + f.h * 0.46, rx = Math.min(f.w * 0.5, box.w * 0.47), ry = f.h * 0.52, e = L.E.out(p);
    ctx.save(); ctx.globalAlpha = L.clamp(p * 1.4);
    // cartouche oval
    ctx.fillStyle = 'rgba(239,226,194,.7)'; ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, 7); ctx.fill();
    ctx.save(); ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, 7); ctx.clip(); ctx.drawImage(img, f.x, f.y + (1 - e) * 40 * u); ctx.restore();
    ctx.strokeStyle = INK; ctx.lineWidth = 3 * u; ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * L.E.inOut(p)); ctx.stroke();
    ctx.lineWidth = 1 * u; ctx.beginPath(); ctx.ellipse(cx, cy, rx + 10 * u, ry + 10 * u, 0, 0, Math.PI * 2 * L.E.inOut(p)); ctx.stroke();
    // ribbon label
    const ly = Math.min(cy + ry + 6 * u, K.H - 70 * u), lw = rx * 1.2; ctx.globalAlpha = L.clamp(p * 2 - 1);
    ctx.fillStyle = PARCH; ctx.strokeStyle = INK; ctx.lineWidth = 1.4 * u; ctx.beginPath(); ctx.moveTo(cx - lw / 2 - 20 * u, ly - 18 * u); ctx.lineTo(cx + lw / 2 + 20 * u, ly - 18 * u); ctx.lineTo(cx + lw / 2 + 4 * u, ly); ctx.lineTo(cx + lw / 2 + 20 * u, ly + 18 * u); ctx.lineTo(cx - lw / 2 - 20 * u, ly + 18 * u); ctx.lineTo(cx - lw / 2 - 4 * u, ly); ctx.closePath(); ctx.fill(); ctx.stroke();
    const nm = K.person?.name ? K.person.name.toUpperCase() : 'N 19°25′ · O 99°08′'; L.text(ctx, nm, cx, ly + 7 * u, { font: K.S.type.label(18 * u), color: INK, align: 'center', ls: 3 * u });
    ctx.restore();
  },
  mascot(K, box, p, s) {
    if (p <= 0) return; const ctx = K.ctx, u = K.u; ctx.save(); ctx.globalAlpha = L.clamp(p * 1.6);
    const b = { ...box, y: box.y + (1 - L.E.back(p)) * 24 * u };
    L.mascot(ctx, K.spec.mascot, b, { fill: (path) => { ctx.fillStyle = '#C9A36B'; ctx.fill(path); ctx.save(); ctx.clip(path); ctx.strokeStyle = 'rgba(59,42,26,.45)'; ctx.lineWidth = 1; for (let k = -300; k < 400; k += 7) { ctx.beginPath(); ctx.moveTo(k, -60); ctx.lineTo(k - 160, 240); ctx.stroke(); } ctx.restore(); }, stroke: (path) => { ctx.strokeStyle = INK; ctx.lineWidth = 2.4; ctx.stroke(path); }, ink: INK, eye: INK });
    ctx.restore();
  },
  media(K, img, box, p, s, frame) { // pinned plate
    if (p <= 0) return; const { ctx, u } = K; box = below(K, box); box = { ...box, h: box.h - 20 * u };
    const [cx, cy] = L.center(box); ctx.save(); ctx.translate(cx, cy); ctx.rotate(0.02 - (1 - L.E.out(p)) * 0.06); ctx.translate(-cx, -cy);
    const o = drawFrame(K, img, box, p, frame, { bezel: '#2B1F12', shadowColor: 'rgba(60,40,15,.4)', filter: (c, b) => { c.globalCompositeOperation = 'multiply'; c.fillStyle = 'rgba(200,160,100,.35)'; c.fillRect(b.x, b.y, b.w, b.h); } });
    ctx.globalAlpha = L.clamp(p * 2 - 1); ctx.fillStyle = RED; ctx.beginPath(); ctx.arc(o.x + o.w / 2, o.y - 4 * u, 9 * u, 0, 7); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 1.2 * u; ctx.stroke();
    ctx.restore();
  },
  prompt(K, str, box, p, s, tp) {
    if (p <= 0) return; const { ctx, u } = K; K.S.panel(K, box, p, s, 'note');
    para(K, '“' + str.slice(0, Math.ceil(str.length * tp)) + (tp < 1 ? '' : '”'), L.inset(box, 24 * u, 14 * u), 1, { font: sz => K.S.type.bodyEm(sz), color: INK, max: 34, valign: 'middle' });
  },
  caption(K, words, act, box, p) { // scroll banner
    const { ctx, u } = K; ctx.save(); ctx.globalAlpha = p; ctx.font = K.S.type.body(34 * u);
    const w = ctx.measureText(words.join(' ')).width + 90 * u, x = box.x + (box.w - w) / 2, y = box.y, h = box.h;
    ctx.fillStyle = 'rgba(239,226,194,.95)'; ctx.strokeStyle = INK; ctx.lineWidth = 1.4 * u;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w - 16 * u, y + h / 2); ctx.lineTo(x + w, y + h); ctx.lineTo(x, y + h); ctx.lineTo(x + 16 * u, y + h / 2); ctx.closePath(); ctx.fill(); ctx.stroke();
    let cx = x + 45 * u; words.forEach((wd, i) => { ctx.fillStyle = i === act ? RED : i < act ? INK : 'rgba(59,42,26,.45)'; ctx.fillText(wd, cx, y + h * 0.66); cx += ctx.measureText(wd + ' ').width; });
    ctx.restore();
  },
  connector(K, a, b, p, s) { route(K.ctx, a, b, p, 7 + (s?.i || 0), K.u); },
  button(K, str, b, p) {
    if (p <= 0) return; const { ctx, u } = K, [cx, cy] = L.center(b); ctx.save(); ctx.translate(cx, cy); const sc = 0.9 + 0.1 * L.E.back(p); ctx.scale(sc, sc); ctx.translate(-cx, -cy); ctx.globalAlpha = L.clamp(p * 1.5);
    ctx.fillStyle = RED; ctx.fillRect(b.x, b.y, b.w, b.h); ctx.strokeStyle = PARCH; ctx.lineWidth = 1.2 * u; ctx.strokeRect(b.x + 6 * u, b.y + 6 * u, b.w - 12 * u, b.h - 12 * u);
    para(K, str, L.inset(b, b.h * 0.3, b.h * 0.2), 1, { font: sz => K.S.type.label(sz), color: PARCH, upper: true, ls: 0.12, max: 30, align: 'center' }); ctx.restore();
  },
  transition(K, A, B, p, info) { // pan across the map; a red route is traced from the old place to the new one
    const { ctx, W, H, u } = K, e = L.E.inOut(info.raw);
    ctx.drawImage(A, -e * W, 0); ctx.drawImage(B, (1 - e) * W, 0);
    const a = [W * 0.2 - e * W, H * 0.62], b = [W * 1.8 - e * W, H * 0.4]; route(ctx, a, b, L.clamp(info.raw * 1.3), 99, u);
    ctx.fillStyle = RED; ctx.beginPath(); ctx.arc(a[0], a[1], 8 * u, 0, 7); ctx.fill();
  },
  overlay(K) { L.drawGrain(K.ctx, grain, K.frame, 0.06, 'multiply'); },
};
