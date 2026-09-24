// Risografía / zine — dos tintas (rosa fluorescente + azul) que se multiplican y no registran perfecto, semitono, amarillo, papel de fotocopia.
import * as L from '../engine/lib.js';
import { BASE, title, para, layoutRich, drawRich, fitSubject, drawFrame } from '../engine/base.js';

const PINK = '#FF48B0', BLUE = '#0078BF', YEL = '#FFE800', BLK = '#1A1A1A', PAPER = '#F4F0E6';
let paperC, backs = [], grain, dots;
const jit = K => { const r = L.rng(Math.floor(K.t * 4) + 3); return [(r() - 0.5) * 3 * K.u, (r() - 0.5) * 3 * K.u]; }; // drum wobble, 4 fps
const mult = (ctx, fn) => { ctx.save(); ctx.globalCompositeOperation = 'multiply'; fn(); ctx.restore(); };
const star = (ctx, x, y, r, col) => { ctx.fillStyle = col; L.star(ctx, x, y, r, 5, 0.42); ctx.fill(); };
const HALF = L.memo(h => { // pink + blue halftone of the person, misregistered
  const S = window.K.subject(h), c = L.canvas(S.w + 20, S.h + 20), x = c.getContext('2d'), Lb = L.blurL(S.L, S.w, S.h, 1);
  for (let i = 0; i < Lb.length; i++) Lb[i] = L.clamp((Lb[i] - 0.06) * 2.3);
  const cell = Math.max(5, Math.round(h / 125));
  L.halftone(x, Lb, S.A, S.w, S.h, 10, 18, { cell, angle: 1.3, color: PINK, gamma: 3.2 });
  x.globalCompositeOperation = 'multiply'; L.halftone(x, Lb, S.A, S.w, S.h, 2, 10, { cell, angle: 0.26, color: BLUE, gamma: 1.3, maxR: cell * 0.58 });
  return c;
});

