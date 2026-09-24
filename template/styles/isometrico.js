// Isométrico — un mundo en proyección isométrica: losas extruidas, bloques con sombras de 3 tonos, piezas de escritorio; todo sube desde el piso.
import * as L from '../engine/lib.js';
import { BASE, title, para, drawFrame } from '../engine/base.js';

const BG = '#EDE8DD', NAVY = '#22313F', TEAL = '#2A9D8F', MUST = '#E9C46A', CORAL = '#E76F51', SAND = '#F4F0E8', MUTED = '#5F6B74';
const C30 = Math.cos(Math.PI / 6), S30 = 0.5;
const shade = (c, k) => k > 0 ? L.mix(c, '#FFFFFF', k) : L.mix(c, '#101820', -k);
let scenesBg = [];
// iso box: base point (x,y) = front-bottom corner on screen; a = size along right axis, b = along left axis, h = height
function isoBox(ctx, x, y, a, b, h, col, { top = 0.22, left = 0, right = -0.22, stroke = null } = {}) {
  const R = [C30 * a, -S30 * a], Lf = [-C30 * b, -S30 * b];
  const p0 = [x, y], pR = [x + R[0], y + R[1]], pL = [x + Lf[0], y + Lf[1]], pB = [x + R[0] + Lf[0], y + R[1] + Lf[1]];
  const up = ([px, py]) => [px, py - h];
  const face = (pts, c) => { ctx.beginPath(); pts.forEach(([px, py], i) => i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)); ctx.closePath(); ctx.fillStyle = c; ctx.fill(); if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1; ctx.stroke(); } };
  face([p0, pL, up(pL), up(p0)], shade(col, left));
  face([p0, pR, up(pR), up(p0)], shade(col, right));
  face([up(p0), up(pR), up(pB), up(pL)], shade(col, top));
}
// extruded front-facing slab (readable card with an isometric thickness)
function slab(ctx, b, col, d, r = 0) {
  const dx = d * C30, dy = d * S30;
  ctx.fillStyle = shade(col, -0.32); ctx.beginPath(); ctx.moveTo(b.x + b.w, b.y); ctx.lineTo(b.x + b.w + dx, b.y + dy); ctx.lineTo(b.x + b.w + dx, b.y + b.h + dy); ctx.lineTo(b.x + dx, b.y + b.h + dy); ctx.lineTo(b.x, b.y + b.h); ctx.lineTo(b.x + b.w, b.y + b.h); ctx.closePath(); ctx.fill();
  ctx.fillStyle = shade(col, -0.18); ctx.beginPath(); ctx.moveTo(b.x, b.y + b.h); ctx.lineTo(b.x + dx, b.y + b.h + dy); ctx.lineTo(b.x + b.w + dx, b.y + b.h + dy); ctx.lineTo(b.x + b.w, b.y + b.h); ctx.closePath(); ctx.fill();
  ctx.fillStyle = col; if (r) { L.rrect(ctx, b.x, b.y, b.w, b.h, r); ctx.fill(); } else ctx.fillRect(b.x, b.y, b.w, b.h);
}
function desk(ctx, x, y, u) { // a small iso workstation: desk, monitor, mug, plant
  isoBox(ctx, x, y, 170 * u, 90 * u, 70 * u, SAND);
  isoBox(ctx, x + 20 * u, y - 70 * u - 12 * u, 90 * u, 10 * u, 60 * u, NAVY);
  isoBox(ctx, x + 60 * u, y - 70 * u - 10 * u, 16 * u, 16 * u, 22 * u, CORAL);
  isoBox(ctx, x - 40 * u, y - 70 * u - 20 * u, 22 * u, 22 * u, 26 * u, TEAL);
}
function stack(ctx, x, y, u) { isoBox(ctx, x, y, 90 * u, 90 * u, 90 * u, MUST); isoBox(ctx, x + 10 * u, y - 90 * u - 5 * u, 60 * u, 60 * u, 60 * u, TEAL); isoBox(ctx, x + 110 * u, y + 30 * u, 60 * u, 60 * u, 40 * u, CORAL); }
function shelf(ctx, x, y, u) { for (let k = 0; k < 3; k++) isoBox(ctx, x, y - k * 55 * u, 140 * u, 36 * u, 50 * u, k % 2 ? SAND : NAVY); isoBox(ctx, x + 30 * u, y - 165 * u - 4 * u, 30 * u, 30 * u, 44 * u, MUST); }

