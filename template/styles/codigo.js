// Código vivo — el video ES el código: editor oscuro, árbol de archivos, números de línea, terminal;
// la persona es un retrato ASCII hecho de caracteres de código que se "compila" al entrar.
import * as L from '../engine/lib.js';
import { BASE, title, para, drawFrame } from '../engine/base.js';

// chrome: header/footer labels (scene numbers, rules, HUDs). Off with `chrome: false` in the video spec.
const CH = K => K.spec.chrome !== false;

const BG = '#0E1220', SIDE = '#141A33', BAR = '#12172C', FG = '#C9CFE0', DIM = '#4A5270', OR = '#E08A5E', LAV = '#A9A4F5', SAND = '#E9D7A8', TEAL = '#79C8B8', PINK = '#E07AA0';
const FILES = ['▾ proyecto', '   engine.js', '   escenas.js', '   estilo.js', '   render.mjs', '▸ audio', '▸ assets'];
const SRC = 'renderAt(t)constescena=draw()write(T)face()TR.iris()bootVideo=>{}ctx.fill()await';
let grain, scan;

// code lines shown in the editor chrome, derived from the scene (no fixed topic text)
function codeFor(s) {
  const t = String(s.d.title || s.d.text || s.d.label || s.type).replace(/\*/g, '');
  return [
    [['// escena ', DIM], [String(s.i + 1).padStart(2, '0'), DIM], [' · ' + s.type, DIM]],
    [['const ', LAV], ['escena', FG], [' = ', DIM], ['nueva', OR], ['(', FG], ["'" + s.type + "'", TEAL], [')', FG]],
    [['escribir', OR], ['(escena, ', FG], ["'" + (t.length > 34 ? t.slice(0, 33) + '…' : t) + "'", TEAL], [')', FG]],
    [['animar', OR], ['(escena, { ', FG], ['entrada', FG], [': ', DIM], ['0.4', SAND], [' })', FG]],
  ];
}
// ASCII portrait of the subject at a given height: cells precomputed once
const ASCII = L.memo((h, cell) => {
  const S = window.K.subject(h), { w } = S, Lb = L.blurL(S.L, S.w, S.h, 1), cw = cell * 0.6, cells = [];
  let k = 0;
  for (let y = 0; y < S.h; y += cell) for (let x = 0; x < w; x += cw) {
    const i = (y | 0) * w + (x | 0); if (S.A[i] < 0.5) continue;
    // local contrast boost: compare to a blurred neighbourhood so eyes/brows/mouth read
    const l = L.clamp((Lb[i] - 0.06) / 0.62);
    cells.push({ x, y, l, ch: SRC[k++ % SRC.length], r: ((x * 13 + y * 7) % 97) / 97 });
  }
  const c = L.canvas(w, S.h), cx = c.getContext('2d');
  cx.font = `700 ${cell * 1.08}px "JetBrains Mono"`; cx.textAlign = 'center'; cx.textBaseline = 'middle';
  for (const q of cells) {
    const l = q.l; cx.globalAlpha = 0.22 + Math.pow(l, 1.3) * 0.78;
    cx.fillStyle = l > 0.72 ? '#FFE9C8' : l > 0.5 ? SAND : l > 0.3 ? OR : l > 0.14 ? '#9A5E86' : '#5B5596';
    cx.fillText(l < 0.12 ? '·' : q.ch, q.x, q.y + cell / 2);
  }
  return { c, cells, w, h: S.h };
});

// keep content inside the editor pane: right of the file tree, below the tab bar
function pane(K, box) { const u = K.u, b = { ...box }, left = K.vertical ? 60 * u : 300 * u, top = CH(K) ? 104 * u : 40 * u; if (b.x < left) { b.w -= left - b.x; b.x = left; } if (b.y < top) { b.h -= top - b.y; b.y = top; } return b; }
function mono(K, sz) { return `500 ${sz * K.u}px "JetBrains Mono"`; }

