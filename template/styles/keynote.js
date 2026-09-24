// Keynote de cristal — escenario oscuro con luces de color que respiran, tarjetas de vidrio esmerilado, grotesca limpia, persona con rim light.
import * as L from '../engine/lib.js';
import { BASE, title, para, fitSubject, drawFrame } from '../engine/base.js';

const INK = '#F2F4F7', BG = '#06080C', TEAL = '#1FB5A6', AMBER = '#F5A524', CORAL = '#E8506A', MUTED = '#9AA3AF';
let grain, small, glow;
// soft light blobs: [cx, cy, r, color] in fractions; they drift slowly
const BLOBS = [[[0.18, 0.25, 0.42, TEAL], [0.85, 0.8, 0.46, CORAL], [0.7, 0.15, 0.3, AMBER]], [[0.82, 0.22, 0.45, AMBER], [0.15, 0.85, 0.42, TEAL], [0.45, 0.6, 0.28, CORAL]], [[0.5, 0.95, 0.55, CORAL], [0.1, 0.1, 0.38, AMBER], [0.92, 0.4, 0.34, TEAL]]];
const grad = (ctx, x0, y0, x1, y1, stops) => { const g = ctx.createLinearGradient(x0, y0, x1, y1); stops.forEach(([o, c]) => g.addColorStop(o, c)); return g; };

function glass(K, b, r, { alpha = 1, glow = null, fill = 'rgba(255,255,255,.07)' } = {}) {
  const { ctx, u } = K; ctx.save(); ctx.globalAlpha *= alpha;
  if (glow) { ctx.shadowColor = glow; ctx.shadowBlur = 40 * u; }
  L.rrect(ctx, b.x, b.y, b.w, b.h, r); ctx.fillStyle = fill; ctx.fill(); ctx.shadowColor = 'transparent';
  // inner sheen (top) + luminous edge (light from top-left)
  ctx.save(); ctx.clip(); ctx.fillStyle = grad(ctx, 0, b.y, 0, b.y + b.h, [[0, 'rgba(255,255,255,.10)'], [0.35, 'rgba(255,255,255,.02)'], [1, 'rgba(255,255,255,0)']]); ctx.fillRect(b.x, b.y, b.w, b.h); ctx.restore();
  ctx.strokeStyle = grad(ctx, b.x, b.y, b.x + b.w, b.y + b.h, [[0, 'rgba(255,255,255,.55)'], [0.45, 'rgba(255,255,255,.10)'], [1, 'rgba(255,255,255,.28)']]);
  ctx.lineWidth = 1.5 * u; L.rrect(ctx, b.x + 0.5, b.y + 0.5, b.w - 1, b.h - 1, r); ctx.stroke(); ctx.restore();
}
// person with a colored rim light on the right edge + a cool glow on the left (pre-computed per height)
const RIM = L.memo(h => {
  const S = window.K.subject(h), pad = 40, c = L.canvas(S.w + pad * 2, S.h + pad), x = c.getContext('2d');
  const tint = (col, dx, blur, a) => { const t = L.canvas(c.width, c.height), tx = t.getContext('2d'); tx.drawImage(S.c, pad + dx, pad); tx.globalCompositeOperation = 'source-in'; tx.fillStyle = col; tx.fillRect(0, 0, t.width, t.height); tx.globalCompositeOperation = 'destination-out'; tx.drawImage(S.c, pad, pad); x.save(); x.filter = `blur(${blur}px)`; x.globalAlpha = a; x.drawImage(t, 0, 0); x.restore(); };
  tint(AMBER, 9, 6, 0.95); tint(TEAL, -9, 7, 0.8);
  x.drawImage(L.mapPixels(S, (r, g, b, a, px, py, l) => { const k = 0.82 + 0.25 * (px / S.w); return [r * k * 0.95, g * k * 0.97, b * k * 1.05, a * L.clamp((S.h - py) / (S.h * 0.14))]; }), pad, pad);
  tint(AMBER, 3, 1.5, 0.9);
  return { c, pad };
});

