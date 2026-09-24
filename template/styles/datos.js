// Periodismo de datos — diario económico: papel salmón, serif editorial, gráficas que se dibujan, anotaciones con líneas guía, fuente al pie.
import * as L from '../engine/lib.js';
import { BASE, title, para, drawFrame } from '../engine/base.js';

const PAPER = '#F6E4D5', INK = '#1E1A17', BLUE = '#1B5C8F', CLARET = '#9B2242', MUTED = '#6F6259', RULE = 'rgba(30,26,23,.22)', GRID = 'rgba(30,26,23,.09)';
let paperC;
const SECTIONS = ['ANÁLISIS', 'MERCADOS', 'TENDENCIAS', 'DATOS', 'OPINIÓN'];
// stippled "hedcut" portrait (fine halftone in ink), pre-rendered per height
const HEDCUT = L.memo(h => {
  const S = window.K.subject(h), c = L.canvas(S.w, S.h), x = c.getContext('2d'), Lb = L.blurL(S.L, S.w, S.h, 1);
  for (let i = 0; i < Lb.length; i++) Lb[i] = L.clamp((Lb[i] - 0.06) * 1.45);
  L.halftone(x, Lb, S.A, S.w, S.h, 0, 0, { cell: Math.max(4, h / 170), angle: 0.785, color: INK, gamma: 1.15 });
  return c;
});

