// Plano técnico — papel de plano azul con cuadrícula, líneas blancas finas, cotas con medidas reales en px,
// rótulo técnico en la esquina; la persona es un dibujo de líneas (bordes) en blanco que se "escanea" al entrar.
import * as L from '../engine/lib.js';
import { BASE, title, para, fitSubject, drawFrame } from '../engine/base.js';

const BLUE = '#12457A', DEEP = '#0C3461', WHITE = '#EAF3FF', PENCIL = '#F4D35E', FAINT = 'rgba(234,243,255,.55)';
let bgC, grain;
// person as white line drawing: edges of the luminance + light hatch on darks
const LINES = L.memo(h => {
  const S = window.K.subject(h), w = S.w, Lb = L.blurL(S.L, w, S.h, 1), A = S.A;
  return L.mapPixels(S, (r, g, b, a, x, y, l) => {
    if (x < 1 || y < 1 || x >= w - 1 || y >= S.h - 1) return [0, 0, 0, 0];
    const i = y * w + x, gx = Lb[i + 1] - Lb[i - 1], gy = Lb[i + w] - Lb[i - w], m = Math.hypot(gx, gy);
    const sil = A[i - 2] < 0.5 || A[i + 2] < 0.5 || A[i - 2 * w] < 0.5 || A[i + 2 * w] < 0.5;
    const edge = sil ? 1 : L.clamp((m - 0.035) * 9);
    const dark = 1 - L.clamp((Lb[i] - 0.05) * 1.6), hatch = ((x + y) % 7 === 0) ? dark * 0.55 : ((x - y + 1000) % 11 === 0 && dark > 0.6 ? 0.35 : 0);
    const v = Math.max(edge, hatch);
    return [234, 243, 255, v * 255];
  });
});
const below = (K, b) => { const m = (K.vertical ? 150 : 116) * K.u; return b.y < m ? { ...b, y: m, h: Math.max(b.h - (m - b.y), b.h * 0.6) } : b; };
// dimension line with ticks and a measure
function cota(K, x1, y1, x2, y2, label, p, off = 0) {
  if (p <= 0) return; const { ctx, u } = K, dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1, nx = -dy / len * off, ny = dx / len * off;
  const ax = x1 + nx, ay = y1 + ny, bx = ax + dx * p, by = ay + dy * p;
  ctx.save(); ctx.strokeStyle = FAINT; ctx.fillStyle = FAINT; ctx.lineWidth = 1 * u;
  ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
  const tick = (x, y) => { ctx.beginPath(); ctx.moveTo(x - 6 * u, y + 6 * u); ctx.lineTo(x + 6 * u, y - 6 * u); ctx.stroke(); };
  tick(ax, ay); if (p >= 1) tick(bx, by);
  if (p >= 1 && label) { ctx.save(); ctx.translate((ax + bx) / 2, (ay + by) / 2); ctx.rotate(Math.atan2(dy, dx)); ctx.font = K.S.type.mono(15 * u); ctx.textAlign = 'center'; const tw = ctx.measureText(label).width + 12 * u; ctx.fillStyle = BLUE; ctx.fillRect(-tw / 2, -10 * u, tw, 20 * u); ctx.fillStyle = WHITE; ctx.fillText(label, 0, 5 * u); ctx.restore(); }
  ctx.restore();
}

