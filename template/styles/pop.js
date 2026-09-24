// Neo-pop sticker — gradiente eléctrico con semitono, títulos cromados, todo es sticker con borde blanco, captions tipo TikTok.
import * as L from '../engine/lib.js';
import { BASE, para, layoutRich, fitSubject, frameBox, cover } from '../engine/base.js';

const DARK = '#140A2E', LIME = '#C8FF3D', WHITE = '#FFFFFF';
const GRADS = [['#2B2BFF', '#FF2E88', '#FF9A1F'], ['#6A1BFF', '#FF2E88', '#FF5A5A'], ['#FF6A00', '#FF2E88', '#7A2BFF']];
let backs = [], grain;
const STK = new WeakMap();
function sticker(src, border) { // white die-cut outline around any canvas (alpha)
  let m = STK.get(src); if (!m) STK.set(src, m = {}); if (m[border]) return m[border];
  const c = L.canvas(src.width + border * 4, src.height + border * 4), x = c.getContext('2d');
  for (let a = 0; a < 24; a++) x.drawImage(src, border * 2 + Math.cos(a / 24 * 6.283) * border, border * 2 + Math.sin(a / 24 * 6.283) * border);
  x.globalCompositeOperation = 'source-in'; x.fillStyle = WHITE; x.fillRect(0, 0, c.width, c.height); x.globalCompositeOperation = 'source-over'; x.drawImage(src, border * 2, border * 2);
  return (m[border] = c);
}
const PHOTO = L.memo(h => { const S = window.K.subject(h), c = L.canvas(S.w, S.h), x = c.getContext('2d'); x.filter = 'contrast(1.12) saturate(1.25) brightness(1.04)'; x.drawImage(S.c, 0, 0); return c; });
const MASC = L.memo((kind, w, h) => { const c = L.canvas(Math.ceil(w), Math.ceil(h)), x = c.getContext('2d'); L.mascot(x, kind, { x: 6, y: 6, w: w - 12, h: h - 12 }, { color: window.K.P.mascot, ink: DARK, eye: DARK, eyeStyle: 'happy' }); return c; });
function stamp(ctx, c, cx, cy, rot, sc, u) { ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot); ctx.scale(sc, sc); ctx.shadowColor = 'rgba(40,0,60,.45)'; ctx.shadowBlur = 30 * u; ctx.shadowOffsetY = 16 * u; ctx.drawImage(c, -c.width / 2, -c.height / 2); ctx.restore(); }
function chrome(K, R, x0s, y0, p, o = {}) { // R = layoutRich result; per-word punch-in
  const ctx = K.ctx, nW = R.lines.reduce((a, l) => a + l.length, 0); let wi = 0;
  R.lines.forEach((line, i) => line.forEach(t => {
    const wp = L.clamp(p * (nW * 0.4 + 1) - wi * 0.4); wi++; if (wp <= 0) return;
    const x = x0s[i] + t.x, base = y0 + i * R.lh + R.size * 0.84, sc = 1 + 0.35 * (1 - L.E.out(wp));
    ctx.save(); ctx.globalAlpha = L.clamp(wp * 3); ctx.translate(x + t.width / 2, base - R.size * 0.35); ctx.scale(sc, sc); ctx.rotate(o.rot || -0.04); ctx.translate(-(x + t.width / 2), -(base - R.size * 0.35));
    ctx.font = t.em ? R.emFont : R.font; ctx.letterSpacing = R.ls + 'px'; ctx.lineJoin = 'round';
    ctx.strokeStyle = DARK; ctx.lineWidth = R.size * 0.12; ctx.strokeText(t.w, x + R.size * 0.05, base + R.size * 0.07); ctx.fillStyle = DARK; ctx.fillText(t.w, x + R.size * 0.05, base + R.size * 0.07);
    ctx.strokeStyle = WHITE; ctx.lineWidth = R.size * 0.07; ctx.strokeText(t.w, x, base);
    if (t.em) ctx.fillStyle = LIME; else { const g = ctx.createLinearGradient(0, base - R.size, 0, base + 5); g.addColorStop(0, '#FFFFFF'); g.addColorStop(0.45, '#BFC7FF'); g.addColorStop(0.52, '#6B5CFF'); g.addColorStop(0.78, '#FFD1F0'); g.addColorStop(1, '#FFFFFF'); ctx.fillStyle = g; }
    ctx.fillText(t.w, x, base); ctx.restore();
  }));
}
const pill = (ctx, x, y, w, h, fill, u) => { L.rrect(ctx, x, y, w, h, h / 2); ctx.fillStyle = fill; ctx.fill(); ctx.lineWidth = 5 * u; ctx.strokeStyle = DARK; ctx.stroke(); };

