// Bauhaus — geometría primaria (círculo rojo, cuadrado azul, triángulo amarillo) sobre crema; composición asimétrica que se arma.
import * as L from '../engine/lib.js';
import { BASE, title, para, fitSubject, drawFrame } from '../engine/base.js';

const CREAM = '#EFE8D8', INK = '#1B1B1B', RED = '#D6402B', YEL = '#F2B632', BLUE = '#1F4E9C';
const PRIM = [RED, BLUE, YEL];
let grain;
const back = t => Math.max(0, L.E.back(t));

// shape helpers (all in absolute px)
function tri(ctx, x, y, s, rot = 0) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.beginPath(); ctx.moveTo(0, -s * 0.66); ctx.lineTo(s * 0.58, s * 0.34); ctx.lineTo(-s * 0.58, s * 0.34); ctx.closePath(); ctx.fill(); ctx.restore(); }
function quarter(ctx, x, y, r, a0) { ctx.beginPath(); ctx.moveTo(x, y); ctx.arc(x, y, r, a0, a0 + Math.PI / 2); ctx.closePath(); ctx.fill(); }

export default {
  id: 'bauhaus', name: 'Bauhaus',
  fonts: 'Jost:wght@400;500;700;800',
  fontLoads: ['800 60px Jost', '700 40px Jost', '500 30px Jost', '400 30px Jost'],
  palette: { bg: CREAM, ink: INK, accent: RED, muted: '#4F4A42', panel: '#F7F2E6', line: 'rgba(0,0,0,.15)', good: BLUE, bad: RED, mascot: BLUE },
  type: { display: s => `800 ${s}px Jost`, em: s => `800 ${s}px Jost`, body: s => `500 ${s}px Jost`, bodyEm: s => `700 ${s}px Jost`, label: s => `700 ${s}px Jost`, mono: s => `500 ${s}px Jost` },
  ls: -0.025, lh: 0.98,
  sfx: 'soft', transDur: 0.6, push: 0.02,
  music: 'playful minimal electronic, marimba and plucked synths, geometric rhythmic patterns, warm bass, 108 BPM, instrumental, modernist and optimistic',
  async setup() { grain = L.grainTiles(4, 256, 0.6, 21); },
  background(K, s) {
    const { ctx, W, H, u } = K, t = s.t, v = s.i % 4, g = e => back(L.clamp((t - e) / 0.7));
    ctx.fillStyle = CREAM; ctx.fillRect(0, 0, W, H);
    const m = Math.min(W, H) * (K.vertical ? 0.55 : 1);
    ctx.save();
    if (v === 0) {
      const a = g(0); ctx.fillStyle = RED; ctx.beginPath(); ctx.arc(W * 0.97, H * 0.06, m * 0.28 * a, 0, 7); ctx.fill();
      ctx.fillStyle = BLUE; ctx.fillRect(0, H * 0.9, W * 0.3 * L.E.out(L.clamp(t / 0.8)), 16 * u);
      ctx.fillStyle = YEL; tri(ctx, W * 0.03, H * 0.97, m * 0.2 * g(0.15), 0.25 + t * 0.05);
    } else if (v === 1) {
      ctx.fillStyle = BLUE; quarter(ctx, 0, 0, m * 0.34 * g(0), 0);
      ctx.fillStyle = YEL; ctx.beginPath(); ctx.arc(W * 0.95, H * 0.88, m * 0.16 * g(0.1), 0, 7); ctx.fill();
      ctx.fillStyle = INK; ctx.fillRect(W - 26 * u, H * 0.08, 14 * u, H * 0.3 * L.E.out(L.clamp(t / 0.8)));
    } else if (v === 2) {
      ctx.fillStyle = YEL; quarter(ctx, W, H, m * 0.36 * g(0), Math.PI);
      ctx.fillStyle = RED; ctx.fillRect(W * 0.9, H * 0.06, m * 0.1 * g(0.1), m * 0.1 * g(0.1));
      ctx.strokeStyle = INK; ctx.lineWidth = 6 * u; ctx.beginPath(); ctx.arc(0, H * 0.55, m * 0.09 * g(0.2), 0, 7); ctx.stroke();
    } else {
      ctx.fillStyle = RED; quarter(ctx, W, 0, m * 0.3 * g(0), Math.PI / 2);
      ctx.fillStyle = BLUE; tri(ctx, W * 0.035, H * 0.9, m * 0.16 * g(0.1), -0.3 - t * 0.04);
      ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(W * 0.5, H * 0.03, 10 * u * g(0.3), 0, 7); ctx.fill();
    }
    ctx.restore();
  },
  headline(K, str, box, p, s, o = {}) { title(K, str, box, p, { align: o.align, size: o.size, color: INK, emColor: RED, reveal: 'rise', valign: 'middle' }); },
  text(K, str, box, p, role, s, o = {}) {
    if (role === 'kicker' || role === 'label') {
      const ctx = K.ctx, r = Math.min(box.h * 0.22, 12 * K.u); if (p > 0 && o.align !== 'center') { ctx.fillStyle = RED; ctx.beginPath(); ctx.arc(box.x + r, box.y + box.h / 2, r * back(p), 0, 7); ctx.fill(); }
      return para(K, str, o.align === 'center' ? box : { ...box, x: box.x + r * 3, w: box.w - r * 3 }, p, { font: sz => K.S.type.label(sz), color: INK, upper: true, ls: 0.14, max: 28, align: o.align || 'left' });
    }
    if (role === 'headBad' || role === 'headGood') return title(K, str, box, p, { color: CREAM, max: 64, reveal: 'rise', valign: 'middle' });
    return BASE.text(K, str, box, p, role, s, { color: role === 'bad' ? '#6D665B' : role === 'body' ? '#3E3A34' : INK, ...o });
  },
  panel(K, b, p, s, kind, j = 0) {
    if (p <= 0) return; const { ctx, u } = K, e = L.E.out(p);
    if (kind === 'good' || kind === 'bad') {
      ctx.save(); ctx.globalAlpha = L.clamp(p * 1.5); ctx.fillStyle = '#F7F2E6'; ctx.fillRect(b.x, b.y, b.w, b.h * e);
      ctx.fillStyle = kind === 'good' ? BLUE : RED; ctx.fillRect(b.x, b.y, b.w, b.h * 0.26 * e); ctx.lineWidth = 4 * u; ctx.strokeStyle = INK; ctx.strokeRect(b.x, b.y, b.w, b.h * e); ctx.restore(); return;
    }
    ctx.fillStyle = INK; ctx.fillRect(b.x, b.y + b.h - 3 * u, b.w * e, 3 * u);
    ctx.fillStyle = PRIM[j % 3]; ctx.fillRect(b.x, b.y, 10 * u, b.h * e);
  },
  bullet(K, i, b, p) {
    if (p <= 0) return; const { ctx } = K, [cx, cy] = L.center(b), r = Math.min(b.w, b.h) / 2, k = i % 3, e = back(p);
    ctx.save(); ctx.translate(cx, cy); ctx.rotate((1 - e) * 1.2); ctx.scale(e, e); ctx.fillStyle = PRIM[k];
    if (k === 0) { ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.fill(); } else if (k === 1) ctx.fillRect(-r * 0.88, -r * 0.88, r * 1.76, r * 1.76); else tri(ctx, 0, r * 0.12, r * 2.1);
    ctx.restore();
    L.text(ctx, String(i + 1), cx, cy + r * 0.12 + (k === 2 ? r * 0.18 : 0), { font: K.S.type.display(r * 0.95), color: k === 2 ? INK : CREAM, align: 'center', base: 'middle', alpha: L.clamp(p * 2 - 0.6) });
  },
  number(K, str, box, p, s, o) {
    const { ctx } = K, [cx, cy] = L.center(box), r = Math.min(box.w, box.h) * (o?.small ? 0.42 : 0.5) * back(L.clamp(p * 1.3));
    if (r > 0) { ctx.fillStyle = YEL; ctx.globalAlpha = 1; ctx.beginPath(); ctx.arc(cx + (o?.small ? 0 : box.w * 0.22), cy, r, 0, 7); ctx.fill(); ctx.globalAlpha = 1; }
    title(K, str, box, p, { align: 'center', color: o?.small ? INK : BLUE, reveal: 'rise', max: o?.small ? 140 : 320 });
  },
  quote(K, str, box, p) {
    const { ctx, u } = K; ctx.fillStyle = RED; ctx.beginPath(); ctx.arc(box.x + 30 * u, box.y - 10 * u, 34 * u * back(p), 0, 7); ctx.fill();
    title(K, '“' + str + '”', box, p, { size: 'm', max: 100, color: INK, reveal: 'rise' });
  },
  portrait(K, box, p, s) {
    const { ctx } = K, f = fitSubject(K, { ...box, h: box.h * 0.95 }), img = K.S._gray(f.subj.h), m = Math.min(box.w, box.h);
    const cx = box.x + box.w * 0.5, cy = box.y + box.h * 0.42, e = back(L.clamp(p * 1.4));
    ctx.fillStyle = YEL; ctx.beginPath(); ctx.arc(cx, cy, m * 0.44 * e, 0, 7); ctx.fill();
    ctx.fillStyle = BLUE; ctx.fillRect(box.x + box.w * 0.06, box.y + box.h * 0.74, box.w * 0.88 * L.E.out(L.clamp(p * 1.3 - 0.2)), box.h * 0.3);
    ctx.fillStyle = RED; tri(ctx, box.x + box.w * 0.88, box.y + box.h * 0.2, m * 0.16 * e, 0.3);
    ctx.save(); ctx.globalAlpha = L.clamp(p * 2 - 0.4); ctx.drawImage(img, f.x, f.y + (1 - L.E.out(p)) * 60 * K.u); ctx.restore();
  },
  _gray: L.memo(h => L.mapPixels(window.K.subject(h), (r, g, b, a, x, y, l) => { const v = Math.pow(L.clamp((l - 0.06) * 1.6), 1.05) * 235 + 10; return [v, v * 0.98, v * 0.94, a]; })),
  mascot(K, box, p, s, mood) { if (p <= 0) return; const e = back(p); L.mascot(K.ctx, K.spec.mascot, { ...box, y: box.y + (1 - e) * 40 * K.u }, { color: BLUE, outline: false, eye: CREAM, eyeStyle: mood === 'happy' ? 'happy' : 'dot', bob: Math.sin(K.t * 3) * 3 * K.u }); },
  media(K, img, box, p, s, frame) {
    const { ctx, u } = K; if (p <= 0) return;
    ctx.save(); ctx.globalAlpha = L.clamp(p * 2); const o = drawFrame(K, img, box, 1, frame, { shadow: false, stroke: INK, strokeW: 5 * u, bezel: INK });
    ctx.globalCompositeOperation = 'destination-over'; ctx.fillStyle = RED; ctx.fillRect(o.x + 22 * u * L.E.out(p), o.y + 22 * u * L.E.out(p), o.w, o.h); ctx.restore();
  },
  prompt(K, str, box, p, s, tp) {
    if (p <= 0) return; const { ctx, u } = K; ctx.fillStyle = INK; ctx.fillRect(box.x, box.y, box.w * L.E.out(p), 4 * u);
    ctx.fillStyle = YEL; ctx.fillRect(box.x, box.y + 4 * u, 12 * u, (box.h - 4 * u) * L.E.out(p));
    para(K, str.slice(0, Math.ceil(str.length * tp)) + (tp < 1 || (K.frame >> 3) % 2 ? ' ■' : ''), { x: box.x + 34 * u, y: box.y + 10 * u, w: box.w - 34 * u, h: box.h - 10 * u }, 1, { font: sz => K.S.type.bodyEm(sz), color: INK, max: 34 });
  },
  caption(K, words, act, box, p) {
    const { ctx, u } = K; ctx.save(); ctx.globalAlpha = p; ctx.font = K.S.type.bodyEm(34 * u);
    const w = ctx.measureText(words.join(' ')).width, x = box.x + (box.w - w) / 2;
    ctx.fillStyle = INK; ctx.fillRect(x - 28 * u, box.y, w + 56 * u, box.h); ctx.fillStyle = RED; ctx.beginPath(); ctx.arc(x - 28 * u, box.y + box.h / 2, box.h / 2, Math.PI / 2, Math.PI * 1.5); ctx.fill();
    let cx = x; words.forEach((wd, i) => { ctx.fillStyle = i === act ? YEL : i < act ? CREAM : 'rgba(239,232,216,.5)'; ctx.fillText(wd, cx, box.y + box.h * 0.66); cx += ctx.measureText(wd + ' ').width; });
    ctx.restore();
  },
  connector(K, a, b, p) {
    if (p <= 0) return; const { ctx, u } = K, x = a[0] + (b[0] - a[0]) * L.E.inOut(p), y = a[1] + (b[1] - a[1]) * L.E.inOut(p);
    ctx.strokeStyle = INK; ctx.lineWidth = 5 * u; ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(x, y); ctx.stroke();
    ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(x, y, 8 * u, 0, 7); ctx.fill();
  },
  button(K, str, b, p) {
    if (p <= 0) return; const { ctx } = K; ctx.fillStyle = RED; ctx.fillRect(b.x, b.y, b.w * L.E.out(p), b.h);
    ctx.fillStyle = YEL; ctx.beginPath(); ctx.arc(b.x + b.w * L.E.out(p), b.y + b.h / 2, b.h * 0.5, -Math.PI / 2, Math.PI / 2); ctx.fill();
    para(K, str, L.inset(b, b.h * 0.3, b.h * 0.2), L.clamp(p * 2 - 0.5), { font: sz => K.S.type.label(sz), color: CREAM, max: 40 });
  },
  transition(K, A, B, p, info) { // a primary disc swells from a corner, then the next scene opens as a disc from the opposite corner
    const { ctx, W, H } = K, r = info.raw, D = Math.hypot(W, H), col = PRIM[info.to.i % 3];
    ctx.drawImage(A, 0, 0);
    ctx.fillStyle = col; ctx.beginPath(); ctx.arc(0, H, D * L.E.inOut(L.clamp(r * 1.8)), 0, 7); ctx.fill();
    const q = L.E.inOut(L.clamp(r * 1.8 - 0.8));
    if (q > 0) { ctx.save(); ctx.beginPath(); ctx.arc(W, 0, D * q, 0, 7); ctx.clip(); ctx.drawImage(B, 0, 0); ctx.restore(); }
    ctx.fillStyle = INK; const sq = 60 * K.u * Math.sin(r * Math.PI); ctx.save(); ctx.translate(W / 2, H / 2); ctx.rotate(r * Math.PI); ctx.fillRect(-sq / 2, -sq / 2, sq, sq); ctx.restore();
  },
  overlay(K) { L.drawGrain(K.ctx, grain, K.frame, 0.07, 'multiply'); },
};
