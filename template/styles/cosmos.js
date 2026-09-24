// Explainer espacial — azul profundo, estrellas que titilan, planetas planos con degradado sutil, formas redondeadas; personaje plano; viaje con warp.
import * as L from '../engine/lib.js';
import { BASE, title, para, fitCharacter, drawFrame } from '../engine/base.js';

const NIGHT = '#0B1537', DEEP = '#15275E', INK = '#F4F6FF', YEL = '#FFC857', ORG = '#FF7A59', TEAL = '#47D6C4', LILA = '#8C9BFF', MUTED = '#A9B4E0', CARD = '#1C3176';
let skies = [], stars = [];
// flat planets per variant: [fx, fy, r (fraction of min side), color, ring]
const PLANETS = [[[0.985, 0.1, 0.12, ORG, true], [0.015, 0.93, 0.07, TEAL, false]], [[0.01, 0.03, 0.08, LILA, false], [0.97, 0.93, 0.15, YEL, true]], [[0.96, 0.96, 0.11, TEAL, true], [0.985, 0.04, 0.05, ORG, false]]];
function planet(ctx, x, y, r, col, ring) {
  const g = ctx.createLinearGradient(x - r, y - r, x + r, y + r); g.addColorStop(0, L.mix(col, '#FFFFFF', 0.25)); g.addColorStop(1, L.mix(col, NIGHT, 0.35));
  if (ring) { ctx.save(); ctx.strokeStyle = L.rgba(L.mix(col, '#FFFFFF', 0.4), 0.55); ctx.lineWidth = r * 0.12; ctx.beginPath(); ctx.ellipse(x, y, r * 1.75, r * 0.45, -0.35, Math.PI, Math.PI * 2); ctx.stroke(); ctx.restore(); }
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
  ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.clip(); ctx.fillStyle = L.rgba('#000000', 0.12); ctx.beginPath(); ctx.arc(x + r * 0.55, y + r * 0.55, r * 1.05, 0, 7); ctx.fill();
  ctx.fillStyle = L.rgba('#FFFFFF', 0.12); ctx.beginPath(); ctx.ellipse(x - r * 0.3, y - 0.05 * r, r * 0.35, r * 0.12, -0.35, 0, 7); ctx.fill(); ctx.restore();
  if (ring) { ctx.save(); ctx.strokeStyle = L.rgba(L.mix(col, '#FFFFFF', 0.4), 0.8); ctx.lineWidth = r * 0.12; ctx.beginPath(); ctx.ellipse(x, y, r * 1.75, r * 0.45, -0.35, 0, Math.PI); ctx.stroke(); ctx.restore(); }
}
const flatFill = ctx => (p, c, part) => { ctx.fillStyle = c; ctx.fill(p); if (part === 'torso' || part === 'hairBack') { ctx.save(); ctx.clip(p); ctx.fillStyle = 'rgba(11,21,55,.18)'; ctx.fillRect(40, -400, 400, 900); ctx.restore(); } };

