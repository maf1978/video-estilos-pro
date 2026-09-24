// Tipografía suiza — póster editorial: rejilla de 12 columnas, grotesca enorme, un solo rojo, foto B/N sobreimpresa.
import * as L from '../engine/lib.js';
import { BASE, title, para, fitSubject, drawFrame } from '../engine/base.js';

// chrome: header/footer labels (scene numbers, rules, HUDs). Off with `chrome: false` in the video spec.
const CH = K => K.spec.chrome !== false;

const INK = '#111111', RED = '#E4331B', BG = '#ECEAE4';
let grain;
const below = (K, b) => { if (!CH(K)) return b; const m = 118 * K.u; return b.y < m ? { ...b, y: m, h: b.h - (m - b.y) } : b; };
const tone = s => s.type === 'statement' && s.i % 2 === 1 ? { bg: RED, ink: INK, em: BG } : s.type === 'chapter' ? { bg: INK, ink: BG, em: RED } : { bg: BG, ink: INK, em: RED };

export default {
  id: 'suizo', name: 'Tipografía suiza',
  fonts: 'Inter+Tight:wght@500;800;900&family=JetBrains+Mono:wght@500',
  fontLoads: ['900 40px "Inter Tight"', '800 40px "Inter Tight"', '500 40px "Inter Tight"', '500 20px "JetBrains Mono"'],
  palette: { bg: BG, ink: INK, accent: RED, muted: '#55534E', panel: BG, line: 'rgba(0,0,0,.14)', good: INK, bad: '#8A8780', mascot: INK },
  type: { display: s => `900 ${s}px "Inter Tight"`, body: s => `500 ${s}px "Inter Tight"`, bodyEm: s => `800 ${s}px "Inter Tight"`, label: s => `800 ${s}px "Inter Tight"`, mono: s => `500 ${s}px "JetBrains Mono"` },
  ls: -0.045, lh: 0.94,
  sfx: 'digital', transDur: 0.55, push: 0.02,
  music: 'minimal techno, precise and confident, tight kick and clicks, deep sub bass, sparse synth stabs, 118 BPM, instrumental, swiss design mood, no vocals',
  async setup(K) { grain = L.grainTiles(4, 256, 0.6); },
  background(K, s) {
    const { ctx, W, H, u } = K, c = tone(s); ctx.fillStyle = c.bg; ctx.fillRect(0, 0, W, H);
    const cols = K.vertical ? 6 : 12, m = 80 * u, cw = (W - 2 * m) / cols;
    ctx.strokeStyle = L.rgba(c.ink === INK ? '#000000' : '#FFFFFF', 0.07); ctx.lineWidth = 1;
    for (let i = 0; i <= cols; i++) { ctx.beginPath(); ctx.moveTo(m + i * cw, 0); ctx.lineTo(m + i * cw, H); ctx.stroke(); }
    if (CH(K)) {
// header: index, type, live timecode
    const mono = K.S.type.mono(20 * u), y = 64 * u, tc = K.t, f = Math.floor((tc % 1) * 30);
    L.text(ctx, String(s.i + 1).padStart(2, '0') + ' — ' + s.type.toUpperCase(), m + 6 * u, y, { font: mono, color: c.ink });
    L.text(ctx, [Math.floor(tc / 3600), Math.floor(tc / 60) % 60, Math.floor(tc) % 60, f].map(v => String(v).padStart(2, '0')).join(':'), W - m, y, { font: mono, color: c.ink, align: 'right' });
    ctx.fillStyle = c.ink; ctx.fillRect(m, y + 22 * u, (W - 2 * m) * L.E.out(L.clamp(s.t / 0.6)), 3 * u);
    }
  },
  headline(K, str, box, p, s, o = {}) { const c = tone(s); box = below(K, box); title(K, str, box, p, { align: o.align === 'center' && !K.vertical ? 'left' : o.align, size: o.size, color: c.ink, emColor: c.em, reveal: 'rise', valign: 'top' }); },
  text(K, str, box, p, role, s, o = {}) {
    const c = tone(s); box = below(K, box);
    if (role === 'kicker' || role === 'label') return para(K, str, box, p, { font: sz => K.S.type.mono(sz), color: c.ink, upper: true, max: 26, align: o.align === 'center' ? 'left' : 'left', reveal: 'type' });
    if (role === 'headBad' || role === 'headGood') return title(K, str, box, p, { color: role === 'headGood' ? RED : c.ink, max: 80, reveal: 'rise', valign: 'top' });
    return BASE.text(K, str, box, p, role, s, { color: role === 'bad' ? '#77746E' : c.ink, align: o.align === 'center' ? 'left' : o.align });
  },
  panel(K, b, p, s, kind, j) { // no cards: a hairline rule + index
    const { ctx, u } = K, c = tone(s); ctx.fillStyle = kind === 'good' ? RED : c.ink; ctx.fillRect(b.x, b.y, b.w * L.E.inOut(p), (kind === 'good' || kind === 'bad' ? 8 : 2) * u);
  },
  bullet(K, i, b, p, s) {
    const { ctx } = K; if (p <= 0) return; ctx.save(); ctx.beginPath(); ctx.rect(b.x, b.y, b.w, b.h * L.E.out(p)); ctx.clip();
    ctx.fillStyle = RED; ctx.fillRect(b.x, b.y, b.w, b.h); L.text(ctx, String(i + 1).padStart(2, '0'), b.x + b.w * 0.12, b.y + b.h * 0.88, { font: K.S.type.display(b.h * 0.62), color: BG, ls: -b.h * 0.03 }); ctx.restore();
  },
  number(K, str, box, p, s, o) { const c = tone(s); title(K, str, box, p, { align: 'left', color: o?.small ? c.em : RED, reveal: 'rise', max: o?.small ? 140 : 380, valign: 'top' }); },
  quote(K, str, box, p, s) { title(K, '«' + str + '»', box, p, { size: 'm', max: 110, color: INK, reveal: 'rise', valign: 'top' }); },
  portrait(K, box, p, s) {
    const { ctx, u } = K, f = fitSubject(K, { ...box, h: box.h * 0.92 }, 1);
    const bw = K.S._bw(f.subj.h), blk = { x: box.x + box.w * 0.04, y: box.y + box.h * 0.1, w: box.w * 0.92, h: box.h * 0.84 };
    ctx.save(); ctx.fillStyle = RED; ctx.fillRect(blk.x, blk.y + blk.h * (1 - L.E.inOut(L.clamp(p * 1.4))), blk.w, blk.h * L.E.inOut(L.clamp(p * 1.4)));
    ctx.beginPath(); ctx.rect(blk.x, blk.y, blk.w, blk.h); ctx.clip(); ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = L.clamp(p * 2 - 0.6);
    ctx.drawImage(bw, f.x, blk.y + blk.h - f.h + blk.h * 0.08); ctx.restore();
    L.text(ctx, 'Fig. ' + (s.i + 1), blk.x, blk.y + blk.h + 30 * u, { font: K.S.type.mono(18 * u), color: tone(s).ink, alpha: L.clamp(p * 2 - 1) });
  },
  _bw: L.memo(h => L.mapPixels(window.K.subject(h), (r, g, b, a, x, y, l) => { const v = Math.pow(L.clamp((l - 0.1) * 1.9), 1.1) * 255; return [v, v, v, a]; })),
  mascot(K, box, p, s) { if (p <= 0) return; const c = tone(s); L.mascot(K.ctx, K.spec.mascot, { ...box, y: box.y + (1 - p) * 40 }, { color: c.ink, outline: false, eye: c.bg, eyeStyle: 'square' }); },
  media(K, img, box, p, s, frame) { const o = drawFrame(K, img, box, p, frame, { shadow: false, stroke: INK, strokeW: 2, bezel: INK }); if (o) L.text(K.ctx, 'Fig. ' + (s.i + 1) + ' — captura real', o.x, o.y + o.h + 30 * K.u, { font: K.S.type.mono(18 * K.u), color: INK, alpha: L.clamp(p * 2 - 1) }); },
  prompt(K, str, box, p, s, tp) {
    if (p <= 0) return; const { ctx, u } = K; ctx.fillStyle = INK; ctx.fillRect(box.x, box.y, box.w * L.E.out(p), 2 * u);
    L.text(ctx, 'INPUT', box.x, box.y + 28 * u, { font: K.S.type.mono(18 * u), color: '#77746E' });
    para(K, '«' + str.slice(0, Math.ceil(str.length * tp)) + (tp < 1 ? '▍' : '»'), { x: box.x, y: box.y + 40 * u, w: box.w, h: box.h - 40 * u }, 1, { font: sz => K.S.type.label(sz), color: INK, max: 38, valign: 'top' });
  },
  caption(K, words, act, box, p) {
    const { ctx, u } = K; ctx.save(); ctx.globalAlpha = p; const f = K.S.type.label(34 * u); ctx.font = f; ctx.letterSpacing = '-0.5px';
    const full = words.join(' '), w = ctx.measureText(full).width, x = box.x + (box.w - w) / 2, y = box.y + box.h * 0.62;
    ctx.fillStyle = INK; ctx.fillRect(x - 24 * u, box.y, w + 48 * u, box.h);
    let cx = x; words.forEach((wd, i) => { const ww = ctx.measureText(wd).width; if (i === act) { ctx.fillStyle = RED; ctx.fillRect(cx - 5 * u, box.y + box.h * 0.18, ww + 10 * u, box.h * 0.64); } ctx.fillStyle = i <= act ? BG : '#8A8780'; ctx.fillText(wd, cx, y); cx += ctx.measureText(wd + ' ').width; });
    ctx.restore();
  },
  connector(K, a, b, p) { if (p <= 0) return; const ctx = K.ctx; ctx.fillStyle = INK; const y = a[1]; ctx.fillRect(a[0], y - 1.5 * K.u, (b[0] - a[0]) * L.E.inOut(p), 3 * K.u); if (K.vertical) ctx.fillRect(a[0] - 1.5 * K.u, a[1], 3 * K.u, (b[1] - a[1]) * L.E.inOut(p)); },
  button(K, str, b, p) { if (p <= 0) return; const ctx = K.ctx; ctx.fillStyle = RED; ctx.fillRect(b.x, b.y, b.w * L.E.out(p), b.h); para(K, str, L.inset(b, b.h * 0.3, b.h * 0.2), L.clamp(p * 2 - 0.5), { font: sz => K.S.type.label(sz), color: BG, max: 40 }); },
  transition(K, A, B, p) { // grid wipe: columns drop in left→right, led by red bars
    const { ctx, W, H } = K, n = K.vertical ? 6 : 12, cw = W / n; ctx.drawImage(A, 0, 0);
    for (let i = 0; i < n; i++) {
      const q = L.E.inOut(L.clamp(p * 1.7 - i * (0.7 / n))); if (q <= 0) continue;
      ctx.save(); ctx.beginPath(); ctx.rect(i * cw, 0, cw + 1, H * q); ctx.clip(); ctx.drawImage(B, 0, 0); ctx.restore();
      if (q < 1) { ctx.fillStyle = RED; ctx.fillRect(i * cw, H * q - 24, cw + 1, 24); }
    }
  },
  overlay(K) { L.drawGrain(K.ctx, grain, K.frame, 0.06, 'overlay'); },
};