export default {
  id: 'pop', name: 'Neo-pop sticker',
  fonts: 'Unbounded:wght@700;900&family=Inter:wght@600;800',
  fontLoads: ['900 100px Unbounded', '700 40px Unbounded', '600 30px Inter', '800 30px Inter'],
  palette: { bg: '#FF2E88', ink: WHITE, accent: LIME, muted: 'rgba(255,255,255,.85)', panel: WHITE, line: 'rgba(255,255,255,.4)', good: '#1F9D55', bad: '#E0245E', mascot: '#D97757' },
  type: { display: s => `900 ${s}px Unbounded`, body: s => `600 ${s}px Inter`, bodyEm: s => `800 ${s}px Inter`, label: s => `700 ${s}px Unbounded`, mono: s => `600 ${s}px Inter` },
  upper: true, lh: 1.05, ls: -0.035,
  sfx: 'pop', transDur: 0.45, push: 0.035,
  music: 'hyperpop K-pop instrumental, glossy synths, punchy 808s, bright bells, chopped vocal-free hooks, energetic 128 BPM, instrumental, confident and fun',
  async setup(K) {
    const { W, H, u } = K; grain = L.grainTiles(3, 256, 0.5, 2);
    GRADS.forEach(([a, b, c], v) => {
      const cv = L.canvas(W, H), x = cv.getContext('2d'), g = x.createLinearGradient(0, 0, W, H); g.addColorStop(0, a); g.addColorStop(0.55, b); g.addColorStop(1, c); x.fillStyle = g; x.fillRect(0, 0, W, H);
      x.fillStyle = 'rgba(255,255,255,.14)'; const st = 22 * u;
      for (let y = 0; y < H; y += st) for (let xx = (Math.round(y / st) % 2) * st / 2; xx < W; xx += st) { const r = 0.5 + 6 * u * Math.max(0, (v % 2 ? W - xx : xx) / W - 0.4) * (1 - y / H); x.beginPath(); x.arc(xx, y, r, 0, 7); x.fill(); }
      backs.push(cv);
    });
  },
  background(K, s) { K.ctx.drawImage(backs[s.i % 3], 0, 0); },
  decor(K, s) { // twinkling sparkles in the corners
    const ctx = K.ctx, u = K.u, r = L.rng(s.i + 9); ctx.fillStyle = WHITE;
    for (let k = 0; k < 5; k++) { const x = K.W * (k % 2 ? 0.93 - r() * 0.05 : 0.03 + r() * 0.05) , y = K.H * (0.08 + r() * 0.7), sz = (14 + r() * 26) * u * (0.6 + 0.4 * Math.sin(K.t * 3 + k * 2)); L.star(ctx, x, y, sz, 4, 0.22, 0); ctx.fill(); }
  },
  headline(K, str, box, p, s, o = {}) {
    const R = layoutRich(K.ctx, K.rich(str), { ...box, w: box.w * 0.95 }, { font: sz => K.S.type.display(sz), max: (o.size === 'm' ? 110 : 170) * K.u, min: 18 * K.u, lh: 1.1, ls: 0.01, upper: true });
    const y0 = box.y + (box.h - R.lines.length * R.lh) / 2, xs = R.widths.map(w => o.align === 'center' ? box.x + (box.w - w) / 2 : box.x + 10 * K.u);
    chrome(K, R, xs, y0, p);
  },
  text(K, str, box, p, role, s, o = {}) {
    const ctx = K.ctx, u = K.u;
    if (role === 'kicker' || role === 'label') {
      if (p <= 0) return; ctx.font = K.S.type.label(26 * u); const tw = ctx.measureText(str.toUpperCase()).width, h = Math.min(box.h, 56 * u), w = Math.min(box.w, tw + 50 * u), x = o.align === 'center' ? box.x + (box.w - w) / 2 : box.x, y = box.y + (box.h - h) / 2, e = L.E.back(p);
      ctx.save(); ctx.translate(x + w / 2, y + h / 2); ctx.scale(e, e); ctx.translate(-(x + w / 2), -(y + h / 2)); pill(ctx, x, y, w, h, LIME, u); ctx.restore();
      return para(K, str, L.inset({ x, y, w, h }, 25 * u, 8 * u), L.clamp(p * 2 - 0.5), { font: sz => K.S.type.label(sz), color: DARK, upper: true, max: 26, align: 'center' });
    }
    if (role === 'headGood' || role === 'headBad') return para(K, str, box, p, { font: sz => K.S.type.display(sz), color: role === 'headGood' ? '#16874A' : '#D11F5A', upper: true, max: 54, ls: -0.02, reveal: 'fade' });
    const onCard = ['item', 'good', 'bad'].includes(role) || (role === 'step' && false);
    return BASE.text(K, str, box, p, role, s, { color: onCard ? (role === 'bad' ? '#6B5A7A' : DARK) : WHITE, font: sz => K.S.type.bodyEm(sz), ...o });
  },
  panel(K, b, p, s, kind, j = 0) {
    if (p <= 0) return; const ctx = K.ctx, u = K.u, e = L.E.back(p), cx = b.x + b.w / 2, cy = b.y + b.h / 2;
    ctx.save(); ctx.translate(cx, cy); ctx.rotate((j % 2 ? 0.006 : -0.006) + (1 - e) * 0.05); ctx.scale(0.85 + 0.15 * e, 0.85 + 0.15 * e); ctx.translate(-cx, -cy); ctx.globalAlpha = L.clamp(p * 3);
    ctx.shadowColor = 'rgba(40,0,60,.4)'; ctx.shadowBlur = 24 * u; ctx.shadowOffsetY = 12 * u;
    L.rrect(ctx, b.x, b.y, b.w, b.h, 26 * u); ctx.fillStyle = kind === 'good' ? '#EFFFD0' : kind === 'bad' ? '#FFE3EE' : WHITE; ctx.fill(); ctx.shadowColor = 'transparent';
    ctx.lineWidth = 4 * u; ctx.strokeStyle = DARK; ctx.stroke(); ctx.restore();
  },
  bullet(K, i, b, p) {
    if (p <= 0) return; const ctx = K.ctx, u = K.u, [cx, cy] = L.center(b), r = Math.min(b.w, b.h) / 2 * L.E.back(p);
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.fillStyle = [LIME, '#7CE7FF', '#FFD23F', '#FF9ECF'][i % 4]; ctx.fill(); ctx.lineWidth = 4 * u; ctx.strokeStyle = DARK; ctx.stroke();
    L.text(ctx, String(i + 1), cx, cy + r * 0.36, { font: K.S.type.display(r * 0.95), color: DARK, align: 'center' });
  },
  number(K, str, box, p, s, o = {}) {
    const R = layoutRich(K.ctx, K.rich(str), box, { font: sz => K.S.type.display(sz), max: (o.small ? 140 : 260) * K.u, min: 20 * K.u, lh: 1.05, ls: 0.005 });
    chrome(K, R, R.widths.map(w => box.x + (box.w - w) / 2), box.y + (box.h - R.lines.length * R.lh) / 2, p, { rot: -0.03 });
  },
  quote(K, str, box, p, s) {
    if (p <= 0) return; K.S.panel(K, box, L.clamp(p * 1.5), s, 'row', 0);
    para(K, '“' + str + '”', L.inset(box, box.w * 0.06, box.h * 0.12), L.clamp(p * 1.4 - 0.3), { font: sz => K.S.type.display(sz), color: DARK, max: 70, lh: 1.15, ls: -0.02, reveal: 'words' });
  },
  portrait(K, box, p, s) { // die-cut sticker slapped onto the page
    if (p <= 0) return; const f = fitSubject(K, { ...box, h: box.h * 0.94 }), stk = sticker(PHOTO(f.subj.h), Math.round(15 * K.u)), e = L.E.back(p);
    stamp(K.ctx, stk, f.x + f.w / 2, f.y + f.h / 2 + box.h * 0.04, 0.035 + (1 - e) * 0.2, 0.8 + 0.2 * e, K.u);
  },
  mascot(K, box, p, s) {
    if (p <= 0) return; const e = L.E.back(p), stk = sticker(MASC(K.spec.mascot, Math.round(box.w), Math.round(box.h)), Math.round(10 * K.u));
    stamp(K.ctx, stk, box.x + box.w / 2, box.y + box.h / 2 + Math.sin(K.t * 3) * 4 * K.u, -0.14 + (1 - e) * 0.5, e, K.u);
  },
  media(K, img, box, p, s, frame) {
    if (p <= 0) return; const ctx = K.ctx, u = K.u, F = frameBox(img, box, frame), O = F.outer, e = L.E.back(p), bw = 12 * u;
    ctx.save(); ctx.translate(O.x + O.w / 2, O.y + O.h / 2); ctx.rotate(0.03 + (1 - e) * 0.15); ctx.scale(0.8 + 0.2 * e, 0.8 + 0.2 * e); ctx.translate(-(O.x + O.w / 2), -(O.y + O.h / 2)); ctx.globalAlpha = L.clamp(p * 3);
    ctx.shadowColor = 'rgba(40,0,60,.45)'; ctx.shadowBlur = 30 * u; ctx.shadowOffsetY = 16 * u; L.rrect(ctx, O.x - bw, O.y - bw, O.w + 2 * bw, O.h + 2 * bw, F.r + bw); ctx.fillStyle = WHITE; ctx.fill(); ctx.shadowColor = 'transparent';
    L.rrect(ctx, O.x, O.y, O.w, O.h, F.r); ctx.fillStyle = frame === 'phone' ? DARK : WHITE; ctx.fill();
    const inner = { x: O.x + F.pad, y: O.y + F.pad, w: O.w - 2 * F.pad, h: O.h - 2 * F.pad }; ctx.save(); L.rrect(ctx, inner.x, inner.y, inner.w, inner.h, F.r * 0.75); ctx.clip(); cover(ctx, img, inner); ctx.restore();
    ctx.restore();
  },
  prompt(K, str, box, p, s, tp) { // chat bubble
    if (p <= 0) return; const ctx = K.ctx, u = K.u, e = L.E.back(p); ctx.save(); ctx.translate(box.x, box.y + box.h); ctx.scale(e, e); ctx.rotate(-0.02); ctx.translate(-box.x, -(box.y + box.h));
    ctx.shadowColor = 'rgba(40,0,60,.35)'; ctx.shadowBlur = 20 * u; ctx.shadowOffsetY = 10 * u; L.rrect(ctx, box.x, box.y, box.w, box.h, Math.min(box.h / 2, 40 * u)); ctx.fillStyle = WHITE; ctx.fill(); ctx.shadowColor = 'transparent';
    ctx.beginPath(); ctx.moveTo(box.x + 30 * u, box.y + box.h - 4 * u); ctx.lineTo(box.x + 10 * u, box.y + box.h + 22 * u); ctx.lineTo(box.x + 60 * u, box.y + box.h - 4 * u); ctx.fill(); ctx.restore();
    para(K, str.slice(0, Math.ceil(str.length * tp)) + (tp < 1 ? '|' : ''), L.inset(box, 32 * u, 12 * u), 1, { font: sz => K.S.type.bodyEm(sz), color: DARK, max: 32 });
  },
  caption(K, words, act, box, p) { // TikTok-style: big bold words, the spoken one pops in lime
    const ctx = K.ctx, u = K.u; ctx.save(); ctx.globalAlpha = p; const f = K.S.type.label(36 * u); ctx.font = f; ctx.letterSpacing = '0px'; ctx.lineJoin = 'round';
    const gap = 14 * u, W = ctx.measureText(words.join(' ').toUpperCase()).width + gap * words.length; let cx = box.x + (box.w - W) / 2; const y = box.y + box.h * 0.68;
    words.forEach((wd, i) => { const w = wd.toUpperCase(), ww = ctx.measureText(w).width, sc = i === act ? 1.08 : 1; ctx.save(); ctx.translate(cx + ww / 2, y); ctx.scale(sc, sc); ctx.strokeStyle = DARK; ctx.lineWidth = 9 * u; ctx.strokeText(w, -ww / 2, 0); ctx.fillStyle = i === act ? LIME : WHITE; ctx.fillText(w, -ww / 2, 0); ctx.restore(); cx += ctx.measureText(w + ' ').width + gap; });
    ctx.restore();
  },
  connector(K, a, b, p) { if (p <= 0) return; const ctx = K.ctx; ctx.save(); ctx.strokeStyle = WHITE; ctx.lineWidth = 6 * K.u; ctx.lineCap = 'round'; ctx.setLineDash([2, 18 * K.u]); ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(a[0] + (b[0] - a[0]) * p, a[1] + (b[1] - a[1]) * p); ctx.stroke(); ctx.restore(); },
  button(K, str, b, p) {
    if (p <= 0) return; const ctx = K.ctx, u = K.u, e = L.E.back(p), cx = b.x + b.w / 2, cy = b.y + b.h / 2; ctx.save(); ctx.translate(cx, cy); ctx.scale(e, e); ctx.rotate(-0.02); ctx.translate(-cx, -cy);
    ctx.fillStyle = DARK; L.rrect(ctx, b.x + 6 * u, b.y + 8 * u, b.w, b.h, b.h / 2); ctx.fill(); pill(ctx, b.x, b.y, b.w, b.h, LIME, u); ctx.restore();
    para(K, str, L.inset(b, b.h * 0.35, b.h * 0.2), L.clamp(p * 2 - 0.6), { font: sz => K.S.type.label(sz), color: DARK, upper: true, max: 30, align: 'center' });
  },
  transition(K, A, B, p, info) { // punch: old frame zooms past, new one slaps in as a giant sticker
    const { ctx, W, H, u } = K, r = info.raw;
    const za = 1 + L.E.in(L.clamp(r * 1.6)) * 0.5; ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(za, za); ctx.translate(-W / 2, -H / 2); ctx.drawImage(A, 0, 0); ctx.restore();
    const q = L.clamp((r - 0.25) / 0.75); if (q <= 0) return; const e = L.E.back(q), sc = 0.35 + 0.65 * e, bw = 18 * u * (1 - L.E.out(q));
    ctx.save(); ctx.translate(W / 2, H / 2); ctx.rotate(-0.18 * (1 - L.E.out(q))); ctx.scale(sc, sc);
    ctx.shadowColor = 'rgba(40,0,60,.5)'; ctx.shadowBlur = 50 * u; ctx.fillStyle = WHITE; ctx.fillRect(-W / 2 - bw, -H / 2 - bw, W + 2 * bw, H + 2 * bw); ctx.shadowColor = 'transparent';
    ctx.drawImage(B, -W / 2, -H / 2); ctx.restore();
    if (r < 0.35) { ctx.fillStyle = `rgba(255,255,255,${0.5 * (1 - r / 0.35)})`; ctx.fillRect(0, 0, W, H); }
  },
  overlay(K) { L.drawGrain(K.ctx, grain, K.frame, 0.05, 'overlay'); },
};
