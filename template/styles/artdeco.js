// Art déco — azul noche y oro: rayos de sol, abanicos, marcos escalonados, tipografía déco; persona en duotono dorado dentro de un arco.
import * as L from '../engine/lib.js';
import { BASE, title, para, fitSubject, drawFrame } from '../engine/base.js';

const NAVY = '#0E1A2B', NAVY2 = '#16263D', GOLD = '#C9A45C', GOLDL = '#EBD49A', CREAM = '#F2E8D5';
let grain;
const back = t => Math.max(0, L.E.back(t));
const goldGrad = (ctx, y0, y1) => { const g = ctx.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, '#F6E3AE'); g.addColorStop(0.5, GOLD); g.addColorStop(0.55, '#A8823E'); g.addColorStop(1, '#E8CC85'); return g; };
// chamfered (stepped-corner) rectangle path
function deco(ctx, b, c) { ctx.beginPath(); ctx.moveTo(b.x + c, b.y); ctx.lineTo(b.x + b.w - c, b.y); ctx.lineTo(b.x + b.w - c, b.y + c * 0.0); ctx.lineTo(b.x + b.w, b.y + c); ctx.lineTo(b.x + b.w, b.y + b.h - c); ctx.lineTo(b.x + b.w - c, b.y + b.h); ctx.lineTo(b.x + c, b.y + b.h); ctx.lineTo(b.x, b.y + b.h - c); ctx.lineTo(b.x, b.y + c); ctx.closePath(); }
function fan(ctx, x, y, r, a0, a1, n, e, col) { ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 2; for (let k = 0; k <= n; k++) { const a = a0 + (a1 - a0) * k / n; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a) * r * e, y + Math.sin(a) * r * e); ctx.stroke(); } for (let k = 1; k <= 3; k++) { ctx.beginPath(); ctx.arc(x, y, r * e * k / 3, a0, a1); ctx.stroke(); } ctx.restore(); }
function diamond(ctx, x, y, r) { ctx.beginPath(); ctx.moveTo(x, y - r); ctx.lineTo(x + r, y); ctx.lineTo(x, y + r); ctx.lineTo(x - r, y); ctx.closePath(); }