export default {
  id: 'riso', name: 'Risografía / zine',
  fonts: 'Archivo+Black&family=Space+Mono:wght@400;700&family=Permanent+Marker',
  fontLoads: ['400 100px "Archivo Black"', '700 30px "Space Mono"', '400 30px "Space Mono"', '400 40px "Permanent Marker"'],
  palette: { bg: PAPER, ink: BLK, accent: PINK, muted: '#4A4A4A', panel: PAPER, line: 'rgba(0,0,0,.2)', good: BLUE, bad: PINK, mascot: PINK },
  type: { display: s => `400 ${s}px "Archivo Black"`, body: s => `400 ${s}px "Space Mono"`, bodyEm: s => `700 ${s}px "Space Mono"`, label: s => `700 ${s}px "Space Mono"`, mono: s => `700 ${s}px "Space Mono"`, hand: s => `400 ${s}px "Permanent Marker"` },
  upper: true, lh: 0.98, ls: -0.01,
  sfx: 'mechanical', transDur: 0.6, push: 0.02,
  music: 'lo-fi indie punk instrumental, fuzzy bass, garage drums, bright chorus guitar, zine DIY energy, 122 BPM, instrumental, playful but cool',
  async setup(K) {
    const { W, H, u } = K; grain = L.grainTiles(4, 256, 0.7, 5);
    paperC = L.canvas(W, H); L.paper(paperC.getContext('2d'), PAPER, { seed: 12, grain: 0.07, blotch: 0.03, fibers: 400 });
    dots = L.canvas(24, 24); { const x = dots.getContext('2d'); x.fillStyle = BLUE; x.beginPath(); x.arc(6, 6, 3, 0, 7); x.arc(18, 18, 3, 0, 7); x.fill(); }
    const V = K.vertical;
    [0, 1, 2].forEach(v => {
      const c = L.canvas(W, H), x = c.getContext('2d'); x.drawImage(paperC, 0, 0); x.globalCompositeOperation = 'multiply';
      if (v === 0) { x.fillStyle = YEL; x.fillRect(W * (V ? 0.55 : 0.78), 0, W * 0.5, H * 0.34); x.globalAlpha = 0.5; x.fillStyle = x.createPattern(dots, 'repeat'); x.fillRect(0, H * (V ? 0.84 : 0.78), W * 0.45, H); }
      if (v === 1) { x.fillStyle = PINK; x.globalAlpha = 0.35; x.beginPath(); x.arc(W * 0.08, H * 0.12, Math.min(W, H) * 0.22, 0, 7); x.fill(); x.globalAlpha = 0.45; x.fillStyle = x.createPattern(dots, 'repeat'); x.fillRect(W * 0.7, H * 0.7, W * 0.4, H * 0.4); }
      if (v === 2) { x.fillStyle = YEL; x.fillRect(0, H * 0.66, W, H * 0.4); x.fillStyle = PINK; x.globalAlpha = 0.25; x.fillRect(W * 0.86, 0, W * 0.2, H); }
      x.globalAlpha = 1; const r = L.rng(v + 4);
      for (let k = 0; k < 5; k++) star(x, W * (k % 2 ? 0.965 : 0.03) + (r() - 0.5) * 30 * u, H * (0.2 + r() * 0.5), (10 + r() * 10) * u, k % 2 ? PINK : BLUE);
      backs.push(c);
    });
  },
  background(K, s) { K.ctx.drawImage(backs[s.i % 3], 0, 0); },
  headline(K, str, box, p, s, o = {}) { // two passes: pink drum then blue drum, slightly off register
    const ctx = K.ctx, [jx, jy] = jit(K), R = layoutRich(ctx, K.rich(str), box, { font: sz => K.S.type.display(sz), max: (o.size === 'm' ? 120 : 190) * K.u, min: 18 * K.u, lh: 0.98, ls: -0.01, upper: true });
    const off = R.size * 0.05;
    mult(ctx, () => { ctx.translate(off + jx, off * 0.8 + jy); drawRich(K, R, box, L.clamp(p * 1.15), { align: o.align, color: PINK, emColor: YEL, reveal: 'wipe' }); });
    mult(ctx, () => drawRich(K, R, box, p, { align: o.align, color: BLUE, emColor: PINK, reveal: 'wipe' }));
  },
  text(K, str, box, p, role, s, o = {}) {
    if (role === 'kicker' || role === 'label') return para(K, str, box, p, { font: sz => K.S.type.mono(sz), color: BLK, upper: true, ls: 0.06, max: 34, align: o.align || 'left', reveal: 'type' });
    if (role === 'headGood' || role === 'headBad') return mult(K.ctx, () => title(K, str, box, p, { color: role === 'headGood' ? BLUE : PINK, max: 64, upper: true, reveal: 'wipe', valign: 'top' }));
    return BASE.text(K, str, box, p, role, s, { color: role === 'bad' ? '#6A6660' : BLK, ...o });
  },
  panel(K, b, p, s, kind, j = 0) {
    if (p <= 0) return; const ctx = K.ctx, u = K.u, w = b.w * L.E.inOut(p), [jx, jy] = jit(K);
    mult(ctx, () => {
      ctx.fillStyle = kind === 'good' ? '#BFE0F2' : kind === 'bad' ? '#FFD0E8' : j % 2 ? '#FFF6A8' : '#E6F0F7'; ctx.fillRect(b.x, b.y, w, b.h);
      ctx.strokeStyle = j % 2 || kind === 'bad' ? PINK : BLUE; ctx.lineWidth = 3 * u; ctx.strokeRect(b.x + 6 * u + jx, b.y + 5 * u + jy, w, b.h);
    });
  },
  bullet(K, i, b, p) {
    if (p <= 0) return; const ctx = K.ctx, [cx, cy] = L.center(b), r = Math.min(b.w, b.h) / 2 * L.E.back(p);
    mult(ctx, () => { ctx.fillStyle = i % 2 ? BLUE : PINK; ctx.beginPath(); ctx.arc(cx + 4 * K.u, cy + 3 * K.u, r, 0, 7); ctx.fill(); });
    L.text(ctx, String(i + 1), cx, cy + r * 0.38, { font: K.S.type.display(r * 1.05), color: i % 2 ? PAPER : BLK, align: 'center', alpha: L.clamp(p * 2 - 0.5) });
  },
  number(K, str, box, p, s, o = {}) {
    const ctx = K.ctx, R = layoutRich(ctx, K.rich(str), box, { font: sz => K.S.type.display(sz), max: (o.small ? 140 : 300) * K.u, min: 20 * K.u, lh: 1 }), off = R.size * 0.05, [jx, jy] = jit(K);
    mult(ctx, () => { ctx.translate(off + jx, off + jy); drawRich(K, R, box, L.clamp(p * 1.2), { align: 'center', color: PINK, reveal: 'wipe' }); });
    mult(ctx, () => drawRich(K, R, box, p, { align: 'center', color: BLUE, reveal: 'wipe' }));
  },
  quote(K, str, box, p) { mult(K.ctx, () => title(K, '“' + str + '”', box, p, { size: 'm', max: 96, color: BLUE, emColor: PINK, upper: false, reveal: 'wipe' })); },
  portrait(K, box, p, s) { // halftone print on a yellow plate, prints bottom→top
    if (p <= 0) return; const ctx = K.ctx, u = K.u, f = fitSubject(K, { ...box, h: box.h * 0.9 }), img = HALF(f.subj.h), e = L.E.inOut(L.clamp(p * 1.2));
    const blk = { x: box.x + box.w * 0.05, y: box.y + box.h * 0.1, w: box.w * 0.9, h: box.h * 0.9 };
    mult(ctx, () => {
      ctx.fillStyle = YEL; ctx.fillRect(blk.x, blk.y + blk.h * (1 - e), blk.w, blk.h * e);
      ctx.fillStyle = PINK; ctx.globalAlpha = 0.7; ctx.beginPath(); ctx.arc(blk.x + blk.w / 2, blk.y + blk.h * 0.34, blk.w * 0.36 * e, 0, 7); ctx.fill(); ctx.globalAlpha = 1;
      ctx.beginPath(); ctx.rect(blk.x - 20 * u, blk.y + blk.h * (1 - e), blk.w + 40 * u, blk.h * e); ctx.clip(); ctx.drawImage(img, f.x - 10, f.y + box.h * 0.1 - 18);
    });
  },
  mascot(K, box, p, s, mood) {
    if (p <= 0) return; const ctx = K.ctx, e = L.E.back(p), [cx, cy] = [box.x + box.w / 2, box.y + box.h];
    ctx.save(); ctx.translate(cx, cy); ctx.scale(e, e); ctx.rotate(Math.sin(K.t * 2) * 0.03); ctx.translate(-cx, -cy);
    mult(ctx, () => L.mascot(ctx, K.spec.mascot, { ...box, x: box.x + 5 * K.u, y: box.y + 4 * K.u }, { color: PINK, outline: false, eye: PINK }));
    mult(ctx, () => L.mascot(ctx, K.spec.mascot, box, { fill: () => {}, ink: BLUE, eye: BLUE, eyeStyle: mood === 'happy' ? 'happy' : 'square' }));
    ctx.restore();
  },
  media(K, img, box, p, s, frame) {
    if (p <= 0) return; const ctx = K.ctx, u = K.u;
    const o = drawFrame(K, img, box, p, frame, { shadow: false, bezel: BLK, stroke: BLK, strokeW: 3 * u });
    mult(ctx, () => { ctx.globalAlpha = L.clamp(p * 2 - 1) * 0.9; ctx.fillStyle = PINK; ctx.fillRect(o.x + 16 * u, o.y + o.h + 4 * u, o.w, 12 * u); ctx.fillRect(o.x + o.w + 4 * u, o.y + 16 * u, 12 * u, o.h); });
  },
  prompt(K, str, box, p, s, tp) {
    if (p <= 0) return; const ctx = K.ctx, u = K.u; ctx.save(); ctx.translate(box.x, box.y + box.h / 2); ctx.rotate(-0.015); ctx.fillStyle = BLK; ctx.fillRect(0, -box.h / 2, box.w * L.E.out(p), box.h); ctx.restore();
    para(K, '> ' + str.slice(0, Math.ceil(str.length * tp)) + (tp < 1 || (K.frame >> 3) % 2 ? '█' : ''), L.inset(box, 24 * u, 12 * u), 1, { font: sz => K.S.type.mono(sz), color: PAPER, max: 32, valign: 'middle' });
  },
  caption(K, words, act, box, p) {
    const ctx = K.ctx, u = K.u; ctx.save(); ctx.globalAlpha = p; ctx.font = K.S.type.mono(32 * u);
    const w = Math.min(box.w, ctx.measureText(words.join(' ')).width + 60 * u), x = box.x + (box.w - w) / 2;
    ctx.fillStyle = BLK; ctx.fillRect(x, box.y, w, box.h);
    let cx = x + 30 * u; const y = box.y + box.h * 0.64;
    words.forEach((wd, i) => { const ww = ctx.measureText(wd).width; if (i === act) { ctx.fillStyle = YEL; ctx.fillRect(cx - 5 * u, box.y + box.h * 0.2, ww + 10 * u, box.h * 0.6); } ctx.fillStyle = i === act ? BLK : i < act ? PAPER : '#8C8880'; ctx.fillText(wd, cx, y); cx += ctx.measureText(wd + ' ').width; });
    ctx.restore();
  },
  connector(K, a, b, p) { if (p <= 0) return; const ctx = K.ctx; ctx.fillStyle = BLUE; const n = 14; for (let k = 0; k <= n * p; k++) { const t = k / n; ctx.beginPath(); ctx.arc(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, 4 * K.u, 0, 7); ctx.fill(); } },
  button(K, str, b, p) {
    if (p <= 0) return; const ctx = K.ctx, u = K.u; mult(ctx, () => { ctx.fillStyle = PINK; ctx.fillRect(b.x + 7 * u, b.y + 6 * u, b.w * L.E.out(p), b.h); ctx.fillStyle = YEL; ctx.fillRect(b.x, b.y, b.w * L.E.out(p), b.h); });
    para(K, str, L.inset(b, b.h * 0.3, b.h * 0.2), L.clamp(p * 2 - 0.6), { font: sz => K.S.type.display(sz), color: BLUE, upper: true, max: 38, align: 'center' });
  },
  transition(K, A, B, p, info) { // a print pass rolls down: new sheet appears under the roller, ink layers catching up
    const { ctx, W, H, u } = K, y = H * L.E.inOut(info.raw) * 1.08, band = 110 * u; ctx.drawImage(A, 0, 0);
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, Math.max(0, y - band)); ctx.clip(); ctx.drawImage(B, 0, 0); ctx.restore();
    ctx.save(); ctx.beginPath(); ctx.rect(0, y - band, W, band); ctx.clip(); ctx.globalAlpha = 0.85; ctx.drawImage(B, 14 * u, 0); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = 'rgba(255,72,176,.55)'; ctx.fillRect(0, y - band, W, band); ctx.restore();
    ctx.fillStyle = BLK; ctx.fillRect(0, y - 6 * u, W, 12 * u);
  },
  overlay(K) { const ctx = K.ctx; L.drawGrain(ctx, grain, K.frame, 0.07, 'multiply'); },
};
