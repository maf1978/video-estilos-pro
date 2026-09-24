// Papel recortado — stop-motion de papel: capas con sombra real, bordes de tijera que "tiemblan" a 6 fps, palabras en tiras de papel, cinta.
import * as L from '../engine/lib.js';
import { BASE, para, layoutRich, fitCharacter, drawFrame } from '../engine/base.js';

const TEAL = '#1F4E57', TEAL2 = '#255C66', MUST = '#E9B44C', CORAL = '#E07A5F', CREAM = '#F2E3C6', INK = '#1B1B24', NAVY = '#2B2D42', SLATE = '#8D99AE', PAPER = '#F7F1E3';
const BACKS = [[TEAL, TEAL2, MUST], ['#2B2D42', '#343750', CORAL], ['#7A3B2E', '#86463A', MUST]];
let backs = [], hills = [];
const boil = K => Math.floor(K.t * 6); // stop-motion: edges re-cut 6 times per second
const F = (K, o = {}) => L.cutFill(K.ctx, { seed: 4, blur: 14 * K.u, dx: 5 * K.u, dy: 8 * K.u, ...o });
const tape = (ctx, x, y, a, u) => { ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.fillStyle = 'rgba(245,235,200,.72)'; ctx.fillRect(-40 * u, -13 * u, 80 * u, 26 * u); ctx.restore(); };

