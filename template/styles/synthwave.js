// Synthwave 80s — sol a franjas, rejilla en perspectiva que avanza, montañas wireframe, cromo + neón;
// persona en duotono neón; overlay VHS; transición: flash + barrido de tracking VHS.
import * as L from '../engine/lib.js';
import { title, para, layoutRich, drawRich } from '../engine/base.js';

const NIGHT = '#0D0221', PURP = '#2A0A4A', PINK = '#FF3EC8', CY = '#2DE2E6', SUN1 = '#FFD319', SUN2 = '#FF2975', WH = '#F7E9FF', LAV = '#B69CFF';
let skies = [], grain;
const glow = (K, c, b = 16) => { K.ctx.shadowColor = c; K.ctx.shadowBlur = b * K.u; };
const ng = K => { K.ctx.shadowColor = 'transparent'; K.ctx.shadowBlur = 0; };
const horizon = K => K.H * (K.vertical ? 0.6 : 0.64);

function chromePattern(ctx, lh, y0) {
  const c = L.canvas(4, Math.max(2, Math.round(lh))), x = c.getContext('2d'), g = x.createLinearGradient(0, 0, 0, c.height);
  g.addColorStop(0, '#1B2A6B'); g.addColorStop(0.18, '#6FA8FF'); g.addColorStop(0.47, '#FFFFFF'); g.addColorStop(0.5, '#3A2156'); g.addColorStop(0.62, '#D65CFF'); g.addColorStop(0.85, '#FFC8F0'); g.addColorStop(1, '#FFFFFF');
  x.fillStyle = g; x.fillRect(0, 0, 4, c.height); const p = ctx.createPattern(c, 'repeat'); p.setTransform(new DOMMatrix().translate(0, y0)); return p;
}
const DUO0 = L.memo(h => L.mapPixels(window.K.subject(h), (r, g, b, a, x, y, l) => {
  const v = L.clamp((l - 0.05) * 1.45); let c;
  if (v < 0.5) { const t = v / 0.5; c = [42 + (255 - 42) * t, 8 + (62 - 8) * t, 69 + (200 - 69) * t]; } else { const t = (v - 0.5) / 0.5; c = [255 + (45 - 255) * t * 0.3, 62 + (226 - 62) * t, 200 + (230 - 200) * t]; }
  const sl = y % 3 === 0 ? 0.78 : 1; return [c[0] * sl, c[1] * sl, c[2] * sl, a];
}));

const DUO = L.memo(h => { const src = DUO0(h), pad = 40, c = L.canvas(src.width + pad * 2, src.height + pad), x = c.getContext('2d'); x.shadowColor = 'rgba(45,226,230,.85)'; x.shadowBlur = 26; x.drawImage(src, pad, pad); return { c, pad }; });

