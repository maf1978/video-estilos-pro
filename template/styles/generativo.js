// Arte generativo / plotter — papel blanco cálido, dos plumas (tinta + naranja), la persona trazada por un flow-field
// que sigue sus contornos; todo se "plotea" en vivo y cada lámina lleva su metadata de plot.
import * as L from '../engine/lib.js';
import { BASE, title, para, fitSubject, drawFrame } from '../engine/base.js';

const INK = '#1C1B22', OR = '#D9653B', PAPER = '#F5F2EA', GREY = '#6B6874';
let paperC, grain;
const BUCKETS = 48;

// Flow-field portrait, precomputed per height: strokes grouped in buckets ordered top→bottom (the plotter's pass order).
const FLOW = L.memo(h => {
  const S = window.K.subject(h), w = S.w, n = w * S.h, A = S.A;
  // histogram-equalize luminance inside the silhouette so faces keep their features
  const Lb = L.blurL(S.L, w, S.h, 2), hist = new Float32Array(256); let cnt = 0;
  for (let i = 0; i < n; i++) if (A[i] > 0.5) { hist[Math.min(255, Lb[i] * 255 | 0)]++; cnt++; }
  const cdf = new Float32Array(256); let acc = 0; for (let k = 0; k < 256; k++) { acc += hist[k]; cdf[k] = acc / (cnt || 1); }
  const Q = new Float32Array(n); for (let i = 0; i < n; i++) Q[i] = 0.55 * cdf[Math.min(255, Lb[i] * 255 | 0)] + 0.45 * L.clamp((Lb[i] - 0.06) * 1.5);
  const Qc = L.blurL(Q, w, S.h, 3), nz = L.noise2(55), r = L.rng(55);
  const buckets = Array.from({ length: BUCKETS }, () => new Path2D());
  const scale = h / 1000, step = 2.2 * scale, tries = Math.round(70000 * (w * S.h) / (620 * 1000));
  let strokes = 0;
  const angle = (x, y) => {
    const xi = Math.min(w - 2, Math.max(1, x | 0)), yi = Math.min(S.h - 2, Math.max(1, y | 0)), q = yi * w + xi;
    const gx = Qc[q + 1] - Qc[q - 1], gy = Qc[q + w] - Qc[q - w], gm = Math.hypot(gx, gy);
    const na = nz(x / (90 * scale), y / (90 * scale)) * Math.PI * 4, ga = Math.atan2(gy, gx) + Math.PI / 2, wg = Math.min(0.8, gm * 22);
    return [Math.atan2(Math.sin(na) * (1 - wg) + Math.sin(ga) * wg, Math.cos(na) * (1 - wg) + Math.cos(ga) * wg), gm];
  };
  const Qf = L.blurL(Q, w, S.h, 1), R = new Float32Array(n); for (let i = 0; i < n; i++) R[i] = L.clamp((Lb[i] - 0.05) / 0.72);
  const inside = (x, y) => x >= 0 && y >= 0 && x < w && y < S.h && A[(y | 0) * w + (x | 0)] > 0.5;
  const bucket = y => buckets[Math.min(BUCKETS - 1, Math.max(0, Math.floor(y / S.h * BUCKETS)))];
  const line = (x, y, a, len) => { const b = bucket(y); let px = x, py = y; b.moveTo(px, py); for (let st = 0; st < len; st++) { px += Math.cos(a) * step; py += Math.sin(a) * step; if (!inside(px, py)) break; b.lineTo(px, py); } };
  // 1) dark masses (hair, clothes): flow-field strokes that follow the form
  for (let k = 0; k < tries; k++) {
    let x = r() * w, y = r() * S.h; if (!inside(x, y)) continue;
    const q = R[(y | 0) * w + (x | 0)]; if (q > 0.3) continue;
    const dark = Math.pow(1 - q, 1.5); if (r() > dark * 0.95) continue;
    const b = bucket(y), len = 5 + dark * 20; b.moveTo(x, y);
    for (let st = 0; st < len; st++) { const [a] = angle(x, y); x += Math.cos(a) * step; y += Math.sin(a) * step; if (!inside(x, y)) break; b.lineTo(x, y); }
    strokes++;
  }
  // 2) light and mid tones (faces, hands): classic pen hatching + cross-hatch, density by tone
  const H1 = -0.78, H2 = 0.62;
  for (let k = 0; k < tries * 1.6; k++) {
    const x = r() * w, y = r() * S.h; if (!inside(x, y)) continue;
    const q = R[(y | 0) * w + (x | 0)]; if (q <= 0.3) continue;
    const t = Math.pow(L.clamp(1 - (q - 0.3) / 0.62), 1.9); if (r() > t * 0.62 + 0.005) continue;
    line(x, y, H1, (3 + 5 * t) * 1.2); strokes++;
    if (q < 0.55 && r() < (0.55 - q) * 2.4) { line(x, y, H2, (3 + 4 * t) * 1.2); strokes++; }
  }
  // 3) contours: short strokes along strong edges (eyes, brows, nose, jaw, silhouette)
  for (let k = 0; k < tries * 0.9; k++) {
    const x = r() * w, y = r() * S.h; if (!inside(x, y)) continue;
    const xi = Math.min(w - 2, Math.max(1, x | 0)), yi = Math.min(S.h - 2, Math.max(1, y | 0)), q = yi * w + xi;
    const gx = Qf[q + 1] - Qf[q - 1], gy = Qf[q + w] - Qf[q - w], gm = Math.hypot(gx, gy);
    if (gm < 0.06 || r() > Math.min(0.8, gm * 5)) continue;
    const a = Math.atan2(gy, gx) + Math.PI / 2; line(x - Math.cos(a) * step * 2, y - Math.sin(a) * step * 2, a, 5); strokes++;
  }
  const full = L.canvas(w, S.h), fx = full.getContext('2d'); fx.strokeStyle = INK; fx.globalAlpha = 0.55; fx.lineWidth = Math.max(0.7, 0.85 * scale); fx.lineCap = 'round';
  buckets.forEach(b => fx.stroke(b));
  return { full, buckets, strokes, w, h: S.h, lw: fx.lineWidth };
});
const below = (K, b) => { const m = (K.vertical ? 150 : 120) * K.u; return b.y < m ? { ...b, y: m, h: Math.max(b.h - (m - b.y), b.h * 0.6) } : b; };

