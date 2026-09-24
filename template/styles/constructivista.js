// Constructivismo — diagonales rojo/negro sobre crema, fotomontaje B/N de alto contraste, tipografía condensada en ángulo, rayos.
import * as L from '../engine/lib.js';
import { BASE, title, para, fitSubject, drawFrame } from '../engine/base.js';

const CREAM = '#ECE3CE', RED = '#C8201E', INK = '#141414';
let grain, paperC;
const back = t => Math.max(0, L.E.back(t));
// draw something rotated about a box centre
function tilt(ctx, box, a, fn) { const [cx, cy] = L.center(box); ctx.save(); ctx.translate(cx, cy); ctx.rotate(a); ctx.translate(-cx, -cy); fn(); ctx.restore(); }

export default {
  id: 'constructivista', name: 'Constructivista',
  fonts: 'Big+Shoulders+Display:wght@800;900&family=Archivo+Narrow:wght@500;700',
  fontLoads: ['900 60px "Big Shoulders Display"', '800 60px "Big Shoulders Display"', '500 30px "Archivo Narrow"', '700 30px "Archivo Narrow"'],
  palette: { bg: CREAM, ink: INK, accent: RED, muted: '#4A443A', panel: CREAM, line: 'rgba(0,0,0,.2)', good: RED, bad: INK, mascot: INK },
  type: { display: s => `900 ${s}px "Big Shoulders Display"`, em: s => `900 ${s}px "Big Shoulders Display"`, body: s => `500 ${s}px "Archivo Narrow"`, bodyEm: s => `700 ${s}px "Archivo Narrow"`, label: s => `700 ${s}px "Archivo Narrow"`, mono: s => `700 ${s}px "Archivo Narrow"` },
  ls: 0.0, lh: 0.9, upper: true,
  sfx: 'mechanical', transDur: 0.5, push: 0.025,
  music: 'driving industrial march, pounding toms and snare, brass stabs, low strings ostinato, bold and urgent, 124 BPM, instrumental, propaganda poster energy',
  async setup(K) { grain = L.grainTiles(4, 256, 0.7, 5); paperC = L.canvas(K.W, K.H); L.paper(paperC.getContext('2d'), CREAM, { seed: 17, grain: 0.05, blotch: 0.06, fibers: 300 }); },
  background(K, s) {
    const { ctx, W, H, u } = K, t = s.t, v = s.i % 3, e = L.E.out(L.clamp(t / 0.7));
    ctx.drawImage(paperC, 0, 0);
    // rays from a corner
    const ox = v === 1 ? 0 : W, oy = H; ctx.save(); ctx.strokeStyle = 'rgba(20,20,20,.12)'; ctx.lineWidth = 2 * u;
    for (let k = 0; k < 14; k++) { const a = -Math.PI / 2 + (v === 1 ? 1 : -1) * (k / 13) * Math.PI / 2 * e; ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(ox + Math.cos(a) * W * 1.6, oy + Math.sin(a) * W * 1.6); ctx.stroke(); }
    ctx.restore();
    // heavy diagonal band (red) + thin black bar
    const ang = [-0.32, 0.28, -0.2][v], bw = (K.vertical ? 90 : 120) * u;
    ctx.save(); ctx.translate(W * [0.78, 0.2, 0.3][v], H * [0.9, 0.95, 1.0][v]); ctx.rotate(ang);
    ctx.fillStyle = RED; ctx.fillRect(-W * 1.2 * e, -bw / 2, W * 2.4 * e, bw);
    ctx.fillStyle = INK; ctx.fillRect(-W * 1.2 * e, bw * 0.9, W * 2.4 * e, 12 * u);
    ctx.restore();
    // black circle segment
    ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(v === 1 ? W * 1.01 : -W * 0.01, -H * 0.03, Math.min(W, H) * 0.12 * back(L.clamp(t / 0.6)), 0, 7); ctx.fill();
  },
  headline(K, str, box, p, s, o = {}) { tilt(K.ctx, box, -0.05, () => title(K, str, box, p, { align: o.align, size: o.size, color: INK, emColor: CREAM, emStyle: 'box', emBg: RED, reveal: 'rise', valign: 'middle', max: o.size === 'm' ? 130 : 210 })); },
  text(K, str, box, p, role, s, o = {}) {
    const { ctx, u } = K;
    if (role === 'kicker' || role === 'label') {
      if (p <= 0) return; ctx.font = K.S.type.label(26 * u); ctx.letterSpacing = '0px'; const w = Math.min(box.w, ctx.measureText(str.toUpperCase()).width * 1.18 + 40 * u), x = o.align === 'center' ? box.x + (box.w - w) / 2 : box.x;
      ctx.save(); ctx.beginPath(); ctx.moveTo(x + 14 * u, box.y); ctx.lineTo(x + (w + 14 * u) * L.E.out(p), box.y); ctx.lineTo(x + (w - 6 * u) * L.E.out(p), box.y + box.h); ctx.lineTo(x - 6 * u, box.y + box.h); ctx.closePath(); ctx.fillStyle = RED; ctx.fill(); ctx.restore();
      return para(K, str, { x: x + 16 * u, y: box.y, w: w - 24 * u, h: box.h }, L.clamp(p * 2 - 0.5), { font: sz => K.S.type.label(sz), color: CREAM, upper: true, ls: 0.12, max: 26 });
    }
    if (role === 'headBad' || role === 'headGood') return title(K, str, box, p, { color: role === 'headGood' ? CREAM : CREAM, max: 80, reveal: 'rise', upper: true, lh: 0.9 });
    return BASE.text(K, str, box, p, role, s, { color: role === 'bad' ? '#6A6356' : role === 'body' ? '#2E2A24' : INK, ...o });
  },
  panel(K, b, p, s, kind, j = 0) {
    if (p <= 0) return; const { ctx, u } = K, e = L.E.out(p);
    if (kind === 'good' || kind === 'bad') {
      ctx.save(); ctx.fillStyle = CREAM; ctx.fillRect(b.x, b.y, b.w, b.h * e); ctx.lineWidth = 5 * u; ctx.strokeStyle = INK; ctx.strokeRect(b.x, b.y, b.w, b.h * e);
      ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.lineTo(b.x + b.w * e, b.y); ctx.lineTo(b.x + b.w * e, b.y + b.h * 0.2); ctx.lineTo(b.x, b.y + b.h * 0.27); ctx.closePath(); ctx.fillStyle = kind === 'good' ? RED : INK; ctx.fill(); ctx.restore(); return;
    }
    ctx.save(); ctx.fillStyle = j % 2 ? 'rgba(20,20,20,.07)' : 'rgba(200,32,30,.1)'; ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.lineTo(b.x + b.w * e, b.y); ctx.lineTo(b.x + b.w * e - 20 * u, b.y + b.h); ctx.lineTo(b.x - 20 * u, b.y + b.h); ctx.closePath(); ctx.fill(); ctx.restore();
    ctx.fillStyle = INK; ctx.fillRect(b.x, b.y + b.h - 4 * u, b.w * e, 4 * u);
  },
  bullet(K, i, b, p) {
    if (p <= 0) return; const { ctx } = K, [cx, cy] = L.center(b), r = Math.min(b.w, b.h) / 2, e = back(p);
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(-0.25); ctx.scale(e, e); ctx.fillStyle = i % 2 ? INK : RED; ctx.fillRect(-r, -r, r * 2, r * 2); ctx.restore();
    L.text(ctx, String(i + 1), cx, cy + r * 0.05, { font: K.S.type.display(r * 1.5), color: CREAM, align: 'center', base: 'middle', alpha: L.clamp(p * 2 - 0.6), rot: -0.25 });
  },
  number(K, str, box, p, s, o) {
    tilt(K.ctx, box, -0.04, () => title(K, str, box, p, { align: 'center', color: o?.small ? RED : INK, shadow: o?.small ? null : RED, shadowX: 14 * K.u, shadowY: 10 * K.u, reveal: 'rise', max: o?.small ? 150 : 360 }));
  },
  quote(K, str, box, p) {
    const { ctx, u } = K; ctx.fillStyle = RED; ctx.fillRect(box.x - 30 * u, box.y, 14 * u, box.h * L.E.out(p));
    tilt(ctx, box, -0.02, () => title(K, '«' + str + '»', box, p, { size: 'm', max: 110, color: INK, reveal: 'rise', lh: 0.95 }));
  },
  portrait(K, box, p, s) {
    const { ctx, u } = K, f = fitSubject(K, { ...box, h: box.h * 0.96 }), img = K.S._post(f.subj.h), m = Math.min(box.w, box.h), e = L.E.out(L.clamp(p * 1.3));
    const [cx, cy] = [box.x + box.w * 0.5, box.y + box.h * 0.4];
    ctx.fillStyle = RED; ctx.beginPath(); ctx.arc(cx + box.w * 0.08, cy, m * 0.42 * back(L.clamp(p * 1.4)), 0, 7); ctx.fill();
    ctx.save(); ctx.translate(cx, box.y + box.h); ctx.rotate(-0.04); ctx.translate(-cx, -(box.y + box.h));
    ctx.globalAlpha = L.clamp(p * 2 - 0.3); ctx.drawImage(img, f.x - (1 - e) * 140 * u, f.y + (1 - e) * 60 * u); ctx.restore();
  },
  _post: L.memo(h => L.mapPixels(window.K.subject(h), (r, g, b, a, x, y, l) => { const v = Math.pow(L.clamp((l - 0.08) * 1.9), 1.2); const q = v < 0.2 ? 20 : v < 0.45 ? 70 : v < 0.7 ? 150 : 236; return [q + 4, q, q - 8 > 0 ? q - 8 : 0, a]; })),
  mascot(K, box, p, s, mood) { if (p <= 0) return; tilt(K.ctx, box, -0.08, () => L.mascot(K.ctx, K.spec.mascot, { ...box, y: box.y + (1 - back(p)) * 40 * K.u }, { color: INK, outline: false, eye: RED, eyeStyle: 'square' })); },
  media(K, img, box, p, s, frame) {
    if (p <= 0) return; const { ctx, u } = K;
    tilt(ctx, box, -0.035, () => { const o = drawFrame(K, img, box, p, frame, { shadow: false, bezel: INK, stroke: RED, strokeW: 10 * u }); ctx.fillStyle = RED; ctx.globalAlpha = L.clamp(p * 2 - 1); ctx.fillRect(o.x - 30 * u, o.y + o.h * 0.75, 60 * u, 60 * u); });
  },
  prompt(K, str, box, p, s, tp) {
    if (p <= 0) return; const { ctx, u } = K, e = L.E.out(p);
    ctx.fillStyle = INK; ctx.beginPath(); ctx.moveTo(box.x, box.y); ctx.lineTo(box.x + box.w * e, box.y); ctx.lineTo(box.x + box.w * e - 16 * u, box.y + box.h); ctx.lineTo(box.x - 16 * u, box.y + box.h); ctx.closePath(); ctx.fill();
    para(K, '► ' + str.slice(0, Math.ceil(str.length * tp)) + (tp < 1 || (K.frame >> 3) % 2 ? '_' : ''), L.inset(box, 26 * u, 12 * u), 1, { font: sz => K.S.type.bodyEm(sz), color: CREAM, max: 34 });
  },
  caption(K, words, act, box, p) {
    const { ctx, u } = K; ctx.save(); ctx.globalAlpha = p; ctx.font = K.S.type.bodyEm(36 * u);
    const w = ctx.measureText(words.join(' ')).width, x = box.x + (box.w - w) / 2, sk = 18 * u;
    ctx.fillStyle = RED; ctx.beginPath(); ctx.moveTo(x - 30 * u + sk, box.y); ctx.lineTo(x + w + 30 * u + sk, box.y); ctx.lineTo(x + w + 30 * u - sk, box.y + box.h); ctx.lineTo(x - 30 * u - sk, box.y + box.h); ctx.closePath(); ctx.fill();
    let cx = x; words.forEach((wd, i) => { ctx.fillStyle = i === act ? INK : i < act ? CREAM : 'rgba(236,227,206,.55)'; ctx.fillText(wd, cx, box.y + box.h * 0.68); cx += ctx.measureText(wd + ' ').width; });
    ctx.restore();
  },
  connector(K, a, b, p) {
    if (p <= 0) return; const { ctx, u } = K, x = a[0] + (b[0] - a[0]) * L.E.inOut(p), y = a[1] + (b[1] - a[1]) * L.E.inOut(p), an = Math.atan2(b[1] - a[1], b[0] - a[0]);
    ctx.strokeStyle = INK; ctx.lineWidth = 7 * u; ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(x, y); ctx.stroke();
    ctx.fillStyle = RED; ctx.save(); ctx.translate(x, y); ctx.rotate(an); ctx.beginPath(); ctx.moveTo(10 * u, 0); ctx.lineTo(-16 * u, -14 * u); ctx.lineTo(-16 * u, 14 * u); ctx.closePath(); ctx.fill(); ctx.restore();
  },
  button(K, str, b, p) {
    if (p <= 0) return; const { ctx, u } = K, e = L.E.out(p), sk = 18 * u;
    ctx.fillStyle = RED; ctx.beginPath(); ctx.moveTo(b.x + sk, b.y); ctx.lineTo(b.x + b.w * e + sk, b.y); ctx.lineTo(b.x + b.w * e - sk, b.y + b.h); ctx.lineTo(b.x - sk, b.y + b.h); ctx.closePath(); ctx.fill();
    para(K, str, L.inset(b, b.h * 0.35, b.h * 0.18), L.clamp(p * 2 - 0.5), { font: sz => K.S.type.display(sz), color: CREAM, upper: true, max: 46 });
  },
  transition(K, A, B, p, info) { // a red wedge slices diagonally; the new scene rides behind its edge
    const { ctx, W, H } = K, r = info.raw, x = L.lerp(-W * 0.6, W * 1.6, L.E.inOut(r)), sk = H * 0.45, band = W * 0.12;
    ctx.drawImage(A, 0, 0);
    ctx.save(); ctx.beginPath(); ctx.moveTo(-W, 0); ctx.lineTo(x - band, 0); ctx.lineTo(x - band - sk, H); ctx.lineTo(-W, H); ctx.closePath(); ctx.clip(); ctx.drawImage(B, 0, 0); ctx.restore();
    ctx.fillStyle = RED; ctx.beginPath(); ctx.moveTo(x - band, 0); ctx.lineTo(x, 0); ctx.lineTo(x - sk, H); ctx.lineTo(x - band - sk, H); ctx.closePath(); ctx.fill();
    ctx.fillStyle = INK; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + 18, 0); ctx.lineTo(x + 18 - sk, H); ctx.lineTo(x - sk, H); ctx.closePath(); ctx.fill();
  },
  overlay(K) { L.drawGrain(K.ctx, grain, K.frame, 0.09, 'multiply'); },
};
