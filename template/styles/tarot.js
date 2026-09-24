// Tarot / esotérico — cartas con marcos ornamentales, morado profundo y oro, estrellas que titilan, numeración romana; la persona como arcano grabado.
import * as L from '../engine/lib.js';
import { BASE, title, para, fitSubject, drawFrame } from '../engine/base.js';

const DEEP = '#170B26', PURP = '#2A1843', PURP2 = '#3A2260', GOLD = '#D4AF5A', GOLDL = '#F0D995', CREAM = '#F3E6C8';
const ROMAN = ['0', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX', 'XXI'];
let grain, stars;
const back = t => Math.max(0, L.E.back(t));

function sparkle(ctx, x, y, r) { ctx.beginPath(); ctx.moveTo(x, y - r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.quadraticCurveTo(x, y, x, y + r); ctx.quadraticCurveTo(x, y, x - r, y); ctx.quadraticCurveTo(x, y, x, y - r); ctx.fill(); }
function moon(ctx, x, y, r, col, bg) { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); ctx.fillStyle = bg; ctx.beginPath(); ctx.arc(x + r * 0.42, y - r * 0.15, r * 0.88, 0, 7); ctx.fill(); }
// ornamental card frame: double border + corner quarter-arcs + small stars
function cardFrame(K, b, e = 1, { fill = PURP, lw = 2 } = {}) {
  const { ctx, u } = K, r = Math.min(b.w, b.h) * 0.06;
  ctx.save(); ctx.fillStyle = fill; L.rrect(ctx, b.x, b.y, b.w, b.h, r * 0.4); ctx.fill();
  ctx.globalAlpha *= e; ctx.strokeStyle = GOLD; ctx.lineWidth = lw * u; L.rrect(ctx, b.x + 6 * u, b.y + 6 * u, b.w - 12 * u, b.h - 12 * u, r * 0.3); ctx.stroke();
  ctx.lineWidth = lw * 0.5 * u; const i = 14 * u; ctx.strokeRect(b.x + i, b.y + i, b.w - 2 * i, b.h - 2 * i);
  for (const [cx, cy, a] of [[b.x + i, b.y + i, 0], [b.x + b.w - i, b.y + i, Math.PI / 2], [b.x + b.w - i, b.y + b.h - i, Math.PI], [b.x + i, b.y + b.h - i, -Math.PI / 2]]) { ctx.beginPath(); ctx.arc(cx, cy, r, a, a + Math.PI / 2); ctx.stroke(); ctx.fillStyle = GOLD; sparkle(ctx, cx + Math.cos(a + Math.PI / 4) * r * 0.55, cy + Math.sin(a + Math.PI / 4) * r * 0.55, r * 0.22); }
  ctx.restore();
}

export default {
  id: 'tarot', name: 'Tarot',
  fonts: 'Cinzel:wght@500;700;900&family=Cinzel+Decorative:wght@700&family=EB+Garamond:ital,wght@0,500;1,500',
  fontLoads: ['700 60px Cinzel', '900 60px Cinzel', '500 30px Cinzel', '700 60px "Cinzel Decorative"', '500 30px "EB Garamond"', 'italic 500 30px "EB Garamond"'],
  palette: { bg: DEEP, ink: CREAM, accent: GOLD, muted: '#B7A6CF', panel: PURP, line: 'rgba(212,175,90,.4)', good: GOLD, bad: '#8F7FA8', mascot: PURP2 },
  type: { display: s => `700 ${s}px Cinzel`, em: s => `900 ${s}px Cinzel`, body: s => `500 ${s}px "EB Garamond"`, bodyEm: s => `italic 500 ${s}px "EB Garamond"`, label: s => `700 ${s}px Cinzel`, mono: s => `500 ${s}px "EB Garamond"`, deco: s => `700 ${s}px "Cinzel Decorative"` },
  ls: 0.02, lh: 1.08,
  sfx: 'cosmic', transDur: 0.8, push: 0.03,
  music: 'mystical dark ambient, harp arpeggios, celesta and glass bells, low choir pads, slow frame drum, enchanting and mysterious, 80 BPM, instrumental',
  async setup(K) {
    grain = L.grainTiles(4, 256, 0.6, 41); const r = L.rng(71);
    stars = Array.from({ length: 140 }, () => ({ x: r() * K.W, y: r() * K.H, s: 0.6 + r() * 2.2, ph: r() * 6.28, sp: 0.8 + r() * 2.5, big: r() < 0.08 }));
  },
  background(K, s) {
    const { ctx, W, H, u, t } = K;
    const g = ctx.createRadialGradient(W * 0.5, H * 0.45, 0, W * 0.5, H * 0.45, Math.max(W, H) * 0.75); g.addColorStop(0, '#2C1747'); g.addColorStop(1, DEEP); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    for (const st of stars) { const a = 0.25 + 0.75 * (0.5 + 0.5 * Math.sin(t * st.sp + st.ph)); ctx.globalAlpha = a * 0.8; ctx.fillStyle = st.big ? GOLDL : CREAM; if (st.big) sparkle(ctx, st.x, st.y, st.s * 4 * u); else { ctx.beginPath(); ctx.arc(st.x, st.y, st.s * u, 0, 7); ctx.fill(); } }
    ctx.globalAlpha = 1;
    // a faint moon and constellation, position alternating per scene
    const mx = W - 60 * u, my = 80 * u, mr = 34 * u;
    ctx.globalAlpha = 0.5; moon(ctx, mx, my, mr, GOLDL, '#221137'); ctx.globalAlpha = 1;
    ctx.strokeStyle = 'rgba(212,175,90,.2)'; ctx.lineWidth = 1 * u; const cr = L.rng(s.i + 3), pts = Array.from({ length: 5 }, () => [W * (s.i % 2 ? 0.02 + cr() * 0.1 : 0.88 + cr() * 0.1), H * (0.6 + cr() * 0.3)]);
    ctx.beginPath(); pts.forEach(([x, y], k) => k ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke(); ctx.fillStyle = GOLDL; pts.forEach(([x, y]) => { ctx.beginPath(); ctx.arc(x, y, 2.5 * u, 0, 7); ctx.fill(); });
    // thin outer frame
    ctx.strokeStyle = 'rgba(212,175,90,.45)'; ctx.lineWidth = 1.5 * u; const m = 22 * u; ctx.strokeRect(m, m, W - 2 * m, H - 2 * m);
  },
  headline(K, str, box, p, s, o = {}) { title(K, str, box, p, { align: o.align, size: o.size, color: GOLD, emColor: CREAM, emStyle: 'underline', emBg: GOLD, reveal: 'fade', valign: 'middle', max: o.size === 'm' ? 100 : 150 }); },
  text(K, str, box, p, role, s, o = {}) {
    const { ctx, u } = K;
    if (role === 'kicker' || role === 'label') {
      ctx.font = K.S.type.label(22 * u); ctx.letterSpacing = '0px';
      return para(K, '✦ ' + str + ' ✦', box, p, { font: sz => K.S.type.label(sz), color: GOLDL, upper: true, ls: 0.22, max: 24, align: o.align || 'left' });
    }
    if (role === 'headBad' || role === 'headGood') return title(K, str, box, p, { color: role === 'headGood' ? GOLD : '#9C8DB5', max: 60, reveal: 'fade', align: 'center' });
    return BASE.text(K, str, box, p, role, s, { color: role === 'bad' ? '#9C8DB5' : role === 'body' ? '#D9C9E8' : CREAM, max: role === 'body' ? 46 : 44, ...o });
  },
  panel(K, b, p, s, kind, j = 0) {
    if (p <= 0) return; const { ctx, u } = K; ctx.save(); ctx.globalAlpha = L.clamp(p * 1.4);
    if (kind === 'good' || kind === 'bad') { ctx.globalAlpha *= kind === 'bad' ? 0.85 : 1; cardFrame(K, b, 1, { fill: kind === 'good' ? PURP2 : '#221236' }); ctx.restore(); return; }
    ctx.fillStyle = 'rgba(42,24,67,.75)'; L.rrect(ctx, b.x, b.y, b.w, b.h, 10 * u); ctx.fill(); ctx.strokeStyle = 'rgba(212,175,90,.55)'; ctx.lineWidth = 1.5 * u; ctx.stroke();
    ctx.fillStyle = GOLD; sparkle(ctx, b.x + b.w - 26 * u, b.y + b.h / 2, 9 * u); ctx.restore();
  },
  bullet(K, i, b, p) {
    if (p <= 0) return; const { ctx, u } = K, [cx, cy] = L.center(b), r = Math.min(b.w, b.h) / 2 * back(p);
    ctx.strokeStyle = GOLD; ctx.lineWidth = 2 * u; ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.stroke(); ctx.lineWidth = 1 * u; ctx.beginPath(); ctx.arc(cx, cy, r * 0.84, 0, 7); ctx.stroke();
    L.text(ctx, ROMAN[i + 1] || String(i + 1), cx, cy + r * 0.06, { font: K.S.type.display(r * (i + 1 >= 4 ? 0.62 : 0.8)), color: GOLDL, align: 'center', base: 'middle', alpha: L.clamp(p * 2 - 0.6) });
  },
  number(K, str, box, p, s, o) { const ctx = K.ctx; ctx.save(); ctx.shadowColor = 'rgba(240,217,149,.5)'; ctx.shadowBlur = 36 * K.u; title(K, str, box, p, { align: 'center', color: GOLD, reveal: 'fade', max: o?.small ? 130 : 280, font: sz => K.S.type.deco(sz) }); ctx.restore(); },
  quote(K, str, box, p) { title(K, '“' + str + '”', box, p, { size: 'm', max: 90, color: CREAM, reveal: 'words', font: sz => `italic 500 ${sz}px "EB Garamond"`, lh: 1.15 }); },
  portrait(K, box, p, s) { // the person as an arcana card
    const { ctx, u } = K, e = L.E.out(L.clamp(p * 1.2));
    const ch = box.h * 0.92, cw = Math.min(box.w * 0.9, ch * 0.6), cb = { x: box.x + (box.w - cw) / 2, y: box.y + box.h * 0.04, w: cw, h: ch };
    ctx.save(); const [cx, cy] = L.center(cb); ctx.translate(cx, cy + (1 - e) * 80 * u); ctx.rotate((1 - e) * 0.15 - 0.02); ctx.scale(Math.max(0.01, Math.abs(Math.cos((1 - e) * Math.PI / 2))), 1); ctx.translate(-cx, -cy);
    ctx.globalAlpha = L.clamp(p * 2);
    ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = 40 * u; ctx.fillStyle = PURP; ctx.fillRect(cb.x, cb.y, cb.w, cb.h); ctx.shadowColor = 'transparent';
    cardFrame(K, cb, 1, { fill: PURP });
    const hb = cb.h * 0.1, inner = { x: cb.x + 26 * u, y: cb.y + hb + 10 * u, w: cb.w - 52 * u, h: cb.h - hb * 2 - 20 * u };
    ctx.save(); ctx.beginPath(); ctx.rect(inner.x, inner.y, inner.w, inner.h); ctx.clip();
    const rg = ctx.createRadialGradient(inner.x + inner.w / 2, inner.y + inner.h * 0.35, 0, inner.x + inner.w / 2, inner.y + inner.h * 0.35, inner.w * 0.7); rg.addColorStop(0, 'rgba(240,217,149,.28)'); rg.addColorStop(1, 'rgba(240,217,149,0)'); ctx.fillStyle = rg; ctx.fillRect(inner.x, inner.y, inner.w, inner.h);
    const f = fitSubject(K, { ...inner, h: inner.h * 0.94 }), img = K.S._eng(f.subj.h); ctx.drawImage(img, f.x, inner.y + inner.h - f.h);
    ctx.restore();
    L.text(ctx, ROMAN[(s.i % 21) + 1], cb.x + cb.w / 2, cb.y + hb * 0.72, { font: K.S.type.display(hb * 0.5), color: GOLD, align: 'center' });
    const name = K.person?.name || K.spec.person?.name; if (name) L.text(ctx, name.toUpperCase(), cb.x + cb.w / 2, cb.y + cb.h - hb * 0.4, { font: K.S.type.display(hb * 0.32), color: GOLD, align: 'center', ls: hb * 0.04 });
    else { ctx.fillStyle = GOLD; sparkle(ctx, cb.x + cb.w / 2, cb.y + cb.h - hb * 0.55, hb * 0.22); }
    ctx.restore();
  },
  _eng: L.memo(h => { const S = window.K.subject(h), c = L.canvas(S.w, S.h), x = c.getContext('2d'); const Lb = L.blurL(S.L, S.w, S.h, 1).map(v => 1 - L.clamp((v - 0.04) * 1.8)); L.engrave(x, Lb, S.A, S.w, S.h, 0, 0, { step: Math.max(3.5, h / 150), maxW: Math.max(3.5, h / 150) * 0.95, color: GOLDL, wave: 1.6, freq: 0.035, angle: -0.5 }); return c; }),
  mascot(K, box, p, s, mood) { if (p <= 0) return; const ctx = K.ctx; ctx.save(); ctx.globalAlpha = L.clamp(p * 1.6); ctx.shadowColor = 'rgba(240,217,149,.5)'; ctx.shadowBlur = 24 * K.u; L.mascot(ctx, K.spec.mascot, { ...box, y: box.y + (1 - back(p)) * 30 * K.u }, { color: PURP2, ink: GOLD, eye: GOLDL, eyeStyle: mood === 'happy' ? 'happy' : 'dot', bob: Math.sin(K.t * 2) * 5 * K.u }); ctx.restore(); },
  media(K, img, box, p, s, frame) { const { ctx, u } = K; if (p <= 0) return; const o = drawFrame(K, img, box, p, frame, { bezel: DEEP, shadowColor: 'rgba(0,0,0,.55)', stroke: GOLD, strokeW: 3 * u }); ctx.save(); ctx.globalAlpha = L.clamp(p * 2 - 1); ctx.fillStyle = GOLD; for (const [x, y] of [[o.x - 20 * u, o.y - 20 * u], [o.x + o.w + 20 * u, o.y - 20 * u], [o.x - 20 * u, o.y + o.h + 20 * u], [o.x + o.w + 20 * u, o.y + o.h + 20 * u]]) sparkle(ctx, x, y, 14 * u); ctx.restore(); },
  prompt(K, str, box, p, s, tp) {
    if (p <= 0) return; const { ctx, u } = K; ctx.save(); ctx.globalAlpha = L.clamp(p * 1.5); cardFrame(K, box, 1, { fill: 'rgba(42,24,67,.9)', lw: 1.5 }); ctx.restore();
    para(K, str.slice(0, Math.ceil(str.length * tp)) + (tp < 1 || (K.frame >> 3) % 2 ? ' ✦' : ''), L.inset(box, 34 * u, 18 * u), 1, { color: CREAM, max: 32, font: sz => K.S.type.bodyEm(sz) });
  },
  caption(K, words, act, box, p) {
    const { ctx, u } = K; ctx.save(); ctx.globalAlpha = p; ctx.font = K.S.type.body(36 * u); ctx.letterSpacing = '0px';
    const w = ctx.measureText(words.join(' ')).width, x = box.x + (box.w - w) / 2;
    ctx.fillStyle = 'rgba(23,11,38,.85)'; L.rrect(ctx, x - 40 * u, box.y, w + 80 * u, box.h, box.h / 2); ctx.fill(); ctx.strokeStyle = 'rgba(212,175,90,.6)'; ctx.lineWidth = 1.5 * u; ctx.stroke();
    ctx.fillStyle = GOLD; sparkle(ctx, x - 22 * u, box.y + box.h / 2, 7 * u); sparkle(ctx, x + w + 22 * u, box.y + box.h / 2, 7 * u);
    let cx = x; words.forEach((wd, i) => { ctx.fillStyle = i === act ? GOLDL : i < act ? CREAM : 'rgba(243,230,200,.5)'; ctx.fillText(wd, cx, box.y + box.h * 0.66); cx += ctx.measureText(wd + ' ').width; });
    ctx.restore();
  },
  connector(K, a, b, p) {
    if (p <= 0) return; const { ctx, u } = K, e = L.E.inOut(p), n = 10; ctx.fillStyle = GOLD;
    for (let k = 1; k < n * e; k++) { const t = k / n, x = a[0] + (b[0] - a[0]) * t, y = a[1] + (b[1] - a[1]) * t; if (k % 3 === 0) sparkle(ctx, x, y, 6 * u); else { ctx.beginPath(); ctx.arc(x, y, 2 * u, 0, 7); ctx.fill(); } }
  },
  button(K, str, b, p) {
    if (p <= 0) return; const { ctx, u } = K; ctx.save(); ctx.globalAlpha = L.clamp(p * 1.5); L.rrect(ctx, b.x, b.y, b.w, b.h, b.h / 2); ctx.fillStyle = PURP2; ctx.fill(); ctx.strokeStyle = GOLD; ctx.lineWidth = 2 * u; ctx.stroke();
    ctx.fillStyle = GOLD; sparkle(ctx, b.x + b.h * 0.5, b.y + b.h / 2, b.h * 0.2); sparkle(ctx, b.x + b.w - b.h * 0.5, b.y + b.h / 2, b.h * 0.2);
    para(K, str, L.inset(b, b.h * 0.9, b.h * 0.2), 1, { font: sz => K.S.type.label(sz), color: GOLDL, upper: true, ls: 0.14, max: 28, align: 'center' }); ctx.restore();
  },
  transition(K, A, B, p, info) { // the scene turns over like a tarot card
    const { ctx, W, H, u } = K, r = info.raw, first = r < 0.5, q = first ? L.E.in(r * 2) : L.E.out((r - 0.5) * 2), sx = first ? 1 - q : q;
    const g = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H) * 0.7); g.addColorStop(0, '#2C1747'); g.addColorStop(1, DEEP); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(Math.max(0.002, sx) * (0.9 + 0.1 * sx), 0.9 + 0.1 * sx); ctx.translate(-W / 2, -H / 2);
    ctx.drawImage(first ? A : B, 0, 0); ctx.fillStyle = `rgba(23,11,38,${(1 - sx) * 0.6})`; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = GOLD; ctx.lineWidth = 6 * u / Math.max(0.05, sx); ctx.strokeRect(0, 0, W, H); ctx.restore();
    ctx.fillStyle = GOLDL; ctx.globalAlpha = Math.sin(r * Math.PI); sparkle(ctx, W / 2, H / 2, 60 * u * Math.sin(r * Math.PI)); ctx.globalAlpha = 1;
  },
  overlay(K) {
    const { ctx, W, H } = K; L.drawGrain(ctx, grain, K.frame, 0.07, 'overlay');
    const v = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.35, W / 2, H / 2, Math.max(W, H) * 0.7); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(8,3,15,.55)'); ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
  },
};
