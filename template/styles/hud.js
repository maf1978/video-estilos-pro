// HUD futurista — interfaz sci-fi: líneas finas cian sobre azul noche, retículas, esquinas chaflanadas,
// datos que corren; la persona como holograma escaneado; transición: barrido de escáner.
import * as L from '../engine/lib.js';
import { title, para } from '../engine/base.js';

// chrome: header/footer labels (scene numbers, rules, HUDs). Off with `chrome: false` in the video spec.
const CH = K => K.spec.chrome !== false;

const BG = '#050B16', CY = '#5CE1FF', CYD = 'rgba(92,225,255,.35)', WH = '#E6F6FF', OR = '#FFB547', DIMT = '#6F8CA8';
let grid;
const glow = (K, b = 12, c = 'rgba(92,225,255,.7)') => { K.ctx.shadowColor = c; K.ctx.shadowBlur = b * K.u; };
const ng = K => { K.ctx.shadowColor = 'transparent'; K.ctx.shadowBlur = 0; };
function chamfer(ctx, b, c) { ctx.beginPath(); ctx.moveTo(b.x + c, b.y); ctx.lineTo(b.x + b.w, b.y); ctx.lineTo(b.x + b.w, b.y + b.h - c); ctx.lineTo(b.x + b.w - c, b.y + b.h); ctx.lineTo(b.x, b.y + b.h); ctx.lineTo(b.x, b.y + c); ctx.closePath(); }
function brackets(ctx, b, m, w) { ctx.beginPath(); for (const [x, y, dx, dy] of [[b.x, b.y, 1, 1], [b.x + b.w, b.y, -1, 1], [b.x, b.y + b.h, 1, -1], [b.x + b.w, b.y + b.h, -1, -1]]) { ctx.moveTo(x + dx * m, y); ctx.lineTo(x, y); ctx.lineTo(x, y + dy * m); } ctx.lineWidth = w; ctx.stroke(); }
const HOLO = L.memo(h => L.mapPixels(window.K.subject(h), (r, g, b, a, x, y, l) => {
  const v = Math.pow(L.clamp((l - 0.04) * 1.5), 0.85), line = (y % 4 < 2) ? 1 : 0.55;
  return [90 + 165 * v * v, 200 + 55 * v, 255, a * (0.18 + 0.82 * v) * line];
}));