export default {
  id: 'cosmos', name: 'Explainer espacial',
  fonts: 'Outfit:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500',
  fontLoads: ['400 30px Outfit', '500 30px Outfit', '600 30px Outfit', '700 60px Outfit', '800 60px Outfit', '500 20px "JetBrains Mono"'],
  palette: { bg: NIGHT, ink: INK, accent: YEL, muted: MUTED, panel: CARD, line: 'rgba(244,246,255,.18)', good: TEAL, bad: ORG, mascot: TEAL },
  type: { display: s => `800 ${s}px Outfit`, em: s => `800 ${s}px Outfit`, body: s => `400 ${s}px Outfit`, bodyEm: s => `600 ${s}px Outfit`, label: s => `700 ${s}px Outfit`, mono: s => `500 ${s}px "JetBrains Mono"` },
  ls: -0.02, lh: 1.02,
  sfx: 'cosmic', transDur: 0.75, push: 0.03,
  music: 'cinematic ambient electronic, twinkling arpeggios, warm analog pads, soft driving pulse, sense of wonder and discovery, 100 BPM, instrumental, science explainer',
  async setup(K) {
    const { W, H } = K, m = Math.min(W, H);
    for (let v = 0; v < 3; v++) {
      const c = L.canvas(W, H), x = c.getContext('2d'), g = x.createLinearGradient(0, 0, W * 0.3, H); g.addColorStop(0, v === 1 ? '#101C47' : NIGHT); g.addColorStop(1, DEEP); x.fillStyle = g; x.fillRect(0, 0, W, H);
      const r = L.rng(70 + v); for (let k = 0; k < 420; k++) { x.fillStyle = `rgba(244,246,255,${0.15 + r() * 0.5})`; x.beginPath(); x.arc(r() * W, r() * H, 0.6 + r() * 1.4, 0, 7); x.fill(); }
      // soft nebula
      const n = x.createRadialGradient(W * (0.2 + v * 0.3), H * 0.3, 0, W * (0.2 + v * 0.3), H * 0.3, m * 0.9); n.addColorStop(0, L.rgba([LILA, TEAL, ORG][v], 0.14)); n.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = n; x.fillRect(0, 0, W, H);
      skies[v] = c;
    }
    const r = L.rng(9); stars = Array.from({ length: 50 }, () => [r(), r(), 1 + r() * 2.2, r() * 6.28, 1 + r() * 2]);
  },
  background(K, s) {
    const { ctx, W, H, t } = K, m = Math.min(W, H); ctx.drawImage(skies[s.i % 3], 0, 0);
    for (const [fx, fy, r, ph, sp] of stars) { const a = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * sp + ph)); ctx.fillStyle = `rgba(255,240,200,${a})`; L.star(ctx, fx * W, fy * H, r * 2.2 * K.u, 4, 0.35); ctx.fill(); }
    PLANETS[s.i % 3].forEach(([fx, fy, fr, col, ring], k) => planet(ctx, fx * W + Math.sin(t * 0.3 + k) * 8 * K.u, (K.vertical && fy < 0.5 ? 0.03 : fy) * H + Math.cos(t * 0.25 + k) * 6 * K.u, fr * m, col, ring));
  },
  headline(K, str, box, p, s, o = {}) { title(K, str, box, p, { align: o.align, size: o.size, color: INK, emColor: YEL, reveal: 'rise', valign: 'middle' }); },
  text(K, str, box, p, role, s, o = {}) {
    if (role === 'kicker' || role === 'label') return para(K, str, box, p, { font: sz => K.S.type.label(sz), color: TEAL, upper: true, ls: 0.14, max: 24, align: o.align || 'left' });
    if (role === 'headBad' || role === 'headGood') return title(K, str, box, p, { color: role === 'headGood' ? TEAL : ORG, max: 60, reveal: 'rise' });
    return BASE.text(K, str, box, p, role, s, { color: role === 'bad' ? '#8C97C4' : role === 'body' ? MUTED : INK, ...o });
  },
  panel(K, b, p, s, kind) {
    if (p <= 0) return; const { ctx, u } = K, e = L.E.back(p); ctx.save(); ctx.globalAlpha = L.clamp(p * 2); const [cx, cy] = L.center(b); ctx.translate(cx, cy); ctx.scale(0.9 + 0.1 * e, 0.9 + 0.1 * e); ctx.translate(-cx, -cy);
    L.rrect(ctx, b.x, b.y, b.w, b.h, Math.min(28 * u, b.h / 2)); ctx.fillStyle = kind === 'good' ? '#17457A' : kind === 'bad' ? '#2A2C66' : CARD; ctx.fill();
    ctx.save(); ctx.clip(); ctx.fillStyle = 'rgba(255,255,255,.06)'; ctx.fillRect(b.x, b.y, b.w, Math.min(b.h * 0.45, 40 * u)); ctx.restore();
    if (kind === 'good') { ctx.strokeStyle = TEAL; ctx.lineWidth = 3 * u; ctx.stroke(); } ctx.restore();
  },
  bullet(K, i, b, p) {
    if (p <= 0) return; const { ctx } = K, [cx, cy] = L.center(b), r = Math.min(b.w, b.h) / 2 * L.E.back(p), col = [YEL, TEAL, ORG, LILA][i % 4];
    planet(ctx, cx, cy, r * 0.9, col, false); L.text(ctx, String(i + 1), cx, cy + r * 0.04, { font: K.S.type.display(r * 0.95), color: NIGHT, align: 'center', base: 'middle' });
  },
  number(K, str, box, p, s, o) { const { ctx, u } = K; ctx.save(); ctx.shadowColor = L.rgba(YEL, 0.5); ctx.shadowBlur = 40 * u; title(K, str, box, p, { align: 'center', color: YEL, reveal: 'rise', max: o?.small ? 130 : 300 }); ctx.restore(); },
  quote(K, str, box, p) { title(K, '“' + str + '”', box, p, { size: 'm', max: 90, color: INK, reveal: 'words', font: sz => K.S.type.bodyEm(sz) }); },
  portrait(K, box, p, s) { // flat character standing on a small moon
    if (p <= 0) return; const { ctx, u } = K, e = L.E.out(p), f = fitCharacter({ ...box, h: box.h * 0.94 });
    ctx.save(); ctx.globalAlpha = L.clamp(p * 1.8); ctx.translate(0, (1 - e) * 70 * u);
    const [hx, hy] = [box.x + box.w / 2, box.y + box.h * 0.4], g = ctx.createRadialGradient(hx, hy, 0, hx, hy, box.w * 0.55); g.addColorStop(0, L.rgba(LILA, 0.25)); g.addColorStop(1, L.rgba(LILA, 0)); ctx.fillStyle = g; ctx.fillRect(box.x - box.w * 0.2, box.y, box.w * 1.4, box.h);
    const bob = Math.sin(K.t * 1.6) * 5 * u;
    L.character(ctx, f.x, f.y + bob, f.s, K.look, { fill: flatFill(ctx), outline: false, ink: NIGHT, mood: s.d.mood === 'surprised' ? 'o' : 'smile', blink: (K.frame % 120) < 4 });
    ctx.restore();
  },
  mascot(K, box, p, s, mood) {
    if (p <= 0) return; const { ctx, u } = K, e = L.E.back(p); ctx.save(); ctx.globalAlpha = L.clamp(p * 2);
    L.mascot(ctx, K.spec.mascot, { ...box, y: box.y + (1 - e) * 30 * u + Math.sin(K.t * 2) * 6 * u }, { color: TEAL, outline: false, eye: NIGHT, eyeStyle: mood === 'happy' ? 'happy' : 'dot' });
    ctx.restore();
  },
  media(K, img, box, p, s, frame) { drawFrame(K, img, box, p, frame, { bezel: '#0A1230', shadowColor: L.rgba(LILA, 0.4), stroke: 'rgba(244,246,255,.25)', strokeW: 2, barColor: '#E7EBFF' }); },
  prompt(K, str, box, p, s, tp) {
    if (p <= 0) return; const { ctx, u } = K; ctx.save(); ctx.globalAlpha = L.clamp(p * 2); L.rrect(ctx, box.x, box.y, box.w, box.h, box.h * 0.3); ctx.fillStyle = CARD; ctx.fill(); ctx.strokeStyle = 'rgba(244,246,255,.2)'; ctx.lineWidth = 2 * u; ctx.stroke(); ctx.restore();
    para(K, str.slice(0, Math.ceil(str.length * tp)) + (tp < 1 || (K.frame >> 3) % 2 ? '▍' : ''), L.inset(box, 26 * u, 12 * u), 1, { font: sz => K.S.type.bodyEm(sz), color: INK, max: 32, valign: 'middle' });
  },
  caption(K, words, act, box, p) {
    const { ctx, u } = K; ctx.save(); ctx.globalAlpha = p; ctx.font = K.S.type.bodyEm(33 * u);
    const w = ctx.measureText(words.join(' ')).width + 64 * u, x = box.x + (box.w - w) / 2; L.rrect(ctx, x, box.y, w, box.h, box.h / 2); ctx.fillStyle = 'rgba(8,14,40,.82)'; ctx.fill();
    let cx = x + 32 * u; words.forEach((wd, i) => { ctx.fillStyle = i === act ? YEL : i < act ? INK : 'rgba(244,246,255,.5)'; ctx.fillText(wd, cx, box.y + box.h * 0.66); cx += ctx.measureText(wd + ' ').width; });
    ctx.restore();
  },
  connector(K, a, b, p) { if (p <= 0) return; const ctx = K.ctx, m = [(a[0] + b[0]) / 2, Math.min(a[1], b[1]) - 40 * K.u]; ctx.save(); ctx.strokeStyle = 'rgba(244,246,255,.45)'; ctx.lineWidth = 3 * K.u; ctx.setLineDash([2 * K.u, 10 * K.u]); ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(...a); for (let k = 1; k <= 24 * p; k++) { const t = k / 24; ctx.lineTo((1 - t) ** 2 * a[0] + 2 * (1 - t) * t * m[0] + t * t * b[0], (1 - t) ** 2 * a[1] + 2 * (1 - t) * t * m[1] + t * t * b[1]); } ctx.stroke(); ctx.restore(); },
  button(K, str, b, p) { if (p <= 0) return; const { ctx, u } = K, e = L.E.back(p), [cx, cy] = L.center(b); ctx.save(); ctx.translate(cx, cy); ctx.scale(e, e); ctx.translate(-cx, -cy); L.rrect(ctx, b.x, b.y, b.w, b.h, b.h / 2); ctx.fillStyle = YEL; ctx.fill(); ctx.restore(); para(K, str, L.inset(b, b.h * 0.35, b.h * 0.2), L.clamp(p * 2 - 0.4), { font: sz => K.S.type.label(sz), color: NIGHT, max: 34, align: 'center' }); },
  transition(K, A, B, p, info) { // warp jump: A rushes toward camera, streaks fly outward, B settles in
    const { ctx, W, H, u } = K, r = info.raw, cx = W / 2, cy = H / 2;
    ctx.fillStyle = NIGHT; ctx.fillRect(0, 0, W, H);
    if (r < 0.55) { const z = 1 + 1.6 * L.E.in(r / 0.55); ctx.save(); ctx.globalAlpha = 1 - L.E.in(r / 0.55); ctx.drawImage(A, cx - W * z / 2, cy - H * z / 2, W * z, H * z); ctx.restore(); }
    if (r > 0.35) { const q = L.E.out((r - 0.35) / 0.65), z = 0.55 + 0.45 * q; ctx.save(); ctx.globalAlpha = L.clamp(q * 1.4); ctx.drawImage(B, cx - W * z / 2, cy - H * z / 2, W * z, H * z); ctx.restore(); }
    const k = Math.sin(r * Math.PI), rr = L.rng(3); ctx.save(); ctx.lineCap = 'round';
    for (let i = 0; i < 90; i++) { const a = rr() * Math.PI * 2, d0 = (0.1 + rr() * 0.5) * W * (0.3 + r), len = (40 + rr() * 260) * u * k; ctx.strokeStyle = `rgba(255,236,190,${0.6 * k})`; ctx.lineWidth = (1 + rr() * 2.5) * u; ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * d0, cy + Math.sin(a) * d0); ctx.lineTo(cx + Math.cos(a) * (d0 + len), cy + Math.sin(a) * (d0 + len)); ctx.stroke(); }
    ctx.restore();
  },
};
