// Glitch editorial — negro profundo, grotesca expandida blanca, separación RGB, cortes horizontales y bloques
// corruptos deterministas en ráfagas cortas; la persona con desplazamiento de canales. Controlado, no caótico.
import * as L from '../engine/lib.js';
import { title, para, layoutRich, drawRich } from '../engine/base.js';

// chrome: header/footer labels (scene numbers, rules, HUDs). Off with `chrome: false` in the video spec.
const CHROME = K => K.spec.chrome !== false;

const BLK = '#0B0B0D', WHT = '#F2F2F0', GRY = '#8C8C92', RED = '#FF2E4D', CYN = '#00E1FF';
let grain;
// burst envelope: short glitch bursts at deterministic times (+ during entrances)
const burst = (K, seed = 0) => { const t = K.t + seed * 0.37, ph = t % 2.3; return ph < 0.12 ? 1 - ph / 0.12 : 0; };
const jr = (a, b) => { const r = L.rng(a * 7919 + b * 104729); return r() * 2 - 1; };

// draw something with RGB split + band displacement. fn(color) draws it at origin.
function split(K, box, amt, slices, fn) {
  const { ctx, u } = K, d = amt * 10 * u;
  if (d > 0.3) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    ctx.save(); ctx.translate(-d, 0); fn(RED); ctx.restore();
    ctx.save(); ctx.translate(d, d * 0.3); fn(CYN); ctx.restore();
    ctx.restore();
  }
  if (slices > 0.05) {
    const n = 7, bh = box.h / n, seed = K.frame >> 1;
    for (let i = 0; i < n; i++) { const off = jr(seed, i) * slices * 60 * u * (Math.abs(jr(seed + 3, i)) > 0.5 ? 1 : 0.1); ctx.save(); ctx.beginPath(); ctx.rect(box.x - 200 * u, box.y + i * bh, box.w + 400 * u, bh + 1); ctx.clip(); ctx.translate(off, 0); fn(WHT); ctx.restore(); }
  } else fn(WHT);
}
const CH = L.memo((h, which) => L.mapPixels(window.K.subject(h), (r, g, b, a) => which === 'r' ? [r * 1.05, 0, 0, a] : [0, g, b * 1.02, a]));

