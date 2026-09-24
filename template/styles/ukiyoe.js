// Ukiyo-e — grabado japonés en madera: papel washi, degradado bokashi índigo, olas con espuma en garra, nubes en bandas,
// sello rojo (hanko) con iniciales; la persona se imprime en planos de color con contorno negro, como una estampa.
import * as L from '../engine/lib.js';
import { BASE, title, para, fitSubject, drawFrame } from '../engine/base.js';

const SUMI = '#1A1A1E', INDIGO = '#1F3A5F', AI = '#3F6E96', VERM = '#C23B22', CREAM = '#EFE3C8', FOAM = '#F6EEDD', ROSE = '#E7B7A0';
const bgs = {}; let washi, grain;
// woodblock print of the person: 4 flat tones + black key line
const BLOCK = L.memo(h => {
  const S = window.K.subject(h), w = S.w, Lb = L.blurL(S.L, w, S.h, 2), A = S.A;
  const tones = [[28, 32, 44], [70, 96, 128], [201, 154, 120], [241, 221, 192]].map(c => c);
  return L.mapPixels(S, (r, g, b, a, x, y) => {
    if (x < 1 || y < 1 || x >= w - 1 || y >= S.h - 1) return [0, 0, 0, 0];
    const i = y * w + x, l = Lb[i], gx = Lb[i + 1] - Lb[i - 1], gy = Lb[i + w] - Lb[i - w], m = Math.hypot(gx, gy);
    const sil = A[i - 2] < 0.5 || A[i + 2] < 0.5 || A[i - 2 * w] < 0.5 || A[i + 2 * w] < 0.5;
    if (sil || m > 0.07) return [26, 26, 30, a];
    const k = l < 0.13 ? 0 : l < 0.27 ? 1 : l < 0.5 ? 2 : 3, c = tones[k];
    return [c[0], c[1], c[2], a];
  });
});
// one curling crest with claw foam
function crest(ctx, cx, cy, R, u) {
  ctx.save(); ctx.translate(cx, cy);
  const body = new Path2D(); body.moveTo(-R * 1.6, R * 1.2); body.bezierCurveTo(-R * 1.4, -R * 0.4, -R * 0.4, -R * 1.1, R * 0.5, -R * 0.8); body.bezierCurveTo(R * 1.1, -R * 0.55, R * 1.05, 0, R * 0.55, R * 0.05);
  body.bezierCurveTo(R * 0.8, -R * 0.35, R * 0.3, -R * 0.55, -R * 0.1, -R * 0.2); body.bezierCurveTo(-R * 0.5, R * 0.2, -R * 0.4, R * 0.9, R * 0.2, R * 1.2); body.closePath();
  ctx.fillStyle = INDIGO; ctx.fill(body); ctx.lineWidth = 2.2 * u; ctx.strokeStyle = SUMI; ctx.stroke(body);
  ctx.save(); ctx.clip(body); ctx.strokeStyle = AI; ctx.lineWidth = 3 * u; for (let k = 1; k < 6; k++) { ctx.beginPath(); ctx.ellipse(R * 0.2, R * 0.3, R * (0.35 + k * 0.22), R * (0.25 + k * 0.2), -0.4, Math.PI * 0.9, Math.PI * 1.9); ctx.stroke(); } ctx.restore();
  // foam fingers along the lip
  ctx.fillStyle = FOAM; ctx.strokeStyle = SUMI; ctx.lineWidth = 1.2 * u;
  for (let k = 0; k < 9; k++) { const t = k / 8, a = -2.6 + t * 2.3, x = Math.cos(a) * R * 0.85 + R * 0.25, y = Math.sin(a) * R * 0.75 - R * 0.1, rr = R * (0.09 + 0.05 * Math.sin(k * 1.7));
    ctx.beginPath(); ctx.arc(x, y, rr, 0, 7); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.arc(x + rr * 0.9, y - rr * 0.4, rr * 0.55, 0, 7); ctx.fill(); ctx.stroke(); }
  ctx.restore();
}
function waves(ctx, W, H, y0, u, seed) { // row of crests over a banded sea
  const r = L.rng(seed); ctx.save();
  const sea = new Path2D(); sea.moveTo(0, H); sea.lineTo(0, y0); for (let x = 0; x <= W; x += 40 * u) sea.lineTo(x, y0 + Math.sin(x / (160 * u) + seed) * 22 * u); sea.lineTo(W, H); sea.closePath();
  ctx.fillStyle = AI; ctx.fill(sea); ctx.save(); ctx.clip(sea); ctx.strokeStyle = 'rgba(246,238,221,.55)'; ctx.lineWidth = 2 * u;
  for (let k = 0; k < 14; k++) { ctx.beginPath(); for (let x = 0; x <= W; x += 30 * u) { const y = y0 + 30 * u + k * 26 * u + Math.sin(x / (90 * u) + k) * 6 * u; x ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); }
  ctx.restore(); ctx.strokeStyle = SUMI; ctx.lineWidth = 2 * u; ctx.stroke(sea);
  for (let x = 90 * u; x < W + 100 * u; x += (230 + r() * 120) * u) crest(ctx, x, y0 - 10 * u, (46 + r() * 30) * u, u);
  ctx.restore();
}
function cloudBand(ctx, x, y, w, h, u, col = CREAM) { // stylized banded cloud (kasumi)
  ctx.save(); const p = new Path2D(); p.roundRect(x, y, w, h, h / 2); ctx.fillStyle = col; ctx.fill(p); ctx.strokeStyle = SUMI; ctx.lineWidth = 1.6 * u; ctx.stroke(p);
  ctx.beginPath(); ctx.moveTo(x + h, y + h * 0.5); ctx.lineTo(x + w - h, y + h * 0.5); ctx.strokeStyle = 'rgba(26,26,30,.35)'; ctx.lineWidth = 1 * u; ctx.stroke(); ctx.restore();
}
function seigaiha(ctx, x0, y0, W, H, R, u, col) {
  ctx.save(); ctx.beginPath(); ctx.rect(x0, y0, W, H); ctx.clip(); ctx.lineWidth = 1.4 * u;
  for (let row = 0, y = y0 + H + R; y > y0 - R; y -= R * 0.5, row++) for (let x = x0 - R + (row % 2) * R; x < x0 + W + R; x += R * 2) {
    for (let k = 4; k >= 1; k--) { ctx.beginPath(); ctx.arc(x, y, R * k / 4, Math.PI, 0); ctx.fillStyle = k % 2 ? col : CREAM; ctx.fill(); ctx.strokeStyle = SUMI; ctx.stroke(); }
  }
  ctx.restore();
}
const initials = K => { const n = K.person?.name || K.spec.brand || String(K.spec.scenes[0]?.title || 'V').replace(/[*¿¡]/g, ''); return n.split(/\s+/).filter(w => /^[A-Za-zÁÉÍÓÚÑáéíóúñ0-9]/.test(w)).slice(0, 2).map(x => x[0]).join('').toUpperCase(); };
const below = (K, b) => { const m = (K.vertical ? 150 : 110) * K.u; return b.y < m ? { ...b, y: m, h: Math.max(b.h - (m - b.y), b.h * 0.62) } : b; };