export default {
  id: 'generativo', name: 'Arte generativo',
  fonts: 'Instrument+Serif:ital@0;1&family=IBM+Plex+Mono:wght@400;500',
  fontLoads: ['400 100px "Instrument Serif"', 'italic 400 100px "Instrument Serif"', '400 20px "IBM Plex Mono"', '500 20px "IBM Plex Mono"'],
  palette: { bg: PAPER, ink: INK, accent: OR, muted: GREY, panel: PAPER, line: 'rgba(28,27,34,.25)', good: INK, bad: GREY, mascot: OR },
  type: { display: s => `400 ${s}px "Instrument Serif"`, em: s => `italic 400 ${s}px "Instrument Serif"`, body: s => `400 ${s}px "IBM Plex Mono"`, bodyEm: s => `500 ${s}px "IBM Plex Mono"`, label: s => `500 ${s}px "IBM Plex Mono"`, mono: s => `400 ${s}px "IBM Plex Mono"` },
  lh: 0.98, ls: -0.015,
  sfx: 'mechanical', transDur: 0.7, push: 0.015,
  music: 'generative ambient electronica, modular synth arpeggios, soft glitchy percussion, warm analog pads, 104 BPM, instrumental, precise and contemplative',
  async setup(K) {
    paperC = L.canvas(K.W, K.H); L.paper(paperC.getContext('2d'), PAPER, { seed: 30, grain: 0.035, blotch: 0.02, fibers: 200 });
    grain = L.grainTiles(4, 256, 0.4, 30);
  },
  background(K, s) {
    const { ctx, W, H, u } = K; ctx.drawImage(paperC, 0, 0);
    // crop marks + registration target: a plotter sheet
    const m = 34 * u, l = 26 * u; ctx.strokeStyle = 'rgba(28,27,34,.45)'; ctx.lineWidth = 1 * u;
    for (const [x, y, dx, dy] of [[m, m, 1, 1], [W - m, m, -1, 1], [m, H - m, 1, -1], [W - m, H - m, -1, -1]]) { ctx.beginPath(); ctx.moveTo(x, y + dy * l); ctx.lineTo(x, y); ctx.lineTo(x + dx * l, y); ctx.stroke(); }
    const rx = W - 70 * u, ry = 70 * u; ctx.beginPath(); ctx.arc(rx, ry, 10 * u, 0, 7); ctx.moveTo(rx - 16 * u, ry); ctx.lineTo(rx + 16 * u, ry); ctx.moveTo(rx, ry - 16 * u); ctx.lineTo(rx, ry + 16 * u); ctx.stroke();
    const f = K.S.type.label(18 * u);
    L.text(ctx, `PLOT ${String(s.i + 1).padStart(3, '0')} · SEED ${(s.i * 37 + 5) % 97}.${s.i % 10}`, 78 * u, 78 * u, { font: f, color: INK });
    L.text(ctx, `2 plumas · ${Math.round(K.t * 1000 + 1200).toLocaleString('es-MX')} trazos`, 78 * u, 104 * u, { font: K.S.type.mono(18 * u), color: GREY });
  },
  headline(K, str, box, p, s, o = {}) { title(K, str, below(K, box), p, { align: o.align, size: o.size, color: INK, emColor: OR, reveal: 'wipe', valign: 'middle' }); },
  text(K, str, box, p, role, s, o = {}) {
    box = below(K, box);
    if (role === 'kicker' || role === 'label') return para(K, str, box, p, { font: sz => K.S.type.label(sz), color: OR, upper: true, ls: 0.08, max: 22, align: o.align || 'left', reveal: 'type' });
    if (role === 'headBad' || role === 'headGood') return title(K, str, box, p, { color: role === 'headGood' ? OR : INK, max: 76, reveal: 'wipe', valign: 'top' });
    return BASE.text(K, str, box, p, role, s, { color: role === 'bad' ? GREY : role === 'body' ? '#3E3C47' : INK, max: role === 'item' ? 36 : 32, reveal: role === 'body' ? 'type' : 'fade', ...o });
  },
  panel(K, b, p, s, kind, j = 0) { // pen outline + plotter hatching
    if (p <= 0) return; const { ctx, u } = K, e = L.E.inOut(p); ctx.save();
    ctx.beginPath(); ctx.rect(b.x - 4, b.y - 4, (b.w + 8) * e, b.h + 8); ctx.clip();
    ctx.strokeStyle = INK; ctx.lineWidth = 1.2 * u; ctx.strokeRect(b.x, b.y, b.w, b.h);
    if (kind !== 'row') { ctx.strokeStyle = kind === 'good' ? OR : 'rgba(28,27,34,.35)'; ctx.lineWidth = 0.8 * u; ctx.beginPath(); ctx.rect(b.x, b.y, b.w, b.h); ctx.clip(); for (let k = -b.h; k < b.w; k += (kind === 'good' ? 9 : 14) * u) { ctx.moveTo(b.x + k, b.y + b.h); ctx.lineTo(b.x + k + b.h, b.y); } ctx.globalAlpha = 0.35; ctx.stroke(); }
    else { ctx.strokeStyle = OR; ctx.lineWidth = 0.8 * u; ctx.beginPath(); for (let k = 0; k < 5; k++) { ctx.moveTo(b.x, b.y + b.h - k * 3 * u); ctx.lineTo(b.x + b.w * 0.18, b.y + b.h - k * 3 * u); } ctx.stroke(); }
    ctx.restore();
  },
  bullet(K, i, b, p) { // concentric pen circles
    if (p <= 0) return; const { ctx, u } = K, [cx, cy] = L.center(b), R = Math.min(b.w, b.h) / 2; ctx.save(); ctx.strokeStyle = OR; ctx.lineWidth = 1 * u;
    const rings = 7; for (let k = 0; k < rings * L.E.out(p); k++) { ctx.beginPath(); ctx.arc(cx, cy, R * (1 - k / rings * 0.85), 0, 7); ctx.stroke(); }
    ctx.fillStyle = PAPER; ctx.beginPath(); ctx.arc(cx, cy, R * 0.42, 0, 7); ctx.fill();
    L.text(ctx, String(i + 1), cx, cy + R * 0.22, { font: K.S.type.em(R * 0.8), color: INK, align: 'center', alpha: L.clamp(p * 2 - 0.4) }); ctx.restore();
  },
  number(K, str, box, p, s, o) {
    const r = title(K, str, box, p, { align: 'center', color: o?.small ? OR : INK, reveal: 'wipe', max: o?.small ? 130 : 320 });
    if (!o?.small && r) { const { ctx, u } = K, y = r.y0 + r.total + 10 * u; ctx.save(); ctx.strokeStyle = OR; ctx.lineWidth = 1 * u; ctx.beginPath(); for (let k = 0; k < 6; k++) { ctx.moveTo(box.x + box.w * 0.3, y + k * 4 * u); ctx.lineTo(box.x + box.w * (0.3 + 0.4 * L.E.inOut(L.clamp(p * 1.3 - k * 0.05))), y + k * 4 * u); } ctx.stroke(); ctx.restore(); }
  },
  quote(K, str, box, p) { title(K, '“' + str + '”', below(K, box), p, { size: 'm', max: 100, color: INK, reveal: 'wipe', font: sz => K.S.type.em(sz) }); },
  portrait(K, box, p, s) {
    if (p <= 0) return; const { ctx, u } = K, f = fitSubject(K, { ...box, y: box.y + box.h * 0.06, h: box.h * 0.94 }), F = FLOW(f.subj.h);
    if (p >= 1) { ctx.drawImage(F.full, f.x, f.y); return; }
    ctx.save(); ctx.translate(f.x, f.y); ctx.strokeStyle = INK; ctx.globalAlpha = 0.55; ctx.lineWidth = F.lw; ctx.lineCap = 'round';
    const n = BUCKETS * L.clamp(p * 1.05); for (let k = 0; k < Math.floor(n); k++) ctx.stroke(F.buckets[k]);
    // pen head position
    const yh = F.h * L.clamp(n / BUCKETS); ctx.globalAlpha = 1; ctx.fillStyle = OR; ctx.fillRect(-20 * u, yh, F.w + 40 * u, 1.5 * u);
    ctx.restore();
  },
  mascot(K, box, p, s) { // concentric-offset fill in orange pen
    if (p <= 0) return; const ctx = K.ctx, u = K.u; ctx.save();
    L.mascot(ctx, K.spec.mascot, box, {
      fill: (path) => { ctx.save(); ctx.clip(path); ctx.strokeStyle = OR; ctx.lineWidth = 1.3; const n = Math.round(18 * L.E.out(p)); for (let k = 0; k < n; k++) { ctx.save(); const sc = 1 - k * 0.05; ctx.translate(110 * (1 - sc), 80 * (1 - sc)); ctx.scale(sc, sc); ctx.lineWidth = 1.3 / sc; ctx.stroke(path); ctx.restore(); } ctx.restore(); },
      stroke: (path) => { ctx.strokeStyle = OR; ctx.lineWidth = 1.8; ctx.globalAlpha = L.clamp(p * 2); ctx.stroke(path); ctx.globalAlpha = 1; }, ink: INK, eye: INK,
    });
    ctx.restore();
  },
  media(K, img, box, p, s, frame) {
    if (p <= 0) return; const { ctx, u } = K; box = below(K, box); box = { ...box, h: box.h - 40 * u };
    const o = drawFrame(K, img, box, p, frame, { shadow: false, bezel: INK, stroke: INK, strokeW: 1 });
    ctx.save(); ctx.globalAlpha = L.clamp(p * 2 - 1); ctx.strokeStyle = INK; ctx.lineWidth = 1 * u; const c = 18 * u, g = 10 * u;
    for (const [x, y, dx, dy] of [[o.x - g, o.y - g, 1, 1], [o.x + o.w + g, o.y - g, -1, 1], [o.x - g, o.y + o.h + g, 1, -1], [o.x + o.w + g, o.y + o.h + g, -1, -1]]) { ctx.beginPath(); ctx.moveTo(x, y + dy * c); ctx.lineTo(x, y); ctx.lineTo(x + dx * c, y); ctx.stroke(); }
    L.text(ctx, `INPUT ${String(s.i + 1).padStart(2, '0')} · ${img.width}×${img.height}px`, o.x, o.y + o.h + 36 * u, { font: K.S.type.mono(17 * u), color: GREY }); ctx.restore();
  },
  prompt(K, str, box, p, s, tp) {
    if (p <= 0) return; const { ctx, u } = K; ctx.save(); ctx.globalAlpha = L.clamp(p * 1.5);
    ctx.fillStyle = INK; ctx.fillRect(box.x, box.y, box.w * L.E.out(p), 1.2 * u);
    L.text(ctx, 'INPUT', box.x, box.y + 28 * u, { font: K.S.type.label(17 * u), color: GREY });
    para(K, '"' + str.slice(0, Math.ceil(str.length * tp)) + (tp < 1 ? '' : '"'), { x: box.x, y: box.y + 38 * u, w: box.w, h: box.h - 38 * u }, 1, { font: sz => K.S.type.em(sz), color: INK, max: 44, valign: 'top' });
    ctx.restore();
  },
  caption(K, words, act, box, p) {
    const { ctx, u } = K; ctx.save(); ctx.globalAlpha = p; ctx.font = K.S.type.mono(30 * u);
    const w = ctx.measureText(words.join(' ')).width, x = box.x + (box.w - w) / 2, y = box.y + box.h * 0.62;
    ctx.fillStyle = 'rgba(245,242,234,.9)'; ctx.fillRect(x - 24 * u, box.y + 4 * u, w + 48 * u, box.h - 8 * u);
    ctx.strokeStyle = INK; ctx.lineWidth = 1 * u; ctx.strokeRect(x - 24 * u, box.y + 4 * u, w + 48 * u, box.h - 8 * u);
    let cx = x; words.forEach((wd, i) => { const ww = ctx.measureText(wd).width; ctx.fillStyle = i === act ? OR : i < act ? INK : 'rgba(28,27,34,.4)'; ctx.fillText(wd, cx, y); if (i === act) ctx.fillRect(cx, y + 8 * u, ww, 2 * u); cx += ctx.measureText(wd + ' ').width; });
    ctx.restore();
  },
  connector(K, a, b, p) { // three parallel pen lines
    if (p <= 0) return; const ctx = K.ctx, u = K.u, dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy) || 1, nx = -dy / len, ny = dx / len;
    ctx.save(); ctx.strokeStyle = INK; ctx.lineWidth = 1 * u; ctx.beginPath(); for (let k = -1; k <= 1; k++) { ctx.moveTo(a[0] + nx * k * 4 * u, a[1] + ny * k * 4 * u); ctx.lineTo(a[0] + dx * p + nx * k * 4 * u, a[1] + dy * p + ny * k * 4 * u); } ctx.stroke(); ctx.restore();
  },
  button(K, str, b, p) {
    if (p <= 0) return; const { ctx, u } = K; ctx.save(); ctx.globalAlpha = L.clamp(p * 1.5); ctx.strokeStyle = OR; ctx.lineWidth = 1 * u;
    ctx.beginPath(); ctx.rect(b.x, b.y, b.w, b.h); ctx.save(); ctx.clip(); ctx.beginPath(); for (let k = 0; k < b.h; k += 5 * u) { ctx.moveTo(b.x, b.y + k); ctx.lineTo(b.x + b.w * L.E.inOut(p), b.y + k); } ctx.globalAlpha = 0.5; ctx.stroke(); ctx.restore();
    ctx.lineWidth = 1.6 * u; ctx.strokeRect(b.x, b.y, b.w, b.h);
    para(K, str, L.inset(b, b.h * 0.3, b.h * 0.2), 1, { font: sz => K.S.type.label(sz), color: INK, max: 30, align: 'center' }); ctx.restore();
  },
  transition(K, A, B, p, info) { // a pen carriage sweeps across; behind it, the new sheet
    const { ctx, W, H, u } = K, x = L.E.inOut(info.raw) * (W + 200 * u) - 100 * u;
    ctx.drawImage(A, 0, 0); ctx.save(); ctx.beginPath(); ctx.rect(0, 0, Math.max(0, x), H); ctx.clip(); ctx.drawImage(B, 0, 0); ctx.restore();
    ctx.save(); ctx.strokeStyle = INK; ctx.lineWidth = 1 * u; ctx.beginPath();
    for (let k = 0; k < 42; k++) { const y0 = k / 41 * H, wob = Math.sin(k * 1.7 + info.raw * 9) * 30 * u; ctx.moveTo(x - 90 * u + wob, y0); ctx.lineTo(x + wob * 0.3, y0 + 6 * u); }
    ctx.globalAlpha = 0.55; ctx.stroke(); ctx.globalAlpha = 1; ctx.fillStyle = OR; ctx.fillRect(x, 0, 3 * u, H); ctx.restore();
  },
  overlay(K) { L.drawGrain(K.ctx, grain, K.frame, 0.05, 'multiply'); },
};