export default {
  id: 'papel', name: 'Papel recortado',
  fonts: 'Bricolage+Grotesque:opsz,wght@12..96,600;12..96,800&family=Gaegu:wght@700&family=Space+Mono:wght@700',
  fontLoads: ['800 60px "Bricolage Grotesque"', '600 40px "Bricolage Grotesque"', '700 40px Gaegu', '700 30px "Space Mono"'],
  palette: { bg: TEAL, ink: INK, accent: CORAL, muted: '#C9D6D3', panel: PAPER, line: 'rgba(0,0,0,.2)', good: '#3E7C59', bad: '#B5503A', mascot: '#D97757' },
  type: { display: s => `800 ${s}px "Bricolage Grotesque"`, body: s => `600 ${s}px "Bricolage Grotesque"`, bodyEm: s => `800 ${s}px "Bricolage Grotesque"`, label: s => `700 ${s}px Gaegu`, mono: s => `700 ${s}px "Space Mono"`, hand: s => `700 ${s}px Gaegu` },
  sfx: 'paper', transDur: 0.65, push: 0.02,
  music: 'playful but sophisticated indie folk-pop, pizzicato strings, marimba, hand claps, upright bass, stop-motion film score feel, 104 BPM, instrumental',
  async setup(K) {
    const { W, H, u } = K;
    BACKS.forEach(([c1, c2, sun], v) => {
      const c = L.canvas(W, H), x = c.getContext('2d'), f = L.cutFill(x, { seed: 4 + v, blur: 14 * u, dx: 5 * u, dy: 8 * u });
      x.fillStyle = c1; x.fillRect(0, 0, W, H); x.fillStyle = x.createPattern(L.paperTex(2, 0.12), 'repeat'); x.fillRect(0, 0, W, H);
      const cx = W * (v === 1 ? 0.1 : 0.9), cy = H * (K.vertical ? 0.1 : 0.16), R = Math.hypot(W, H);
      for (let k = 0; k < 32; k++) { if (k % 2) continue; const a = k * Math.PI / 16, p = new Path2D(); p.moveTo(cx, cy); p.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R); p.lineTo(cx + Math.cos(a + Math.PI / 16) * R, cy + Math.sin(a + Math.PI / 16) * R); p.closePath(); f(p, c2); }
      const sr = Math.min(W, H) * 0.12; f(new Path2D(`M${cx - sr},${cy} a${sr},${sr} 0 1,0 ${2 * sr},0 a${sr},${sr} 0 1,0 ${-2 * sr},0`), sun);
      backs.push(c);
      const h = L.canvas(W + 80 * u, H), hx = h.getContext('2d'), hf = L.cutFill(hx, { seed: 9 + v, blur: 16 * u, dx: 0, dy: -6 * u });
      hf(new Path2D(`M-20,${H * 0.8} C${W * 0.2},${H * 0.7} ${W * 0.35},${H * 0.74} ${W * 0.5},${H * 0.77} C${W * 0.65},${H * 0.8} ${W * 0.8},${H * 0.7} ${W + 100},${H * 0.73} L${W + 100},${H + 20} L-20,${H + 20} Z`), v === 1 ? '#B5503A' : CORAL);
      hf(new Path2D(`M-20,${H * 0.88} C${W * 0.25},${H * 0.83} ${W * 0.45},${H * 0.9} ${W * 0.6},${H * 0.87} C${W * 0.75},${H * 0.84} ${W * 0.9},${H * 0.88} ${W + 100},${H * 0.86} L${W + 100},${H + 20} L-20,${H + 20} Z`), CREAM);
      hills.push(h);
    });
  },
  background(K, s) { const v = s.i % 3; K.ctx.drawImage(backs[v], 0, 0); K.ctx.drawImage(hills[v], -40 * K.u + Math.sin(K.t * 0.6 + s.i) * 12 * K.u, 0); },
  headline(K, str, box, p, s, o = {}) { // every word on its own strip of paper, dropped in one by one
    const ctx = K.ctx, u = K.u, R = layoutRich(ctx, K.rich(str), { ...box, w: box.w * 0.94 }, { font: sz => K.S.type.display(sz), max: (o.size === 'm' ? 110 : 160) * u, min: 18 * u, lh: 1.24, ls: -0.02 });
    const f = F(K), n = R.lines.length, y0 = box.y + (box.h - n * R.lh) / 2, nW = R.lines.reduce((a, l) => a + l.length, 0), pad = R.size * 0.17;
    let wi = 0;
    R.lines.forEach((line, i) => {
      const lw = R.widths[i], x0 = o.align === 'center' ? box.x + (box.w - lw) / 2 : box.x + pad;
      line.forEach(t => {
        const wp = L.clamp(p * (nW * 0.45 + 1.2) - wi * 0.45), k = wi++; if (wp <= 0) return;
        const e = L.E.back(wp), r = L.rng(k * 13 + 7), rot = (r() - 0.5) * 0.07, col = t.em ? CORAL : k % 3 === 2 ? MUST : CREAM;
        ctx.save(); ctx.translate(x0 + t.x + t.width / 2, y0 + i * R.lh + R.lh / 2 - (1 - e) * 50 * u); ctx.rotate(rot + (1 - e) * 0.25); ctx.globalAlpha = L.clamp(wp * 3);
        f(L.cutRect(-t.width / 2 - pad, -R.size * 0.58, t.width + 2 * pad, R.size * 1.1, k * 7 + boil(K), 2 * u), col);
        ctx.font = R.font; ctx.letterSpacing = R.ls + 'px'; ctx.fillStyle = t.em ? PAPER : INK; ctx.textAlign = 'center'; ctx.fillText(t.w, 0, R.size * 0.33);
        ctx.restore();
      });
    });
  },
  text(K, str, box, p, role, s, o = {}) {
    const ctx = K.ctx, u = K.u;
    if (role === 'kicker' || role === 'label') { // dark strip with hand lettering
      if (p <= 0) return; ctx.font = K.S.type.hand(40 * u); const w = Math.min(box.w, ctx.measureText(str).width + 50 * u), h = Math.min(box.h * 1.2, 62 * u);
      const x = o.align === 'center' ? box.x + (box.w - w) / 2 : box.x; ctx.save(); ctx.globalAlpha = L.clamp(p * 2); ctx.translate(x, box.y + (box.h - h) / 2); ctx.rotate(-0.015);
      F(K)(L.cutRect(0, 0, w * L.E.out(p), h, 33 + boil(K), 2 * u), INK); ctx.restore();
      return para(K, str, { x: x + 22 * u, y: box.y, w: w - 40 * u, h: box.h }, L.clamp(p * 2 - 0.5), { font: sz => K.S.type.hand(sz), color: CREAM, max: 40 });
    }
    if (role === 'headBad' || role === 'headGood') return para(K, str, box, p, { font: sz => K.S.type.display(sz), color: role === 'headGood' ? '#2F6B4B' : '#9E4430', max: 60, align: 'left', reveal: 'fade' });
    const onPanel = ['item', 'step', 'good', 'bad'].includes(role) && s.type !== 'steps';
    return BASE.text(K, str, box, p, role, s, { color: onPanel ? (role === 'bad' ? '#6D6A63' : INK) : CREAM, ...o });
  },
  panel(K, b, p, s, kind, j = 0) {
    if (p <= 0) return; const ctx = K.ctx, u = K.u, e = L.E.back(p), rot = ((j * 37) % 7 - 3) * 0.004;
    const col = kind === 'good' ? '#CFE3C9' : kind === 'bad' ? '#F3D2C6' : kind === 'note' ? PAPER : [PAPER, '#F4E4BE', PAPER, '#E9EEF0'][j % 4];
    ctx.save(); ctx.translate(b.x + b.w / 2 + (1 - e) * -60 * u, b.y + b.h / 2); ctx.rotate(rot + (1 - e) * -0.05); ctx.globalAlpha = L.clamp(p * 3);
    F(K)(L.cutRect(-b.w / 2, -b.h / 2, b.w, b.h, j * 11 + 3 + boil(K), 2.2 * u), col);
    if (kind === 'good' || kind === 'bad' || kind === 'note') { tape(ctx, -b.w / 2 + 30 * u, -b.h / 2, -0.35, u); tape(ctx, b.w / 2 - 30 * u, -b.h / 2, 0.4, u); }
    ctx.restore();
  },
  bullet(K, i, b, p) {
    if (p <= 0) return; const ctx = K.ctx, [cx, cy] = L.center(b), r = Math.min(b.w, b.h) / 2, e = L.E.back(p);
    ctx.save(); ctx.translate(cx, cy); ctx.rotate((1 - e) * 1.2); ctx.scale(e, e);
    const rr = L.rng(i * 5 + boil(K)), pth = new Path2D(); for (let k = 0; k < 18; k++) { const a = k / 18 * Math.PI * 2, q = r * (0.97 + rr() * 0.06); k ? pth.lineTo(Math.cos(a) * q, Math.sin(a) * q) : pth.moveTo(q, 0); } pth.closePath();
    F(K)(pth, [MUST, CORAL, TEAL2, NAVY][i % 4]); ctx.restore();
    L.text(ctx, String(i + 1), cx, cy + r * 0.36, { font: K.S.type.display(r * 1.05), color: i % 4 === 0 ? INK : PAPER, align: 'center', alpha: L.clamp(p * 2 - 0.5) });
  },
  number(K, str, box, p, s, o = {}) {
    const ctx = K.ctx, u = K.u, R = layoutRich(ctx, K.rich(str), { ...box, w: box.w * 0.88, h: box.h * 0.8 }, { font: sz => K.S.type.display(sz), max: (o.small ? 130 : 280) * u, min: 20 * u, lh: 1.1, ls: -0.03 });
    const w = R.widths[0] + R.size * 0.5, h = R.size * 1.12, e = L.E.back(p); if (p <= 0) return;
    ctx.save(); ctx.translate(box.x + box.w / 2, box.y + box.h / 2); ctx.rotate(-0.02 + (1 - e) * 0.2); ctx.scale(0.6 + 0.4 * e, 0.6 + 0.4 * e); ctx.globalAlpha = L.clamp(p * 3);
    F(K, { blur: 24 * u, dy: 14 * u })(L.cutRect(-w / 2, -h / 2, w, h, 71 + boil(K), 3 * u), o.small ? MUST : CORAL);
    ctx.font = R.font; ctx.letterSpacing = R.ls + 'px'; ctx.fillStyle = o.small ? INK : PAPER; ctx.textAlign = 'center'; ctx.fillText(R.lines[0].map(t => t.w).join(' '), 0, R.size * 0.34);
    ctx.restore();
  },
  quote(K, str, box, p, s) {
    if (p <= 0) return; K.S.panel(K, box, L.clamp(p * 1.6), s, 'note', 2);
    para(K, '“' + str + '”', L.inset(box, box.w * 0.06, box.h * 0.12), L.clamp(p * 1.4 - 0.3), { font: sz => K.S.type.display(sz), color: INK, max: 88, lh: 1.1, reveal: 'words', align: 'left' });
  },
  portrait(K, box, p, s) {
    if (p <= 0) return; const ctx = K.ctx, f = fitCharacter({ ...box, h: box.h * 0.98 }), e = L.E.out(p), bt = boil(K);
    ctx.save(); ctx.globalAlpha = L.clamp(p * 2); const px = f.x, py = f.y + 400 * f.s; // pivot at the bust bottom: puppet sway
    ctx.translate(px, py + (1 - e) * 120 * K.u); ctx.rotate(Math.sin(K.t * 1.3) * 0.012 + (bt % 2) * 0.003); ctx.translate(-px, -py);
    L.character(ctx, f.x, f.y, f.s, K.look, { fill: F(K, { blur: 18 * K.u, dx: 6 * K.u, dy: 10 * K.u, seed: 6 }), outline: false, ink: INK, blink: (K.frame % 120) < 4, mood: s.d.mood === 'surprised' ? 'o' : 'smile', stroke: (pth, m = 1) => { ctx.strokeStyle = INK; ctx.lineWidth = 4.5 * m / f.s; ctx.stroke(pth); } });
    ctx.restore();
  },
  mascot(K, box, p, s, mood) {
    if (p <= 0) return; const ctx = K.ctx, e = L.E.back(p), [cx, cy] = [box.x + box.w / 2, box.y + box.h];
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(Math.sin(K.t * 2) * 0.03 - (1 - e) * 0.4); ctx.scale(e, e); ctx.translate(-cx, -cy);
    L.mascot(ctx, K.spec.mascot, box, { fill: F(K, { seed: 8 }), outline: false, color: K.P.mascot, eye: INK, eyeStyle: mood === 'happy' ? 'happy' : 'dot' });
    ctx.restore();
  },
  media(K, img, box, p, s, frame) { // photo mounted on a cream mat, taped
    if (p <= 0) return; const ctx = K.ctx, u = K.u, [cx, cy] = L.center(box); ctx.save(); ctx.translate(cx, cy); ctx.rotate(0.02 + (1 - L.E.out(p)) * 0.1); ctx.translate(-cx, -cy);
    const o = drawFrame(K, img, box, p, frame, { bezel: NAVY, card: PAPER, shadowColor: 'rgba(10,20,20,.45)' });
    ctx.globalAlpha = L.clamp(p * 2 - 1); tape(ctx, o.x + o.w * 0.2, o.y + 4 * u, -0.3, u * 1.3); tape(ctx, o.x + o.w * 0.8, o.y + 4 * u, 0.35, u * 1.3); ctx.restore();
  },
  prompt(K, str, box, p, s, tp) {
    if (p <= 0) return; K.S.panel(K, box, p, s, 'note', 0); const u = K.u;
    para(K, '> ' + str.slice(0, Math.ceil(str.length * tp)) + (tp < 1 || (K.frame >> 3) % 2 ? '_' : ''), L.inset(box, 26 * u, 14 * u), 1, { font: sz => K.S.type.mono(sz), color: NAVY, max: 30, valign: 'middle' });
  },
  caption(K, words, act, box, p) { // paper label, the spoken word gets a coral underline
    const ctx = K.ctx, u = K.u; ctx.save(); ctx.globalAlpha = p; ctx.font = K.S.type.hand(40 * u);
    const w = Math.min(box.w, ctx.measureText(words.join(' ')).width + 70 * u), x = box.x + (box.w - w) / 2;
    ctx.save(); ctx.translate(x + w / 2, box.y + box.h / 2); ctx.rotate(-0.006); F(K, { blur: 10 * u, dy: 5 * u })(L.cutRect(-w / 2, -box.h / 2, w, box.h, 55 + boil(K), 2 * u), PAPER); ctx.restore();
    let cx = x + 35 * u; const y = box.y + box.h * 0.66;
    words.forEach((wd, i) => { const ww = ctx.measureText(wd).width; if (i === act) { ctx.fillStyle = CORAL; ctx.fillRect(cx, y + 6 * u, ww, 5 * u); } ctx.fillStyle = i <= act ? INK : '#8B8577'; ctx.fillText(wd, cx, y); cx += ctx.measureText(wd + ' ').width; });
    ctx.restore();
  },
  connector(K, a, b, p) { // a thread stitched across
    if (p <= 0) return; const ctx = K.ctx, u = K.u; ctx.save(); ctx.strokeStyle = CREAM; ctx.lineWidth = 3 * u; ctx.setLineDash([14 * u, 9 * u]); ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(a[0] + (b[0] - a[0]) * p, a[1] + (b[1] - a[1]) * p); ctx.stroke(); ctx.restore();
  },
  button(K, str, b, p) {
    if (p <= 0) return; const ctx = K.ctx, e = L.E.back(p); ctx.save(); ctx.translate(b.x + b.w / 2, b.y + b.h / 2); ctx.rotate(-0.03); ctx.scale(e, e);
    F(K)(L.cutRect(-b.w / 2, -b.h / 2, b.w, b.h, 91 + boil(K), 2 * K.u), CORAL); ctx.restore();
    para(K, str, L.inset(b, b.h * 0.35, b.h * 0.18), L.clamp(p * 2 - 0.6), { font: sz => K.S.type.display(sz), color: PAPER, max: 40, align: 'center' });
  },
  transition(K, A, B, p, info) { // a new sheet slides over the old one from the right, landing with a soft shadow
    const { ctx, W, H, u } = K, e = L.E.out(info.raw); ctx.drawImage(A, 0, 0);
    ctx.fillStyle = `rgba(0,0,0,${0.35 * e})`; ctx.fillRect(0, 0, W, H);
    ctx.save(); ctx.translate((1 - e) * W * 1.08, (1 - e) * 40 * u); ctx.rotate((1 - e) * 0.06);
    const edge = L.cutRect(0, -40 * u, W + 40 * u, H + 80 * u, 5, 4 * u);
    ctx.shadowColor = 'rgba(0,0,0,.45)'; ctx.shadowBlur = 40 * u; ctx.shadowOffsetX = -12 * u; ctx.fillStyle = TEAL; ctx.fill(edge); ctx.shadowColor = 'transparent';
    ctx.clip(edge); ctx.drawImage(B, 0, 0); ctx.restore();
  },
  overlay(K) { const { ctx, W, H } = K, v = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.45, W / 2, H / 2, Math.max(W, H) * 0.75); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(10,10,20,.35)'); ctx.fillStyle = v; ctx.fillRect(0, 0, W, H); },
};