export default {
  id: 'ukiyoe', name: 'Ukiyo-e',
  fonts: 'Shippori+Mincho+B1:wght@600;800&family=Zen+Kaku+Gothic+New:wght@500;700',
  fontLoads: ['800 80px "Shippori Mincho B1"', '600 40px "Shippori Mincho B1"', '500 30px "Zen Kaku Gothic New"', '700 30px "Zen Kaku Gothic New"'],
  palette: { bg: CREAM, ink: SUMI, accent: VERM, muted: '#5A5046', panel: '#F4EAD4', line: 'rgba(26,26,30,.4)', good: INDIGO, bad: '#7A6A5A', mascot: '#D0703C' },
  type: { display: s => `800 ${s}px "Shippori Mincho B1"`, em: s => `800 ${s}px "Shippori Mincho B1"`, body: s => `500 ${s}px "Zen Kaku Gothic New"`, bodyEm: s => `700 ${s}px "Zen Kaku Gothic New"`, label: s => `700 ${s}px "Zen Kaku Gothic New"`, mono: s => `500 ${s}px "Zen Kaku Gothic New"` },
  lh: 1.08, ls: -0.01,
  sfx: 'ink', transDur: 0.8, push: 0.025,
  music: 'modern japanese-inspired instrumental, koto and shakuhachi over soft taiko and subtle lo-fi beat, calm yet driving, 92 BPM, elegant and focused, no vocals',
  async setup(K) {
    const { W, H, u } = K; washi = L.canvas(W, H); const wx = washi.getContext('2d');
    L.paper(wx, CREAM, { seed: 61, grain: 0.05, blotch: 0.05, fibers: 2600 });
    const V = K.vertical;
    for (let v = 0; v < 3; v++) {
      const c = L.canvas(W, H), x = c.getContext('2d'); x.drawImage(washi, 0, 0);
      // bokashi: indigo gradient at the top edge
      const g = x.createLinearGradient(0, 0, 0, H * 0.14); g.addColorStop(0, 'rgba(31,58,95,.75)'); g.addColorStop(1, 'rgba(31,58,95,0)'); x.fillStyle = g; x.fillRect(0, 0, W, H * 0.14);
      if (v === 0) { waves(x, W, H, H * (V ? 0.86 : 0.83), u, 3); }
      if (v === 1) { const sx = W - 150 * u, sy = 120 * u; x.fillStyle = VERM; x.beginPath(); x.arc(sx, sy, 64 * u, 0, 7); x.fill(); cloudBand(x, sx - 40 * u, sy + 30 * u, 260 * u, 26 * u, u); cloudBand(x, -40 * u, H * 0.9, W * 0.45, 34 * u, u, '#E9D6B6'); cloudBand(x, W * 0.7, H * 0.86, W * 0.4, 30 * u, u, ROSE); }
      if (v === 2) { seigaiha(x, 0, H * (V ? 0.9 : 0.88), W, H * 0.14, 36 * u, u, AI); cloudBand(x, -60 * u, 64 * u, W * 0.3, 26 * u, u, ROSE); }
      // woodblock frame
      x.strokeStyle = SUMI; x.lineWidth = 3 * u; x.strokeRect(22 * u, 22 * u, W - 44 * u, H - 44 * u);
      bgs[v] = c;
    }
    grain = L.grainTiles(4, 256, 0.45, 61);
  },
  background(K, s) {
    const { ctx, W, H, u } = K; ctx.drawImage(bgs[s.i % 3], 0, 0);
    // hanko seal, bottom right above the caption band
    const sz = 64 * u, x = W - 70 * u - sz, y = (K.vertical ? 0.76 : 0.72) * H;
    ctx.save(); ctx.fillStyle = VERM; ctx.globalAlpha = 0.9; L.rrect(ctx, x, y, sz, sz, 6 * u); ctx.fill(); ctx.strokeStyle = CREAM; ctx.lineWidth = 2 * u; ctx.strokeRect(x + 6 * u, y + 6 * u, sz - 12 * u, sz - 12 * u);
    L.text(ctx, initials(K), x + sz / 2, y + sz * 0.66, { font: K.S.type.display(sz * 0.42), color: CREAM, align: 'center' }); ctx.restore();
    // title slip (tanzaku) with the sheet number
    const tx = W - 88 * u, ty = (s.i % 3 === 1 ? 210 : 44) * u; ctx.save(); ctx.fillStyle = '#F4EAD4'; ctx.fillRect(tx, ty, 40 * u, 120 * u); ctx.strokeStyle = SUMI; ctx.lineWidth = 1.5 * u; ctx.strokeRect(tx, ty, 40 * u, 120 * u);
    ctx.translate(tx + 27 * u, ty + 12 * u); ctx.rotate(Math.PI / 2); L.text(ctx, 'Nº ' + String(s.i + 1).padStart(2, '0'), 0, 0, { font: K.S.type.label(18 * u), color: SUMI, ls: 2 * u }); ctx.restore();
  },
  headline(K, str, box, p, s, o = {}) { title(K, str, below(K, box), p, { align: o.align, size: o.size, color: SUMI, emColor: VERM, reveal: 'rise', valign: 'middle' }); },
  text(K, str, box, p, role, s, o = {}) {
    box = below(K, box);
    if (role === 'kicker' || role === 'label') return para(K, str, box, p, { font: sz => K.S.type.label(sz), color: VERM, upper: true, ls: 0.18, max: 24, align: o.align || 'left' });
    if (role === 'headBad' || role === 'headGood') return title(K, str, box, p, { color: role === 'headGood' ? INDIGO : '#6A5A4A', max: 64, reveal: 'rise', valign: 'top' });
    return BASE.text(K, str, box, p, role, s, { color: role === 'bad' ? '#7A6A5A' : role === 'body' ? '#3E372F' : SUMI, max: role === 'item' ? 44 : 40, ...o });
  },
  panel(K, b, p, s, kind, j = 0) {
    if (p <= 0) return; const { ctx, u } = K; ctx.save(); ctx.globalAlpha = L.clamp(p * 1.5); const e = L.E.out(p);
    ctx.translate(0, (1 - e) * 20 * u);
    ctx.fillStyle = kind === 'good' ? '#EAF0F4' : '#F4EAD4'; ctx.fillRect(b.x, b.y, b.w, b.h); ctx.strokeStyle = SUMI; ctx.lineWidth = 1.8 * u; ctx.strokeRect(b.x, b.y, b.w, b.h);
    ctx.fillStyle = kind === 'good' ? INDIGO : kind === 'bad' ? '#8A7A68' : VERM; ctx.fillRect(b.x, b.y, kind === 'row' ? 8 * u : b.w, kind === 'row' ? b.h : 8 * u);
    ctx.restore();
  },
  bullet(K, i, b, p) {
    if (p <= 0) return; const { ctx, u } = K, [cx, cy] = L.center(b), r = Math.min(b.w, b.h) * 0.42 * L.E.back(p); if (r <= 0) return;
    ctx.fillStyle = VERM; ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.fill(); ctx.strokeStyle = SUMI; ctx.lineWidth = 1.5 * u; ctx.stroke();
    L.text(ctx, String(i + 1), cx, cy + r * 0.36, { font: K.S.type.display(r * 1.05), color: CREAM, align: 'center' });
  },
  number(K, str, box, p, s, o) { title(K, str, box, p, { align: 'center', color: o?.small ? VERM : INDIGO, reveal: 'rise', max: o?.small ? 130 : 280 }); },
  quote(K, str, box, p) { title(K, '「' + str + '」', below(K, box), p, { size: 'm', max: 90, color: SUMI, reveal: 'rise' }); },
  portrait(K, box, p, s) {
    if (p <= 0) return; const { ctx, u } = K, f = fitSubject(K, { ...box, y: box.y + box.h * 0.06, h: box.h * 0.94 }), img = BLOCK(f.subj.h);
    // printed block by block: key line first, then colors (simulated by a wipe from the left with a vermilion registration mark)
    const e = L.E.inOut(L.clamp(p * 1.1));
    ctx.save(); ctx.beginPath(); ctx.rect(f.x - 10, f.y, (f.w + 20) * e, f.h); ctx.clip(); ctx.drawImage(img, f.x, f.y); ctx.restore();
    if (e < 1) { ctx.fillStyle = VERM; ctx.fillRect(f.x - 10 + (f.w + 20) * e, f.y, 3 * u, f.h); }
  },
  mascot(K, box, p, s) {
    if (p <= 0) return; const ctx = K.ctx, u = K.u; ctx.save(); ctx.globalAlpha = L.clamp(p * 1.6);
    L.mascot(ctx, K.spec.mascot, { ...box, y: box.y + (1 - L.E.back(p)) * 24 * u }, { color: K.P.mascot, stroke: (path) => { ctx.strokeStyle = SUMI; ctx.lineWidth = 4; ctx.stroke(path); }, ink: SUMI, eye: SUMI });
    ctx.restore();
  },
  media(K, img, box, p, s, frame) {
    if (p <= 0) return; const { ctx, u } = K; box = below(K, box); box = { ...box, h: box.h - 20 * u };
    const o = drawFrame(K, img, box, p, frame, { bezel: SUMI, stroke: SUMI, strokeW: 2, shadowColor: 'rgba(26,26,30,.25)' });
    ctx.save(); ctx.globalAlpha = L.clamp(p * 2 - 1); ctx.strokeStyle = VERM; ctx.lineWidth = 2 * u; ctx.strokeRect(o.x - 12 * u, o.y - 12 * u, o.w + 24 * u, o.h + 24 * u); ctx.restore();
  },
  prompt(K, str, box, p, s, tp) {
    if (p <= 0) return; const { u } = K; K.S.panel(K, box, p, s, 'note');
    para(K, str.slice(0, Math.ceil(str.length * tp)) + (tp < 1 || (K.frame >> 3) % 2 ? '｜' : ''), { x: box.x + 26 * u, y: box.y + 16 * u, w: box.w - 44 * u, h: box.h - 26 * u }, 1, { color: SUMI, max: 32, valign: 'middle' });
  },
  caption(K, words, act, box, p) {
    const { ctx, u } = K; ctx.save(); ctx.globalAlpha = p; ctx.font = K.S.type.bodyEm(32 * u);
    const w = ctx.measureText(words.join(' ')).width + 90 * u, x = box.x + (box.w - w) / 2;
    ctx.fillStyle = '#F4EAD4'; ctx.fillRect(x, box.y, w, box.h); ctx.strokeStyle = SUMI; ctx.lineWidth = 1.6 * u; ctx.strokeRect(x, box.y, w, box.h);
    ctx.fillStyle = VERM; ctx.fillRect(x, box.y, 12 * u, box.h); ctx.fillRect(x + w - 12 * u, box.y, 12 * u, box.h);
    let cx = x + 45 * u; words.forEach((wd, i) => { ctx.fillStyle = i === act ? VERM : i < act ? SUMI : 'rgba(26,26,30,.42)'; ctx.fillText(wd, cx, box.y + box.h * 0.66); cx += ctx.measureText(wd + ' ').width; });
    ctx.restore();
  },
  connector(K, a, b, p) { // brush-like line
    if (p <= 0) return; const { ctx, u } = K; ctx.save(); ctx.strokeStyle = SUMI; ctx.lineCap = 'round';
    for (let k = 0; k < 3; k++) { ctx.lineWidth = (4 - k) * u; ctx.globalAlpha = 0.35 + k * 0.2; ctx.beginPath(); ctx.moveTo(a[0], a[1] + (k - 1) * 1.5 * u); ctx.lineTo(a[0] + (b[0] - a[0]) * p, a[1] + (b[1] - a[1]) * p + (k - 1) * 1.5 * u); ctx.stroke(); }
    ctx.restore();
  },
  button(K, str, b, p) {
    if (p <= 0) return; const { ctx, u } = K, [cx, cy] = L.center(b); ctx.save(); ctx.translate(cx, cy); const sc = 0.85 + 0.15 * L.E.back(p); ctx.scale(sc, sc); ctx.translate(-cx, -cy); ctx.globalAlpha = L.clamp(p * 1.5);
    ctx.fillStyle = VERM; ctx.fillRect(b.x, b.y, b.w, b.h); ctx.strokeStyle = SUMI; ctx.lineWidth = 2 * u; ctx.strokeRect(b.x, b.y, b.w, b.h);
    para(K, str, L.inset(b, b.h * 0.3, b.h * 0.2), 1, { font: sz => K.S.type.label(sz), color: CREAM, max: 34, align: 'center', ls: 0.06 }); ctx.restore();
  },
  transition(K, A, B, p, info) { // a great wave sweeps across and leaves the new print behind
    const { ctx, W, H, u } = K, e = L.E.inOut(info.raw), x = e * (W + 520 * u) - 260 * u;
    ctx.drawImage(A, 0, 0); ctx.save(); ctx.beginPath(); ctx.rect(0, 0, Math.max(0, x - 120 * u), H); ctx.clip(); ctx.drawImage(B, 0, 0); ctx.restore();
    // wave front: indigo wall with foam edge
    ctx.save(); const wall = new Path2D(); wall.moveTo(x - 140 * u, 0); for (let y = 0; y <= H; y += 30 * u) wall.lineTo(x + Math.sin(y / (70 * u) + info.raw * 6) * 26 * u, y); wall.lineTo(x - 140 * u, H); wall.closePath();
    ctx.fillStyle = INDIGO; ctx.fill(wall); ctx.save(); ctx.clip(wall); ctx.strokeStyle = AI; ctx.lineWidth = 4 * u; for (let k = 1; k < 5; k++) { ctx.beginPath(); for (let y = 0; y <= H; y += 30 * u) ctx.lineTo(x - k * 26 * u + Math.sin(y / (70 * u) + info.raw * 6 + k) * 20 * u, y); ctx.stroke(); } ctx.restore();
    ctx.fillStyle = FOAM; ctx.strokeStyle = SUMI; ctx.lineWidth = 1.2 * u; for (let y = 10 * u; y < H; y += 44 * u) { const fx = x + Math.sin(y / (70 * u) + info.raw * 6) * 26 * u; ctx.beginPath(); ctx.arc(fx + 8 * u, y, 13 * u, 0, 7); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.arc(fx + 20 * u, y + 12 * u, 7 * u, 0, 7); ctx.fill(); ctx.stroke(); }
    ctx.restore();
  },
  overlay(K) { const ctx = K.ctx; ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = 0.25; ctx.drawImage(washi, 0, 0); ctx.restore(); L.drawGrain(ctx, grain, K.frame, 0.05, 'multiply'); },
};
