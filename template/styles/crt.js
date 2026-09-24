// Monitor CRT ámbar — fósforo ámbar monocromo sobre negro: scanlines, curvatura y viñeta, bloom en el texto,
// la persona como imagen de fósforo por líneas de barrido; transición: la pantalla se apaga a una línea y vuelve.
import * as L from '../engine/lib.js';
import { title, para } from '../engine/base.js';

const AMB = '#FFB000', HOT = '#FFE2A0', DIM = '#8A5A10', SOFT = '#C08A2A', DEEP = '#3A2406', BLK = '#0A0703';
let scan, grain, frameC;
const glow = (K, blur = 16) => { K.ctx.shadowColor = 'rgba(255,176,0,.75)'; K.ctx.shadowBlur = blur * K.u; };
const noGlow = K => { K.ctx.shadowColor = 'transparent'; K.ctx.shadowBlur = 0; };

// subject → phosphor raster: amber by luminance, drawn only on scanlines
const PHOS = L.memo(h => {
  const S = window.K.subject(h), u = window.K.u, pitch = Math.max(3, Math.round(4 * u));
  return L.mapPixels(S, (r, g, b, a, x, y, l) => {
    if (y % pitch >= pitch - 1) return [0, 0, 0, 0];
    const v = Math.pow(L.clamp((l - 0.05) * 1.6), 0.9);
    return [255 * Math.min(1, 0.25 + v), 176 * v + 30 * v * v, 40 * v * v, a * (0.12 + 0.88 * v)];
  });
});
const AMBERIMG = L.memo(src => {
  const img = window.K.images[src], c = L.canvas(img.width, img.height), x = c.getContext('2d'); x.drawImage(img, 0, 0);
  const d = x.getImageData(0, 0, c.width, c.height);
  for (let i = 0; i < d.data.length; i += 4) { const l = (0.3 * d.data[i] + 0.59 * d.data[i + 1] + 0.11 * d.data[i + 2]) / 255, v = Math.pow(l, 1.2); d.data[i] = 255 * (0.15 + 0.85 * v); d.data[i + 1] = 176 * v; d.data[i + 2] = 30 * v * v; }
  x.putImageData(d, 0, 0); return c;
});

