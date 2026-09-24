// Lámina de patente — papel envejecido, doble marco, encabezado de especificación, la persona grabada en líneas tipo billete,
// etiquetas A/B/C con líneas guía y "FIG." como en una patente del siglo XIX.
import * as L from '../engine/lib.js';
import { BASE, title, para, fitSubject, drawFrame } from '../engine/base.js';

// chrome: header/footer labels (scene numbers, rules, HUDs). Off with `chrome: false` in the video spec.
const CH = K => K.spec.chrome !== false;

const INK = '#2B2118', RED = '#8E2A1E', PAPER = '#EDE2C6';
let paperC, grain;
const LETTERS = 'ABCDEFGH';
// engraved person, cached per height
const ENGRAVED = L.memo(h => {
  const S = window.K.subject(h), Lb = L.blurL(S.L, S.w, S.h, 1), c = L.canvas(S.w, S.h);
  for (let i = 0; i < Lb.length; i++) Lb[i] = L.clamp((Lb[i] - 0.04) * 1.8);
  L.engrave(c.getContext('2d'), Lb, S.A, S.w, S.h, 0, 0, { step: Math.max(4, h / 150), maxW: Math.max(3.6, h / 160), color: INK, wave: 2.2, freq: 0.03, angle: -0.35 });
  return c;
});
const inside = (K) => { const m = 40 * K.u; return { x: m, y: m, w: K.W - 2 * m, h: K.H - 2 * m }; };
const below = (K, b) => { const m = CH(K) ? (K.vertical ? 170 : 124) * K.u : 76 * K.u; return b.y < m ? { ...b, y: m, h: Math.max(b.h - (m - b.y), b.h * 0.6) } : b; };