export default {
  id: 'keynote', name: 'Keynote de cristal',
  fonts: 'Inter+Tight:wght@300;500;700;800&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500',
  fontLoads: ['700 60px "Inter Tight"', '800 60px "Inter Tight"', '300 60px "Inter Tight"', '400 30px Inter', '500 30px Inter', '600 30px Inter', '500 20px "JetBrains Mono"'],
  palette: { bg: BG, ink: INK, accent: AMBER, muted: MUTED, panel: 'rgba(255,255,255,.07)', line: 'rgba(255,255,255,.18)', good: TEAL, bad: CORAL, mascot: 'rgba(255,255,255,.14)' },
  type: { display: s => `700 ${s}px "Inter Tight"`, em: s => `800 ${s}px "Inter Tight"`, body: s => `400 ${s}px Inter`, bodyEm: s => `600 ${s}px Inter`, label: s => `600 ${s}px Inter`, mono: s => `500 ${s}px "JetBrains Mono"`, thin: s => `300 ${s}px "Inter Tight"` },
  ls: -0.03, lh: 1.02,
  sfx: 'soft', transDur: 0.6, push: 0.035,
  music: 'modern ambient electronic keynote, glassy pads, soft pulsing arpeggio, subtle four-on-the-floor, inspiring product-launch mood, 108 BPM, instrumental',
  async setup(K) { grain = L.grainTiles(4, 256, 0.5, 21); small = L.canvas(Math.round(K.W / 4), Math.round(K.H / 4)); glow = L.canvas(Math.round(K.W / 6), Math.round(K.H / 6)); },
  background(K, s) {
    const { ctx, W, H, t } = K; ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
    // light blobs rendered at 1/6 res then upscaled (soft by nature, much cheaper)
    const gx = glow.getContext('2d'), gw = glow.width, gh = glow.height; gx.globalCompositeOperation = 'source-over'; gx.clearRect(0, 0, gw, gh); gx.globalCompositeOperation = 'lighter';
    BLOBS[s.i % 3].forEach(([fx, fy, fr, col], k) => {
      const x = (fx + Math.sin(t * 0.25 + k * 2) * 0.04) * gw, y = (fy + Math.cos(t * 0.2 + k) * 0.05) * gh, r = fr * Math.max(gw, gh) * (1 + Math.sin(t * 0.4 + k) * 0.05);
      const g = gx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, L.rgba(col, 0.42)); g.addColorStop(0.45, L.rgba(col, 0.14)); g.addColorStop(1, L.rgba(col, 0)); gx.fillStyle = g; gx.fillRect(0, 0, gw, gh);
    });
    ctx.save(); ctx.imageSmoothingQuality = 'high'; ctx.drawImage(glow, 0, 0, W, H); ctx.restore();
    // faint stage floor
    const f = ctx.createLinearGradient(0, H * 0.7, 0, H); f.addColorStop(0, 'rgba(0,0,0,0)'); f.addColorStop(1, 'rgba(0,0,0,.45)'); ctx.fillStyle = f; ctx.fillRect(0, H * 0.7, W, H * 0.3);
  },
  headline(K, str, box, p, s, o = {}) {
    const em = grad(K.ctx, box.x, box.y, box.x + box.w * 0.7, box.y + box.h, [[0, AMBER], [1, CORAL]]);
    title(K, str, box, p, { align: o.align, size: o.size, color: INK, emColor: em, reveal: 'rise', valign: 'middle' });
  },
  text(K, str, box, p, role, s, o = {}) {
    if (role === 'kicker' || role === 'label') return para(K, str, box, p, { font: sz => K.S.type.label(sz), color: role === 'kicker' ? AMBER : MUTED, upper: role === 'kicker', ls: role === 'kicker' ? 0.14 : 0, max: role === 'kicker' ? 24 : 30, align: o.align || 'left' });
    if (role === 'headBad' || role === 'headGood') return title(K, str, box, p, { color: role === 'headGood' ? TEAL : MUTED, max: 64, reveal: 'rise' });
    return BASE.text(K, str, box, p, role, s, { color: role === 'bad' ? '#7C8591' : role === 'body' ? '#B8C0CC' : INK, ...o });
  },
  panel(K, b, p, s, kind) {
    if (p <= 0) return; const { ctx, u } = K, e = L.E.out(p); ctx.save(); ctx.translate(0, (1 - e) * 24 * u);
    glass(K, b, 22 * u, { alpha: L.clamp(p * 1.4), glow: kind === 'good' ? L.rgba(TEAL, 0.35) : null, fill: kind === 'good' ? 'rgba(31,181,166,.10)' : 'rgba(255,255,255,.06)' });
    ctx.restore();
  },
  bullet(K, i, b, p) {
    if (p <= 0) return; const { ctx, u } = K, [cx, cy] = L.center(b), r = Math.min(b.w, b.h) / 2 * (0.8 + 0.2 * L.E.back(p));
    ctx.save(); ctx.globalAlpha = L.clamp(p * 2); ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.fillStyle = 'rgba(255,255,255,.08)'; ctx.fill();
    ctx.strokeStyle = grad(ctx, cx - r, cy - r, cx + r, cy + r, [[0, AMBER], [1, CORAL]]); ctx.lineWidth = 2.5 * u; ctx.beginPath(); ctx.arc(cx, cy, r - 1.5 * u, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * L.E.out(p)); ctx.stroke();
    L.text(ctx, String(i + 1), cx, cy + r * 0.04, { font: K.S.type.display(r * 0.95), color: INK, align: 'center', base: 'middle' }); ctx.restore();
  },
  number(K, str, box, p, s, o) {
    const { ctx, u } = K; ctx.save(); ctx.shadowColor = L.rgba(AMBER, 0.45); ctx.shadowBlur = 60 * u;
    title(K, str, box, p, { align: 'center', color: grad(ctx, 0, box.y, 0, box.y + box.h, [[0, '#FFFFFF'], [0.55, '#FFE1A8'], [1, AMBER]]), reveal: 'rise', max: o?.small ? 130 : 300, font: sz => K.S.type.em(sz) });
    ctx.restore();
  },
  quote(K, str, box, p) { title(K, '“' + str + '”', box, p, { size: 'm', max: 92, color: INK, reveal: 'words', font: sz => K.S.type.thin(sz), emFont: sz => K.S.type.em(sz), emColor: AMBER }); },
  portrait(K, box, p, s) {
    if (p <= 0) return; const { ctx, u } = K, R = RIM(Math.round(box.h * 0.97)), e = L.E.out(p);
    const x = box.x + (box.w - R.c.width) / 2, y = box.y + box.h - R.c.height;
    // halo behind the person
    const [hx, hy] = [box.x + box.w / 2, box.y + box.h * 0.38], g = ctx.createRadialGradient(hx, hy, 0, hx, hy, box.w * 0.55); g.addColorStop(0, L.rgba(AMBER, 0.22 * p)); g.addColorStop(1, L.rgba(AMBER, 0));
    ctx.fillStyle = g; ctx.fillRect(box.x - box.w * 0.2, box.y, box.w * 1.4, box.h);
    ctx.save(); ctx.globalAlpha = L.clamp(p * 1.4); ctx.drawImage(R.c, x, y + (1 - e) * 40 * u); ctx.restore();
  },
  mascot(K, box, p, s, mood) {
    if (p <= 0) return; const { ctx, u } = K; ctx.save(); ctx.globalAlpha = L.clamp(p * 2); ctx.shadowColor = L.rgba(AMBER, 0.5); ctx.shadowBlur = 24 * u;
    L.mascot(ctx, K.spec.mascot, { ...box, y: box.y + (1 - L.E.back(p)) * 24 * u }, { color: 'rgba(255,255,255,.16)', ink: 'rgba(255,255,255,.7)', eye: AMBER, eyeStyle: mood === 'happy' ? 'happy' : 'dot', bob: Math.sin(K.t * 2.4) * 4 * u });
    ctx.restore();
  },
  media(K, img, box, p, s, frame) { drawFrame(K, img, box, p, frame, { bezel: '#15181E', stroke: 'rgba(255,255,255,.35)', strokeW: 1.5, shadowColor: L.rgba(TEAL, 0.35), barColor: '#1B1F27', card: '#15181E' }); },
  prompt(K, str, box, p, s, tp) {
    if (p <= 0) return; const { ctx, u } = K; const b = { ...box, h: Math.min(box.h, 96 * u) }; b.y = box.y + (box.h - b.h) / 2;
    glass(K, b, b.h / 2, { alpha: L.clamp(p * 1.5), glow: L.rgba(AMBER, 0.25) });
    ctx.save(); ctx.globalAlpha = L.clamp(p * 1.5); ctx.fillStyle = AMBER; ctx.beginPath(); ctx.arc(b.x + b.h / 2, b.y + b.h / 2, b.h * 0.16, 0, 7); ctx.fill(); ctx.restore();
    para(K, str.slice(0, Math.ceil(str.length * tp)) + (tp < 1 || (K.frame >> 3) % 2 ? '▏' : ''), { x: b.x + b.h * 0.9, y: b.y, w: b.w - b.h * 1.2, h: b.h }, 1, { color: INK, max: 30, valign: 'middle' });
  },
  caption(K, words, act, box, p) {
    const { ctx, u } = K; ctx.save(); ctx.font = K.S.type.bodyEm(32 * u); const w = ctx.measureText(words.join(' ')).width + 70 * u, b = { x: box.x + (box.w - w) / 2, y: box.y, w, h: box.h };
    glass(K, b, b.h / 2, { alpha: p, fill: 'rgba(10,12,16,.55)' }); ctx.globalAlpha = p; ctx.font = K.S.type.bodyEm(32 * u);
    let cx = b.x + 35 * u; words.forEach((wd, i) => { ctx.fillStyle = i === act ? AMBER : i < act ? INK : 'rgba(242,244,247,.45)'; ctx.fillText(wd, cx, b.y + b.h * 0.64); cx += ctx.measureText(wd + ' ').width; });
    ctx.restore();
  },
  connector(K, a, b, p) { if (p <= 0) return; const ctx = K.ctx; ctx.save(); ctx.strokeStyle = grad(ctx, a[0], a[1], b[0], b[1], [[0, L.rgba(AMBER, 0.2)], [1, AMBER]]); ctx.lineWidth = 2.5 * K.u; ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(a[0] + (b[0] - a[0]) * p, a[1] + (b[1] - a[1]) * p); ctx.stroke(); ctx.restore(); },
  button(K, str, b, p) {
    if (p <= 0) return; const { ctx, u } = K, [cx, cy] = L.center(b); ctx.save(); ctx.translate(cx, cy); ctx.scale(0.9 + 0.1 * p, 0.9 + 0.1 * p); ctx.translate(-cx, -cy); ctx.globalAlpha = L.clamp(p * 1.5);
    ctx.shadowColor = L.rgba(AMBER, 0.6); ctx.shadowBlur = 36 * u; L.rrect(ctx, b.x, b.y, b.w, b.h, b.h / 2); ctx.fillStyle = grad(ctx, b.x, 0, b.x + b.w, 0, [[0, AMBER], [1, CORAL]]); ctx.fill(); ctx.restore();
    para(K, str, L.inset(b, b.h * 0.35, b.h * 0.2), L.clamp(p * 2 - 0.4), { font: sz => K.S.type.label(sz), color: '#1A1206', max: 34, align: 'center' });
  },
  transition(K, A, B, p, info) { // soft zoom through a defocus: A pushes past the camera, B settles in from slightly behind
    const { ctx, W, H } = K, r = info.raw, sx = small.getContext('2d');
    const blurDraw = (src, amt, z, a) => { // cheap blur: downscale then upscale
      if (a <= 0) return; ctx.save(); ctx.globalAlpha = a;
      if (amt > 0.05) { sx.clearRect(0, 0, small.width, small.height); sx.filter = `blur(${2 + amt * 6}px)`; sx.drawImage(src, 0, 0, small.width, small.height); sx.filter = 'none'; ctx.imageSmoothingQuality = 'high'; ctx.globalAlpha = a * Math.min(1, amt * 1.6); ctx.drawImage(small, (W - W * z) / 2, (H - H * z) / 2, W * z, H * z); ctx.globalAlpha = a * (1 - Math.min(1, amt * 1.6)); }
      ctx.drawImage(src, (W - W * z) / 2, (H - H * z) / 2, W * z, H * z); ctx.restore();
    };
    ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
    blurDraw(A, L.clamp(r * 1.8), 1 + 0.12 * L.E.in(r), 1 - L.E.inOut(L.clamp(r * 1.25)));
    blurDraw(B, L.clamp((1 - r) * 1.8), 0.92 + 0.08 * L.E.out(r), L.E.inOut(L.clamp(r * 1.4 - 0.25)));
  },
  overlay(K) {
    const { ctx, W, H } = K; L.drawGrain(ctx, grain, K.frame, 0.035, 'overlay');
    const v = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.35, W / 2, H / 2, Math.max(W, H) * 0.75); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.5)'); ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
  },
};