export default {
  id: 'crt', name: 'Monitor CRT ámbar',
  fonts: 'VT323&family=IBM+Plex+Mono:wght@500',
  fontLoads: ['400 60px VT323', '500 20px "IBM Plex Mono"'],
  palette: { bg: BLK, ink: AMB, accent: HOT, muted: DIM, panel: 'rgba(255,176,0,.04)', line: DIM, good: HOT, bad: DIM, mascot: 'rgba(255,176,0,.08)' },
  type: { display: s => `400 ${s}px VT323`, em: s => `400 ${s}px VT323`, body: s => `400 ${s}px VT323`, bodyEm: s => `400 ${s}px VT323`, label: s => `400 ${s}px VT323`, mono: s => `400 ${s}px VT323` },
  ls: 0.01, lh: 0.92, upper: true,
  sfx: 'retro', transDur: 0.6, push: 0.012,
  music: 'dark synthwave retro computer ambience, analog synth pads, pulsing arpeggio, tape hiss, mysterious, 96 BPM, instrumental, 1980s terminal',
  async setup(K) {
    scan = L.canvas(4, Math.max(3, Math.round(3 * K.u))); const x = scan.getContext('2d'); x.fillStyle = 'rgba(0,0,0,.42)'; x.fillRect(0, 0, 4, 1);
    grain = L.grainTiles(4, 256, 0.6, 21);
    // bezel/curvature mask: rounded screen with inner shadow
    frameC = L.canvas(K.W, K.H); const f = frameC.getContext('2d'), m = 18 * K.u;
    f.fillStyle = '#050302'; f.fillRect(0, 0, K.W, K.H); f.globalCompositeOperation = 'destination-out'; L.rrect(f, m, m, K.W - 2 * m, K.H - 2 * m, 60 * K.u); f.fill(); f.globalCompositeOperation = 'source-over';
    const v = f.createRadialGradient(K.W / 2, K.H / 2, Math.min(K.W, K.H) * 0.35, K.W / 2, K.H / 2, Math.max(K.W, K.H) * 0.62); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.75)'); f.fillStyle = v; f.fillRect(0, 0, K.W, K.H);
  },
  background(K, s) {
    const { ctx, W, H, u, t } = K; ctx.fillStyle = BLK; ctx.fillRect(0, 0, W, H);
    const g = ctx.createRadialGradient(W / 2, H * 0.45, 0, W / 2, H * 0.45, Math.max(W, H) * 0.6); g.addColorStop(0, 'rgba(255,150,0,.07)'); g.addColorStop(1, 'rgba(255,150,0,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    // status line top
    const f = `400 ${26 * u}px VT323`;
    L.text(ctx, `SISTEMA-${String(s.i + 1).padStart(2, '0')}  ::  ${s.type.toUpperCase()}  ::  MEM ${(640 - s.i * 12)}K OK`, 56 * u, 62 * u, { font: f, color: DIM });
    L.text(ctx, `T+${K.t.toFixed(1).padStart(5, '0')}`, W - 56 * u, 62 * u, { font: f, color: DIM, align: 'right' });
    ctx.fillStyle = DEEP; ctx.fillRect(56 * u, 74 * u, W - 112 * u, 2 * u);
  },
  headline(K, str, box, p, s, o = {}) {
    const b = { ...box }; if (b.y < 96 * K.u) { b.h -= 96 * K.u - b.y; b.y = 96 * K.u; } if (b.x < 56 * K.u) { b.w -= 56 * K.u - b.x; b.x = 56 * K.u; }
    glow(K, 22); const r = title(K, str, b, p, { align: o.align, size: o.size, color: AMB, emColor: BLK, emStyle: 'box', emBg: AMB, reveal: 'type', valign: 'top', max: o.size === 'm' ? 130 : 200 }); noGlow(K);
    if ((o.align || 'left') === 'left' && (p < 1 || (K.frame >> 3) % 2)) { K.ctx.fillStyle = AMB; K.ctx.fillRect(b.x, r.y0 + r.total + 6 * K.u, 26 * K.u, 8 * K.u); }
  },
  text(K, str, box, p, role, s, o = {}) {
    const b = { ...box }; if (b.x < 56 * K.u) { b.w -= 56 * K.u - b.x; b.x = 56 * K.u; } glow(K, 10);
    const map = { kicker: ['> ' + str, SOFT, 40], label: ['// ' + str, SOFT, 36], body: [str, AMB, 50], item: [str, AMB, 52], step: [str, AMB, 44], good: ['+ ' + str.replace(/^✓ /, ''), HOT, 42], bad: ['- ' + str.replace(/^✗ /, ''), SOFT, 42], headGood: ['[ ' + str + ' ]', HOT, 70], headBad: ['[ ' + str + ' ]', SOFT, 70] }[role] || [str, AMB, 44];
    para(K, map[0], b, p, { color: map[1], max: map[2], upper: true, lh: 1.02, align: o.align || 'left', reveal: 'type' }); noGlow(K);
  },
  panel(K, b, p, s, kind) {
    if (p <= 0) return; const { ctx, u } = K, e = L.E.out(p); ctx.save(); glow(K, 8);
    ctx.strokeStyle = kind === 'good' ? AMB : DIM; ctx.lineWidth = 2 * u; ctx.strokeRect(b.x, b.y, b.w * e, b.h);
    if (kind === 'good' || kind === 'bad') ctx.strokeRect(b.x + 6 * u, b.y + 6 * u, (b.w - 12 * u) * e, b.h - 12 * u);
    ctx.fillStyle = 'rgba(255,176,0,.035)'; ctx.fillRect(b.x, b.y, b.w * e, b.h); ctx.restore();
  },
  bullet(K, i, b, p) { if (p <= 0) return; glow(K, 10); L.text(K.ctx, String(i + 1).padStart(2, '0') + '>', b.x, b.y + b.h * 0.78, { font: `400 ${b.h * 0.9}px VT323`, color: HOT, alpha: L.clamp(p * 2) }); noGlow(K); },
  number(K, str, box, p, s, o = {}) { glow(K, 34); title(K, str, box, p, { align: 'center', color: o.small ? SOFT : HOT, reveal: 'type', max: o.small ? 150 : 330, valign: 'middle' }); noGlow(K); },
  quote(K, str, box, p) { glow(K, 14); title(K, '"' + str + '"', box, p, { size: 'm', max: 100, color: AMB, reveal: 'type', valign: 'top' }); noGlow(K); },
  portrait(K, box, p, s) {
    if (p <= 0) return; const { ctx, u } = K, img = PHOS(Math.round(box.h)), x = box.x + (box.w - img.width) / 2, y = box.y + box.h - img.height;
    const edge = img.height * L.clamp(p * 1.2);
    ctx.save(); ctx.beginPath(); ctx.rect(x, y, img.width, edge); ctx.clip(); ctx.shadowColor = 'rgba(255,160,0,.5)'; ctx.shadowBlur = 14 * u; ctx.drawImage(img, x, y); ctx.restore();
    if (p < 0.85) { ctx.fillStyle = HOT; ctx.globalAlpha = 0.9; ctx.fillRect(x, y + edge - 2 * u, img.width, 3 * u); ctx.globalAlpha = 1; }
    // horizontal hold wobble: a thin band shifts a few px
    const by = y + ((K.t * 0.35) % 1) * img.height; ctx.save(); ctx.beginPath(); ctx.rect(x, by, img.width, 18 * u); ctx.clip(); ctx.globalAlpha = 0.35; ctx.drawImage(img, x + 6 * u, y); ctx.restore();
  },
  mascot(K, box, p, s, mood) { if (p <= 0) return; const ctx = K.ctx; ctx.save(); ctx.globalAlpha = L.clamp(p * 2); glow(K, 12); L.mascot(ctx, K.spec.mascot, box, { color: 'rgba(255,176,0,.06)', ink: AMB, eye: AMB, eyeStyle: mood === 'happy' ? 'happy' : 'square', bob: Math.floor(K.t * 2) % 2 * 4 * K.u }); ctx.restore(); },
  media(K, img, box, p, s, frame) {
    if (p <= 0) return; const { ctx, u } = K, a = AMBERIMG(s.d.src), r = Math.min(box.w / a.width, box.h / a.height), w = a.width * r, h = a.height * r, x = box.x + (box.w - w) / 2, y = box.y + (box.h - h) / 2;
    ctx.save(); glow(K, 10); ctx.strokeStyle = AMB; ctx.lineWidth = 2 * u; ctx.strokeRect(x - 10 * u, y - 10 * u, w + 20 * u, h + 20 * u); noGlow(K);
    ctx.beginPath(); ctx.rect(x, y, w, h * L.clamp(p * 1.3)); ctx.clip(); ctx.drawImage(a, x, y, w, h); ctx.restore();
    L.text(ctx, `IMG ${img.width}x${img.height} CARGADA`, x - 10 * u, y + h + 44 * u, { font: `400 ${26 * u}px VT323`, color: DIM, alpha: L.clamp(p * 2 - 1) });
  },
  prompt(K, str, box, p, s, tp) {
    if (p <= 0) return; const { ctx, u } = K; K.S.panel(K, box, p, s, 'row');
    glow(K, 10); para(K, 'C:\\> ' + str.slice(0, Math.ceil(str.length * tp)) + (tp < 1 || (K.frame >> 3) % 2 ? '█' : ''), L.inset(box, 20 * u, 12 * u), 1, { color: AMB, max: 44, upper: true, lh: 1, valign: 'middle' }); noGlow(K);
  },
  caption(K, words, act, box, p) {
    const { ctx, u } = K; ctx.save(); ctx.globalAlpha = p; const f = `400 ${46 * u}px VT323`; ctx.font = f;
    const up = words.map(w => w.toUpperCase()), full = up.join(' '), w = ctx.measureText(full).width, x = box.x + (box.w - w) / 2, y = box.y + box.h * 0.7;
    ctx.fillStyle = 'rgba(10,7,3,.85)'; ctx.fillRect(x - 20 * u, box.y, w + 40 * u, box.h); ctx.strokeStyle = DIM; ctx.lineWidth = 1.5 * u; ctx.strokeRect(x - 20 * u, box.y, w + 40 * u, box.h);
    let cx = x; up.forEach((wd, i) => { const ww = ctx.measureText(wd).width; if (i === act) { ctx.fillStyle = AMB; ctx.fillRect(cx - 4 * u, box.y + box.h * 0.16, ww + 8 * u, box.h * 0.68); ctx.fillStyle = BLK; } else ctx.fillStyle = i < act ? AMB : DIM; ctx.fillText(wd, cx, y); cx += ctx.measureText(wd + ' ').width; });
    ctx.restore();
  },
  connector(K, a, b, p) { if (p <= 0) return; const ctx = K.ctx; ctx.save(); glow(K, 8); ctx.strokeStyle = AMB; ctx.lineWidth = 2 * K.u; ctx.setLineDash([12 * K.u, 8 * K.u]); ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(a[0] + (b[0] - a[0]) * p, a[1] + (b[1] - a[1]) * p); ctx.stroke(); ctx.restore(); },
  button(K, str, b, p) {
    if (p <= 0) return; const { ctx } = K; ctx.save(); glow(K, 16); ctx.fillStyle = AMB; ctx.fillRect(b.x, b.y, b.w * L.E.out(p), b.h); noGlow(K);
    para(K, '[ ' + str + ' ]', L.inset(b, b.h * 0.2, b.h * 0.12), L.clamp(p * 2 - 0.5), { color: BLK, max: 48, upper: true, align: 'center' }); ctx.restore();
  },
  transition(K, A, B, p, info) { // CRT power-off to a line, then power-on of the next scene
    const { ctx, W, H } = K, r = info.raw; ctx.fillStyle = BLK; ctx.fillRect(0, 0, W, H);
    const src = r < 0.5 ? A : B, k = r < 0.5 ? r * 2 : 1 - (r - 0.5) * 2; // 0 = full, 1 = collapsed
    const sy = Math.max(0.004, 1 - L.E.in(Math.min(1, k * 1.25))), sx = k > 0.8 ? 1 - (k - 0.8) / 0.2 * 0.97 : 1;
    ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(sx, sy); ctx.filter = `brightness(${1 + k * 2.5})`; ctx.drawImage(src, -W / 2, -H / 2); ctx.restore();
    if (k > 0.6) { ctx.save(); ctx.globalCompositeOperation = 'screen'; const g = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * 0.5 * sx); g.addColorStop(0, `rgba(255,226,160,${(k - 0.6) * 2})`); g.addColorStop(1, 'rgba(255,176,0,0)'); ctx.fillStyle = g; ctx.fillRect(0, H / 2 - 30 * K.u, W, 60 * K.u); ctx.restore(); }
  },
  overlay(K) {
    const { ctx, W, H } = K;
    ctx.save(); ctx.fillStyle = ctx.createPattern(scan, 'repeat'); ctx.fillRect(0, 0, W, H); ctx.restore();
    // rolling refresh band
    const y = ((K.t * 0.22) % 1.2 - 0.1) * H, g = ctx.createLinearGradient(0, y - 90 * K.u, 0, y + 90 * K.u); g.addColorStop(0, 'rgba(255,190,80,0)'); g.addColorStop(0.5, 'rgba(255,190,80,.045)'); g.addColorStop(1, 'rgba(255,190,80,0)'); ctx.fillStyle = g; ctx.fillRect(0, y - 90 * K.u, W, 180 * K.u);
    L.drawGrain(ctx, grain, K.frame, 0.07, 'screen');
    ctx.fillStyle = `rgba(0,0,0,${0.03 + 0.03 * Math.sin(K.frame * 2.3)})`; ctx.fillRect(0, 0, W, H); // flicker
    ctx.drawImage(frameC, 0, 0);
  },
};
