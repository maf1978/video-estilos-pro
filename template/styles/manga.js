// Manga / cómic B/N — tramas de puntos, líneas de enfoque, viñetas con borde grueso, bocadillos, onomatopeyas; la persona en tinta con trama.
import * as L from '../engine/lib.js';
import { BASE, title, para, drawFrame } from '../engine/base.js';

const INK = '#111111', PAPER = '#F6F3EC', GREY = '#8C8984';
let tone, toneLight, focus = [], grain;
const SFXW = { hook: '¡ZAS!', stat: '¡BOOM!', chapter: '¡GO!', cta: '¡YA!', compare: '¿¡EH!?' };
// screentone patterns (dots) — the manga grey
function dots(cell, r, col = INK) { const c = L.canvas(cell, cell), x = c.getContext('2d'); x.fillStyle = col; x.beginPath(); x.arc(cell / 2, cell / 2, r, 0, 7); x.fill(); x.beginPath(); x.arc(0, 0, r, 0, 7); x.arc(cell, 0, r, 0, 7); x.arc(0, cell, r, 0, 7); x.arc(cell, cell, r, 0, 7); x.fill(); return c; }
// person → ink: black shadows, dotted mid-tones, white highlights, bold contour (per height)
const INKED = L.memo(h => {
  const S = window.K.subject(h), c = L.canvas(S.w, S.h), x = c.getContext('2d'), Lb = L.blurL(S.L, S.w, S.h, 2), cell = Math.max(5, Math.round(h / 150));
  const im = x.createImageData(S.w, S.h);
  for (let y = 0; y < S.h; y++) for (let xx = 0; xx < S.w; xx++) {
    const i = y * S.w + xx; if (S.A[i] < 0.5) continue; const l = Lb[i], k = i * 4;
    const gx = (xx % cell) - cell / 2, gy = (y % cell) - cell / 2, inDot = gx * gx + gy * gy < (cell * 0.34) ** 2;
    const edge = S.A[i - 3] < 0.5 || S.A[i + 3] < 0.5 || S.A[i - 3 * S.w] < 0.5 || S.A[i + 3 * S.w] < 0.5;
    let v = l < 0.13 ? 0 : l < 0.38 ? (inDot ? 0 : 255) : 255; if (edge) v = 0;
    const tint = v ? 246 : 17; im.data[k] = tint; im.data[k + 1] = v ? 243 : 17; im.data[k + 2] = v ? 236 : 17; im.data[k + 3] = 255;
  }
  x.putImageData(im, 0, 0);
  // ink lines on strong luminance edges
  const e = x.getImageData(0, 0, S.w, S.h);
  for (let y = 1; y < S.h - 1; y++) for (let xx = 1; xx < S.w - 1; xx++) { const i = y * S.w + xx; if (S.A[i] < 0.5) continue; const g = Math.abs(Lb[i + 1] - Lb[i - 1]) + Math.abs(Lb[i + S.w] - Lb[i - S.w]); if (g > 0.13) { const k = i * 4; e.data[k] = e.data[k + 1] = e.data[k + 2] = 17; } }
  x.putImageData(e, 0, 0);
  return c;
});
function bubble(ctx, b, tail, u) { // speech bubble (ellipse-ish) with tail to point
  ctx.save(); ctx.lineWidth = 4 * u; ctx.strokeStyle = INK; ctx.fillStyle = '#FFFFFF';
  const cx = b.x + b.w / 2, cy = b.y + b.h / 2; ctx.beginPath(); ctx.ellipse(cx, cy, b.w / 2, b.h / 2, 0, 0, 7);
  if (tail) { const a = Math.atan2(tail[1] - cy, tail[0] - cx), ex = cx + Math.cos(a) * b.w * 0.42, ey = cy + Math.sin(a) * b.h * 0.42; ctx.moveTo(ex - Math.sin(a) * 18 * u, ey + Math.cos(a) * 18 * u); ctx.lineTo(tail[0], tail[1]); ctx.lineTo(ex + Math.sin(a) * 18 * u, ey - Math.cos(a) * 18 * u); }
  ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.ellipse(cx, cy, b.w / 2 - 2 * u, b.h / 2 - 2 * u, 0, 0, 7); ctx.fillStyle = '#FFFFFF'; ctx.fill(); ctx.restore();
}
function frameBorder(ctx, b, u, w = 6) { ctx.save(); ctx.strokeStyle = INK; ctx.lineWidth = w * u; ctx.strokeRect(b.x, b.y, b.w, b.h); ctx.restore(); }