export default {
  id: 'plano', name: 'Plano técnico',
  fonts: 'Barlow+Condensed:ital,wght@0,500;0,600;1,600&family=IBM+Plex+Mono:wght@400;500',
  fontLoads: ['600 80px "Barlow Condensed"', '500 40px "Barlow Condensed"', 'italic 600 80px "Barlow Condensed"', '400 20px "IBM Plex Mono"', '500 20px "IBM Plex Mono"'],
  palette: { bg: BLUE, ink: WHITE, accent: PENCIL, muted: 'rgba(234,243,255,.72)', panel: DEEP, line: FAINT, good: PENCIL, bad: 'rgba(234,243,255,.6)', mascot: BLUE },
  type: { display: s => `600 ${s}px "Barlow Condensed"`, em: s => `italic 600 ${s}px "Barlow Condensed"`, body: s => `400 ${s}px "IBM Plex Mono"`, bodyEm: s => `500 ${s}px "IBM Plex Mono"`, label: s => `500 ${s}px "IBM Plex Mono"`, mono: s => `400 ${s}px "IBM Plex Mono"` },
  lh: 0.98, ls: 0.01, upper: true,
  sfx: 'mechanical', transDur: 0.75, push: 0.02,
  music: 'precise minimal electronic, ticking hi-hats, clean synth arpeggio, soft analog bass, engineering focus mood, 112 BPM, instrumental, confident and methodical',
  async setup(K) {
    const { W, H, u } = K; bgC = L.canvas(W, H); const x = bgC.getContext('2d');
    const g = x.createRadialGradient(W * 0.45, H * 0.4, 0, W / 2, H / 2, Math.max(W, H) * 0.75); g.addColorStop(0, '#1A5690'); g.addColorStop(1, DEEP); x.fillStyle = g; x.fillRect(0, 0, W, H);
    // paper mottling
    const n = L.noise2(12), im = x.getImageData(0, 0, W, H), d = im.data; for (let yy = 0; yy < H; yy += 1) for (let xx = 0; xx < W; xx++) { const i = (yy * W + xx) * 4, v = (n(xx / 140, yy / 140) - 0.5) * 18; d[i] += v * 0.5; d[i + 1] += v * 0.7; d[i + 2] += v; } x.putImageData(im, 0, 0);
    const step = 24 * u;
    for (let k = 0, xx = 0; xx <= W; xx += step, k++) { x.fillStyle = k % 5 === 0 ? 'rgba(234,243,255,.13)' : 'rgba(234,243,255,.055)'; x.fillRect(Math.round(xx), 0, 1, H); }
    for (let k = 0, yy = 0; yy <= H; yy += step, k++) { x.fillStyle = k % 5 === 0 ? 'rgba(234,243,255,.13)' : 'rgba(234,243,255,.055)'; x.fillRect(0, Math.round(yy), W, 1); }
    // border frame
    x.strokeStyle = 'rgba(234,243,255,.7)'; x.lineWidth = 2 * u; x.strokeRect(28 * u, 28 * u, W - 56 * u, H - 56 * u); x.lineWidth = 1 * u; x.strokeRect(36 * u, 36 * u, W - 72 * u, H - 72 * u);
    grain = L.grainTiles(4, 256, 0.5, 12);
  },
  background(K, s) {
    const { ctx, W, u } = K; ctx.drawImage(bgC, 0, 0);
    // title block (rótulo) top-right
    const bw = (K.vertical ? 420 : 520) * u, bh = 64 * u, x = W - 36 * u - bw, y = 36 * u;
    ctx.save(); ctx.strokeStyle = 'rgba(234,243,255,.7)'; ctx.lineWidth = 1 * u; ctx.strokeRect(x, y, bw, bh);
    const cols = [0.34, 0.6, 0.8]; cols.forEach(c => { ctx.beginPath(); ctx.moveTo(x + bw * c, y); ctx.lineTo(x + bw * c, y + bh); ctx.stroke(); });
    const f = K.S.type.mono(12 * u), fv = K.S.type.label(18 * u), n = K.spec.scenes.length;
    [['PLANO', s.type.toUpperCase(), 0], ['LÁMINA', `${String(s.i + 1).padStart(2, '0')}/${String(n).padStart(2, '0')}`, 0.34], ['ESCALA', '1:1', 0.6], ['T', K.t.toFixed(1) + 's', 0.8]].forEach(([k, v, c]) => {
      L.text(ctx, k, x + bw * c + 10 * u, y + 20 * u, { font: f, color: FAINT }); L.text(ctx, v, x + bw * c + 10 * u, y + 48 * u, { font: fv, color: WHITE });
    });
    ctx.restore();
    // coordinate markers along the frame
    ctx.save(); ctx.font = K.S.type.mono(11 * u); ctx.fillStyle = 'rgba(234,243,255,.45)'; const n2 = K.vertical ? 4 : 8;
    for (let k = 0; k < n2; k++) ctx.fillText('ABCDEFGH'[k], 36 * u + (k + 0.5) * (W - 72 * u) / n2, K.H - 42 * u);
    ctx.restore();
  },
  headline(K, str, box, p, s, o = {}) {
    box = below(K, box); const r = title(K, str, box, p, { align: o.align, size: o.size, color: WHITE, emColor: PENCIL, reveal: 'wipe', valign: 'middle' });
    if (r && !K.vertical) cota(K, box.x, r.y0 - 14 * K.u, box.x + Math.min(box.w, K.W * 0.5), r.y0 - 14 * K.u, `${Math.round(Math.min(box.w, K.W * 0.5))} px`, L.clamp(p * 1.4 - 0.3));
  },
  text(K, str, box, p, role, s, o = {}) {
    box = below(K, box);
    if (role === 'kicker' || role === 'label') return para(K, '// ' + str, box, p, { font: sz => K.S.type.label(sz), color: PENCIL, upper: true, ls: 0.1, max: 22, align: o.align || 'left', reveal: 'type' });
    if (role === 'headBad' || role === 'headGood') return title(K, str, box, p, { color: role === 'headGood' ? PENCIL : WHITE, max: 70, reveal: 'wipe', valign: 'top' });
    return BASE.text(K, str, box, p, role, s, { color: role === 'bad' ? 'rgba(234,243,255,.55)' : role === 'body' ? 'rgba(234,243,255,.85)' : WHITE, max: role === 'item' ? 34 : 30, ...o });
  },
  panel(K, b, p, s, kind, j = 0) {
    if (p <= 0) return; const { ctx, u } = K, e = L.E.inOut(p); ctx.save();
    ctx.strokeStyle = kind === 'good' ? PENCIL : 'rgba(234,243,255,.75)'; ctx.lineWidth = 1.3 * u;
    // draw the rectangle perimeter progressively
    const per = 2 * (b.w + b.h), dl = per * e; ctx.setLineDash([dl, per]); ctx.strokeRect(b.x, b.y, b.w, b.h); ctx.setLineDash([]);
    if (kind === 'good' || kind === 'bad') { ctx.globalAlpha = 0.07 * e; ctx.fillStyle = kind === 'good' ? PENCIL : WHITE; ctx.fillRect(b.x, b.y, b.w, b.h); ctx.globalAlpha = 1; cota(K, b.x, b.y + b.h, b.x + b.w, b.y + b.h, `${Math.round(b.w)} px`, L.clamp(p * 1.5 - 0.5), 18 * u); }
    // corner crosses
    ctx.strokeStyle = FAINT; ctx.lineWidth = 1 * u; for (const [x, y] of [[b.x, b.y], [b.x + b.w, b.y], [b.x, b.y + b.h], [b.x + b.w, b.y + b.h]]) { ctx.beginPath(); ctx.moveTo(x - 8 * u, y); ctx.lineTo(x + 8 * u, y); ctx.moveTo(x, y - 8 * u); ctx.lineTo(x, y + 8 * u); ctx.globalAlpha = e; ctx.stroke(); }
    ctx.restore();
  },
  bullet(K, i, b, p) {
    if (p <= 0) return; const { ctx, u } = K, [cx, cy] = L.center(b), r = Math.min(b.w, b.h) * 0.42; ctx.save(); ctx.strokeStyle = WHITE; ctx.lineWidth = 1.4 * u;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2 * L.E.out(p)); ctx.stroke();
    ctx.strokeStyle = FAINT; ctx.lineWidth = 1 * u; ctx.beginPath(); ctx.moveTo(cx - r * 1.35, cy); ctx.lineTo(cx - r * 1.05, cy); ctx.moveTo(cx + r * 1.05, cy); ctx.lineTo(cx + r * 1.35, cy); ctx.moveTo(cx, cy - r * 1.35); ctx.lineTo(cx, cy - r * 1.05); ctx.moveTo(cx, cy + r * 1.05); ctx.lineTo(cx, cy + r * 1.35); ctx.stroke();
    L.text(ctx, String(i + 1).padStart(2, '0'), cx, cy + r * 0.3, { font: K.S.type.display(r * 0.95), color: PENCIL, align: 'center', alpha: L.clamp(p * 2 - 0.5) }); ctx.restore();
  },
  number(K, str, box, p, s, o) {
    const r = title(K, str, box, p, { align: 'center', color: o?.small ? PENCIL : WHITE, reveal: 'wipe', max: o?.small ? 130 : 300 });
    if (r && !o?.small) { const { ctx } = K; ctx.save(); ctx.font = K.S.type.display(r.total * 0.9); const tw = Math.min(box.w, ctx.measureText(str).width); ctx.restore(); cota(K, box.x + (box.w - tw) / 2, r.y0 + r.total + 22 * K.u, box.x + (box.w + tw) / 2, r.y0 + r.total + 22 * K.u, `${Math.round(tw)} px`, L.clamp(p * 1.3 - 0.3)); }
  },
  quote(K, str, box, p) { title(K, '“' + str + '”', below(K, box), p, { size: 'm', max: 90, color: WHITE, reveal: 'wipe', upper: false, font: sz => K.S.type.em(sz) }); },
  portrait(K, box, p, s) {
    if (p <= 0) return; const { ctx, u } = K, f = fitSubject(K, { ...box, y: box.y + box.h * 0.08, h: box.h * 0.92 }), img = LINES(f.subj.h);
    const e = L.E.inOut(L.clamp(p * 1.1)), yscan = f.y + f.h * e;
    ctx.save(); ctx.beginPath(); ctx.rect(f.x - 10, f.y, f.w + 20, f.h * e); ctx.clip(); ctx.drawImage(img, f.x, f.y); ctx.restore();
    if (e < 1) { ctx.fillStyle = PENCIL; ctx.fillRect(f.x - 30 * u, yscan, f.w + 60 * u, 2 * u); }
    // height dimension on the side
    const sx = Math.min(K.W - 60 * u, f.x + f.w + 16 * u);
    cota(K, sx, f.y + f.h * 0.02, sx, K.vertical ? f.y + f.h * 0.6 : f.y + f.h * 0.72, `${Math.round(f.h * 0.7)} px`, L.clamp(p * 1.6 - 0.6));
  },
  mascot(K, box, p, s) {
    if (p <= 0) return; const ctx = K.ctx, u = K.u; ctx.save(); ctx.globalAlpha = L.clamp(p * 1.6);
    L.mascot(ctx, K.spec.mascot, box, { fill: (path) => { ctx.fillStyle = 'rgba(234,243,255,.06)'; ctx.fill(path); }, stroke: (path) => { ctx.strokeStyle = WHITE; ctx.lineWidth = 2; ctx.stroke(path); }, ink: WHITE, eye: PENCIL });
    ctx.setLineDash([6 * u, 5 * u]); ctx.strokeStyle = FAINT; ctx.lineWidth = 1 * u; ctx.beginPath(); const cx = box.x + box.w / 2; ctx.moveTo(cx, box.y - 10 * u); ctx.lineTo(cx, box.y + box.h + 10 * u); ctx.stroke();
    ctx.restore();
  },
  media(K, img, box, p, s, frame) {
    if (p <= 0) return; const { ctx, u } = K; box = below(K, box); box = { ...box, x: box.x + 30 * u, w: box.w - 30 * u, h: box.h - 40 * u };
    const o = drawFrame(K, img, box, p, frame, { shadow: false, bezel: DEEP, stroke: WHITE, strokeW: 1.4, filter: (c, b) => { c.globalCompositeOperation = 'multiply'; c.fillStyle = 'rgba(80,140,210,.45)'; c.fillRect(b.x, b.y, b.w, b.h); } });
    cota(K, o.x, o.y + o.h, o.x + o.w, o.y + o.h, `${img.width} px`, L.clamp(p * 1.5 - 0.5), 22 * u);
    cota(K, o.x, o.y, o.x, o.y + o.h, `${img.height} px`, L.clamp(p * 1.5 - 0.5), 22 * u);
  },
  prompt(K, str, box, p, s, tp) {
    if (p <= 0) return; const { ctx, u } = K; K.S.panel(K, box, p, s, 'note');
    L.text(ctx, 'ENTRADA', box.x + 12 * u, box.y - 10 * u, { font: K.S.type.mono(14 * u), color: PENCIL, alpha: L.clamp(p * 2) });
    para(K, '> ' + str.slice(0, Math.ceil(str.length * tp)) + ((K.frame >> 3) % 2 || tp < 1 ? '_' : ''), L.inset(box, 20 * u, 12 * u), 1, { color: WHITE, max: 28, valign: 'middle' });
  },
  caption(K, words, act, box, p) {
    const { ctx, u } = K; ctx.save(); ctx.globalAlpha = p; ctx.font = K.S.type.mono(30 * u);
    const w = ctx.measureText(words.join(' ')).width, x = box.x + (box.w - w) / 2, y = box.y + box.h * 0.62;
    ctx.fillStyle = 'rgba(12,52,97,.88)'; ctx.fillRect(x - 30 * u, box.y + 4 * u, w + 60 * u, box.h - 8 * u);
    ctx.strokeStyle = WHITE; ctx.lineWidth = 1.2 * u; const bx = x - 30 * u, by = box.y + 4 * u, bh = box.h - 8 * u, bw = w + 60 * u, t = 12 * u;
    ctx.beginPath(); ctx.moveTo(bx + t, by); ctx.lineTo(bx, by); ctx.lineTo(bx, by + bh); ctx.lineTo(bx + t, by + bh); ctx.moveTo(bx + bw - t, by); ctx.lineTo(bx + bw, by); ctx.lineTo(bx + bw, by + bh); ctx.lineTo(bx + bw - t, by + bh); ctx.stroke();
    let cx = x; words.forEach((wd, i) => { ctx.fillStyle = i === act ? PENCIL : i < act ? WHITE : 'rgba(234,243,255,.45)'; ctx.fillText(wd, cx, y); cx += ctx.measureText(wd + ' ').width; });
    ctx.restore();
  },
  connector(K, a, b, p) {
    if (p <= 0) return; const { ctx, u } = K, ex = a[0] + (b[0] - a[0]) * p, ey = a[1] + (b[1] - a[1]) * p; ctx.save(); ctx.strokeStyle = WHITE; ctx.fillStyle = WHITE; ctx.lineWidth = 1.2 * u;
    ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(ex, ey); ctx.stroke();
    const an = Math.atan2(b[1] - a[1], b[0] - a[0]); ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(ex - Math.cos(an - 0.3) * 12 * u, ey - Math.sin(an - 0.3) * 12 * u); ctx.lineTo(ex - Math.cos(an + 0.3) * 12 * u, ey - Math.sin(an + 0.3) * 12 * u); ctx.fill(); ctx.restore();
  },
  button(K, str, b, p) {
    if (p <= 0) return; const { ctx, u } = K; ctx.save(); ctx.globalAlpha = L.clamp(p * 1.5); ctx.fillStyle = PENCIL; ctx.fillRect(b.x, b.y, b.w * L.E.out(p), b.h);
    para(K, str, L.inset(b, b.h * 0.3, b.h * 0.2), L.clamp(p * 2 - 0.5), { font: sz => K.S.type.display(sz), color: DEEP, upper: true, max: 40, align: 'center' }); ctx.restore();
  },
  transition(K, A, B, p, info) { // the new blueprint unrolls from the top: a paper roll travels down
    const { ctx, W, H, u } = K, e = L.E.inOut(info.raw), y = e * H, R = 34 * u;
    ctx.drawImage(A, 0, 0);
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, y); ctx.clip(); ctx.drawImage(B, 0, 0); ctx.restore();
    if (e < 1) {
      ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = 30 * u; ctx.shadowOffsetY = 12 * u;
      const g = ctx.createLinearGradient(0, y - R, 0, y + R); g.addColorStop(0, '#0B2E55'); g.addColorStop(0.35, '#2B6FB0'); g.addColorStop(0.55, '#5E9BD6'); g.addColorStop(1, '#0A2748');
      ctx.fillStyle = g; ctx.fillRect(0, y - R, W, R * 2); ctx.restore();
      ctx.fillStyle = 'rgba(234,243,255,.25)'; for (let k = 0; k < W; k += 24 * u) ctx.fillRect(k, y - R, 1, R * 2);
    }
  },
  overlay(K) { L.drawGrain(K.ctx, grain, K.frame, 0.06, 'overlay'); },
};