export default {
  id: 'hud', name: 'HUD futurista',
  fonts: 'Rajdhani:wght@500;600;700&family=Share+Tech+Mono',
  fontLoads: ['700 60px Rajdhani', '600 40px Rajdhani', '500 30px Rajdhani', '400 20px "Share Tech Mono"'],
  palette: { bg: BG, ink: WH, accent: CY, muted: DIMT, panel: 'rgba(92,225,255,.05)', line: CYD, good: CY, bad: OR, mascot: 'rgba(92,225,255,.08)' },
  type: { display: s => `700 ${s}px Rajdhani`, em: s => `700 ${s}px Rajdhani`, body: s => `500 ${s}px Rajdhani`, bodyEm: s => `700 ${s}px Rajdhani`, label: s => `600 ${s}px Rajdhani`, mono: s => `400 ${s}px "Share Tech Mono"` },
  ls: 0.02, lh: 0.95, upper: true,
  sfx: 'digital', transDur: 0.6, push: 0.02,
  music: 'cinematic sci-fi electronic, pulsing synth bass, glassy arpeggios, subtle risers, tense and sleek, 110 BPM, instrumental, futuristic interface',
  async setup(K) {
    grid = L.canvas(K.W, K.H); const g = grid.getContext('2d'), s = 48 * K.u;
    const bg = g.createRadialGradient(K.W / 2, K.H * 0.4, 0, K.W / 2, K.H * 0.4, Math.max(K.W, K.H) * 0.75); bg.addColorStop(0, '#0B1A30'); bg.addColorStop(1, BG); g.fillStyle = bg; g.fillRect(0, 0, K.W, K.H);
    g.strokeStyle = 'rgba(92,225,255,.06)'; g.lineWidth = 1; for (let x = 0; x < K.W; x += s) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, K.H); g.stroke(); } for (let y = 0; y < K.H; y += s) { g.beginPath(); g.moveTo(0, y); g.lineTo(K.W, y); g.stroke(); }
    g.fillStyle = 'rgba(92,225,255,.18)'; for (let x = 0; x < K.W; x += s) for (let y = 0; y < K.H; y += s) g.fillRect(x - 1, y - 1, 2, 2);
  },
  background(K, s) {
    const { ctx, W, H, u, t } = K; ctx.drawImage(grid, 0, 0);
    // big slow reticle
    const cx = s.type === 'hook' || s.type === 'cta' ? (K.vertical ? W * 0.5 : W * 0.77) : W * 0.5, cy = K.vertical && (s.type === 'hook' || s.type === 'cta') ? H * 0.7 : H * 0.45, R = Math.min(W, H) * 0.42;
    ctx.save(); ctx.translate(cx, cy); ctx.strokeStyle = 'rgba(92,225,255,.12)'; ctx.lineWidth = 1.5 * u;
    ctx.beginPath(); ctx.arc(0, 0, R, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.arc(0, 0, R * 0.72, 0, 7); ctx.stroke();
    ctx.rotate(t * 0.15); ctx.strokeStyle = 'rgba(92,225,255,.28)'; ctx.lineWidth = 3 * u; for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.arc(0, 0, R * 0.86, k * Math.PI / 2, k * Math.PI / 2 + 0.6); ctx.stroke(); }
    ctx.rotate(-t * 0.4); ctx.strokeStyle = 'rgba(92,225,255,.18)'; ctx.lineWidth = 1 * u; for (let k = 0; k < 72; k++) { const a = k / 72 * Math.PI * 2, r1 = R * 0.95, r2 = R * (k % 6 ? 0.975 : 1.0); ctx.beginPath(); ctx.moveTo(Math.cos(a) * r1, Math.sin(a) * r1); ctx.lineTo(Math.cos(a) * r2, Math.sin(a) * r2); ctx.stroke(); }
    ctx.restore();
    // side data stream
    const f = `400 ${14 * u}px "Share Tech Mono"`, x = W - 28 * u, n = Math.floor(H * K.cap / (22 * u));
    for (let k = 3; k < n; k++) { const r = L.rng((k + Math.floor(t * 6)) * 97 + s.i); L.text(ctx, (r() * 0xFFFFFF | 0).toString(16).toUpperCase().padStart(6, '0') + ' ' + (r() * 99).toFixed(1), x, k * 22 * u, { font: f, color: 'rgba(92,225,255,.22)', align: 'right' }); }
    if (CH(K)) {
// header strip
    L.text(ctx, `SYS//${String(s.i + 1).padStart(2, '0')}  ${s.type.toUpperCase()}  ·  SEÑAL ${(96 + Math.sin(t * 2) * 3).toFixed(1)}%`, 40 * u, 44 * u, { font: `400 ${16 * u}px "Share Tech Mono"`, color: DIMT });
    ctx.fillStyle = CYD; ctx.fillRect(40 * u, 56 * u, 260 * u, 1.5 * u); ctx.fillStyle = CY; ctx.fillRect(40 * u, 55 * u, 260 * u * ((t * 0.3) % 1), 3 * u);
    }
  },
  headline(K, str, box, p, s, o = {}) {
    const b = { ...box }, tm = CH(K) ? 76 * K.u : 0; if (b.y < tm) { b.h -= tm - b.y; b.y = tm; }
    glow(K, 10, 'rgba(92,225,255,.45)'); const r = title(K, str, b, p, { align: o.align, size: o.size, color: WH, emColor: OR, reveal: 'wipe', valign: 'top', ls: 0.02, lh: 0.95 }); ng(K);
    if (p > 0 && p < 1) { const x = b.x + (b.w + 40) * L.E.inOut(L.clamp(p * 1.1)) - 20; K.ctx.fillStyle = CY; glow(K, 18); K.ctx.fillRect(x, r.y0 - 10 * K.u, 3 * K.u, r.total + 20 * K.u); ng(K); }
  },
  text(K, str, box, p, role, s, o = {}) {
    const m = { kicker: ['▸ ' + str, CY, 30, sz => K.S.type.mono(sz), true, 'type'], label: ['// ' + str, DIMT, 26, sz => K.S.type.mono(sz), true, 'type'], body: [str, '#A9C3DA', 44], item: [str, WH, 46], step: [str, WH, 36], good: [str, WH, 38], bad: [str, DIMT, 38], headGood: ['◆ ' + str, CY, 60, sz => K.S.type.display(sz), true], headBad: ['◇ ' + str, OR, 60, sz => K.S.type.display(sz), true] }[role] || [str, WH, 42];
    para(K, m[0], box, p, { color: m[1], max: m[2], font: m[3], upper: m[4], ls: m[4] ? 0.06 : 0.01, align: o.align || 'left', reveal: m[5] || 'fade', lh: 1.12 });
  },
  panel(K, b, p, s, kind) {
    if (p <= 0) return; const { ctx, u } = K, e = L.E.out(p), c = kind === 'bad' ? OR : CY, bb = { ...b, w: b.w * e };
    ctx.save(); chamfer(ctx, bb, 16 * u); ctx.fillStyle = kind === 'bad' ? 'rgba(255,181,71,.05)' : 'rgba(92,225,255,.05)'; ctx.fill(); ctx.strokeStyle = kind === 'row' || kind === 'note' ? CYD : c; ctx.lineWidth = 1.5 * u; ctx.stroke();
    ctx.fillStyle = c; ctx.fillRect(bb.x + bb.w - 60 * u, bb.y - 2 * u, 44 * u, 4 * u); ctx.restore();
  },
  bullet(K, i, b, p) {
    if (p <= 0) return; const { ctx, u } = K, [cx, cy] = L.center(b), r = Math.min(b.w, b.h) / 2 * L.E.back(p);
    ctx.save(); glow(K, 10); ctx.strokeStyle = CY; ctx.lineWidth = 2 * u; ctx.beginPath(); for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3 + Math.PI / 6; ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); } ctx.closePath(); ctx.stroke(); ng(K);
    L.text(ctx, String(i + 1).padStart(2, '0'), cx, cy + r * 0.3, { font: `700 ${r * 0.85}px Rajdhani`, color: WH, align: 'center' }); ctx.restore();
  },
  number(K, str, box, p, s, o = {}) {
    const { ctx, u } = K; if (!o.small) { // tick gauge under the number
      const w = box.w * 0.6, x0 = box.x + (box.w - w) / 2, y0 = box.y + box.h - 6 * u, n = 40;
      for (let k = 0; k < n; k++) { const on = k / n < L.clamp(p); ctx.fillStyle = on ? CY : 'rgba(92,225,255,.15)'; ctx.fillRect(x0 + k * w / n, y0 - (k % 5 ? 10 : 18) * u, 3 * u, (k % 5 ? 10 : 18) * u); } }
    glow(K, 20, 'rgba(92,225,255,.6)'); title(K, str, box, p, { align: 'center', color: o.small ? CY : WH, reveal: 'fade', max: o.small ? 120 : 300, valign: 'middle' }); ng(K);
  },
  quote(K, str, box, p) { glow(K, 8, 'rgba(92,225,255,.4)'); title(K, '“' + str + '”', box, p, { size: 'm', max: 90, color: WH, reveal: 'wipe', valign: 'top' }); ng(K); },
  portrait(K, box, p, s) {
    if (p <= 0) return; const { ctx, u, t } = K, img = HOLO(Math.round(box.h * 0.94)), x = box.x + (box.w - img.width) / 2, y = box.y + box.h - img.height;
    // projector base
    const bx = x + img.width / 2, by = box.y + box.h - 10 * u; ctx.save(); const g = ctx.createRadialGradient(bx, by, 0, bx, by, img.width * 0.55); g.addColorStop(0, 'rgba(92,225,255,.35)'); g.addColorStop(1, 'rgba(92,225,255,0)'); ctx.fillStyle = g; ctx.fillRect(bx - img.width * 0.6, by - 40 * u, img.width * 1.2, 60 * u); ctx.restore();
    const edge = img.height * L.clamp(p * 1.2), top = y + img.height - edge;
    ctx.save(); ctx.beginPath(); ctx.rect(x - 20 * u, top, img.width + 40 * u, edge); ctx.clip(); ctx.globalAlpha = 0.88 + 0.12 * Math.sin(t * 23); glow(K, 16, 'rgba(92,225,255,.5)');
    ctx.drawImage(img, x + (K.frame % 37 === 0 ? 8 * u : 0), y); ctx.restore();
    // scan line sweeping the hologram
    const sy = p < 1 ? top : y + ((t * 0.5) % 1) * img.height; ctx.save(); glow(K, 14); ctx.fillStyle = 'rgba(160,240,255,.85)'; ctx.fillRect(x - 10 * u, sy, img.width + 20 * u, 2 * u); ctx.restore();
    ctx.save(); ctx.strokeStyle = CYD; brackets(ctx, { x: x - 18 * u, y: y - 10 * u, w: img.width + 36 * u, h: img.height }, 30 * u, 2 * u); ctx.restore();
    L.text(ctx, `ID: ${(K.person?.name || 'SUJETO-01').toUpperCase()}  ·  VERIFICADO`, x - 18 * u, y - 22 * u, { font: `400 ${14 * u}px "Share Tech Mono"`, color: CY, alpha: L.clamp(p * 2 - 1) });
  },
  mascot(K, box, p, s, mood) { if (p <= 0) return; const ctx = K.ctx; ctx.save(); ctx.globalAlpha = L.clamp(p * 2) * (0.85 + 0.15 * Math.sin(K.t * 17)); glow(K, 14); L.mascot(ctx, K.spec.mascot, box, { color: 'rgba(92,225,255,.1)', ink: CY, eye: WH, eyeStyle: mood === 'happy' ? 'happy' : 'dot', bob: Math.sin(K.t * 2) * 5 * K.u }); ng(K); ctx.restore(); },
  media(K, img, box, p, s, frame) {
    if (p <= 0) return; const { ctx, u } = K, r = Math.min(box.w / img.width, box.h / img.height), w = img.width * r, h = img.height * r, x = box.x + (box.w - w) / 2, y = box.y + (box.h - h) / 2;
    ctx.save(); ctx.beginPath(); ctx.rect(x, y + h * (1 - L.E.out(p)) * 0.5, w, h * L.E.out(p)); ctx.clip(); ctx.drawImage(img, x, y, w, h);
    ctx.fillStyle = 'rgba(0,0,0,.08)'; for (let yy = y; yy < y + h; yy += 3 * u) ctx.fillRect(x, yy, w, u); ctx.restore();
    ctx.save(); glow(K, 10); ctx.strokeStyle = CY; brackets(ctx, { x: x - 14 * u, y: y - 14 * u, w: w + 28 * u, h: h + 28 * u }, 36 * u, 2.5 * u); ng(K); ctx.restore();
    L.text(ctx, `ARCHIVO · ${img.width}×${img.height}`, x - 14 * u, y + h + 42 * u, { font: `400 ${15 * u}px "Share Tech Mono"`, color: CY, alpha: L.clamp(p * 2 - 1) });
  },
  prompt(K, str, box, p, s, tp) {
    if (p <= 0) return; const { ctx, u } = K; this.panel(K, box, p, s, 'note');
    L.text(ctx, 'CMD>', box.x + 18 * u, box.y + 26 * u, { font: `400 ${14 * u}px "Share Tech Mono"`, color: CY });
    para(K, str.slice(0, Math.ceil(str.length * tp)) + ((K.frame >> 3) % 2 || tp < 1 ? '▌' : ''), { x: box.x + 18 * u, y: box.y + 32 * u, w: box.w - 36 * u, h: box.h - 40 * u }, 1, { font: sz => `400 ${sz}px "Share Tech Mono"`, color: WH, max: 26, valign: 'middle' });
  },
  caption(K, words, act, box, p) {
    const { ctx, u } = K; ctx.save(); ctx.globalAlpha = p; ctx.font = `600 ${34 * u}px Rajdhani`;
    const w = ctx.measureText(words.join(' ')).width + 60 * u, x = box.x + (box.w - w) / 2, bb = { x, y: box.y, w, h: box.h };
    chamfer(ctx, bb, 12 * u); ctx.fillStyle = 'rgba(5,11,22,.8)'; ctx.fill(); ctx.strokeStyle = CYD; ctx.lineWidth = 1.5 * u; ctx.stroke();
    let cx = x + 30 * u; words.forEach((wd, i) => { ctx.fillStyle = i === act ? CY : i < act ? WH : '#5A7590'; ctx.fillText(wd, cx, box.y + box.h * 0.66); cx += ctx.measureText(wd + ' ').width; });
    ctx.restore();
  },
  connector(K, a, b, p) {
    if (p <= 0) return; const { ctx, u } = K; ctx.save(); ctx.strokeStyle = CYD; ctx.lineWidth = 1.5 * u; ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(a[0] + (b[0] - a[0]) * p, a[1] + (b[1] - a[1]) * p); ctx.stroke();
    const q = (K.t * 0.8) % 1; glow(K, 10); ctx.fillStyle = CY; ctx.beginPath(); ctx.arc(a[0] + (b[0] - a[0]) * q * p, a[1] + (b[1] - a[1]) * q * p, 4 * u, 0, 7); ctx.fill(); ng(K); ctx.restore();
  },
  button(K, str, b, p) {
    if (p <= 0) return; const { ctx, u } = K; ctx.save(); const bb = { ...b, w: b.w * L.E.out(p) }; chamfer(ctx, bb, 14 * u); glow(K, 16); ctx.fillStyle = CY; ctx.fill(); ng(K);
    para(K, str, L.inset(b, b.h * 0.3, b.h * 0.18), L.clamp(p * 2 - 0.6), { font: sz => K.S.type.label(sz), color: BG, max: 38, upper: true, ls: 0.06, align: 'center' }); ctx.restore();
  },
  transition(K, A, B, p, info) { // scanner sweep left→right revealing B, with a bright beam and grid band
    const { ctx, W, H, u } = K, x = L.E.inOut(info.raw) * (W + 200 * u) - 100 * u;
    ctx.drawImage(A, 0, 0);
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, x, H); ctx.clip(); ctx.drawImage(B, 0, 0); ctx.restore();
    const g = ctx.createLinearGradient(x - 220 * u, 0, x, 0); g.addColorStop(0, 'rgba(92,225,255,0)'); g.addColorStop(1, 'rgba(92,225,255,.28)'); ctx.fillStyle = g; ctx.fillRect(x - 220 * u, 0, 220 * u, H);
    ctx.strokeStyle = 'rgba(92,225,255,.35)'; ctx.lineWidth = 1; for (let yy = 0; yy < H; yy += 24 * u) { ctx.beginPath(); ctx.moveTo(x - 180 * u, yy); ctx.lineTo(x, yy); ctx.stroke(); }
    ctx.save(); glow(K, 30); ctx.fillStyle = '#CFF7FF'; ctx.fillRect(x - 2 * u, 0, 4 * u, H); ng(K); ctx.restore();
  },
  overlay(K) {
    const { ctx, W, H, u } = K; ctx.save(); ctx.strokeStyle = 'rgba(92,225,255,.5)'; brackets(ctx, { x: 22 * u, y: 22 * u, w: W - 44 * u, h: H - 44 * u }, 60 * u, 2 * u); ctx.restore();
    ctx.fillStyle = 'rgba(0,0,0,.08)'; for (let y = 0; y < H; y += 3 * u) ctx.fillRect(0, y, W, u);
    const v = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.4, W / 2, H / 2, Math.max(W, H) * 0.7); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.45)'); ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
  },
};
