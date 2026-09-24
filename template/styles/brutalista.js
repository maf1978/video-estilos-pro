// Brutalismo web — HTML crudo: Times + monoespaciada, bordes negros gruesos, sombras duras, amarillo y azul link, marquesina, ventanas, foto en dithering 1-bit.
import * as L from '../engine/lib.js';
import { BASE, title, para, fitSubject, frameBox, cover } from '../engine/base.js';

// chrome: header/footer labels (scene numbers, rules, HUDs). Off with `chrome: false` in the video spec.
const CH = K => K.spec.chrome !== false;

const BG = '#F4F4EF', INK = '#000000', YEL = '#FFE500', BLUE = '#0000EE', PINK = '#FF4FD8';
const back = t => Math.max(0, L.E.back(t));
const mono = (K, sz) => K.S.type.mono(sz);

// a raw OS/HTML window: title bar + border + hard shadow. returns inner box
function win(K, b, name, { fill = '#FFFFFF', bar = YEL, shadow = 10 } = {}) {
  const { ctx, u } = K, bh = 34 * u, sh = shadow * u;
  ctx.fillStyle = INK; ctx.fillRect(b.x + sh, b.y + sh, b.w, b.h);
  ctx.fillStyle = fill; ctx.fillRect(b.x, b.y, b.w, b.h);
  ctx.fillStyle = bar; ctx.fillRect(b.x, b.y, b.w, bh);
  ctx.lineWidth = 4 * u; ctx.strokeStyle = INK; ctx.strokeRect(b.x, b.y, b.w, b.h); ctx.beginPath(); ctx.moveTo(b.x, b.y + bh); ctx.lineTo(b.x + b.w, b.y + bh); ctx.stroke();
  if (name) L.text(ctx, name, b.x + 12 * u, b.y + bh * 0.7, { font: mono(K, 18 * u), color: INK });
  L.text(ctx, '[x]', b.x + b.w - 12 * u, b.y + bh * 0.7, { font: mono(K, 18 * u), color: INK, align: 'right' });
  return { x: b.x + 2 * u, y: b.y + bh + 2 * u, w: b.w - 4 * u, h: b.h - bh - 4 * u };
}
// pop window: stepped scale (no smooth easing — brutal)
function popIn(ctx, b, p, fn) { const k = p >= 1 ? 1 : p > 0.66 ? 1.04 : p > 0.33 ? 0.9 : p > 0 ? 0.6 : 0; if (!k) return; const [cx, cy] = L.center(b); ctx.save(); ctx.translate(cx, cy); ctx.scale(k, k); ctx.translate(-cx, -cy); fn(); ctx.restore(); }