export default {
  id: 'manga', name: 'Manga',
  fonts: 'Dela+Gothic+One&family=M+PLUS+1p:wght@500;700;800&family=Bangers',
  fontLoads: ['400 60px "Dela Gothic One"', '500 30px "M PLUS 1p"', '700 30px "M PLUS 1p"', '800 30px "M PLUS 1p"', '400 60px Bangers'],
  palette: { bg: PAPER, ink: INK, accent: INK, muted: '#55524D', panel: '#FFFFFF', line: INK, good: INK, bad: '#55524D', mascot: '#FFFFFF' },
  type: { display: s => `400 ${s}px "Dela Gothic One"`, em: s => `400 ${s}px "Dela Gothic One"`, body: s => `700 ${s}px "M PLUS 1p"`, bodyEm: s => `800 ${s}px "M PLUS 1p"`, label: s => `800 ${s}px "M PLUS 1p"`, mono: s => `700 ${s}px "M PLUS 1p"`, sfx: s => `400 ${s}px Bangers` },
  ls: -0.01, lh: 1.08,
  sfx: 'ink', transDur: 0.45, push: 0.04, beatBump: 2,
  music: 'energetic anime opening instrumental, driving drums, electric guitar riffs, bright synth leads, heroic and fast, 150 BPM, instrumental, no vocals',
  async setup(K) {
    const { W, H, u } = K; tone = dots(Math.round(9 * u), 2.6 * u); toneLight = dots(Math.round(9 * u), 1.4 * u); grain = L.grainTiles(3, 256, 0.35, 5);
    // focus (speed) lines, 3 variants with different vanishing points
    [[0.72, 0.42], [0.5, 0.45], [0.28, 0.4]].forEach(([fx, fy], v) => {
      const c = L.canvas(W, H), x = c.getContext('2d'), r = L.rng(30 + v), cx = W * fx, cy = H * fy, R = Math.hypot(W, H);
      x.fillStyle = INK;
      for (let k = 0; k < 220; k++) { const a = r() * Math.PI * 2, w = (0.002 + r() * 0.006), r0 = R * (0.22 + r() * 0.2); x.beginPath(); x.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0); x.lineTo(cx + Math.cos(a - w) * R, cy + Math.sin(a - w) * R); x.lineTo(cx + Math.cos(a + w) * R, cy + Math.sin(a + w) * R); x.closePath(); x.fill(); }
      focus[v] = c;
    });
  },
  background(K, s) {
    const { ctx, W, H, u } = K; ctx.fillStyle = PAPER; ctx.fillRect(0, 0, W, H);
    const m = 22 * u, fb = { x: m, y: m, w: W - 2 * m, h: H - 2 * m };
    ctx.save(); ctx.beginPath(); ctx.rect(fb.x, fb.y, fb.w, fb.h); ctx.clip();
    if (s.type === 'hook' || s.type === 'stat' || s.type === 'chapter' || s.type === 'statement' || s.type === 'cta') { ctx.globalAlpha = 0.9; ctx.drawImage(focus[s.i % 3], 0, 0); ctx.globalAlpha = 1; }
    else { ctx.fillStyle = ctx.createPattern(toneLight, 'repeat'); ctx.globalAlpha = 0.5; ctx.fillRect(fb.x, fb.y + fb.h * 0.62, fb.w, fb.h * 0.38); ctx.globalAlpha = 1; }
    // soft white glow behind the main text area so titles stay readable on top of the lines
    const g = ctx.createRadialGradient(W * (s.i % 3 === 0 ? 0.3 : 0.5), H * 0.4, 0, W * 0.4, H * 0.4, Math.max(W, H) * 0.5); g.addColorStop(0, 'rgba(246,243,236,.95)'); g.addColorStop(0.55, 'rgba(246,243,236,.75)'); g.addColorStop(1, 'rgba(246,243,236,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.restore(); frameBorder(ctx, fb, u, 7);
  },
  decor(K, s) { // onomatopoeia
    const w = SFXW[s.type]; if (!w) return; const { ctx, W, H, u } = K, p = L.E.back(L.clamp((s.t - 0.9) / 0.35)); if (p <= 0) return;
    const [x, y] = K.vertical ? (s.type === 'hook' || s.type === 'cta' ? [W * 0.2, H * 0.5] : [W * 0.7, H * 0.72]) : s.type === 'hook' || s.type === 'cta' ? [W * 0.5, H * 0.13] : [W * 0.84, H * 0.2];
    ctx.save(); ctx.translate(x, y); ctx.rotate(-0.12); ctx.scale(p, p); const sh = Math.sin(K.t * 40) * 2 * u * (s.t < 1.6 ? 1 : 0);
    L.text(ctx, w, sh, 0, { font: K.S.type.sfx(110 * u), color: INK, align: 'center', stroke: INK, sw: 22 * u });
    L.text(ctx, w, sh, 0, { font: K.S.type.sfx(110 * u), color: '#FFFFFF', align: 'center', stroke: '#FFFFFF', sw: 8 * u }); L.text(ctx, w, sh, 0, { font: K.S.type.sfx(110 * u), color: INK, align: 'center' });
    ctx.restore();
  },
  headline(K, str, box, p, s, o = {}) {
    const top = 50 * K.u; if (box.y < top) box = { ...box, y: top, h: box.h - (top - box.y) };
    title(K, str, box, p, { align: o.align, size: o.size, color: INK, emColor: '#FFFFFF', emStyle: 'box', emBg: INK, reveal: 'words', valign: 'middle', upper: false });
  },
  text(K, str, box, p, role, s, o = {}) {
    const { ctx, u } = K;
    if (role === 'kicker' || role === 'label') { // narration box (rectangular caption)
      if (p <= 0) return; ctx.font = K.S.type.label(26 * u); const w = Math.min(box.w, ctx.measureText(str.toUpperCase()).width * 1.12 + 40 * u), h = Math.min(box.h, 50 * u);
      const x = o.align === 'center' ? box.x + (box.w - w) / 2 : box.x, y = box.y + (box.h - h) / 2; ctx.save(); ctx.globalAlpha = L.clamp(p * 2); ctx.fillStyle = '#FFFFFF'; ctx.fillRect(x, y, w, h); frameBorder(ctx, { x, y, w, h }, u, 3.5); ctx.restore();
      return para(K, str, { x: x + 16 * u, y, w: w - 32 * u, h }, p, { font: sz => K.S.type.label(sz), color: INK, upper: true, ls: 0.06, max: 26, align: 'center' });
    }
    if (role === 'body' && s.type !== 'media') { // body text lives in a speech bubble
      if (p > 0) { const e = L.E.back(p), bb = { x: box.x - 30 * u, y: box.y - 16 * u, w: box.w + 60 * u, h: box.h + 32 * u }, [cx, cy] = L.center(bb); ctx.save(); ctx.translate(cx, cy); ctx.scale(e, e); ctx.translate(-cx, -cy); bubble(ctx, bb, [bb.x + bb.w * 0.2, bb.y + bb.h + 40 * u], u); ctx.restore(); }
      return para(K, str, L.inset(box, box.w * 0.08, 4 * u), L.clamp(p * 1.5 - 0.3), { color: INK, max: 44, align: 'center' });
    }
    if (role === 'headBad' || role === 'headGood') return title(K, str, box, p, { color: INK, max: 60, reveal: 'words', emStyle: 'box' });
    return BASE.text(K, str, box, p, role, s, { color: role === 'bad' ? '#5E5B56' : INK, ...o });
  },
  panel(K, b, p, s, kind, j = 0) { // each block is a manga panel (koma) with a hard offset shadow in screentone
    if (p <= 0) return; const { ctx, u } = K, e = L.E.out(p), off = 10 * u;
    ctx.save(); ctx.globalAlpha = L.clamp(p * 3); ctx.beginPath(); ctx.rect(b.x, b.y, b.w * e + off, b.h + off); ctx.clip();
    ctx.fillStyle = ctx.createPattern(tone, 'repeat'); ctx.fillRect(b.x + off, b.y + off, b.w, b.h);
    ctx.fillStyle = kind === 'good' ? '#FFFFFF' : kind === 'bad' ? '#E9E6DF' : '#FFFFFF'; ctx.fillRect(b.x, b.y, b.w, b.h);
    if (kind === 'good') { ctx.globalAlpha = 0.18; ctx.drawImage(focus[1], b.x - b.w * 0.3, b.y - b.h * 0.3, b.w * 1.6, b.h * 1.6); ctx.globalAlpha = 1; }
    frameBorder(ctx, b, u, kind === 'row' ? 4 : 5); ctx.restore();
  },
  bullet(K, i, b, p) {
    if (p <= 0) return; const { ctx, u } = K, [cx, cy] = L.center(b), r = Math.min(b.w, b.h) / 2 * L.E.back(p);
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(-0.1); L.star(ctx, 0, 0, r * 1.05, 10, 0.78); ctx.fillStyle = INK; ctx.fill(); ctx.restore();
    L.text(ctx, String(i + 1), cx, cy + r * 0.04, { font: K.S.type.display(r * 0.95), color: '#FFFFFF', align: 'center', base: 'middle' });
  },
  number(K, str, box, p, s, o) { title(K, str, box, p, { align: 'center', color: INK, stroke: '#FFFFFF', strokeW: 22 * K.u, reveal: 'words', max: o?.small ? 140 : 300, font: sz => K.S.type.display(sz) }); },
  quote(K, str, box, p, s) {
    const { ctx, u } = K; if (p > 0) { const e = L.E.back(p), bb = { x: box.x - 50 * u, y: box.y - 40 * u, w: box.w + 100 * u, h: box.h + 80 * u }, [cx, cy] = L.center(bb); ctx.save(); ctx.translate(cx, cy); ctx.scale(e, e); ctx.translate(-cx, -cy); bubble(ctx, bb, [bb.x + bb.w * 0.8, bb.y + bb.h + 50 * u], u); ctx.restore(); }
    title(K, str, L.inset(box, box.w * 0.1, box.h * 0.12), L.clamp(p * 1.3 - 0.2), { size: 'm', max: 80, color: INK, reveal: 'words', font: sz => K.S.type.bodyEm(sz), align: 'center' });
  },
  portrait(K, box, p, s) {
    if (p <= 0) return; const { ctx, u } = K, img = INKED(Math.round(box.h * 0.95)), x = box.x + (box.w - img.width) / 2, y = box.y + box.h - img.height;
    ctx.save(); const e = L.E.out(p); ctx.globalAlpha = L.clamp(p * 3); ctx.translate((1 - e) * 60 * u, 0); ctx.drawImage(img, x, y); ctx.restore();
  },
  mascot(K, box, p, s, mood) { if (p <= 0) return; const { ctx, u } = K, e = L.E.back(p); ctx.save(); const [cx, cy] = [box.x + box.w / 2, box.y + box.h]; ctx.translate(cx, cy); ctx.scale(e, e); ctx.translate(-cx, -cy); L.mascot(ctx, K.spec.mascot, box, { color: '#FFFFFF', ink: INK, eye: INK, eyeStyle: mood === 'happy' ? 'happy' : 'dot', bob: Math.sin(K.t * 5) * 3 * u, fill: (pth, c) => { ctx.fillStyle = '#FFFFFF'; ctx.fill(pth); ctx.save(); ctx.clip(pth); ctx.fillStyle = ctx.createPattern(toneLight, 'repeat'); ctx.globalAlpha = 0.8; ctx.fillRect(-500, 60, 1000, 400); ctx.restore(); } }); ctx.restore(); },
  media(K, img, box, p, s, frame) {
    if (p <= 0) return; const { ctx, u } = K, o = drawFrame(K, img, box, p, frame, { shadow: false, bezel: INK, stroke: INK, strokeW: 5 * u, filter: (c, b) => { c.globalCompositeOperation = 'saturation'; c.fillStyle = '#888'; c.fillRect(b.x, b.y, b.w, b.h); } });
    if (o) { ctx.save(); ctx.globalAlpha = L.clamp(p * 2 - 0.5); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = ctx.createPattern(tone, 'repeat'); ctx.fillRect(o.x + 14 * u, o.y + o.h, o.w, 14 * u); ctx.fillRect(o.x + o.w, o.y + 14 * u, 14 * u, o.h); ctx.restore(); }
  },
  prompt(K, str, box, p, s, tp) { // a thought-ish rectangular bubble with the typed prompt
    if (p <= 0) return; const { ctx, u } = K, e = L.E.back(p), [cx, cy] = L.center(box); ctx.save(); ctx.translate(cx, cy); ctx.scale(e, e); ctx.translate(-cx, -cy);
    ctx.fillStyle = '#FFFFFF'; L.rrect(ctx, box.x, box.y, box.w, box.h, 14 * u); ctx.fill(); ctx.lineWidth = 4 * u; ctx.strokeStyle = INK; ctx.stroke(); ctx.restore();
    para(K, str.slice(0, Math.ceil(str.length * tp)) + (tp < 1 ? '▍' : ''), L.inset(box, 22 * u, 12 * u), 1, { color: INK, max: 32, valign: 'middle', font: sz => K.S.type.bodyEm(sz) });
  },
  caption(K, words, act, box, p) { // narration box at the bottom
    const { ctx, u } = K; ctx.save(); ctx.globalAlpha = p; ctx.font = K.S.type.bodyEm(31 * u);
    const w = ctx.measureText(words.join(' ')).width + 50 * u, x = box.x + (box.w - w) / 2; ctx.fillStyle = '#FFFFFF'; ctx.fillRect(x, box.y, w, box.h); frameBorder(ctx, { x, y: box.y, w, h: box.h }, u, 3.5);
    let cx = x + 25 * u; words.forEach((wd, i) => { const ww = ctx.measureText(wd).width; if (i === act) { ctx.fillStyle = INK; ctx.fillRect(cx - 4 * u, box.y + box.h * 0.16, ww + 8 * u, box.h * 0.68); } ctx.fillStyle = i === act ? '#FFFFFF' : i < act ? INK : '#9C9993'; ctx.fillText(wd, cx, box.y + box.h * 0.66); cx += ctx.measureText(wd + ' ').width; });
    ctx.restore();
  },
  connector(K, a, b, p) { if (p <= 0) return; const ctx = K.ctx; ctx.save(); ctx.strokeStyle = INK; ctx.lineWidth = 5 * K.u; ctx.beginPath(); ctx.moveTo(...a); const ex = a[0] + (b[0] - a[0]) * p, ey = a[1] + (b[1] - a[1]) * p; ctx.lineTo(ex, ey); ctx.stroke(); if (p > 0.95) { const an = Math.atan2(b[1] - a[1], b[0] - a[0]); ctx.fillStyle = INK; ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(ex - Math.cos(an - 0.5) * 18 * K.u, ey - Math.sin(an - 0.5) * 18 * K.u); ctx.lineTo(ex - Math.cos(an + 0.5) * 18 * K.u, ey - Math.sin(an + 0.5) * 18 * K.u); ctx.fill(); } ctx.restore(); },
  button(K, str, b, p) { if (p <= 0) return; const { ctx, u } = K, e = L.E.back(p), [cx, cy] = L.center(b); ctx.save(); ctx.translate(cx, cy); ctx.scale(e, e); ctx.translate(-cx, -cy); ctx.fillStyle = INK; ctx.fillRect(b.x + 8 * u, b.y + 8 * u, b.w, b.h); ctx.fillStyle = '#FFFFFF'; ctx.fillRect(b.x, b.y, b.w, b.h); frameBorder(ctx, b, u, 4); ctx.restore(); para(K, str, L.inset(b, b.h * 0.3, b.h * 0.2), L.clamp(p * 2 - 0.4), { font: sz => K.S.type.display(sz), color: INK, max: 32, align: 'center' }); },
  transition(K, A, B, p, info) { // diagonal panel cut: a slash with a thick gutter sweeps across
    const { ctx, W, H, u } = K, r = L.E.inOut(info.raw), sl = H * 0.35, x = L.lerp(-sl - 40 * u, W + 40 * u, r);
    ctx.drawImage(A, 0, 0);
    ctx.save(); ctx.beginPath(); ctx.moveTo(-10, -10); ctx.lineTo(x + sl, -10); ctx.lineTo(x, H + 10); ctx.lineTo(-10, H + 10); ctx.closePath(); ctx.clip(); ctx.drawImage(B, 0, 0); ctx.restore();
    ctx.save(); ctx.strokeStyle = PAPER; ctx.lineWidth = 26 * u; ctx.beginPath(); ctx.moveTo(x + sl, -10); ctx.lineTo(x, H + 10); ctx.stroke(); ctx.strokeStyle = INK; ctx.lineWidth = 6 * u; for (const d of [-16, 16]) { ctx.beginPath(); ctx.moveTo(x + sl + d * u, -10); ctx.lineTo(x + d * u, H + 10); ctx.stroke(); } ctx.restore();
  },
  overlay(K) { L.drawGrain(K.ctx, grain, K.frame, 0.05, 'multiply'); },
};