export default {
  id: 'isometrico', name: 'Isométrico',
  fonts: 'Sora:wght@400;600;700;800&family=JetBrains+Mono:wght@500',
  fontLoads: ['400 30px Sora', '600 30px Sora', '700 60px Sora', '800 60px Sora', '500 20px "JetBrains Mono"'],
  palette: { bg: BG, ink: NAVY, accent: CORAL, muted: MUTED, panel: '#FFFFFF', line: 'rgba(34,49,63,.15)', good: TEAL, bad: CORAL, mascot: TEAL },
  type: { display: s => `800 ${s}px Sora`, em: s => `800 ${s}px Sora`, body: s => `400 ${s}px Sora`, bodyEm: s => `600 ${s}px Sora`, label: s => `700 ${s}px Sora`, mono: s => `500 ${s}px "JetBrains Mono"` },
  ls: -0.035, lh: 1.02,
  sfx: 'mechanical', transDur: 0.65, push: 0.02,
  music: 'playful but sophisticated electronic, marimba and plucked synths, clean tight beat, building-blocks feel, 112 BPM, instrumental, tech explainer',
  async setup(K) {
    const { W, H, u } = K;
    for (let v = 0; v < 3; v++) {
      const c = L.canvas(W, H), x = c.getContext('2d'); x.fillStyle = BG; x.fillRect(0, 0, W, H);
      // isometric floor lattice
      x.strokeStyle = 'rgba(34,49,63,.07)'; x.lineWidth = 1; const g = 70 * u;
      for (let k = -40; k < 60; k++) { x.beginPath(); x.moveTo(k * g * 2 * C30 / 1.0 - H * 2, -H); x.lineTo(k * g * 2 * C30 + H * 2 * C30 * 2 - H * 2, H * 2 * 1); x.stroke(); }
      for (let k = -40; k < 60; k++) { x.beginPath(); x.moveTo(k * g * 2 * C30, -H); x.lineTo(k * g * 2 * C30 - H * 2 * C30 * 2, H * 3); x.stroke(); }
      const V = K.vertical;
      if (V) { // vertical: keep set pieces in the bottom corners, clear of titles
        if (v === 0) desk(x, W * 0.16, H * 0.995, u * 0.8);
        if (v === 1) shelf(x, W * 0.84, H * 0.995, u * 0.75);
        if (v === 2) stack(x, W * 0.1, H * 0.995, u * 0.65);
      } else {
        if (v === 0) { desk(x, W * 0.06, H * 0.97, u * 0.9); stack(x, W * 0.9, H * 0.28, u * 0.55); }
        if (v === 1) { shelf(x, W * 0.93, H * 0.97, u * 0.9); isoBox(x, W * 0.04, H * 0.2, 60 * u, 60 * u, 60 * u, MUST); }
        if (v === 2) { stack(x, W * 0.03, H * 0.98, u * 0.75); desk(x, W * 0.88, H * 0.24, u * 0.5); }
      }
      scenesBg[v] = c;
    }
  },
  background(K, s) { K.ctx.drawImage(scenesBg[s.i % 3], 0, 0); },
  decor(K, s) { // one floating cube that bobs, different corner per scene
    const { ctx, u, W, H, t } = K, V = K.vertical, pos = (V ? [[0.9, 0.955], [0.1, 0.955], [0.9, 0.955]] : [[0.93, 0.08], [0.05, 0.9], [0.95, 0.9]])[s.i % 3];
    const x = W * pos[0], y = H * pos[1] - (V ? 60 * u : 0) + Math.sin(t * 2.1 + s.i) * 10 * u, col = [CORAL, TEAL, MUST][s.i % 3];
    ctx.save(); ctx.fillStyle = 'rgba(34,49,63,.10)'; ctx.beginPath(); ctx.ellipse(x, H * pos[1] + 50 * u, 30 * u * (1 - Math.sin(t * 2.1 + s.i) * 0.1), 12 * u, 0, 0, 7); ctx.fill(); ctx.restore();
    isoBox(ctx, x, y + 26 * u, 36 * u, 36 * u, 36 * u, col);
  },
  headline(K, str, box, p, s, o = {}) { title(K, str, box, p, { align: o.align, size: o.size, color: NAVY, emColor: CORAL, reveal: 'rise', valign: 'middle' }); },
  text(K, str, box, p, role, s, o = {}) {
    if (role === 'kicker' || role === 'label') return para(K, str, box, p, { font: sz => K.S.type.label(sz), color: TEAL, upper: true, ls: 0.1, max: 24, align: o.align || 'left' });
    if (role === 'headBad' || role === 'headGood') return title(K, str, box, p, { color: role === 'headGood' ? TEAL : CORAL, max: 60, reveal: 'rise' });
    return BASE.text(K, str, box, p, role, s, { color: role === 'bad' ? MUTED : role === 'body' ? '#44525E' : NAVY, ...o });
  },
  panel(K, b, p, s, kind, j = 0) {
    if (p <= 0) return; const { ctx, u } = K, e = L.E.back(p);
    ctx.save(); ctx.globalAlpha = L.clamp(p * 2); ctx.translate(0, (1 - e) * 40 * u);
    slab(ctx, b, kind === 'good' ? '#E3F3F0' : kind === 'bad' ? '#FBE7E0' : '#FFFFFF', (kind === 'row' ? 14 : 22) * u, 0);
    if (kind === 'row') { ctx.fillStyle = [TEAL, MUST, CORAL, NAVY][j % 4]; ctx.fillRect(b.x, b.y, 8 * u, b.h); }
    ctx.restore();
  },
  bullet(K, i, b, p) {
    if (p <= 0) return; const { ctx, u } = K, e = L.E.back(p), col = [TEAL, MUST, CORAL, NAVY][i % 4], sz = Math.min(b.w, b.h) * 0.62;
    ctx.save(); ctx.globalAlpha = L.clamp(p * 2); const x = b.x + b.w / 2, y = b.y + b.h * 0.92 + (1 - e) * 30 * u;
    isoBox(ctx, x, y, sz * 0.72, sz * 0.72, sz * 0.72, col);
    L.text(ctx, String(i + 1), x + sz * 0.3, y - sz * 0.43, { font: K.S.type.display(sz * 0.42), color: i % 4 === 1 ? NAVY : '#FFFFFF', align: 'center', base: 'middle' });
    ctx.restore();
  },
  number(K, str, box, p, s, o) {
    const { ctx, u } = K; ctx.save(); // extruded numerals: stacked copies give an isometric depth
    for (let d = 10; d >= 1; d--) { ctx.save(); ctx.translate(d * 1.2 * u * C30, d * 1.2 * u * S30); title(K, str, box, p, { align: 'center', color: shade(o?.small ? TEAL : CORAL, -0.35), reveal: 'rise', max: o?.small ? 130 : 290 }); ctx.restore(); }
    title(K, str, box, p, { align: 'center', color: o?.small ? TEAL : CORAL, reveal: 'rise', max: o?.small ? 130 : 290 }); ctx.restore();
  },
  quote(K, str, box, p, s) { const { ctx, u } = K; if (p > 0) { ctx.save(); ctx.globalAlpha = L.clamp(p * 2); slab(ctx, { x: box.x - 30 * u, y: box.y - 20 * u, w: box.w + 60 * u, h: box.h + 40 * u }, '#FFFFFF', 22 * u); ctx.restore(); } title(K, '“' + str + '”', L.inset(box, 20 * u), p, { size: 'm', max: 86, color: NAVY, reveal: 'words' }); },
  portrait(K, box, p, s) { // the person in front of an extruded isometric backdrop slab
    if (p <= 0) return; const { ctx, u } = K, e = L.E.out(p), subj = K.subject(Math.round(box.h * 0.9));
    const cx = box.x + box.w / 2, sw = Math.min(box.w * 0.86, subj.w * 1.02), bk = { x: cx - sw / 2, y: box.y + box.h * 0.12, w: sw, h: box.h * 0.9 };
    ctx.save(); ctx.globalAlpha = L.clamp(p * 1.8); ctx.translate(0, (1 - L.E.back(L.clamp(p * 1.3))) * 50 * u);
    slab(ctx, bk, s.i % 2 ? '#F2D58A' : '#A8D8CF', 30 * u, 18 * u); ctx.restore();
    ctx.save(); ctx.globalAlpha = L.clamp(p * 1.4 - 0.2); ctx.beginPath(); ctx.rect(box.x - box.w, box.y - box.h, box.w * 3, box.h * 2); ctx.clip();
    ctx.drawImage(subj.c, cx - subj.w / 2, box.y + box.h - subj.h + (1 - e) * 40 * u); ctx.restore();
  },
  mascot(K, box, p, s, mood) {
    if (p <= 0) return; const { ctx, u } = K, e = L.E.back(p); ctx.save(); ctx.globalAlpha = L.clamp(p * 2);
    ctx.fillStyle = 'rgba(34,49,63,.14)'; ctx.beginPath(); ctx.ellipse(box.x + box.w / 2 + 8 * u, box.y + box.h, box.w * 0.42, box.w * 0.12, 0, 0, 7); ctx.fill();
    L.mascot(ctx, K.spec.mascot, { ...box, y: box.y + (1 - e) * 40 * u }, { color: MUST, ink: NAVY, eye: NAVY, eyeStyle: mood === 'happy' ? 'happy' : 'dot', bob: Math.sin(K.t * 2.4) * 3 * u });
    ctx.restore();
  },
  media(K, img, box, p, s, frame) { const { ctx, u } = K; if (p <= 0) return; const e = L.E.out(p); ctx.save(); ctx.globalAlpha = L.clamp(p * 2); const dd = 26 * u; ctx.translate(0, (1 - e) * 60 * u); const b0 = { x: box.x, y: box.y, w: box.w - dd, h: box.h - dd }; ctx.restore(); drawFrame(K, img, b0, p, frame, { bezel: NAVY, shadowColor: 'rgba(34,49,63,.28)', barColor: '#DDE3E6' }); },
  prompt(K, str, box, p, s, tp) {
    if (p <= 0) return; const { ctx, u } = K, e = L.E.back(p); ctx.save(); ctx.globalAlpha = L.clamp(p * 2); ctx.translate(0, (1 - e) * 30 * u);
    slab(ctx, box, NAVY, 16 * u); ctx.fillStyle = CORAL; ctx.beginPath(); ctx.arc(box.x + 26 * u, box.y + 24 * u, 6 * u, 0, 7); ctx.fill(); ctx.fillStyle = MUST; ctx.beginPath(); ctx.arc(box.x + 44 * u, box.y + 24 * u, 6 * u, 0, 7); ctx.fill(); ctx.restore();
    para(K, '> ' + str.slice(0, Math.ceil(str.length * tp)) + (tp < 1 || (K.frame >> 3) % 2 ? '▍' : ''), { x: box.x + 22 * u, y: box.y + 34 * u, w: box.w - 44 * u, h: box.h - 44 * u }, 1, { font: sz => K.S.type.mono(sz), color: '#F4F0E8', max: 28, valign: 'middle' });
  },
  caption(K, words, act, box, p) {
    const { ctx, u } = K; ctx.save(); ctx.globalAlpha = p; ctx.font = K.S.type.bodyEm(31 * u);
    const w = ctx.measureText(words.join(' ')).width + 60 * u, b = { x: box.x + (box.w - w) / 2, y: box.y, w, h: box.h * 0.9 };
    slab(ctx, b, NAVY, 10 * u); ctx.font = K.S.type.bodyEm(31 * u);
    let cx = b.x + 30 * u; words.forEach((wd, i) => { ctx.fillStyle = i === act ? MUST : i < act ? '#FFFFFF' : 'rgba(255,255,255,.5)'; ctx.fillText(wd, cx, b.y + b.h * 0.66); cx += ctx.measureText(wd + ' ').width; });
    ctx.restore();
  },
  connector(K, a, b, p) { if (p <= 0) return; const ctx = K.ctx; ctx.save(); ctx.strokeStyle = NAVY; ctx.lineWidth = 3 * K.u; ctx.setLineDash([2 * K.u, 9 * K.u]); ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(a[0] + (b[0] - a[0]) * p, a[1] + (b[1] - a[1]) * p); ctx.stroke(); ctx.restore(); },
  button(K, str, b, p) { if (p <= 0) return; const { ctx, u } = K, e = L.E.back(p); ctx.save(); ctx.globalAlpha = L.clamp(p * 2); ctx.translate(0, (1 - e) * 20 * u); slab(ctx, b, CORAL, 14 * u); ctx.restore(); para(K, str, L.inset(b, b.h * 0.3, b.h * 0.2), L.clamp(p * 2 - 0.4), { font: sz => K.S.type.label(sz), color: '#FFFFFF', max: 32, align: 'center' }); },
  transition(K, A, B, p, info) { // tiles of the next scene rise from the floor, diagonal stagger
    const { ctx, W, H, u } = K, n = K.vertical ? 6 : 10, tw = W / n, m = Math.ceil(H / tw), th = tw;
    ctx.drawImage(A, 0, 0);
    for (let j = 0; j < m; j++) for (let i = 0; i < n; i++) {
      const q = L.E.out(L.clamp(info.raw * 2.2 - (i + j) / (n + m) * 1.2)); if (q <= 0) continue;
      const off = (1 - q) * 70 * u, x = i * tw, y = j * th;
      ctx.save(); ctx.globalAlpha = L.clamp(q * 2.5);
      if (q < 1) { ctx.fillStyle = shade(TEAL, -0.2); ctx.fillRect(x, y + th + off - 1, tw, 12 * u * (1 - q) + 1); }
      ctx.beginPath(); ctx.rect(x, y + off, tw + 0.5, th + 0.5); ctx.clip(); ctx.drawImage(B, 0, off); ctx.restore();
    }
  },
};