export default {
  id: 'brutalista', name: 'Brutalismo web',
  fonts: 'Tinos:ital,wght@0,700;1,700&family=Space+Mono:wght@400;700',
  fontLoads: ['700 60px Tinos', 'italic 700 60px Tinos', '400 30px "Space Mono"', '700 30px "Space Mono"'],
  palette: { bg: BG, ink: INK, accent: BLUE, muted: '#333333', panel: '#FFFFFF', line: INK, good: INK, bad: INK, mascot: BLUE },
  type: { display: s => `700 ${s}px Tinos`, em: s => `italic 700 ${s}px Tinos`, body: s => `400 ${s}px "Space Mono"`, bodyEm: s => `700 ${s}px "Space Mono"`, label: s => `700 ${s}px "Space Mono"`, mono: s => `400 ${s}px "Space Mono"` },
  ls: -0.02, lh: 0.98,
  sfx: 'digital', transDur: 0.4, push: 0, camera: false,
  music: 'lo-fi glitch hop, crunchy bitcrushed drums, detuned synth bass, dial-up modem textures, off-kilter and cheeky, 92 BPM, instrumental',
  background(K, s) {
    const { ctx, W, H, u, t } = K; ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
    // faint table grid
    ctx.strokeStyle = 'rgba(0,0,0,.06)'; ctx.lineWidth = 1; const g = 60 * u;
    for (let x = 0; x < W; x += g) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y < H; y += g) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    if (CH(K)) {
// address bar + marquee on top
    const bh = 44 * u; ctx.fillStyle = INK; ctx.fillRect(0, 0, W, bh);
    L.text(ctx, `file:///video/escena-${String(s.i + 1).padStart(2, '0')}.html`, 16 * u, bh * 0.66, { font: mono(K, 20 * u), color: '#FFFFFF' });
    const mq = ('★ ' + String(s.d.title || s.d.text || s.d.kicker || s.type).replace(/\*/g, '').toUpperCase() + ' ').repeat(12);
    ctx.save(); ctx.beginPath(); ctx.rect(0, bh, W, 34 * u); ctx.clip(); ctx.fillStyle = s.i % 2 ? YEL : PINK; ctx.fillRect(0, bh, W, 34 * u);
    ctx.font = K.S.type.label(20 * u); ctx.fillStyle = INK; const mw = ctx.measureText(mq).width / 12; ctx.fillText(mq, -((t * 160 * u) % mw), bh + 24 * u); ctx.restore();
    ctx.fillStyle = INK; ctx.fillRect(0, bh + 34 * u, W, 4 * u);
    }
  },
  decor(K, s) { // a mouse cursor wandering deterministically
    const { ctx, W, H, u, t } = K, x = W * (0.9 + 0.04 * Math.sin(t * 0.7 + s.i)), y = H * (0.66 + 0.08 * Math.sin(t * 1.1 + s.i * 2));
    ctx.save(); ctx.translate(x, y); ctx.scale(1.6 * u, 1.6 * u); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 22); ctx.lineTo(6, 17); ctx.lineTo(10, 26); ctx.lineTo(14, 24); ctx.lineTo(10, 15); ctx.lineTo(17, 15); ctx.closePath(); ctx.fillStyle = '#fff'; ctx.fill(); ctx.lineWidth = 1.6; ctx.strokeStyle = INK; ctx.stroke(); ctx.restore();
  },
  headline(K, str, box, p, s, o = {}) {
    const m = CH(K) ? 90 * K.u : 0; if (box.y < m) box = { ...box, y: m, h: box.h - (m - box.y) };
    title(K, str, box, p, { align: o.align, size: o.size, color: INK, emColor: BLUE, emStyle: 'underline', emBg: BLUE, reveal: 'type', valign: 'middle' });
  },
  text(K, str, box, p, role, s, o = {}) {
    const { ctx, u } = K, m = CH(K) ? 90 * u : 0; if (box.y < m) box = { ...box, y: m, h: box.h - (m - box.y) };
    if (role === 'kicker' || role === 'label') {
      if (p <= 0) return; ctx.font = K.S.type.label(22 * u); ctx.letterSpacing = '0px'; const w = Math.min(box.w, ctx.measureText('<' + str.toUpperCase() + '>').width + 24 * u), x = o.align === 'center' ? box.x + (box.w - w) / 2 : box.x;
      ctx.fillStyle = INK; ctx.fillRect(x, box.y, w, box.h);
      return para(K, '<' + str + '>', { x: x + 12 * u, y: box.y, w: w - 20 * u, h: box.h }, p, { font: sz => K.S.type.label(sz), color: YEL, upper: true, max: 22, reveal: 'type' });
    }
    if (role === 'headBad' || role === 'headGood') return title(K, str, box, p, { color: INK, max: 66, reveal: 'type', font: sz => K.S.type.label(sz) });
    const col = role === 'bad' ? '#555' : INK;
    return para(K, str, box, p, { color: col, align: o.align || 'left', max: role === 'body' ? 40 : role === 'item' ? 40 : 34, reveal: 'type', font: sz => (role === 'item' || role === 'step' ? K.S.type.bodyEm : K.S.type.body)(sz), ...o, ...(role === 'bad' ? {} : {}) });
  },
  panel(K, b, p, s, kind, j = 0) {
    if (p <= 0) return; const { ctx, u } = K;
    popIn(ctx, b, p, () => {
      if (kind === 'good' || kind === 'bad') { win(K, b, kind === 'good' ? 'ahora.exe' : 'antes.exe', { fill: kind === 'good' ? '#FFFBD0' : '#FFFFFF', bar: kind === 'good' ? YEL : '#D8D8D8' }); return; }
      const sh = 8 * u; ctx.fillStyle = INK; ctx.fillRect(b.x + sh, b.y + sh, b.w, b.h); ctx.fillStyle = j % 2 ? '#FFFFFF' : '#FFFBD0'; ctx.fillRect(b.x, b.y, b.w, b.h); ctx.lineWidth = 4 * u; ctx.strokeStyle = INK; ctx.strokeRect(b.x, b.y, b.w, b.h);
    });
  },
  bullet(K, i, b, p) {
    if (p <= 0) return; const { ctx } = K, s = Math.min(b.w, b.h);
    ctx.fillStyle = i % 2 ? BLUE : INK; ctx.fillRect(b.x, b.y + (b.h - s) / 2, s, s);
    L.text(ctx, '[' + (i + 1) + ']', b.x + s / 2, b.y + b.h / 2, { font: K.S.type.label(s * 0.42), color: i % 2 ? '#FFFFFF' : YEL, align: 'center', base: 'middle' });
  },
  number(K, str, box, p, s, o) {
    const { ctx, u } = K; if (p <= 0) return;
    if (!o?.small) { const hb = { x: box.x + box.w * 0.08, y: box.y + box.h * 0.2, w: box.w * 0.84, h: box.h * 0.66 }; ctx.fillStyle = INK; ctx.fillRect(hb.x + 14 * u, hb.y + 14 * u, hb.w, hb.h); ctx.fillStyle = YEL; ctx.fillRect(hb.x, hb.y, hb.w, hb.h); ctx.lineWidth = 5 * u; ctx.strokeStyle = INK; ctx.strokeRect(hb.x, hb.y, hb.w, hb.h); box = L.inset(hb, hb.w * 0.04, hb.h * 0.08); }
    title(K, str, box, 1, { align: 'center', color: o?.small ? BLUE : INK, reveal: 'none', font: sz => K.S.type.label(sz), max: o?.small ? 120 : 280 });
  },
  quote(K, str, box, p) { title(K, '> "' + str + '"', box, p, { size: 'm', max: 90, color: INK, reveal: 'type' }); },
  portrait(K, box, p, s) {
    const { ctx, u } = K; if (p <= 0) return;
    const wb = { x: box.x + box.w * 0.08, y: box.y + box.h * 0.1, w: box.w * 0.84, h: box.h * 0.86 };
    popIn(ctx, wb, p, () => {
      const inner = win(K, wb, 'persona_1bit.png', { fill: s.i % 2 ? YEL : '#FFFFFF', bar: s.i % 2 ? PINK : YEL });
      const f = fitSubject(K, { ...inner, h: inner.h * 0.96 }), img = K.S._dith(f.subj.h);
      ctx.save(); ctx.beginPath(); ctx.rect(inner.x, inner.y, inner.w, inner.h); ctx.clip(); ctx.imageSmoothingEnabled = false; ctx.drawImage(img, f.x, inner.y + inner.h - f.h); ctx.restore();
    });
  },
  // Floyd–Steinberg 1-bit dithering at half resolution, drawn back 2x (chunky pixels)
  _dith: L.memo(h => {
    const S = window.K.subject(Math.round(h / 2)), w = S.w, hh = S.h, E = Float32Array.from(S.L, (l, i) => S.A[i] < 0.5 ? -1 : Math.pow(L.clamp((l - 0.05) * 1.5), 0.9));
    const c = L.canvas(w * 2, hh * 2), x = c.getContext('2d'); x.fillStyle = INK;
    for (let y = 0; y < hh; y++) for (let xx = 0; xx < w; xx++) {
      const i = y * w + xx; if (E[i] < 0) continue; const old = E[i], nv = old > 0.5 ? 1 : 0, er = old - nv;
      if (!nv) x.fillRect(xx * 2, y * 2, 2, 2);
      if (xx + 1 < w && E[i + 1] >= 0) E[i + 1] += er * 7 / 16;
      if (y + 1 < hh) { if (xx > 0 && E[i + w - 1] >= 0) E[i + w - 1] += er * 3 / 16; if (E[i + w] >= 0) E[i + w] += er * 5 / 16; if (xx + 1 < w && E[i + w + 1] >= 0) E[i + w + 1] += er / 16; }
    }
    return c;
  }),
  mascot(K, box, p, s, mood) { if (p <= 0) return; popIn(K.ctx, box, p, () => L.mascot(K.ctx, K.spec.mascot, box, { color: BLUE, ink: INK, eye: '#FFFFFF', eyeStyle: 'square' })); },
  media(K, img, box, p, s, frame) {
    const { ctx, u } = K; if (p <= 0) return;
    const F = frameBox(img, box, frame === 'phone' ? 'plain' : frame), O = F.outer, bh = 34 * u, wb = { x: O.x, y: O.y - bh, w: O.w, h: O.h + bh };
    if (wb.y < 90 * u) { const d = 90 * u - wb.y; wb.y += d; wb.h -= d; }
    popIn(ctx, wb, p, () => { const inner = win(K, wb, 'captura.jpg', { bar: YEL }); ctx.save(); ctx.beginPath(); ctx.rect(inner.x, inner.y, inner.w, inner.h); ctx.clip(); cover(ctx, img, inner); ctx.restore(); });
  },
  prompt(K, str, box, p, s, tp) {
    const { ctx, u } = K; if (p <= 0) return;
    L.text(ctx, 'prompt:', box.x, box.y - 8 * u, { font: K.S.type.label(18 * u), color: INK });
    const bw = box.w * 0.78; ctx.fillStyle = '#FFFFFF'; ctx.fillRect(box.x, box.y, bw, box.h); ctx.lineWidth = 4 * u; ctx.strokeStyle = INK; ctx.strokeRect(box.x, box.y, bw, box.h);
    para(K, str.slice(0, Math.ceil(str.length * tp)) + ((K.frame >> 3) % 2 || tp < 1 ? '█' : ''), L.inset({ x: box.x, y: box.y, w: bw, h: box.h }, 14 * u, 10 * u), 1, { color: INK, max: 28, font: sz => K.S.type.body(sz) });
    const bb = { x: box.x + bw + 12 * u, y: box.y, w: box.w - bw - 12 * u, h: box.h }; const down = tp >= 1 && (K.t % 1.4) < 0.15;
    ctx.fillStyle = INK; ctx.fillRect(bb.x + (down ? 0 : 6 * u), bb.y + (down ? 0 : 6 * u), bb.w, bb.h); ctx.fillStyle = BLUE; ctx.fillRect(bb.x + (down ? 4 * u : 0), bb.y + (down ? 4 * u : 0), bb.w, bb.h);
    L.text(ctx, 'OK', bb.x + bb.w / 2, bb.y + bb.h * 0.6, { font: K.S.type.label(24 * u), color: '#FFFFFF', align: 'center' });
  },
  caption(K, words, act, box, p) {
    const { ctx, u } = K; ctx.save(); ctx.globalAlpha = p >= 0.5 ? 1 : 0; ctx.font = K.S.type.bodyEm(30 * u);
    const w = ctx.measureText(words.join(' ')).width + 40 * u, x = box.x + (box.w - w) / 2;
    ctx.fillStyle = INK; ctx.fillRect(x + 6 * u, box.y + 6 * u, w, box.h); ctx.fillStyle = YEL; ctx.fillRect(x, box.y, w, box.h); ctx.lineWidth = 3 * u; ctx.strokeStyle = INK; ctx.strokeRect(x, box.y, w, box.h);
    let cx = x + 20 * u; words.forEach((wd, i) => { const ww = ctx.measureText(wd).width; if (i === act) { ctx.fillStyle = INK; ctx.fillRect(cx - 4 * u, box.y + box.h * 0.16, ww + 8 * u, box.h * 0.68); } ctx.fillStyle = i === act ? YEL : INK; ctx.fillText(wd, cx, box.y + box.h * 0.64); cx += ctx.measureText(wd + ' ').width; });
    ctx.restore();
  },
  connector(K, a, b, p) {
    if (p <= 0) return; const { ctx, u } = K, x = a[0] + (b[0] - a[0]) * L.E.step(p, 5), y = a[1] + (b[1] - a[1]) * L.E.step(p, 5);
    ctx.strokeStyle = INK; ctx.lineWidth = 5 * u; ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(x, y); ctx.stroke();
    if (p >= 1) { const an = Math.atan2(b[1] - a[1], b[0] - a[0]); ctx.fillStyle = INK; ctx.save(); ctx.translate(x, y); ctx.rotate(an); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-18 * u, -12 * u); ctx.lineTo(-18 * u, 12 * u); ctx.closePath(); ctx.fill(); ctx.restore(); }
  },
  button(K, str, b, p) {
    if (p <= 0) return; const { ctx, u } = K; popIn(ctx, b, p, () => {
      ctx.fillStyle = INK; ctx.fillRect(b.x + 8 * u, b.y + 8 * u, b.w, b.h); ctx.fillStyle = BLUE; ctx.fillRect(b.x, b.y, b.w, b.h); ctx.lineWidth = 4 * u; ctx.strokeStyle = INK; ctx.strokeRect(b.x, b.y, b.w, b.h);
      para(K, str, L.inset(b, b.h * 0.3, b.h * 0.18), 1, { font: sz => K.S.type.label(sz), color: '#FFFFFF', max: 34, align: 'center' });
    });
  },
  transition(K, A, B, p, info) { // windows of the next page slam in, stacking, then a hard cut
    const { ctx, W, H, u } = K, r = info.raw, n = 4;
    ctx.drawImage(A, 0, 0);
    const R = [[0.55, 0.12, 0.38, 0.4], [0.08, 0.3, 0.46, 0.46], [0.3, 0.08, 0.6, 0.62], [0.04, 0.04, 0.92, 0.9]];
    for (let k = 0; k < n; k++) {
      if (r < (k + 0.5) / (n + 0.6)) break;
      const b = { x: R[k][0] * W, y: R[k][1] * H, w: R[k][2] * W, h: R[k][3] * H }, inner = win(K, b, `cargando_${k + 1}.html`, { bar: k % 2 ? PINK : YEL });
      ctx.save(); ctx.beginPath(); ctx.rect(inner.x, inner.y, inner.w, inner.h); ctx.clip(); ctx.drawImage(B, 0, 0); ctx.restore();
      if (k < n - 1) { const pb = { x: inner.x + inner.w * 0.1, y: inner.y + inner.h * 0.5, w: inner.w * 0.8, h: 30 * u }, pct = Math.min(99, Math.round(((r * 97 + k * 23) % 1) * 100 * 0.9 + 9 * k));
        ctx.fillStyle = '#FFFFFF'; ctx.fillRect(pb.x, pb.y, pb.w, pb.h); ctx.fillStyle = BLUE; ctx.fillRect(pb.x, pb.y, pb.w * pct / 100, pb.h); ctx.lineWidth = 3 * u; ctx.strokeStyle = INK; ctx.strokeRect(pb.x, pb.y, pb.w, pb.h);
        L.text(ctx, `cargando… ${pct}%`, pb.x, pb.y - 10 * u, { font: K.S.type.label(18 * u), color: INK }); }
    }
    if (r > 0.93) ctx.drawImage(B, 0, 0);
  },
  overlay() {},
};