export default {
  id: 'datos', name: 'Periodismo de datos',
  fonts: 'Newsreader:ital,opsz,wght@0,6..72,500;0,6..72,700;1,6..72,500&family=Libre+Franklin:wght@400;600;700&family=IBM+Plex+Mono:wght@400;500',
  fontLoads: ['500 60px Newsreader', '700 60px Newsreader', 'italic 500 60px Newsreader', '400 30px "Libre Franklin"', '600 30px "Libre Franklin"', '700 30px "Libre Franklin"', '400 20px "IBM Plex Mono"', '500 20px "IBM Plex Mono"'],
  palette: { bg: PAPER, ink: INK, accent: BLUE, muted: MUTED, panel: '#FBF0E6', line: RULE, good: BLUE, bad: CLARET, mascot: BLUE },
  type: { display: s => `500 ${s}px Newsreader`, em: s => `italic 500 ${s}px Newsreader`, bold: s => `700 ${s}px Newsreader`, body: s => `400 ${s}px "Libre Franklin"`, bodyEm: s => `600 ${s}px "Libre Franklin"`, label: s => `700 ${s}px "Libre Franklin"`, mono: s => `400 ${s}px "IBM Plex Mono"` },
  ls: -0.015, lh: 1.04,
  sfx: 'paper', transDur: 0.65, push: 0.02,
  music: 'understated documentary score, pizzicato strings, soft piano ostinato, light ticking percussion, analytical and curious, 100 BPM, instrumental, news analysis',
  async setup(K) { paperC = L.canvas(K.W, K.H); L.paper(paperC.getContext('2d'), PAPER, { seed: 14, grain: 0.035, blotch: 0.03, fibers: 300 }); },
  background(K, s) {
    const { ctx, W, H, u } = K; ctx.drawImage(paperC, 0, 0);
    const m = 70 * u, y = (K.vertical ? 96 : 66) * u;
    // masthead: section tag, rule, edition line
    ctx.fillStyle = CLARET; ctx.fillRect(m, y - 30 * u, 6 * u, 26 * u);
    L.text(ctx, SECTIONS[s.i % SECTIONS.length], m + 16 * u, y - 10 * u, { font: K.S.type.label(18 * u), color: INK, ls: 2 });
    L.text(ctx, `Edición especial · p. ${s.i + 1}`, W - m, y - 10 * u, { font: K.S.type.em(20 * u), color: MUTED, align: 'right' });
    ctx.fillStyle = INK; ctx.fillRect(m, y, W - 2 * m, 2 * u); ctx.fillRect(m, y + 5 * u, W - 2 * m, 0.8 * u);
  },
  headline(K, str, box, p, s, o = {}) {
    const top = (K.vertical ? 130 : 100) * K.u; if (box.y < top) box = { ...box, y: top, h: box.h - (top - box.y) };
    title(K, str, box, p, { align: o.align === 'center' && s.type !== 'chapter' && s.type !== 'statement' ? 'left' : o.align, size: o.size, color: INK, emColor: BLUE, emFont: sz => K.S.type.em(sz), reveal: 'wipe', valign: s.type === 'hook' || s.type === 'cta' ? 'middle' : 'top' });
  },
  text(K, str, box, p, role, s, o = {}) {
    const top = (K.vertical ? 130 : 100) * K.u; if (box.y < top) box = { ...box, y: top, h: box.h - (top - box.y) };
    if (role === 'kicker' || role === 'label') return para(K, str, box, p, { font: sz => K.S.type.label(sz), color: CLARET, upper: true, ls: 0.12, max: 22, align: o.align === 'center' && s.type !== 'statement' && s.type !== 'stat' ? 'left' : o.align || 'left' });
    if (role === 'headBad' || role === 'headGood') return title(K, str, box, p, { color: role === 'headGood' ? BLUE : CLARET, max: 58, reveal: 'wipe', font: sz => K.S.type.bold(sz) });
    if (role === 'body') return para(K, str, box, p, { font: sz => K.S.type.em(sz), color: '#4A3F38', max: 44, align: o.align || 'left' });
    return BASE.text(K, str, box, p, role, s, { color: role === 'bad' ? MUTED : INK, ...o });
  },
  panel(K, b, p, s, kind) {
    if (p <= 0) return; const { ctx, u } = K, e = L.E.inOut(p);
    if (kind === 'row') { ctx.fillStyle = RULE; ctx.fillRect(b.x, b.y + b.h + 2 * u, b.w * e, 1); return; }
    ctx.save(); ctx.globalAlpha = L.clamp(p * 1.4); ctx.fillStyle = 'rgba(255,248,240,.55)'; ctx.fillRect(b.x, b.y, b.w, b.h);
    ctx.fillStyle = kind === 'good' ? BLUE : kind === 'bad' ? CLARET : INK; ctx.fillRect(b.x, b.y, b.w * e, 4 * u);
    ctx.strokeStyle = RULE; ctx.lineWidth = 1; ctx.strokeRect(b.x, b.y, b.w, b.h); ctx.restore();
  },
  bullet(K, i, b, p) { if (p <= 0) return; para(K, (i + 1) + '.', b, p, { font: sz => K.S.type.bold(sz), color: BLUE, max: b.h * 0.8 / K.u, align: 'right' }); },
  number(K, str, box, p, s, o = {}) {
    const { ctx, u } = K;
    if (o.small) return title(K, str, box, p, { align: 'center', color: CLARET, reveal: 'wipe', max: 120, font: sz => K.S.type.bold(sz) });
    // big figure on top + a mini bar chart that draws itself, with an annotation and source line
    const nb = { x: box.x, y: box.y, w: box.w, h: box.h * 0.44 }; title(K, str, nb, p, { align: 'center', color: INK, reveal: 'fade', max: 190, font: sz => K.S.type.bold(sz) });
    const cw = Math.min(box.w * 0.62, 820 * u), cb = { x: box.x + (box.w - cw) / 2, y: box.y + box.h * 0.53, w: cw, h: box.h * 0.4 };
    const r = L.rng(Math.round(Math.abs(Number(String(str).replace(/[^\d.]/g, '')) || 7))), n = 9, vals = Array.from({ length: n }, (_, k) => 0.18 + 0.72 * Math.pow(k / (n - 1), 1.6) + (r() - 0.5) * 0.1); vals[n - 1] = 1;
    ctx.fillStyle = GRID; for (let g = 0; g <= 4; g++) ctx.fillRect(cb.x, cb.y + cb.h - cb.h * g / 4, cb.w, 1);
    const bw = cb.w / n * 0.62, dp = s ? L.clamp((s.t - 0.35) / 1.3) : p;
    vals.forEach((v, k) => { const q = L.E.out(L.clamp(dp * 1.6 - k * 0.07)), bh = cb.h * v * q, x = cb.x + k * cb.w / n + (cb.w / n - bw) / 2; ctx.fillStyle = k === n - 1 ? BLUE : 'rgba(30,26,23,.28)'; ctx.fillRect(x, cb.y + cb.h - bh, bw, bh); });
    ctx.fillStyle = INK; ctx.fillRect(cb.x, cb.y + cb.h, cb.w, 1.5 * u);
    const ap = L.clamp(dp * 1.6 - 1.1); if (ap > 0) { // annotation with a leader line to the last bar
      const lx = cb.x + (n - 1) * cb.w / n + cb.w / n / 2, ly = cb.y + cb.h * 0.02, tx = lx - 170 * u, ty = cb.y - 16 * u;
      ctx.save(); ctx.globalAlpha = ap; ctx.strokeStyle = INK; ctx.lineWidth = 1.2 * u; ctx.beginPath(); ctx.moveTo(tx + 150 * u, ty + 6 * u); ctx.lineTo(lx, ty + 6 * u); ctx.lineTo(lx, ly); ctx.stroke();
      L.text(ctx, 'hoy', tx + 140 * u, ty + 12 * u, { font: K.S.type.em(24 * u), color: INK, align: 'right' }); ctx.restore();
    }
    L.text(ctx, 'Fuente: ' + (s?.d?.source || 'elaboración propia con datos del video'), cb.x, cb.y + cb.h + 26 * u, { font: K.S.type.mono(17 * u), color: MUTED, alpha: L.clamp(dp * 2 - 0.4) });
  },
  quote(K, str, box, p) { title(K, '“' + str + '”', box, p, { size: 'm', max: 96, color: INK, reveal: 'words', font: sz => K.S.type.em(sz) }); },
  portrait(K, box, p, s) {
    if (p <= 0) return; const { ctx, u } = K, img = HEDCUT(Math.round(box.h * 0.92)), x = box.x + (box.w - img.width) / 2, y = box.y + box.h - img.height;
    ctx.save(); ctx.beginPath(); ctx.rect(x - 10, y + img.height * (1 - L.E.inOut(L.clamp(p * 1.2))), img.width + 20, img.height); ctx.clip(); ctx.drawImage(img, x, y); ctx.restore();
    if (s.type === 'hook' || s.type === 'cta') { ctx.fillStyle = RULE; ctx.fillRect(box.x + box.w * 0.08, box.y + box.h * 0.1, 1, box.h * 0.8 * L.E.out(p)); }
  },
  mascot(K, box, p, s, mood) { if (p <= 0) return; const ctx = K.ctx; ctx.save(); ctx.globalAlpha = L.clamp(p * 1.8); L.mascot(ctx, K.spec.mascot, { ...box, y: box.y + (1 - L.E.back(p)) * 20 * K.u }, { color: BLUE, ink: INK, eye: '#FBF0E6', eyeStyle: mood === 'happy' ? 'happy' : 'dot', outline: false }); ctx.restore(); },
  media(K, img, box, p, s, frame) {
    const o = drawFrame(K, img, box, p, frame, { shadow: false, stroke: INK, strokeW: 1.2, bezel: INK, card: '#FBF0E6', barColor: '#EBD8C8' });
    if (o) { L.text(K.ctx, 'Imagen: captura de pantalla real', o.x, o.y + o.h + 26 * K.u, { font: K.S.type.mono(15 * K.u), color: MUTED, alpha: L.clamp(p * 2 - 1) }); }
  },
  prompt(K, str, box, p, s, tp) {
    if (p <= 0) return; const { ctx, u } = K; ctx.save(); ctx.globalAlpha = L.clamp(p * 1.5);
    ctx.fillStyle = INK; ctx.fillRect(box.x, box.y, 4 * u, box.h); L.text(ctx, 'LA PREGUNTA', box.x + 18 * u, box.y + 20 * u, { font: K.S.type.label(15 * u), color: CLARET, ls: 1.5 }); ctx.restore();
    para(K, '«' + str.slice(0, Math.ceil(str.length * tp)) + (tp < 1 ? '▍' : '»'), { x: box.x + 18 * u, y: box.y + 26 * u, w: box.w - 20 * u, h: box.h - 26 * u }, 1, { font: sz => K.S.type.em(sz), color: INK, max: 36, valign: 'middle' });
  },
  caption(K, words, act, box, p) {
    const { ctx, u } = K; ctx.save(); ctx.globalAlpha = p; ctx.font = K.S.type.bodyEm(31 * u);
    const w = ctx.measureText(words.join(' ')).width + 56 * u, x = box.x + (box.w - w) / 2;
    ctx.fillStyle = '#FFF8F1'; ctx.fillRect(x, box.y, w, box.h); ctx.fillStyle = INK; ctx.fillRect(x, box.y, 4 * u, box.h);
    let cx = x + 28 * u; words.forEach((wd, i) => { const ww = ctx.measureText(wd).width; ctx.fillStyle = i <= act ? INK : '#A89A8F'; ctx.fillText(wd, cx, box.y + box.h * 0.64); if (i === act) { ctx.fillStyle = BLUE; ctx.fillRect(cx, box.y + box.h * 0.76, ww, 3 * u); } cx += ctx.measureText(wd + ' ').width; });
    ctx.restore();
  },
  connector(K, a, b, p) { if (p <= 0) return; const ctx = K.ctx; ctx.save(); ctx.strokeStyle = INK; ctx.lineWidth = 1.2 * K.u; ctx.setLineDash([4 * K.u, 5 * K.u]); ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(a[0] + (b[0] - a[0]) * p, a[1] + (b[1] - a[1]) * p); ctx.stroke(); ctx.restore(); },
  button(K, str, b, p) { if (p <= 0) return; const ctx = K.ctx; ctx.save(); ctx.globalAlpha = L.clamp(p * 1.5); ctx.fillStyle = BLUE; ctx.fillRect(b.x, b.y, b.w * L.E.out(p), b.h); ctx.restore(); para(K, str, L.inset(b, b.h * 0.35, b.h * 0.2), L.clamp(p * 2 - 0.5), { font: sz => K.S.type.label(sz), color: '#FFFFFF', max: 30, align: 'center' }); },
  transition(K, A, B, p, info) { // page turn: the new page slides over from the right edge, the old one darkens under the fold
    const { ctx, W, H, u } = K, r = L.E.inOut(info.raw), x = W * (1 - r);
    ctx.drawImage(A, -W * 0.12 * r, 0); ctx.fillStyle = `rgba(30,20,10,${0.35 * r})`; ctx.fillRect(0, 0, W, H);
    ctx.save(); ctx.beginPath(); ctx.rect(x, 0, W - x + 1, H); ctx.clip(); ctx.drawImage(B, 0, 0); ctx.restore();
    const g = ctx.createLinearGradient(x - 40 * u, 0, x + 60 * u, 0); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.4, 'rgba(0,0,0,.22)'); g.addColorStop(0.5, 'rgba(255,245,235,.35)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    if (r > 0 && r < 1) { ctx.fillStyle = g; ctx.fillRect(x - 40 * u, 0, 100 * u, H); }
  },
  overlay(K) { const ctx = K.ctx; ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = 0.18; ctx.drawImage(paperC, 0, 0); ctx.restore(); },
};
