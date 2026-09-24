// Noir cinematográfico — blanco y negro de película: persiana de luz, grano fuerte, letterbox; el único color es una luz cálida.
import * as L from '../engine/lib.js';
import { BASE, title, para, fitSubject, drawFrame } from '../engine/base.js';

const CREAM = '#EDE8DF', WARM = '#E8875A', BLACK = '#0A0A0B';
let grain;
export default {
  id: 'noir', name: 'Noir cinematográfico',
  fonts: 'Bodoni+Moda:ital,opsz,wght@0,6..96,700;1,6..96,500;1,6..96,700&family=Inter:wght@500;600',
  fontLoads: ['italic 500 60px "Bodoni Moda"', 'italic 700 60px "Bodoni Moda"', '700 30px "Bodoni Moda"', '500 30px Inter', '600 30px Inter'],
  palette: { bg: BLACK, ink: CREAM, accent: WARM, muted: '#9A948A', panel: 'rgba(255,255,255,.03)', line: 'rgba(237,232,223,.25)', good: WARM, bad: '#8A857C', mascot: '#060606' },
  type: { display: s => `italic 500 ${s}px "Bodoni Moda"`, em: s => `italic 700 ${s}px "Bodoni Moda"`, body: s => `500 ${s}px Inter`, bodyEm: s => `600 ${s}px Inter`, label: s => `700 ${s}px "Bodoni Moda"`, mono: s => `500 ${s}px Inter` },
  lh: 1.08, ls: -0.01,
  sfx: 'film', transDur: 0.8, push: 0.04,
  music: 'dark cinematic noir jazz, brushed drums, upright bass, muted trumpet, smoky, slow 84 BPM, suspenseful but elegant, instrumental',
  async setup() { grain = L.grainTiles(6, 256, 0.9, 3); },
  background(K, s) {
    const { ctx, W, H, u, t } = K; ctx.fillStyle = BLACK; ctx.fillRect(0, 0, W, H);
    // venetian blind light, drifting slowly; side alternates per scene
    const side = s.i % 2 ? -1 : 1; ctx.save(); ctx.translate(side > 0 ? W * 0.52 : W * 0.02, -40 * u + Math.sin(t * 0.3) * 10 * u); ctx.transform(1, 0, -0.45 * side, 1, 0, 0);
    for (let k = 0; k < 10; k++) { const y = 80 * u + k * 62 * u, g = ctx.createLinearGradient(0, 0, 900 * u, 0); g.addColorStop(0, 'rgba(237,232,223,0)'); g.addColorStop(0.5, 'rgba(237,232,223,.11)'); g.addColorStop(1, 'rgba(237,232,223,0)'); ctx.fillStyle = g; ctx.fillRect(0, y, 900 * u, 30 * u); }
    ctx.restore();
    // warm practical light (lamp / screen) — position varies per scene
    const gx = [0.3, 0.7, 0.5, 0.2, 0.8][s.i % 5] * W, gy = H * 0.72, r = ctx.createRadialGradient(gx, gy, 10, gx, gy, 700 * u);
    r.addColorStop(0, 'rgba(232,135,90,.38)'); r.addColorStop(1, 'rgba(232,135,90,0)'); ctx.fillStyle = r; ctx.fillRect(0, 0, W, H);
  },
  headline(K, str, box, p, s, o = {}) { title(K, str, box, p, { align: o.align === 'left' && s.type !== 'hook' && s.type !== 'cta' ? 'left' : o.align, size: o.size, color: CREAM, emColor: WARM, reveal: 'fade', valign: 'middle' }); },
  text(K, str, box, p, role, s, o = {}) {
    if (role === 'kicker' || role === 'label') return para(K, str, box, p, { font: sz => K.S.type.label(sz), color: WARM, upper: true, ls: 0.35, max: 28, align: o.align || 'left' });
    if (role === 'headBad' || role === 'headGood') return title(K, str, box, p, { color: role === 'headGood' ? WARM : '#8A857C', max: 70, reveal: 'fade' });
    return BASE.text(K, str, box, p, role, s, { color: role === 'bad' ? '#7E796F' : role === 'body' ? '#BDB6AA' : CREAM, ...o });
  },
  panel(K, b, p, s, kind) {
    const { ctx, u } = K; if (p <= 0) return; ctx.save(); ctx.globalAlpha = L.clamp(p * 1.3);
    ctx.fillStyle = 'rgba(255,255,255,.035)'; ctx.fillRect(b.x, b.y, b.w, b.h);
    ctx.strokeStyle = kind === 'good' ? WARM : 'rgba(237,232,223,.28)'; ctx.lineWidth = 1.5 * u; const i = 8 * u;
    ctx.strokeRect(b.x, b.y, b.w, b.h); if (kind === 'good' || kind === 'bad') ctx.strokeRect(b.x + i, b.y + i, b.w - 2 * i, b.h - 2 * i);
    ctx.restore();
  },
  bullet(K, i, b, p) { const R = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII']; para(K, R[i] || String(i + 1), b, p, { font: sz => K.S.type.em(sz), color: WARM, max: b.h * 0.9 / K.u, align: 'center' }); },
  number(K, str, box, p, s, o) { const ctx = K.ctx; ctx.save(); ctx.shadowColor = 'rgba(232,135,90,.55)'; ctx.shadowBlur = 50 * K.u; title(K, str, box, p, { align: 'center', color: o?.small ? WARM : CREAM, reveal: 'fade', max: o?.small ? 130 : 300 }); ctx.restore(); },
  quote(K, str, box, p) { title(K, '“' + str + '”', box, p, { size: 'm', max: 96, color: CREAM, reveal: 'words' }); },
  portrait(K, box, p, s) {
    const { ctx } = K, f = fitSubject(K, box), img = K.S._bw(f.subj.h);
    ctx.save(); ctx.globalAlpha = L.clamp(p * 1.2); ctx.filter = `brightness(${0.25 + 0.75 * L.E.out(p)})`; ctx.drawImage(img, f.x, f.y); ctx.restore();
  },
  _bw: L.memo(h => { const S = window.K.subject(h); return L.mapPixels(S, (r, g, b, a, x, y, l) => { l = Math.pow(L.clamp((l - 0.08) * 1.7), 1.2); const warm = Math.max(0, 1 - Math.hypot(x - S.w * 0.15, y - S.h * 0.95) / (S.w * 1.1)) * 0.7, fade = L.clamp((S.h - y) / (S.h * 0.18)); return [l * 255 * (1 + warm * 0.35), l * 255 * (1 + warm * 0.08), l * 255 * (1 - warm * 0.2), a * fade]; }); }),
  mascot(K, box, p, s) { if (p <= 0) return; const ctx = K.ctx; ctx.save(); ctx.globalAlpha = L.clamp(p * 1.5); L.mascot(ctx, K.spec.mascot, box, { color: '#070707', ink: 'rgba(232,135,90,.55)', eye: WARM }); ctx.restore(); },
  media(K, img, box, p, s, frame) { drawFrame(K, img, box, p, frame, { bezel: '#050505', stroke: 'rgba(237,232,223,.4)', strokeW: 1.5, shadowColor: 'rgba(232,135,90,.35)', filter: (ctx, b) => { ctx.globalCompositeOperation = 'color'; ctx.fillStyle = '#6B5A4E'; ctx.fillRect(b.x, b.y, b.w, b.h); } }); },
  prompt(K, str, box, p, s, tp) {
    if (p <= 0) return; const { ctx, u } = K; ctx.save(); ctx.globalAlpha = L.clamp(p * 1.5);
    const g = ctx.createLinearGradient(0, box.y, 0, box.y + box.h); g.addColorStop(0, 'rgba(232,135,90,.16)'); g.addColorStop(1, 'rgba(232,135,90,.05)'); ctx.fillStyle = g; ctx.fillRect(box.x, box.y, box.w, box.h);
    ctx.strokeStyle = 'rgba(232,135,90,.5)'; ctx.lineWidth = 1.5 * u; ctx.strokeRect(box.x, box.y, box.w, box.h);
    para(K, '> ' + str.slice(0, Math.ceil(str.length * tp)) + ((K.frame >> 3) % 2 || tp < 1 ? '▍' : ''), L.inset(box, 22 * u, 14 * u), 1, { color: '#F4C2A6', max: 30, valign: 'middle' }); ctx.restore();
  },
  caption(K, words, act, box, p) { // film subtitle: no box, soft shadow
    const { ctx, u } = K; ctx.save(); ctx.globalAlpha = p; ctx.font = K.S.type.body(36 * u); ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0,0,0,.9)'; ctx.shadowBlur = 10 * u; ctx.fillStyle = '#FFFFFF'; ctx.fillText(words.join(' '), box.x + box.w / 2, box.y + box.h * 0.6); ctx.restore();
  },
  connector(K, a, b, p) { if (p <= 0) return; const ctx = K.ctx; ctx.strokeStyle = 'rgba(232,135,90,.6)'; ctx.lineWidth = 1.5 * K.u; ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(a[0] + (b[0] - a[0]) * p, a[1] + (b[1] - a[1]) * p); ctx.stroke(); },
  button(K, str, b, p) { if (p <= 0) return; const ctx = K.ctx; ctx.save(); ctx.globalAlpha = p; ctx.strokeStyle = WARM; ctx.lineWidth = 2 * K.u; ctx.strokeRect(b.x, b.y, b.w, b.h); para(K, str, L.inset(b, b.h * 0.3, b.h * 0.2), 1, { font: sz => K.S.type.label(sz), color: CREAM, upper: true, ls: 0.2, max: 30, align: 'center' }); ctx.restore(); },
  transition(K, A, B, p, info) { // dip through black with a warm light leak sweeping across
    const { ctx, W, H } = K, r = info.raw;
    if (r < 0.5) { ctx.drawImage(A, 0, 0); ctx.fillStyle = `rgba(0,0,0,${L.E.in(r * 2)})`; ctx.fillRect(0, 0, W, H); }
    else { ctx.drawImage(B, 0, 0); ctx.fillStyle = `rgba(0,0,0,${1 - L.E.out((r - 0.5) * 2)})`; ctx.fillRect(0, 0, W, H); }
    const x = L.lerp(-0.3, 1.3, r) * W, g = ctx.createRadialGradient(x, H * 0.4, 0, x, H * 0.4, W * 0.45);
    g.addColorStop(0, `rgba(255,170,110,${0.55 * Math.sin(r * Math.PI)})`); g.addColorStop(1, 'rgba(255,120,60,0)');
    ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore();
  },
  overlay(K) {
    const { ctx, W, H, u } = K;
    L.drawGrain(ctx, grain, K.frame, 0.16, 'overlay');
    const v = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.3, W / 2, H / 2, Math.max(W, H) * 0.65); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.7)'); ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = `rgba(255,240,220,${0.015 * Math.sin(K.frame * 1.7)})`; ctx.fillRect(0, 0, W, H); // projector flicker
    ctx.fillStyle = '#000'; const bar = (K.vertical ? 0 : 58) * u; ctx.fillRect(0, 0, W, bar); ctx.fillRect(0, H - bar, W, bar);
  },
};