export default {
  id: 'artdeco', name: 'Art déco',
  fonts: 'Limelight&family=Poiret+One&family=Josefin+Sans:wght@400;600;700',
  fontLoads: ['400 60px Limelight', '400 40px "Poiret One"', '400 30px "Josefin Sans"', '600 30px "Josefin Sans"', '700 30px "Josefin Sans"'],
  palette: { bg: NAVY, ink: CREAM, accent: GOLD, muted: '#AFA48F', panel: NAVY2, line: 'rgba(201,164,92,.4)', good: GOLD, bad: '#8C8577', mascot: GOLD },
  type: { display: s => `400 ${s}px Limelight`, em: s => `400 ${s}px Limelight`, body: s => `400 ${s}px "Josefin Sans"`, bodyEm: s => `600 ${s}px "Josefin Sans"`, label: s => `700 ${s}px "Josefin Sans"`, mono: s => `400 ${s}px "Josefin Sans"`, deco: s => `400 ${s}px "Poiret One"` },
  ls: 0.01, lh: 1.02,
  sfx: 'film', transDur: 0.8, push: 0.025,
  music: '1920s art deco big band swing, muted trumpets, walking upright bass, brushed snare, piano stabs, glamorous and confident, 132 BPM, instrumental',
  async setup() { grain = L.grainTiles(4, 256, 0.6, 33); },
  background(K, s) {
    const { ctx, W, H, u, t } = K, e = L.E.out(L.clamp(s.t / 1.0));
    const g = ctx.createRadialGradient(W / 2, H * 1.05, 0, W / 2, H * 1.05, Math.max(W, H)); g.addColorStop(0, '#1D3150'); g.addColorStop(1, NAVY); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    // sunburst rays from bottom centre, slowly turning
    ctx.save(); ctx.translate(W / 2, H * 1.05); ctx.rotate(Math.sin(t * 0.15) * 0.03); ctx.strokeStyle = 'rgba(201,164,92,.10)'; ctx.lineWidth = 2 * u;
    for (let k = 0; k < 40; k++) { const a = Math.PI + (k + 0.5) / 40 * Math.PI; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * W * 1.3 * e, Math.sin(a) * W * 1.3 * e); ctx.stroke(); }
    ctx.restore();
    // corner fans
    const R = Math.min(W, H) * 0.16; fan(ctx, 0, 0, R, 0, Math.PI / 2, 8, e, 'rgba(201,164,92,.35)'); fan(ctx, W, 0, R, Math.PI / 2, Math.PI, 8, e, 'rgba(201,164,92,.35)');
    // stepped double frame
    ctx.strokeStyle = GOLD; ctx.lineWidth = 2 * u; const m = 26 * u; deco(ctx, { x: m, y: m, w: W - 2 * m, h: H - 2 * m }, 30 * u); ctx.globalAlpha = 0.9 * e; ctx.stroke();
    ctx.lineWidth = 1 * u; deco(ctx, { x: m + 10 * u, y: m + 10 * u, w: W - 2 * m - 20 * u, h: H - 2 * m - 20 * u }, 24 * u); ctx.stroke(); ctx.globalAlpha = 1;
  },
  headline(K, str, box, p, s, o = {}) { title(K, str, box, p, { align: o.align, size: o.size, color: goldGrad(K.ctx, box.y, box.y + box.h), emColor: CREAM, reveal: 'fade', valign: 'middle', shadow: 'rgba(0,0,0,.35)', shadowX: 0, shadowY: 4 * K.u }); },
  text(K, str, box, p, role, s, o = {}) {
    const { ctx, u } = K;
    if (role === 'kicker' || role === 'label') {
      const r = para(K, str, box, p, { font: sz => K.S.type.label(sz), color: GOLD, upper: true, ls: 0.3, max: 24, align: o.align || 'left' });
      if (p > 0 && o.align === 'center') { ctx.globalAlpha = L.clamp(p * 1.5); ctx.fillStyle = GOLD; diamond(ctx, box.x + box.w / 2, box.y + box.h + 10 * u, 6 * u); ctx.fill(); ctx.globalAlpha = 1; }
      return r;
    }
    if (role === 'headBad' || role === 'headGood') return title(K, str, box, p, { color: role === 'headGood' ? goldGrad(ctx, box.y, box.y + box.h) : '#9C9483', max: 64, reveal: 'fade' });
    return BASE.text(K, str, box, p, role, s, { color: role === 'bad' ? '#8C8577' : role === 'body' ? '#CFC4AE' : CREAM, ...o });
  },
  panel(K, b, p, s, kind, j = 0) {
    if (p <= 0) return; const { ctx, u } = K; ctx.save(); ctx.globalAlpha = L.clamp(p * 1.4);
    const c = Math.min(22 * u, b.h * 0.25); deco(ctx, b, c); ctx.fillStyle = kind === 'good' ? '#1C2F4A' : NAVY2; ctx.fill();
    ctx.strokeStyle = kind === 'bad' ? 'rgba(201,164,92,.35)' : GOLD; ctx.lineWidth = 2 * u; ctx.stroke();
    if (kind === 'good' || kind === 'bad') { deco(ctx, L.inset(b, 8 * u), c * 0.7); ctx.lineWidth = 1 * u; ctx.stroke(); fan(ctx, b.x + b.w / 2, b.y + b.h, b.w * 0.18, Math.PI, Math.PI * 2, 10, L.E.out(p), 'rgba(201,164,92,.18)'); }
    ctx.restore();
  },
  bullet(K, i, b, p) {
    if (p <= 0) return; const { ctx } = K, [cx, cy] = L.center(b), r = Math.min(b.w, b.h) / 2 * back(p);
    ctx.fillStyle = goldGrad(ctx, cy - r, cy + r); diamond(ctx, cx, cy, r); ctx.fill(); ctx.strokeStyle = NAVY; ctx.lineWidth = 2 * K.u; diamond(ctx, cx, cy, r * 0.8); ctx.stroke();
    L.text(ctx, String(i + 1), cx, cy + r * 0.05, { font: K.S.type.display(r * 0.8), color: NAVY, align: 'center', base: 'middle', alpha: L.clamp(p * 2 - 0.6) });
  },
  number(K, str, box, p, s, o) { const ctx = K.ctx; ctx.save(); ctx.shadowColor = 'rgba(235,212,154,.45)'; ctx.shadowBlur = 40 * K.u; title(K, str, box, p, { align: 'center', color: goldGrad(ctx, box.y, box.y + box.h), reveal: 'fade', max: o?.small ? 130 : 300 }); ctx.restore(); },
  quote(K, str, box, p) { title(K, '“' + str + '”', box, p, { size: 'm', max: 90, color: CREAM, reveal: 'words', font: sz => `400 ${sz}px "Josefin Sans"` }); },
  portrait(K, box, p, s) {
    const { ctx, u } = K, e = L.E.inOut(L.clamp(p * 1.2));
    const aw = Math.min(box.w * 0.8, box.h * 0.62), ab = { x: box.x + (box.w - aw) / 2, y: box.y + box.h * 0.06, w: aw, h: box.h * 0.94 }, rr = aw / 2;
    const arch = () => { ctx.beginPath(); ctx.moveTo(ab.x, ab.y + ab.h); ctx.lineTo(ab.x, ab.y + rr); ctx.arc(ab.x + rr, ab.y + rr, rr, Math.PI, 0); ctx.lineTo(ab.x + ab.w, ab.y + ab.h); ctx.closePath(); };
    ctx.save(); ctx.beginPath(); ctx.rect(ab.x - 20 * u, ab.y + ab.h * (1 - e) - 20 * u, ab.w + 40 * u, ab.h * e + 40 * u); ctx.clip();
    arch(); ctx.fillStyle = '#132540'; ctx.fill();
    ctx.save(); arch(); ctx.clip(); fan(ctx, ab.x + rr, ab.y + ab.h, ab.h * 1.1, Math.PI, Math.PI * 2, 18, 1, 'rgba(201,164,92,.22)');
    const f = fitSubject(K, { ...ab, h: ab.h * 0.9 }), img = K.S._duo(f.subj.h); ctx.globalAlpha = L.clamp(p * 1.6 - 0.3); ctx.drawImage(img, f.x, ab.y + ab.h - f.h); ctx.restore();
    arch(); ctx.strokeStyle = GOLD; ctx.lineWidth = 4 * u; ctx.stroke();
    ctx.save(); ctx.translate(ab.x + ab.w / 2, ab.y + ab.h / 2); ctx.scale((ab.w + 24 * u) / ab.w, (ab.h + 12 * u) / ab.h); ctx.translate(-(ab.x + ab.w / 2), -(ab.y + ab.h / 2)); arch(); ctx.restore(); ctx.lineWidth = 1.5 * u; ctx.stroke();
    ctx.fillStyle = GOLD; diamond(ctx, ab.x + rr, ab.y - 14 * u, 10 * u); ctx.fill();
    ctx.restore();
  },
  _duo: L.memo(h => L.mapPixels(window.K.subject(h), (r, g, b, a, x, y, l) => { const v = Math.pow(L.clamp((l - 0.05) * 1.7), 1.1), c0 = [14, 26, 43], c1 = [246, 222, 160]; return [c0[0] + (c1[0] - c0[0]) * v, c0[1] + (c1[1] - c0[1]) * v, c0[2] + (c1[2] - c0[2]) * v, a]; })),
  mascot(K, box, p, s, mood) { if (p <= 0) return; const ctx = K.ctx; ctx.save(); ctx.globalAlpha = L.clamp(p * 1.6); L.mascot(ctx, K.spec.mascot, { ...box, y: box.y + (1 - back(p)) * 30 * K.u }, { color: GOLD, ink: '#6E5427', eye: NAVY, eyeStyle: mood === 'happy' ? 'happy' : 'dot', bob: Math.sin(K.t * 2.5) * 3 * K.u }); ctx.restore(); },
  media(K, img, box, p, s, frame) {
    const { ctx, u } = K; if (p <= 0) return; const o = drawFrame(K, img, box, p, frame, { bezel: '#07101C', shadowColor: 'rgba(0,0,0,.5)', stroke: GOLD, strokeW: 3 * u });
    ctx.save(); ctx.globalAlpha = L.clamp(p * 2 - 1); ctx.strokeStyle = GOLD; ctx.lineWidth = 1.5 * u; deco(ctx, { x: o.x - 16 * u, y: o.y - 16 * u, w: o.w + 32 * u, h: o.h + 32 * u }, 22 * u); ctx.stroke(); ctx.restore();
  },
  prompt(K, str, box, p, s, tp) {
    if (p <= 0) return; const { ctx, u } = K; K.S.panel(K, box, p, s, 'row');
    para(K, str.slice(0, Math.ceil(str.length * tp)) + (tp < 1 || (K.frame >> 3) % 2 ? ' ◆' : ''), L.inset(box, 26 * u, 14 * u), 1, { color: CREAM, max: 32, font: sz => K.S.type.bodyEm(sz) });
  },
  caption(K, words, act, box, p) {
    const { ctx, u } = K; ctx.save(); ctx.globalAlpha = p; ctx.font = K.S.type.bodyEm(33 * u); ctx.letterSpacing = '1px';
    const w = ctx.measureText(words.join(' ')).width, x = box.x + (box.w - w) / 2;
    const g = ctx.createLinearGradient(x - 80 * u, 0, x + w + 80 * u, 0); g.addColorStop(0, 'rgba(14,26,43,0)'); g.addColorStop(0.15, 'rgba(14,26,43,.88)'); g.addColorStop(0.85, 'rgba(14,26,43,.88)'); g.addColorStop(1, 'rgba(14,26,43,0)');
    ctx.fillStyle = g; ctx.fillRect(x - 80 * u, box.y, w + 160 * u, box.h); ctx.fillStyle = GOLD; ctx.fillRect(x - 20 * u, box.y, w + 40 * u, 1.5 * u); ctx.fillRect(x - 20 * u, box.y + box.h - 1.5 * u, w + 40 * u, 1.5 * u);
    let cx = x; words.forEach((wd, i) => { ctx.fillStyle = i === act ? GOLDL : i < act ? CREAM : 'rgba(242,232,213,.5)'; ctx.fillText(wd, cx, box.y + box.h * 0.66); cx += ctx.measureText(wd + ' ').width; });
    ctx.restore();
  },
  connector(K, a, b, p) {
    if (p <= 0) return; const { ctx, u } = K, e = L.E.inOut(p), x = a[0] + (b[0] - a[0]) * e, y = a[1] + (b[1] - a[1]) * e;
    ctx.strokeStyle = GOLD; ctx.lineWidth = 2 * u; ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(x, y); ctx.stroke();
    if (p > 0.5) { ctx.fillStyle = GOLD; diamond(ctx, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2, 8 * u); ctx.fill(); }
  },
  button(K, str, b, p) {
    if (p <= 0) return; const { ctx, u } = K; ctx.save(); ctx.globalAlpha = L.clamp(p * 1.5); deco(ctx, b, b.h * 0.3); ctx.fillStyle = goldGrad(ctx, b.y, b.y + b.h); ctx.fill();
    para(K, str, L.inset(b, b.h * 0.4, b.h * 0.2), 1, { font: sz => K.S.type.label(sz), color: NAVY, upper: true, ls: 0.18, max: 30, align: 'center' }); ctx.restore();
  },
  transition(K, A, B, p, info) { // navy curtains with gold pleats close, then open on the next scene
    const { ctx, W, H, u } = K, r = info.raw, c = r < 0.5 ? L.E.inOut(r * 2) : 1 - L.E.inOut((r - 0.5) * 2);
    ctx.drawImage(r < 0.5 ? A : B, 0, 0);
    const cw = W / 2 * c;
    for (const side of [0, 1]) {
      const x0 = side ? W - cw : 0; ctx.save(); ctx.beginPath(); ctx.rect(x0, 0, cw, H); ctx.clip();
      const g = ctx.createLinearGradient(0, 0, W / 2, 0); ctx.fillStyle = NAVY2; ctx.fillRect(x0, 0, cw, H);
      ctx.strokeStyle = 'rgba(201,164,92,.35)'; ctx.lineWidth = 2 * u; const n = 9;
      for (let k = 0; k <= n; k++) { const x = side ? W - cw + k * cw / n : k * cw / n; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
      ctx.fillStyle = GOLD; ctx.fillRect(side ? W - cw : cw - 6 * u, 0, 6 * u, H);
      ctx.restore();
    }
    if (c > 0.6) { ctx.fillStyle = goldGrad(ctx, H / 2 - 40 * u, H / 2 + 40 * u); ctx.globalAlpha = (c - 0.6) / 0.4; diamond(ctx, W / 2, H / 2, 40 * u); ctx.fill(); ctx.globalAlpha = 1; }
  },
  overlay(K) { L.drawGrain(K.ctx, grain, K.frame, 0.08, 'overlay'); },
};