export default {
  id: 'synthwave', name: 'Synthwave 80s',
  fonts: 'Kanit:ital,wght@0,300;0,400;1,700;1,800;1,900&family=Yellowtail&family=VT323',
  fontLoads: ['italic 900 60px Kanit', 'italic 800 60px Kanit', 'italic 700 40px Kanit', '400 30px Kanit', '300 30px Kanit', '400 60px Yellowtail', '400 30px VT323'],
  palette: { bg: NIGHT, ink: WH, accent: PINK, muted: LAV, panel: 'rgba(42,10,74,.6)', line: PINK, good: CY, bad: PINK, mascot: 'rgba(45,226,230,.1)' },
  type: { display: s => `italic 900 ${s}px Kanit`, em: s => `400 ${s * 1.08}px Yellowtail`, body: s => `300 ${s}px Kanit`, bodyEm: s => `400 ${s}px Kanit`, label: s => `italic 700 ${s}px Kanit`, mono: s => `400 ${s}px VT323` },
  ls: -0.01, lh: 1.0, upper: true,
  sfx: 'retro', transDur: 0.55, push: 0.02,
  music: 'synthwave outrun, driving analog bass arpeggio, gated reverb snare, lush polysynth pads, neon night drive, 112 BPM, instrumental, 1980s',
  async setup(K) {
    const { W, H, u } = K, hz = horizon(K);
    grain = L.grainTiles(4, 256, 0.6, 31);
    for (const sx of [0.5, K.vertical ? 0.5 : 0.76]) {
      const c = L.canvas(W, H), x = c.getContext('2d');
      const g = x.createLinearGradient(0, 0, 0, hz); g.addColorStop(0, NIGHT); g.addColorStop(0.55, '#2B0B4E'); g.addColorStop(1, '#7A1C6E'); x.fillStyle = g; x.fillRect(0, 0, W, hz);
      const r = L.rng(5); for (let k = 0; k < 160; k++) { x.fillStyle = `rgba(255,255,255,${0.2 + r() * 0.6})`; x.fillRect(r() * W, r() * hz * 0.7, r() > 0.9 ? 2.5 * u : 1.3 * u, r() > 0.9 ? 2.5 * u : 1.3 * u); }
      // sun with stripe cuts
      const R = Math.min(W, H) * 0.3, cx = W * sx, cy = hz - R * 0.25; x.save(); x.beginPath(); x.arc(cx, cy, R, 0, 7); x.clip();
      const sg = x.createLinearGradient(0, cy - R, 0, cy + R); sg.addColorStop(0, SUN1); sg.addColorStop(0.6, SUN2); sg.addColorStop(1, '#B3136C'); x.fillStyle = sg; x.fillRect(cx - R, cy - R, 2 * R, 2 * R);
      for (let k = 0; k < 8; k++) { const yy = cy + R * 0.05 + k * R * 0.13, hh = 2 * u + k * 2.2 * u; x.clearRect(cx - R, yy, 2 * R, hh); }
      x.restore(); x.save(); x.globalCompositeOperation = 'destination-over'; x.restore();
      x.save(); x.shadowColor = SUN2; x.shadowBlur = 90 * u; x.globalCompositeOperation = 'lighter'; x.globalAlpha = 0.25; x.beginPath(); x.arc(cx, cy, R, 0, 7); x.fillStyle = SUN2; x.fill(); x.restore();
      // wireframe mountains
      x.save(); const mr = L.rng(11); x.beginPath(); x.moveTo(0, hz); let px = 0; while (px < W) { px += (40 + mr() * 90) * u; x.lineTo(px, hz - (30 + mr() * 150) * u * (Math.abs(px - cx) < R * 1.1 ? 0.35 : 1)); } x.lineTo(W, hz); x.closePath();
      x.fillStyle = '#140428'; x.fill(); x.strokeStyle = 'rgba(45,226,230,.6)'; x.lineWidth = 1.6 * u; x.stroke(); x.restore();
      // floor base
      const fg = x.createLinearGradient(0, hz, 0, H); fg.addColorStop(0, '#2A0845'); fg.addColorStop(1, '#07010F'); x.fillStyle = fg; x.fillRect(0, hz, W, H - hz);
      skies.push(c);
    }
  },
  background(K, s) {
    const { ctx, W, H, u, t } = K, hz = horizon(K), side = (s.type === 'hook' || s.type === 'cta') ? 1 : 0;
    ctx.drawImage(skies[side], 0, 0);
    // perspective grid moving towards camera
    ctx.save(); ctx.beginPath(); ctx.rect(0, hz, W, H - hz); ctx.clip(); ctx.strokeStyle = 'rgba(255,62,200,.75)'; ctx.lineWidth = 1.6 * u;
    const vx = side ? W * (K.vertical ? 0.5 : 0.76) : W * 0.5;
    const ph = (t * 0.9) % 1;
    for (const [lw, a] of [[6 * u, 0.18], [1.6 * u, 0.85]]) { // soft glow pass + crisp line pass (no shadowBlur: fast)
      ctx.lineWidth = lw; ctx.globalAlpha = a; ctx.beginPath();
      for (let k = -24; k <= 24; k++) { ctx.moveTo(vx + k * 18 * u, hz); ctx.lineTo(vx + k * W * 0.16, H); }
      ctx.stroke();
      for (let k = 0; k < 14; k++) { const z = (k + ph) / 14, y = hz + (H - hz) * Math.pow(z, 2.4); ctx.globalAlpha = a * (0.2 + 0.8 * z); ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    }
    ctx.restore();
    ctx.fillStyle = 'rgba(255,62,200,.6)'; ctx.fillRect(0, hz - u, W, 2 * u);
    // readability veil for text-heavy scenes
    if (!['hook', 'cta', 'chapter'].includes(s.type)) { ctx.fillStyle = 'rgba(13,2,33,.5)'; ctx.fillRect(0, 0, W, H); }
  },
  headline(K, str, box, p, s, o = {}) {
    const b = { ...box }; if (b.y < 80 * K.u) { b.h -= 80 * K.u - b.y; b.y = 80 * K.u; }
    const toks = K.rich(str).map(t => ({ ...t, w: t.em ? t.w : t.w.toUpperCase() }));
    const R = layoutRich(K.ctx, toks, b, { font: sz => K.S.type.display(sz), emFont: sz => K.S.type.em(sz), max: (o.size === 'm' ? 120 : 180) * K.u, min: 18 * K.u, lh: 1.0, ls: -0.01 });
    const y0 = b.y, pat = chromePattern(K.ctx, R.lh, y0 + R.size * 0.02);
    glow(K, 'rgba(255,62,200,.55)', 20);
    drawRich(K, R, b, p, { align: o.align, color: pat, emColor: PINK, valign: 'top', reveal: 'rise', stroke: 'rgba(255,255,255,.9)', strokeW: R.size * 0.03, shadow: '#14032B', shadowX: R.size * 0.05, shadowY: R.size * 0.06 });
    ng(K);
  },
  text(K, str, box, p, role, s, o = {}) {
    const m = { kicker: [CY, 30, sz => K.S.type.label(sz), true, 0.18], label: [LAV, 26, sz => K.S.type.label(sz), true, 0.1], body: [WH, 44], item: [WH, 46], step: [WH, 36], good: [WH, 38], bad: [LAV, 38], headGood: [CY, 60, sz => K.S.type.display(sz), true], headBad: [PINK, 60, sz => K.S.type.display(sz), true] }[role] || [WH, 42];
    if (role === 'kicker' || role.startsWith('head')) glow(K, m[0], 12);
    para(K, str, box, p, { color: m[0], max: m[1], font: m[2], upper: m[3], ls: m[4] || 0, align: o.align || 'left', lh: 1.15 }); ng(K);
  },
  panel(K, b, p, s, kind) {
    if (p <= 0) return; const { ctx, u } = K, e = L.E.out(p), c = kind === 'good' ? CY : PINK;
    ctx.save(); ctx.globalAlpha = L.clamp(p * 1.4); L.rrect(ctx, b.x, b.y, b.w * e, b.h, 10 * u); ctx.fillStyle = 'rgba(30,6,58,.72)'; ctx.fill(); glow(K, c, 14); ctx.strokeStyle = c; ctx.lineWidth = 2 * u; ctx.stroke(); ng(K); ctx.restore();
  },
  bullet(K, i, b, p) {
    if (p <= 0) return; const { ctx, u } = K, [cx, cy] = L.center(b), r = Math.min(b.w, b.h) / 2 * L.E.back(p), c = i % 2 ? CY : PINK;
    ctx.save(); glow(K, c, 14); ctx.strokeStyle = c; ctx.lineWidth = 3 * u; ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.stroke(); ng(K);
    L.text(ctx, String(i + 1), cx, cy + r * 0.34, { font: `italic 900 ${r}px Kanit`, color: WH, align: 'center' }); ctx.restore();
  },
  number(K, str, box, p, s, o = {}) {
    const R = layoutRich(K.ctx, K.rich(str), box, { font: sz => K.S.type.display(sz), max: (o.small ? 130 : 300) * K.u, min: 18 * K.u, lh: 1, ls: -0.01 });
    const y0 = box.y + (box.h - R.lines.length * R.lh) / 2, pat = chromePattern(K.ctx, R.lh, y0 + R.size * 0.02);
    glow(K, 'rgba(255,62,200,.6)', 26); drawRich(K, R, box, p, { align: 'center', color: o.small ? PINK : pat, reveal: 'rise', stroke: 'rgba(255,255,255,.9)', strokeW: R.size * 0.025, shadow: '#14032B', shadowX: R.size * 0.04, shadowY: R.size * 0.05 }); ng(K);
  },
  quote(K, str, box, p) { glow(K, 'rgba(45,226,230,.5)', 12); title(K, '“' + str + '”', box, p, { size: 'm', max: 90, color: WH, emColor: PINK, reveal: 'rise', valign: 'top', font: sz => `italic 800 ${sz}px Kanit` }); ng(K); },
  portrait(K, box, p, s) {
    if (p <= 0) return; const { ctx, u } = K, D = DUO(Math.round(box.h)), img = D.c, x = box.x + (box.w - img.width) / 2, y = box.y + box.h - img.height, e = L.E.out(p);
    ctx.save(); ctx.globalAlpha = L.clamp(p * 1.6); ctx.drawImage(img, x, y + (1 - e) * 60 * u); ctx.restore();
  },
  mascot(K, box, p, s, mood) { if (p <= 0) return; const ctx = K.ctx; ctx.save(); ctx.globalAlpha = L.clamp(p * 2); glow(K, CY, 16); L.mascot(ctx, K.spec.mascot, { ...box, y: box.y + (1 - L.E.back(p)) * 30 * K.u }, { color: 'rgba(45,226,230,.12)', ink: CY, eye: PINK, eyeStyle: mood === 'happy' ? 'happy' : 'dot', bob: Math.sin(K.t * 3) * 4 * K.u }); ng(K); ctx.restore(); },
  media(K, img, box, p, s, frame) {
    if (p <= 0) return; const { ctx, u } = K, r = Math.min(box.w / img.width, box.h / img.height), w = img.width * r, h = img.height * r, x = box.x + (box.w - w) / 2, y = box.y + (box.h - h) / 2, e = L.E.out(p);
    ctx.save(); ctx.globalAlpha = L.clamp(p * 1.5); ctx.translate(0, (1 - e) * 50 * u); glow(K, PINK, 30); ctx.fillStyle = '#000'; ctx.fillRect(x, y, w, h); ng(K); ctx.drawImage(img, x, y, w, h);
    glow(K, CY, 12); ctx.strokeStyle = CY; ctx.lineWidth = 3 * u; ctx.strokeRect(x - 6 * u, y - 6 * u, w + 12 * u, h + 12 * u); ng(K); ctx.restore();
  },
  prompt(K, str, box, p, s, tp) {
    if (p <= 0) return; const { u } = K; this.panel(K, box, p, s, 'good');
    para(K, '> ' + str.slice(0, Math.ceil(str.length * tp)) + ((K.frame >> 3) % 2 || tp < 1 ? '▮' : ''), L.inset(box, 22 * u, 12 * u), 1, { font: sz => `400 ${sz * 1.3}px VT323`, color: WH, max: 30, valign: 'middle' });
  },
  caption(K, words, act, box, p) {
    const { ctx, u, W } = K; ctx.save(); ctx.globalAlpha = p; ctx.font = `italic 700 ${34 * u}px Kanit`;
    const g = ctx.createLinearGradient(0, box.y - 20 * u, 0, box.y + box.h + 20 * u); g.addColorStop(0, 'rgba(13,2,33,0)'); g.addColorStop(0.5, 'rgba(13,2,33,.75)'); g.addColorStop(1, 'rgba(13,2,33,0)'); ctx.fillStyle = g; ctx.fillRect(0, box.y - 20 * u, W, box.h + 40 * u);
    const w = ctx.measureText(words.join(' ')).width; let cx = box.x + (box.w - w) / 2;
    words.forEach((wd, i) => { if (i === act) glow(K, PINK, 14); ctx.fillStyle = i === act ? '#FFB3EC' : i < act ? WH : 'rgba(247,233,255,.45)'; ctx.fillText(wd, cx, box.y + box.h * 0.66); ng(K); cx += ctx.measureText(wd + ' ').width; });
    ctx.restore();
  },
  connector(K, a, b, p) { if (p <= 0) return; const ctx = K.ctx; ctx.save(); glow(K, PINK, 10); ctx.strokeStyle = PINK; ctx.lineWidth = 2.5 * K.u; ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(a[0] + (b[0] - a[0]) * p, a[1] + (b[1] - a[1]) * p); ctx.stroke(); ng(K); ctx.restore(); },
  button(K, str, b, p) {
    if (p <= 0) return; const { ctx, u } = K; ctx.save(); const [cx, cy] = L.center(b); ctx.translate(cx, cy); ctx.scale(L.E.back(p), L.E.back(p)); ctx.translate(-cx, -cy);
    const g = ctx.createLinearGradient(b.x, 0, b.x + b.w, 0); g.addColorStop(0, PINK); g.addColorStop(1, '#8A2BE2'); L.rrect(ctx, b.x, b.y, b.w, b.h, b.h / 2); glow(K, PINK, 24); ctx.fillStyle = g; ctx.fill(); ng(K);
    para(K, str, L.inset(b, b.h * 0.3, b.h * 0.18), 1, { font: sz => `italic 800 ${sz}px Kanit`, color: WH, max: 36, upper: true, align: 'center' }); ctx.restore();
  },
  transition(K, A, B, p, info) { // white-hot flash + VHS tracking tear
    const { ctx, W, H, u } = K, r = info.raw, src = r < 0.5 ? A : B, k = Math.sin(r * Math.PI);
    const n = 18, bh = H / n, rr = L.rng(K.frame * 13 + 1);
    for (let i = 0; i < n; i++) { const off = (rr() - 0.5) * k * 160 * u * (rr() > 0.6 ? 1 : 0.2); ctx.save(); ctx.beginPath(); ctx.rect(0, i * bh, W, bh + 1); ctx.clip(); ctx.drawImage(src, off, 0); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.35 * k; ctx.drawImage(src, off + 14 * u * k, 0); ctx.restore(); }
    ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = `rgba(255,220,250,${Math.pow(k, 3) * 0.95})`; ctx.fillRect(0, 0, W, H); ctx.restore();
    const ty = ((r * 1.7) % 1) * H; ctx.fillStyle = `rgba(255,255,255,${0.35 * k})`; for (let j = 0; j < 30; j++) ctx.fillRect(rr() * W, ty + rr() * 40 * u, (20 + rr() * 120) * u, 2 * u);
  },
  overlay(K) {
    const { ctx, W, H, u, t } = K;
    ctx.fillStyle = 'rgba(0,0,0,.12)'; for (let y = 0; y < H; y += 3 * u) ctx.fillRect(0, y, W, u);
    // VHS tracking band drifting up from the bottom
    const by = H - ((t * 0.12) % 1) * H * 1.3; const rr = L.rng(K.frame);
    ctx.fillStyle = 'rgba(255,255,255,.05)'; ctx.fillRect(0, by, W, 10 * u); for (let j = 0; j < 12; j++) { ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.fillRect(rr() * W, by + rr() * 10 * u, (10 + rr() * 60) * u, u); }
    L.drawGrain(ctx, grain, K.frame, 0.06, 'overlay');
    // OSD
    const f = `400 ${34 * u}px VT323`, sec = Math.floor(t); L.text(ctx, '▶ PLAY', 44 * u, 60 * u, { font: f, color: 'rgba(255,255,255,.85)' });
    L.text(ctx, `SP  0:${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`, W - 44 * u, 60 * u, { font: f, color: 'rgba(255,255,255,.85)', align: 'right' });
    const v = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.4, W / 2, H / 2, Math.max(W, H) * 0.72); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.45)'); ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
  },
};