export default {
  id: 'codigo', name: 'Código vivo',
  fonts: 'Martian+Mono:wght@300;700;800&family=JetBrains+Mono:wght@400;500;700',
  fontLoads: ['800 80px "Martian Mono"', '300 30px "Martian Mono"', '700 30px "Martian Mono"', '400 20px "JetBrains Mono"', '500 20px "JetBrains Mono"', '700 20px "JetBrains Mono"'],
  palette: { bg: BG, ink: FG, accent: OR, muted: '#8A91AE', panel: '#131933', line: 'rgba(201,207,224,.14)', good: TEAL, bad: PINK, mascot: OR },
  type: { display: s => `800 ${s}px "Martian Mono"`, em: s => `800 ${s}px "Martian Mono"`, body: s => `400 ${s}px "JetBrains Mono"`, bodyEm: s => `700 ${s}px "JetBrains Mono"`, label: s => `700 ${s}px "JetBrains Mono"`, mono: s => `500 ${s}px "JetBrains Mono"`, light: s => `300 ${s}px "Martian Mono"` },
  ls: -0.035, lh: 1.08,
  sfx: 'digital', transDur: 0.55, push: 0.018,
  music: 'lofi electronic coding beat, soft analog synth arpeggio, dusty drums, warm sub bass, focused and clever, 100 BPM, instrumental',
  async setup(K) { grain = L.grainTiles(4, 256, 0.5, 5); scan = L.canvas(4, 3); const x = scan.getContext('2d'); x.fillStyle = 'rgba(0,0,0,.16)'; x.fillRect(0, 0, 4, 1); },
  // content area = editor pane (right of the file tree, above the terminal)
  background(K, s) {
    const { ctx, W, H, u } = K, V = K.vertical;
    ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
    if (CH(K)) {
// title bar
    ctx.fillStyle = BAR; ctx.fillRect(0, 0, W, 50 * u);
    ['#E0625A', '#E3B341', '#58B368'].forEach((c, i) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc((30 + i * 26) * u, 25 * u, 7 * u, 0, 7); ctx.fill(); });
    L.text(ctx, 'escena_' + String(s.i + 1).padStart(2, '0') + '.js — proyecto', W / 2, 32 * u, { font: mono(K, 18), color: DIM, align: 'center' });
    // tabs
    ctx.fillStyle = '#0B0F1C'; ctx.fillRect(V ? 0 : 230 * u, 50 * u, W, 34 * u);
    ctx.fillStyle = BG; ctx.fillRect(V ? 0 : 230 * u, 50 * u, 190 * u, 34 * u); ctx.fillStyle = OR; ctx.fillRect(V ? 0 : 230 * u, 50 * u, 190 * u, 2 * u);
    L.text(ctx, 'escena_' + String(s.i + 1).padStart(2, '0') + '.js', (V ? 16 : 246) * u, 73 * u, { font: mono(K, 16), color: SAND });
    }
    if (!V) { // file tree
      ctx.fillStyle = SIDE; ctx.fillRect(0, CH(K) ? 50 * u : 0, 230 * u, H);
      FILES.forEach((f, i) => L.text(ctx, f, 18 * u, (100 + i * 32) * u, { font: mono(K, 18), color: i === 2 ? SAND : DIM }));
      L.text(ctx, 'EXPLORADOR', 18 * u, (100 + 8 * 32) * u + 20 * u, { font: `700 ${14 * u}px "JetBrains Mono"`, color: '#353C5C' });
    }
    // gutter line numbers (fixed ruler behind content)
    const gx = V ? 34 * u : 262 * u, top = (CH(K) ? 110 : 46) * u, lh = 36 * u, n = Math.floor((H * K.cap - top) / lh);
    for (let k = 0; k < n; k++) L.text(ctx, String(k + 1 + s.i * 12), gx, top + k * lh, { font: mono(K, 15), color: k === Math.floor((s.t * 3) % n) ? '#6B7394' : '#262C47', align: 'right' });
    // small code comment strip that types in (from scene data)
    if (!V && ['statement', 'stat', 'quote', 'chapter'].includes(s.type)) {
      const lines = codeFor(s), cp = L.clamp(s.t / 1.0);
      let chars = Math.floor(cp * 120);
      lines.forEach((ln, i) => {
        let x = 300 * u; const y = (H * K.cap) - (lines.length - i) * 30 * u - 4 * u;
        for (const [str, col] of ln) { if (chars <= 0) break; const part = str.slice(0, chars); chars -= str.length; ctx.font = mono(K, 17); L.text(ctx, part, x, y, { font: mono(K, 17), color: col, alpha: 0.55 }); x += ctx.measureText(part).width; }
      });
    }
    if (CH(K)) {
// status bar
    ctx.fillStyle = '#1B2140'; ctx.fillRect(0, H - 30 * u, W, 30 * u);
    L.text(ctx, '⎇ main   ✓ 0 errores   UTF-8   JS', 16 * u, H - 10 * u, { font: mono(K, 15), color: '#8A91AE' });
    L.text(ctx, `Ln ${12 + s.i}, Col ${1 + Math.floor(s.t * 9) % 40}   render ${(K.t).toFixed(2)}s`, W - 16 * u, H - 10 * u, { font: mono(K, 15), color: '#8A91AE', align: 'right' });
    }
  },
  headline(K, str, box, p, s, o = {}) {
    // typed like code: caret + light comment marker
    const b = pane(K, box);
    title(K, str, b, p, { align: o.align === 'center' ? 'left' : o.align, size: o.size, color: FG, emColor: OR, reveal: 'type', valign: 'top' });
    // blinking caret after the headline area while typing
    if (p < 1 || (K.frame >> 3) % 2) { const ctx = K.ctx; ctx.fillStyle = OR; ctx.globalAlpha = 0.9; ctx.fillRect(b.x - 18 * K.u, b.y + 8 * K.u, 6 * K.u, 50 * K.u); ctx.globalAlpha = 1; }
  },
  text(K, str, box, p, role, s, o = {}) {
    const b = pane(K, box);
    if (role === 'kicker' || role === 'label') return para(K, '// ' + str, b, p, { font: sz => K.S.type.mono(sz), color: SAND, max: 28, align: o.align === 'center' ? 'left' : 'left', reveal: 'type' });
    if (role === 'headBad' || role === 'headGood') return title(K, (role === 'headGood' ? '✓ ' : '✗ ') + str, b, p, { color: role === 'headGood' ? TEAL : PINK, max: 60, reveal: 'type', valign: 'top' });
    if (role === 'good' || role === 'bad') return para(K, str, b, p, { color: role === 'good' ? FG : '#7A819C', max: 36, align: 'left', reveal: 'type' });
    if (role === 'body') return para(K, '→ ' + str, b, p, { font: sz => K.S.type.light(sz), color: SAND, max: 38, align: o.align === 'center' ? 'left' : (o.align || 'left'), reveal: 'type' });
    return para(K, str, b, p, { color: FG, max: role === 'step' ? 32 : 40, align: o.align || 'left', reveal: 'type' });
  },
  panel(K, b, p, s, kind, j) {
    if (p <= 0) return; const { ctx, u } = K; ctx.save(); ctx.globalAlpha = L.clamp(p * 1.4);
    ctx.fillStyle = kind === 'good' ? 'rgba(121,200,184,.07)' : kind === 'bad' ? 'rgba(224,122,160,.06)' : 'rgba(169,164,245,.05)'; ctx.fillRect(b.x, b.y, b.w * L.E.out(p), b.h);
    ctx.fillStyle = kind === 'good' ? TEAL : kind === 'bad' ? PINK : LAV; ctx.fillRect(b.x, b.y, 3 * u, b.h);
    if (kind === 'good' || kind === 'bad') { L.text(ctx, kind === 'good' ? 'ahora.js' : 'antes.js', b.x + b.w - 14 * u, b.y + 24 * u, { font: mono(K, 15), color: DIM, align: 'right' }); }
    ctx.restore();
  },
  bullet(K, i, b, p) { if (p <= 0) return; const [cx, cy] = L.center(b); L.text(K.ctx, `[${i}]`, cx, cy + b.h * 0.18, { font: `700 ${b.h * 0.5}px "JetBrains Mono"`, color: LAV, align: 'center', alpha: L.clamp(p * 2) }); },
  number(K, str, box, p, s, o = {}) {
    const ctx = K.ctx; ctx.save(); ctx.shadowColor = 'rgba(224,138,94,.45)'; ctx.shadowBlur = 30 * K.u;
    const b = pane(K, box);
    title(K, str, b, p, { align: o.small ? 'left' : 'center', color: o.small ? LAV : OR, reveal: 'type', max: o.small ? 110 : 280, valign: 'middle' }); ctx.restore();
  },
  quote(K, str, box, p) {
    const b = pane(K, box);
    title(K, '"' + str + '"', b, p, { size: 'm', max: 72, color: TEAL, reveal: 'type', valign: 'top' });
  },
  portrait(K, box, p, s) {
    const { ctx, u } = K, cell = 9 * u, A = ASCII(Math.round(box.h), cell), x0 = box.x + (box.w - A.w) / 2, y0 = box.y + box.h - A.h;
    // "compile": rows resolve from random glyph noise top→bottom; the final image is the cached canvas
    const rev = L.clamp(p * 1.25);
    if (rev >= 1) { ctx.drawImage(A.c, x0, y0); }
    else {
      const edge = rev * A.h;
      ctx.save(); ctx.beginPath(); ctx.rect(x0, y0, A.w, edge); ctx.clip(); ctx.drawImage(A.c, x0, y0); ctx.restore();
      // scanning band of raw glyphs
      ctx.save(); ctx.font = `700 ${cell * 1.08}px "JetBrains Mono"`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = TEAL;
      for (const q of A.cells) { const d = q.y - edge; if (d < 0 || d > cell * 5) continue; ctx.globalAlpha = (1 - d / (cell * 5)) * 0.8; ctx.fillText(SRC[(q.r * 50 + K.frame) % SRC.length | 0], x0 + q.x, y0 + q.y + cell / 2); }
      ctx.restore();
    }
    // subtle living shimmer: a few glyphs flicker brighter
    if (rev >= 1) { ctx.save(); ctx.font = `700 ${cell * 1.08}px "JetBrains Mono"`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#FFF4DE';
      const r = L.rng(K.frame >> 1); for (let k = 0; k < 18; k++) { const q = A.cells[(r() * A.cells.length) | 0]; if (q && q.l > 0.4) { ctx.globalAlpha = 0.7; ctx.fillText(q.ch, x0 + q.x, y0 + q.y + cell / 2); } } ctx.restore(); }
    L.text(ctx, `persona.ascii · ${A.cells.length.toLocaleString('es-MX')} glifos`, box.x + box.w - 10 * u, y0 + 14 * u, { font: mono(K, 14), color: DIM, align: 'right', alpha: L.clamp(p * 2 - 1) });
  },
  mascot(K, box, p, s, mood) {
    if (p <= 0) return; const ctx = K.ctx; ctx.save(); ctx.globalAlpha = L.clamp(p * 1.6);
    L.mascot(ctx, K.spec.mascot, { ...box, y: box.y + (1 - L.E.back(p)) * 24 * K.u }, { color: 'rgba(224,138,94,.12)', ink: OR, eye: OR, eyeStyle: mood === 'happy' ? 'happy' : 'square', bob: Math.sin(K.t * 3) * 3 * K.u });
    ctx.restore();
  },
  media(K, img, box, p, s, frame) {
    const o = drawFrame(K, img, box, p, frame, { bezel: '#050710', card: '#0B0F1C', barColor: '#1B2140', stroke: 'rgba(169,164,245,.35)', strokeW: 1.5, shadowColor: 'rgba(0,0,0,.6)' });
    if (o) L.text(K.ctx, `<img src="captura.png" /> // ${img.width}×${img.height}`, o.x, o.y + o.h + 28 * K.u, { font: mono(K, 15), color: DIM, alpha: L.clamp(p * 2 - 1) });
  },
  prompt(K, str, box, p, s, tp) {
    if (p <= 0) return; const { ctx, u } = K; ctx.save(); ctx.globalAlpha = L.clamp(p * 1.5);
    const b = pane(K, box);
    ctx.fillStyle = '#0A0D18'; ctx.fillRect(b.x, b.y, b.w, b.h); ctx.fillStyle = '#1D2440'; ctx.fillRect(b.x, b.y, b.w, 2 * u);
    L.text(ctx, 'TERMINAL', b.x + 16 * u, b.y + 26 * u, { font: `700 ${14 * u}px "JetBrains Mono"`, color: DIM });
    para(K, '❯ claude "' + str.slice(0, Math.ceil(str.length * tp)) + (tp >= 1 ? '"' : '') + ((K.frame >> 3) % 2 || tp < 1 ? '▍' : ''), { x: b.x + 16 * u, y: b.y + 34 * u, w: b.w - 32 * u, h: b.h - 40 * u }, 1, { color: FG, max: 26, valign: 'middle' });
    ctx.restore();
  },
  caption(K, words, act, box, p) {
    const { ctx, u } = K; ctx.save(); ctx.globalAlpha = p; ctx.font = `500 ${30 * u}px "JetBrains Mono"`;
    const full = '> ' + words.join(' '), w = Math.min(box.w, ctx.measureText(full).width + 44 * u), x = box.x + (box.w - w) / 2;
    ctx.fillStyle = 'rgba(10,13,24,.9)'; ctx.fillRect(x, box.y, w, box.h); ctx.fillStyle = OR; ctx.fillRect(x, box.y, 3 * u, box.h);
    let cx = x + 22 * u; const y = box.y + box.h * 0.64;
    ctx.fillStyle = DIM; ctx.fillText('> ', cx, y); cx += ctx.measureText('> ').width;
    words.forEach((wd, i) => { ctx.fillStyle = i === act ? OR : i < act ? FG : '#5A6283'; ctx.fillText(wd, cx, y); cx += ctx.measureText(wd + ' ').width; });
    ctx.restore();
  },
  connector(K, a, b, p) { if (p <= 0) return; const ctx = K.ctx; ctx.save(); ctx.strokeStyle = LAV; ctx.globalAlpha = 0.7; ctx.lineWidth = 2 * K.u; ctx.setLineDash([6 * K.u, 6 * K.u]); ctx.lineDashOffset = -K.t * 30; ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(a[0] + (b[0] - a[0]) * p, a[1] + (b[1] - a[1]) * p); ctx.stroke(); ctx.restore(); },
  button(K, str, b, p) {
    if (p <= 0) return; const ctx = K.ctx, u = K.u; ctx.save(); ctx.globalAlpha = L.clamp(p * 1.5);
    const bb = pane(K, b);
    ctx.fillStyle = OR; ctx.fillRect(bb.x, bb.y, bb.w * L.E.out(p), bb.h);
    para(K, '▶ ' + str, L.inset(bb, bb.h * 0.3, bb.h * 0.2), L.clamp(p * 2 - 0.5), { font: sz => K.S.type.label(sz), color: BG, max: 34 }); ctx.restore();
  },
  transition(K, A, B, p, info) { // compile: new scene scrolls up like a fast code scroll, a build log flashes
    const { ctx, W, H, u } = K, r = info.raw, e = L.E.inOut(r);
    ctx.drawImage(A, 0, -e * H * 0.35); ctx.fillStyle = `rgba(14,18,32,${e * 0.8})`; ctx.fillRect(0, 0, W, H);
    ctx.save(); ctx.beginPath(); ctx.rect(0, H * (1 - e), W, H * e); ctx.clip(); ctx.drawImage(B, 0, H * (1 - e) * 0.6); ctx.restore();
    // build log line at the seam
    const y = H * (1 - e); ctx.fillStyle = OR; ctx.fillRect(0, y - 2 * u, W, 3 * u);
    ctx.fillStyle = 'rgba(10,13,24,.92)'; ctx.fillRect(0, y - 40 * u, W, 38 * u);
    L.text(ctx, `▸ compilando escena ${info.to.i + 1} … ${Math.round(r * 100)}%   ${'█'.repeat(Math.round(r * 24))}${'░'.repeat(24 - Math.round(r * 24))}`, 24 * u, y - 14 * u, { font: mono(K, 18), color: TEAL });
  },
  overlay(K) {
    const { ctx, W, H } = K; ctx.save(); ctx.fillStyle = ctx.createPattern(scan, 'repeat'); ctx.fillRect(0, 0, W, H); ctx.restore();
    L.drawGrain(ctx, grain, K.frame, 0.05, 'overlay');
    const v = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.4, W / 2, H / 2, Math.max(W, H) * 0.7); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.4)'); ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
  },
};