export default {
  id: 'glitch', name: 'Glitch editorial',
  fonts: 'Archivo:wdth,wght@125,800;125,900;100,500;100,600&family=JetBrains+Mono:wght@500',
  fontLoads: ['900 expanded 60px Archivo', '800 expanded 60px Archivo', '500 30px Archivo', '600 30px Archivo', '500 20px "JetBrains Mono"'],
  palette: { bg: BLK, ink: WHT, accent: RED, muted: GRY, panel: '#141418', line: 'rgba(242,242,240,.2)', good: CYN, bad: RED, mascot: WHT },
  type: { display: s => `900 expanded ${s}px Archivo`, em: s => `900 expanded ${s}px Archivo`, body: s => `500 ${s}px Archivo`, bodyEm: s => `600 ${s}px Archivo`, label: s => `800 expanded ${s}px Archivo`, mono: s => `500 ${s}px "JetBrains Mono"` },
  ls: -0.03, lh: 0.9, upper: true,
  sfx: 'digital', transDur: 0.45, push: 0.02,
  music: 'glitchy experimental electronic, stuttering beats, bitcrushed percussion, deep sub bass, dark and modern, 124 BPM, instrumental, editorial fashion film',
  async setup(K) {
    grain = L.grainTiles(4, 256, 0.7, 13);
  },
  background(K, s) {
    const { ctx, W, H, u } = K; ctx.fillStyle = BLK; ctx.fillRect(0, 0, W, H);
    // faint horizontal scan structure + a data margin
    ctx.fillStyle = 'rgba(255,255,255,.025)'; for (let y = 0; y < H; y += 4 * u) ctx.fillRect(0, y, W, u);
    if (CHROME(K)) {
const f = `500 ${15 * u}px "JetBrains Mono"`;
    L.text(ctx, `SEQ_${String(s.i + 1).padStart(3, '0')} // ${s.type.toUpperCase()} // ${(K.t * 1000 | 0).toString(16).toUpperCase().padStart(6, '0')}`, 40 * u, H - 20 * u, { font: f, color: '#48484E' });
    L.text(ctx, 'REC ●', W - 40 * u, 40 * u, { font: f, color: (K.frame >> 4) % 2 ? RED : '#48484E', align: 'right' });
    }
  },
  headline(K, str, box, p, s, o = {}) {
    const b = { ...box }, g = Math.max(1 - L.clamp(p * 1.3), 0) + burst(K, s.i) * 0.8;
    const R = layoutRich(K.ctx, K.rich(str), b, { font: sz => K.S.type.display(sz), emFont: sz => K.S.type.em(sz), max: (o.size === 'm' ? 120 : 190) * K.u, min: 18 * K.u, lh: 0.92, ls: -0.03, upper: true });
    split(K, b, 0.35 + g * 1.5, g, col => drawRich(K, R, b, 1, { align: o.align, color: col, emColor: col === WHT ? RED : col, valign: 'middle', reveal: 'none' }));
    if (p < 1) { const ctx = K.ctx; ctx.fillStyle = BLK; ctx.fillRect(b.x + b.w * L.E.inOut(p), b.y - 10, b.w, b.h + 20); }
  },
  text(K, str, box, p, role, s, o = {}) {
    const map = { kicker: [RED, 30, sz => K.S.type.label(sz), true], label: [GRY, 26, sz => K.S.type.label(sz), true], body: [GRY, 46], item: [WHT, 48], step: [WHT, 38], good: [WHT, 38], bad: [GRY, 38], headGood: [CYN, 66, sz => K.S.type.display(sz), true], headBad: [RED, 66, sz => K.S.type.display(sz), true] }[role] || [WHT, 44];
    const g = 1 - L.clamp(p * 1.5);
    const draw = col => para(K, str, box, p > 0 ? 1 : 0, { color: col === WHT ? map[0] : col, max: map[1], font: map[2], upper: map[3], ls: map[3] ? 0.04 : 0, align: o.align || 'left', reveal: 'fade', lh: 1.15 });
    if (p <= 0) return; K.ctx.save(); K.ctx.globalAlpha = L.clamp(p * 2); split(K, box, g * 0.8, g * 0.6, draw); K.ctx.restore();
  },
  panel(K, b, p, s, kind) {
    if (p <= 0) return; const { ctx, u } = K, e = L.E.out(p), c = kind === 'good' ? CYN : kind === 'bad' ? RED : 'rgba(242,242,240,.35)';
    ctx.fillStyle = kind === 'good' || kind === 'bad' ? '#111116' : 'rgba(255,255,255,.03)'; ctx.fillRect(b.x, b.y, b.w * e, b.h);
    ctx.strokeStyle = c; ctx.lineWidth = 1.5 * u; ctx.strokeRect(b.x, b.y, b.w * e, b.h);
    const m = 14 * u; ctx.fillStyle = c; [[b.x, b.y], [b.x + b.w * e, b.y], [b.x, b.y + b.h], [b.x + b.w * e, b.y + b.h]].forEach(([x, y]) => { ctx.fillRect(x - m / 2, y - u, m, 2 * u); ctx.fillRect(x - u, y - m / 2, 2 * u, m); });
    if (p < 0.9) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = RED; ctx.strokeRect(b.x + 8 * u * (1 - p), b.y, b.w * e, b.h); ctx.restore(); }
  },
  bullet(K, i, b, p, s) {
    if (p <= 0) return; const { ctx } = K, [cx, cy] = L.center(b), g = 1 - L.clamp(p * 1.6);
    split(K, b, 0.3 + g, g, col => { ctx.strokeStyle = col; ctx.lineWidth = 2 * K.u; ctx.strokeRect(b.x + b.w * 0.1, b.y + b.h * 0.1, b.w * 0.8, b.h * 0.8); L.text(ctx, String(i + 1).padStart(2, '0'), cx, cy + b.h * 0.18, { font: `900 expanded ${b.h * 0.46}px Archivo`, color: col, align: 'center' }); });
  },
  number(K, str, box, p, s, o = {}) {
    const g = Math.max(1 - L.clamp(p * 1.2), 0) + burst(K, 2) * 0.6 + (o.final ? 0 : 0.25);
    const R = layoutRich(K.ctx, K.rich(str), box, { font: sz => K.S.type.display(sz), max: (o.small ? 130 : 320) * K.u, min: 18 * K.u, lh: 0.9, ls: -0.03 });
    split(K, box, 0.5 + g * 1.5, g * 0.8, col => drawRich(K, R, box, 1, { align: 'center', color: col === WHT ? (o.small ? RED : WHT) : col, reveal: 'none' }));
  },
  quote(K, str, box, p, s) { this.headline(K, '“' + str + '”', box, p, s, { size: 'm', align: 'left' }); },
  portrait(K, box, p, s) {
    if (p <= 0) return; const { ctx, u } = K, h = Math.round(box.h), r = CH(h, 'r'), gb = CH(h, 'gb'), x = box.x + (box.w - r.width) / 2, y = box.y + box.h - r.height;
    const g = Math.max(1 - L.clamp(p * 1.3), 0) + burst(K, s.i + 1), d = (3 + g * 26) * u;
    ctx.save(); ctx.globalAlpha = L.clamp(p * 2); ctx.globalCompositeOperation = 'lighter';
    const n = 12, bh = r.height / n, seed = K.frame >> 1;
    if (g < 0.05) { ctx.drawImage(r, x - d, y); ctx.drawImage(gb, x + d * 0.6, y + d * 0.15); ctx.restore(); return; }
    for (let i = 0; i < n; i++) {
      const off = g > 0.05 && Math.abs(jr(seed, i + 40)) > 0.55 ? jr(seed + 1, i) * g * 90 * u : 0;
      ctx.save(); ctx.beginPath(); ctx.rect(x - 200 * u, Math.round(y + i * bh), r.width + 400 * u, Math.round(y + (i + 1) * bh) - Math.round(y + i * bh)); ctx.clip();
      ctx.drawImage(r, x - d + off, y); ctx.drawImage(gb, x + d * 0.6 + off, y + d * 0.15); ctx.restore();
    }
    ctx.restore();
  },
  mascot(K, box, p, s, mood) { if (p <= 0) return; const g = 1 - L.clamp(p * 1.5) + burst(K, 4) * 0.5; split(K, box, 0.3 + g, g, col => L.mascot(K.ctx, K.spec.mascot, box, { color: 'rgba(0,0,0,0)', ink: col, eye: col, eyeStyle: mood === 'happy' ? 'happy' : 'square' })); },
  media(K, img, box, p, s, frame) {
    if (p <= 0) return; const { ctx, u } = K, r = Math.min(box.w / img.width, box.h / img.height), w = img.width * r, h = img.height * r, x = box.x + (box.w - w) / 2, y = box.y + (box.h - h) / 2;
    const g = Math.max(1 - L.clamp(p * 1.3), 0) + burst(K, 6) * 0.6, n = 10, bh = h / n, seed = K.frame >> 1;
    ctx.save(); ctx.globalAlpha = L.clamp(p * 2);
    for (let i = 0; i < n; i++) { const off = g > 0.05 && Math.abs(jr(seed, i + 9)) > 0.5 ? jr(seed + 2, i) * g * 80 * u : 0; ctx.save(); ctx.beginPath(); ctx.rect(x - 100 * u, y + i * bh, w + 200 * u, bh + 1); ctx.clip(); ctx.drawImage(img, x + off, y, w, h); ctx.restore(); }
    ctx.strokeStyle = WHT; ctx.lineWidth = 1.5 * u; ctx.strokeRect(x - 10 * u, y - 10 * u, w + 20 * u, h + 20 * u);
    ctx.restore();
    L.text(ctx, `SRC://${String(s.d.src).split('/').pop().toUpperCase()}`, x - 10 * u, y + h + 36 * u, { font: `500 ${15 * u}px "JetBrains Mono"`, color: GRY, alpha: L.clamp(p * 2 - 1) });
  },
  prompt(K, str, box, p, s, tp) {
    if (p <= 0) return; const { ctx, u } = K; ctx.save(); ctx.globalAlpha = L.clamp(p * 2);
    ctx.fillStyle = '#131317'; ctx.fillRect(box.x, box.y, box.w, box.h); ctx.fillStyle = RED; ctx.fillRect(box.x, box.y, 4 * u, box.h);
    para(K, str.slice(0, Math.ceil(str.length * tp)) + ((K.frame >> 3) % 2 || tp < 1 ? '_' : ''), L.inset(box, 24 * u, 12 * u), 1, { font: sz => `500 ${sz}px "JetBrains Mono"`, color: WHT, max: 28, valign: 'middle' });
    ctx.restore();
  },
  caption(K, words, act, box, p) {
    const { ctx, u } = K; ctx.save(); ctx.globalAlpha = p; ctx.font = `800 expanded ${30 * u}px Archivo`;
    const up = words.map(w => w.toUpperCase()), w = ctx.measureText(up.join(' ')).width, x = box.x + (box.w - w) / 2, y = box.y + box.h * 0.66;
    let cx = x; up.forEach((wd, i) => { const ww = ctx.measureText(wd).width; if (i === act) { ctx.fillStyle = RED; ctx.fillRect(cx - 6 * u, box.y + box.h * 0.14, ww + 12 * u, box.h * 0.72); } ctx.fillStyle = i <= act ? WHT : '#6A6A70'; ctx.fillText(wd, cx, y); cx += ctx.measureText(wd + ' ').width; });
    ctx.restore();
  },
  connector(K, a, b, p) { if (p <= 0) return; const ctx = K.ctx; ctx.fillStyle = 'rgba(242,242,240,.5)'; const n = 14; for (let k = 0; k < n * p; k++) { const t = k / n; ctx.fillRect(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t - K.u, 10 * K.u, 2 * K.u); } },
  button(K, str, b, p) {
    if (p <= 0) return; const g = 1 - L.clamp(p * 1.5);
    split(K, b, g, g, col => { K.ctx.fillStyle = col === WHT ? RED : col; K.ctx.fillRect(b.x, b.y, b.w, b.h); para(K, str, L.inset(b, b.h * 0.3, b.h * 0.2), 1, { font: sz => K.S.type.label(sz), color: WHT, max: 34, upper: true, align: 'center' }); });
  },
  transition(K, A, B, p, info) { // strong glitch: horizontal slices of B slam in from alternating sides with RGB tearing
    const { ctx, W, H, u } = K, r = info.raw, n = 16, bh = H / n;
    ctx.drawImage(A, 0, 0);
    for (let i = 0; i < n; i++) {
      const start = Math.abs(jr(7, i)) * 0.45, q = L.E.out(L.clamp((r - start) / 0.45)); if (q <= 0) continue;
      const dir = i % 2 ? 1 : -1, off = (1 - q) * W * 0.6 * dir;
      ctx.save(); ctx.beginPath(); ctx.rect(0, i * bh, W, bh + 1); ctx.clip();
      if (q < 1) { ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.6; ctx.filter = 'none'; ctx.drawImage(B, off - 24 * u * dir, 0); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1; }
      ctx.drawImage(B, off, 0); ctx.restore();
    }
    // corrupt blocks
    const k = Math.sin(r * Math.PI); const rr = L.rng(K.frame * 31 + 5);
    for (let j = 0; j < 22 * k; j++) { ctx.fillStyle = [RED, CYN, WHT, BLK][j % 4]; ctx.globalAlpha = 0.7; ctx.fillRect(rr() * W, rr() * H, (20 + rr() * 220) * u, (4 + rr() * 26) * u); }
    ctx.globalAlpha = 1;
  },
  overlay(K) {
    const { ctx, W, H, u } = K, b = burst(K, 9);
    if (b > 0) { const rr = L.rng(K.frame * 17); for (let j = 0; j < 10; j++) { ctx.fillStyle = [RED, CYN, 'rgba(255,255,255,.5)'][j % 3]; ctx.globalAlpha = 0.35 * b; ctx.fillRect(rr() * W, rr() * H, (30 + rr() * 300) * u, (2 + rr() * 10) * u); } ctx.globalAlpha = 1; }
    L.drawGrain(ctx, grain, K.frame, 0.07, 'overlay');
  },
};