export default {
  id: 'patente', name: 'Lámina de patente',
  fonts: 'IM+Fell+English:ital@0;1&family=IM+Fell+English+SC&family=Cormorant+Garamond:ital,wght@1,500;1,600',
  fontLoads: ['400 80px "IM Fell English"', 'italic 400 40px "IM Fell English"', '400 40px "IM Fell English SC"', 'italic 500 40px "Cormorant Garamond"', 'italic 600 40px "Cormorant Garamond"'],
  palette: { bg: PAPER, ink: INK, accent: RED, muted: '#5E5040', panel: PAPER, line: 'rgba(43,33,24,.35)', good: INK, bad: '#7A6A58', mascot: PAPER },
  type: { display: s => `400 ${s}px "IM Fell English"`, em: s => `italic 400 ${s}px "IM Fell English"`, body: s => `italic 500 ${s}px "Cormorant Garamond"`, bodyEm: s => `italic 600 ${s}px "Cormorant Garamond"`, label: s => `400 ${s}px "IM Fell English SC"`, mono: s => `italic 400 ${s}px "IM Fell English"` },
  lh: 1.04, ls: -0.005,
  sfx: 'paper', transDur: 0.75, push: 0.02,
  music: 'victorian chamber music, pizzicato strings, harpsichord, curious inventor workshop mood, ticking clockwork percussion, 100 BPM, instrumental, elegant and witty',
  async setup(K) {
    const { W, H } = K; paperC = L.canvas(W, H); const x = paperC.getContext('2d');
    L.paper(x, PAPER, { seed: 21, grain: 0.06, blotch: 0.1, fibers: 1400 });
    const g = x.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.35, W / 2, H / 2, Math.max(W, H) * 0.7); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(90,60,20,.3)'); x.fillStyle = g; x.fillRect(0, 0, W, H);
    // foxing stains
    const r = L.rng(8); for (let k = 0; k < 14; k++) { const cx = r() * W, cy = r() * H, rr = (8 + r() * 40) * K.u, gg = x.createRadialGradient(cx, cy, 0, cx, cy, rr); gg.addColorStop(0, 'rgba(140,95,40,.12)'); gg.addColorStop(1, 'rgba(140,95,40,0)'); x.fillStyle = gg; x.fillRect(cx - rr, cy - rr, rr * 2, rr * 2); }
    grain = L.grainTiles(4, 256, 0.5, 21);
  },
  background(K, s) {
    const { ctx, u, W, H } = K; ctx.drawImage(paperC, 0, 0);
    const b = inside(K); ctx.strokeStyle = INK; ctx.lineWidth = 3 * u; ctx.strokeRect(b.x, b.y, b.w, b.h); ctx.lineWidth = 1 * u; ctx.strokeRect(b.x + 14 * u, b.y + 14 * u, b.w - 28 * u, b.h - 28 * u);
    if (CH(K)) {
const n = K.spec.scenes.length, y = b.y + (K.vertical ? 64 : 46) * u;
    const hdr = sz => K.S.type.label(sz), it = sz => K.S.type.em(sz);
    if (K.vertical) {
      L.text(ctx, 'ESPECIFICACIÓN DE INVENTO', W / 2, y, { font: hdr(26 * u), color: INK, align: 'center', ls: 4 * u });
      L.text(ctx, `Lámina ${s.i + 1} de ${n}`, W / 2, y + 44 * u, { font: it(24 * u), color: INK, align: 'center' });
    } else {
      L.text(ctx, 'N.º ' + (s.i + 1), b.x + 60 * u, y, { font: it(24 * u), color: INK });
      L.text(ctx, 'ESPECIFICACIÓN DE INVENTO', W / 2, y, { font: hdr(28 * u), color: INK, align: 'center', ls: 5 * u });
      L.text(ctx, `Lámina ${s.i + 1} de ${n}`, b.x + b.w - 60 * u, y, { font: it(24 * u), color: INK, align: 'right' });
    }
    ctx.fillStyle = INK; const ly = y + (K.vertical ? 62 : 18) * u; ctx.fillRect(W / 2 - 180 * u, ly, 360 * u, 1.2 * u);
    }
  },
  headline(K, str, box, p, s, o = {}) { title(K, str, below(K, box), p, { align: o.align, size: o.size, color: INK, emColor: RED, reveal: 'wipe', valign: 'middle' }); },
  text(K, str, box, p, role, s, o = {}) {
    box = below(K, box);
    if (role === 'kicker' || role === 'label') return para(K, str, box, p, { font: sz => K.S.type.label(sz), color: RED, max: 30, ls: 0.12, align: o.align || 'left' });
    if (role === 'headBad' || role === 'headGood') return title(K, str, box, p, { color: role === 'headGood' ? RED : INK, max: 64, reveal: 'wipe', valign: 'top' });
    return BASE.text(K, str, box, p, role, s, { color: role === 'bad' ? '#7A6A58' : role === 'body' ? '#4A3D2F' : INK, max: role === 'item' ? 50 : 46, ...o });
  },
  panel(K, b, p, s, kind, j = 0) {
    if (p <= 0) return; const { ctx, u } = K, e = L.E.inOut(p);
    ctx.save(); ctx.strokeStyle = INK;
    if (kind === 'row') { ctx.lineWidth = 1 * u; ctx.setLineDash([2 * u, 5 * u]); ctx.beginPath(); ctx.moveTo(b.x, b.y + b.h); ctx.lineTo(b.x + b.w * e, b.y + b.h); ctx.stroke(); ctx.restore(); return; }
    ctx.beginPath(); ctx.rect(b.x - 4, b.y - 4, (b.w + 8) * e, b.h + 8); ctx.clip();
    ctx.lineWidth = 2 * u; ctx.strokeRect(b.x, b.y, b.w, b.h); ctx.lineWidth = 0.8 * u; ctx.strokeRect(b.x + 8 * u, b.y + 8 * u, b.w - 16 * u, b.h - 16 * u);
    if (kind === 'good' || kind === 'bad') L.text(ctx, 'Fig. ' + (kind === 'bad' ? '1' : '2'), b.x + b.w - 20 * u, b.y + b.h - 20 * u, { font: K.S.type.em(22 * u), color: INK, align: 'right' });
    ctx.restore();
  },
  bullet(K, i, b, p) {
    if (p <= 0) return; const { ctx, u } = K, [cx, cy] = L.center(b), r = Math.min(b.w, b.h) * 0.42;
    ctx.save(); ctx.strokeStyle = INK; ctx.lineWidth = 1.6 * u; ctx.beginPath(); ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * L.E.out(p)); ctx.stroke();
    L.text(ctx, LETTERS[i] || String(i + 1), cx, cy + r * 0.38, { font: K.S.type.em(r * 1.15), color: RED, align: 'center', alpha: L.clamp(p * 2 - 0.5) }); ctx.restore();
  },
  number(K, str, box, p, s, o) { title(K, str, box, p, { align: 'center', color: o?.small ? RED : INK, reveal: 'wipe', max: o?.small ? 120 : 300 }); },
  quote(K, str, box, p) { title(K, '“' + str + '”', below(K, box), p, { size: 'm', max: 90, color: INK, reveal: 'wipe', font: sz => K.S.type.em(sz) }); },
  portrait(K, box, p, s) {
    if (p <= 0) return; const { ctx, u } = K, f = fitSubject(K, { ...box, y: box.y + box.h * 0.12, h: box.h * 0.88 }), img = ENGRAVED(f.subj.h);
    const e = L.E.inOut(L.clamp(p * 1.1));
    ctx.save(); ctx.beginPath(); ctx.rect(f.x - 10, f.y, f.w + 20, f.h * e); ctx.clip(); ctx.drawImage(img, f.x, f.y); ctx.restore();
    // leader line "A."
    const lp = L.clamp(p * 2 - 1); if (lp <= 0) return;
    const hx = f.x + f.w * 0.62, hy = f.y + f.h * 0.14, tx = K.vertical ? f.x + f.w * 0.86 : Math.min(K.W - 150 * u, f.x + f.w * 0.95), ty = f.y + f.h * 0.04;
    ctx.save(); ctx.globalAlpha = lp; ctx.strokeStyle = INK; ctx.lineWidth = 1.2 * u; ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(hx + (tx - hx) * lp, hy + (ty - hy) * lp); ctx.stroke();
    ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(hx, hy, 3 * u, 0, 7); ctx.fill();
    L.text(ctx, 'A.', tx + 8 * u, ty + 8 * u, { font: K.S.type.em(30 * u), color: INK });
    L.text(ctx, 'FIG. ' + (s.i + 1), f.x + f.w * 0.5, Math.min(f.y + f.h + 34 * u, K.H - 60 * u), { font: K.S.type.label(24 * u), color: INK, align: 'center', ls: 3 * u });
    ctx.restore();
  },
  mascot(K, box, p, s) {
    if (p <= 0) return; const ctx = K.ctx, u = K.u; ctx.save(); ctx.globalAlpha = L.clamp(p * 1.6);
    const b = { ...box, y: box.y + (1 - L.E.out(p)) * 20 * u };
    L.mascot(ctx, K.spec.mascot, b, {
      fill: (path) => { ctx.save(); ctx.clip(path); ctx.strokeStyle = INK; ctx.lineWidth = 1.2; ctx.globalAlpha = 0.8; for (let k = -300; k < 400; k += 6) { ctx.beginPath(); ctx.moveTo(k, -60); ctx.lineTo(k + 200, 240); ctx.stroke(); } ctx.restore(); },
      stroke: (path) => { ctx.strokeStyle = INK; ctx.lineWidth = 2.6; ctx.stroke(path); }, ink: INK, eye: INK,
    });
    L.text(ctx, 'B.', b.x + b.w + 40 * u > K.W - 60 * u ? b.x - 34 * u : b.x + b.w + 6 * u, b.y + 22 * u, { font: K.S.type.em(28 * u), color: INK });
    ctx.restore();
  },
  media(K, img, box, p, s, frame) {
    if (p <= 0) return; const ctx = K.ctx, u = K.u; box = below(K, box); box = { ...box, h: box.h - 50 * u };
    const o = drawFrame(K, img, box, p, frame, { shadow: false, bezel: INK, stroke: INK, strokeW: 1.5, filter: (c, b) => { c.globalCompositeOperation = 'multiply'; c.fillStyle = 'rgba(180,140,80,.35)'; c.fillRect(b.x, b.y, b.w, b.h); } });
    ctx.save(); ctx.globalAlpha = L.clamp(p * 2 - 1); ctx.strokeStyle = INK; ctx.lineWidth = 1 * u; ctx.strokeRect(o.x - 10 * u, o.y - 10 * u, o.w + 20 * u, o.h + 20 * u);
    L.text(ctx, 'FIG. ' + (s.i + 1), o.x + o.w / 2, o.y + o.h + 40 * u, { font: K.S.type.label(22 * u), color: INK, align: 'center', ls: 3 * u }); ctx.restore();
  },
  prompt(K, str, box, p, s, tp) {
    if (p <= 0) return; const { ctx, u } = K; ctx.save(); ctx.globalAlpha = L.clamp(p * 1.5);
    ctx.fillStyle = INK; ctx.fillRect(box.x, box.y, box.w * L.E.out(p), 1.2 * u);
    L.text(ctx, 'Instrucción al aparato:', box.x, box.y + 30 * u, { font: K.S.type.label(20 * u), color: RED, ls: 2 * u });
    para(K, '“' + str.slice(0, Math.ceil(str.length * tp)) + (tp < 1 ? '' : '”'), { x: box.x, y: box.y + 40 * u, w: box.w, h: box.h - 40 * u }, 1, { font: sz => K.S.type.em(sz), color: INK, max: 34, valign: 'top' });
    ctx.restore();
  },
  caption(K, words, act, box, p) {
    const { ctx, u } = K; ctx.save(); ctx.globalAlpha = p; ctx.font = K.S.type.em(34 * u);
    const w = ctx.measureText(words.join(' ')).width + 80 * u, x = box.x + (box.w - w) / 2;
    ctx.fillStyle = 'rgba(237,226,198,.92)'; ctx.fillRect(x, box.y, w, box.h); ctx.fillStyle = INK; ctx.fillRect(x, box.y, w, 1.2 * u); ctx.fillRect(x, box.y + box.h - 1.2 * u, w, 1.2 * u);
    let cx = x + 40 * u; words.forEach((wd, i) => { ctx.fillStyle = i === act ? RED : i < act ? INK : 'rgba(43,33,24,.45)'; ctx.fillText(wd, cx, box.y + box.h * 0.66); cx += ctx.measureText(wd + ' ').width; });
    ctx.restore();
  },
  connector(K, a, b, p) {
    if (p <= 0) return; const ctx = K.ctx; ctx.save(); ctx.strokeStyle = INK; ctx.lineWidth = 1.2 * K.u; ctx.setLineDash([2 * K.u, 6 * K.u]);
    ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(a[0] + (b[0] - a[0]) * p, a[1] + (b[1] - a[1]) * p); ctx.stroke(); ctx.restore();
  },
  button(K, str, b, p) {
    if (p <= 0) return; const { ctx, u } = K, [cx, cy] = L.center(b); ctx.save(); ctx.translate(cx, cy); ctx.rotate(-0.03); const sc = 1 + (1 - L.E.out(p)) * 0.4; ctx.scale(sc, sc); ctx.translate(-cx, -cy);
    ctx.globalAlpha = L.clamp(p * 1.5) * 0.9; ctx.strokeStyle = RED; ctx.lineWidth = 3 * u; ctx.strokeRect(b.x, b.y, b.w, b.h); ctx.lineWidth = 1.2 * u; ctx.strokeRect(b.x + 6 * u, b.y + 6 * u, b.w - 12 * u, b.h - 12 * u);
    para(K, str, L.inset(b, b.h * 0.3, b.h * 0.2), 1, { font: sz => K.S.type.label(sz), color: RED, max: 34, align: 'center', ls: 0.1 }); ctx.restore();
  },
  transition(K, A, B, p, info) { // a fresh sheet slides up over the old one and settles
    const { ctx, W, H } = K, e = L.E.out(info.raw), y = (1 - e) * H * 1.05, rot = (1 - e) * 0.05;
    ctx.drawImage(A, 0, 0); ctx.fillStyle = `rgba(40,25,10,${0.25 * e})`; ctx.fillRect(0, 0, W, H);
    ctx.save(); ctx.translate(W / 2, y + H / 2); ctx.rotate(rot); ctx.shadowColor = 'rgba(40,25,10,.45)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = -10; ctx.drawImage(B, -W / 2, -H / 2); ctx.restore();
  },
  overlay(K) { L.drawGrain(K.ctx, grain, K.frame, 0.07, 'multiply'); },
};
