// Collage de revista — letras recortadas tipo "ransom", papel rasgado con fibra blanca, foto B/N recortada a mano, cinta de etiquetadora, grapas.
import * as L from '../engine/lib.js';
import { BASE, para, layoutRich, fitSubject, drawFrame } from '../engine/base.js';

const NEWS = '#ECE7DC', BLK = '#161412', RED = '#D7261E', YEL = '#F6D02F', BLUE = '#1F4FA8', KRAFT = '#C9A57A', WHITE = '#FBFAF6';
const FONTS = [s => `400 ${s}px "Abril Fatface"`, s => `400 ${s}px "Archivo Black"`, s => `400 ${s}px "Bebas Neue"`, s => `italic 900 ${s}px "Playfair Display"`, s => `700 ${s}px "Courier Prime"`, s => `400 ${s}px Anton`, s => `400 ${s}px "Rubik Mono One"`];
const SCRAPS = [[WHITE, BLK], [BLK, WHITE], [YEL, BLK], [NEWS, BLK], [WHITE, RED], [BLUE, WHITE], ['#E9DFC8', BLK]];
let backs = [], grain;
// torn-paper path: jagged high-frequency edge
function torn(x, y, w, h, seed, amp = 3) {
  const r = L.rng(seed), p = new Path2D(), pts = [], st = 7;
  const seg = (x1, y1, x2, y2) => { const n = Math.max(2, Math.round(Math.hypot(x2 - x1, y2 - y1) / st)); for (let i = 0; i < n; i++) pts.push([x1 + (x2 - x1) * i / n + (r() - 0.5) * amp, y1 + (y2 - y1) * i / n + (r() - 0.5) * amp]); };
  seg(x, y, x + w, y); seg(x + w, y, x + w, y + h); seg(x + w, y + h, x, y + h); seg(x, y + h, x, y);
  pts.forEach(([a, b], i) => i ? p.lineTo(a, b) : p.moveTo(a, b)); p.closePath(); return p;
}
function scrap(ctx, x, y, w, h, col, seed, u, rim = true) { // torn piece with white fibre rim + soft shadow
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.28)'; ctx.shadowBlur = 8 * u; ctx.shadowOffsetY = 3 * u;
  if (rim) { ctx.fillStyle = WHITE; ctx.fill(torn(x - 2.5 * u, y - 2.5 * u, w + 5 * u, h + 5 * u, seed + 1, 4 * u)); ctx.shadowColor = 'transparent'; }
  ctx.fillStyle = col; ctx.fill(torn(x, y, w, h, seed, 3 * u)); ctx.restore();
}
const tape = (ctx, x, y, a, u, w = 90) => { ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.fillStyle = 'rgba(240,232,205,.72)'; ctx.fillRect(-w / 2 * u, -14 * u, w * u, 28 * u); ctx.restore(); };
const staple = (ctx, x, y, a, u) => { ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.strokeStyle = '#8E9196'; ctx.lineWidth = 3 * u; ctx.beginPath(); ctx.moveTo(-14 * u, 0); ctx.lineTo(14 * u, 0); ctx.stroke(); ctx.strokeStyle = 'rgba(255,255,255,.6)'; ctx.lineWidth = 1 * u; ctx.beginPath(); ctx.moveTo(-13 * u, -1 * u); ctx.lineTo(13 * u, -1 * u); ctx.stroke(); ctx.restore(); };
function ransom(K, str, box, p, o = {}) { // every letter cut from a different magazine
  const ctx = K.ctx, u = K.u, R = layoutRich(ctx, K.rich(str), box, { font: sz => `400 ${sz}px "Archivo Black"`, max: (o.max || 150) * u, min: 18 * u, lh: 1.3, ls: 0.12, upper: true });
  const n = R.lines.length, y0 = box.y + (box.h - n * R.lh) / 2, total = R.lines.reduce((a, l) => a + l.reduce((b, t) => b + t.w.length, 0), 0); let li = 0;
  R.lines.forEach((line, i) => {
    const x0 = o.align === 'center' ? box.x + (box.w - R.widths[i]) / 2 : box.x, cy = y0 + i * R.lh + R.lh / 2;
    line.forEach(t => {
      ctx.font = R.font; ctx.letterSpacing = R.ls + 'px'; let x = x0 + t.x;
      for (const ch of t.w) {
        ctx.font = R.font; ctx.letterSpacing = R.ls + 'px'; const adv = ctx.measureText(ch).width, k = li++;
        const lp = L.clamp(p * (total * 0.22 + 1) - k * 0.22); if (lp <= 0) { x += adv; continue; }
        const r = L.rng(k * 31 + str.length * 7 + (o.seed || 0)), [bg, fg] = t.em ? (r() < 0.5 ? [RED, WHITE] : [YEL, RED]) : SCRAPS[Math.floor(r() * SCRAPS.length)], F = FONTS[Math.floor(r() * FONTS.length)];
        const sz = R.size * (0.82 + r() * 0.3); ctx.font = F(sz); ctx.letterSpacing = '0px'; let cw = ctx.measureText(ch).width; const fs = cw > adv * 0.92 ? sz * adv * 0.92 / cw : sz; ctx.font = F(fs); cw = ctx.measureText(ch).width;
        const e = L.E.back(lp), rot = (r() - 0.5) * 0.22 + (1 - e) * 0.6, pw = adv * (0.96 + r() * 0.1), ph = R.size * (1.02 + r() * 0.2);
        ctx.save(); ctx.translate(x + adv / 2, cy + (r() - 0.5) * R.size * 0.08); ctx.rotate(rot); ctx.scale(0.5 + 0.5 * e, 0.5 + 0.5 * e); ctx.globalAlpha = L.clamp(lp * 4);
        scrap(ctx, -pw / 2, -ph / 2, pw, ph, bg, k * 5 + 3, u, bg !== WHITE);
        ctx.fillStyle = fg; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(ch, 0, fs * 0.04); ctx.restore();
        x += adv;
      }
    });
  });
}
function dymo(K, str, box, p, o = {}) { // label-maker tape with embossed white letters
  const ctx = K.ctx, u = K.u; if (p <= 0) return; const f = K.S.type.label(o.size || 30 * u); ctx.font = f; ctx.letterSpacing = 3 * u + 'px';
  const txt = str.toUpperCase(), w = Math.min(box.w, ctx.measureText(txt).width + 40 * u), h = Math.min(box.h, (o.size || 30 * u) * 1.7), x = o.align === 'center' ? box.x + (box.w - w) / 2 : box.x, y = box.y + (box.h - h) / 2;
  ctx.save(); ctx.translate(x, y + h / 2); ctx.rotate(o.rot ?? -0.012); ctx.fillStyle = o.tape || BLK; L.rrect(ctx, 0, -h / 2, w * L.E.out(p), h, 4 * u); ctx.fill();
  ctx.beginPath(); ctx.rect(0, -h / 2, w * L.E.out(p), h); ctx.clip(); ctx.textBaseline = 'middle'; ctx.fillStyle = 'rgba(0,0,0,.5)'; ctx.fillText(txt, 20 * u + 1.5, 2); ctx.fillStyle = o.ink || '#F4F1EA'; ctx.fillText(txt, 20 * u, 0); ctx.restore();
}
const BW = L.memo(h => { // high-contrast B/W cut-out with a rough hand-cut white border
  const S = window.K.subject(h), bw = L.mapPixels(S, (r, g, b, a, x, y, l) => { const v = Math.pow(L.clamp((l - 0.08) * 1.8), 1.15) * 255; return [v, v * 0.98, v * 0.94, a]; });
  const pad = Math.round(h * 0.03), c = L.canvas(S.w + pad * 2, S.h + pad), x = c.getContext('2d'), n = L.noise2(7);
  for (let a = 0; a < 20; a++) { const ang = a / 20 * 6.283, rr = pad * (0.55 + 0.45 * n(a * 1.7, 3)); x.drawImage(S.c, pad + Math.cos(ang) * rr, pad + Math.sin(ang) * rr); }
  x.globalCompositeOperation = 'source-in'; x.fillStyle = WHITE; x.fillRect(0, 0, c.width, c.height); x.globalCompositeOperation = 'source-over'; x.drawImage(bw, pad, pad); return c;
});
const MAS = L.memo((kind, w, h, col) => { const pad = 10, c = L.canvas(w + pad * 2, h + pad * 2), x = c.getContext('2d'); L.mascot(x, kind, { x: pad, y: pad, w, h }, { color: col, outline: false, eye: BLK }); const o = L.canvas(c.width, c.height), ox = o.getContext('2d'); for (let a = 0; a < 16; a++) ox.drawImage(c, Math.cos(a / 16 * 6.283) * 7, Math.sin(a / 16 * 6.283) * 7); ox.globalCompositeOperation = 'source-in'; ox.fillStyle = WHITE; ox.fillRect(0, 0, o.width, o.height); ox.globalCompositeOperation = 'source-over'; ox.drawImage(c, 0, 0); return o; });

export default {
  id: 'collage', name: 'Collage de revista',
  fonts: 'Abril+Fatface&family=Archivo+Black&family=Bebas+Neue&family=Playfair+Display:ital,wght@1,900&family=Courier+Prime:wght@400;700&family=Anton&family=Rubik+Mono+One',
  fontLoads: ['400 60px "Abril Fatface"', '400 60px "Archivo Black"', '400 60px "Bebas Neue"', 'italic 900 60px "Playfair Display"', '700 30px "Courier Prime"', '400 30px "Courier Prime"', '400 60px Anton', '400 60px "Rubik Mono One"'],
  palette: { bg: NEWS, ink: BLK, accent: RED, muted: '#3E3A35', panel: WHITE, line: 'rgba(0,0,0,.2)', good: BLUE, bad: RED, mascot: '#D97757' },
  type: { display: s => `400 ${s}px "Archivo Black"`, em: s => `italic 900 ${s}px "Playfair Display"`, body: s => `400 ${s}px "Courier Prime"`, bodyEm: s => `700 ${s}px "Courier Prime"`, label: s => `700 ${s}px "Courier Prime"`, mono: s => `700 ${s}px "Courier Prime"` },
  sfx: 'paper', transDur: 0.6, push: 0.02,
  music: 'lo-fi hip hop meets punk collage, dusty breakbeat, vinyl crackle, scratchy guitar riff, tape-saturated bass, 92 BPM, instrumental, cool and rebellious',
  async setup(K) {
    const { W, H, u } = K; grain = L.grainTiles(4, 256, 0.6, 8);
    [[NEWS, true], [KRAFT, false], ['#22201D', false]].forEach(([base, cols], v) => {
      const c = L.canvas(W, H), x = c.getContext('2d'); L.paper(x, base, { seed: 20 + v, grain: 0.06, blotch: 0.06, fibers: 700 });
      const r = L.rng(v + 3);
      if (cols) { x.fillStyle = 'rgba(40,36,30,.07)'; for (let col = 0; col < 7; col++) for (let ln = 0; ln < 60; ln++) { if (r() < 0.08) continue; x.fillRect(W * 0.03 + col * W * 0.14, H * 0.03 + ln * H * 0.016, W * (0.1 + r() * 0.025), 3 * u); } }
      // magazine scraps in the margins
      const spots = [[-0.03, -0.04], [0.82, -0.05], [-0.04, 0.72], [0.86, 0.66]];
      spots.forEach(([sx, sy], k) => { const [bg] = SCRAPS[(k + v * 2) % SCRAPS.length]; x.save(); x.translate(W * sx + 120 * u, H * sy + 90 * u); x.rotate((r() - 0.5) * 0.4); scrap(x, -140 * u, -90 * u, 280 * u, 180 * u, k === 1 ? (v === 2 ? RED : YEL) : bg === BLK && v === 2 ? '#3A3632' : bg, 60 + k * 9 + v, u); x.restore(); });
      if (v === 2) { x.fillStyle = 'rgba(255,255,255,.05)'; for (let k = 0; k < 40; k++) x.fillRect(r() * W, r() * H, 2 * u, 2 * u); }
      backs.push(c);
    });
  },
  background(K, s) { K.ctx.drawImage(backs[s.i % 3], 0, 0); },
  headline(K, str, box, p, s, o = {}) { ransom(K, str, box, p, { align: o.align, max: o.size === 'm' ? 100 : 140, seed: s.i }); },
  text(K, str, box, p, role, s, o = {}) {
    const dark = s.i % 3 === 2 && !['item', 'good', 'bad'].includes(role);
    if (role === 'kicker' || role === 'label') return dymo(K, str, box, p, { align: o.align, tape: role === 'label' ? RED : BLK, size: 26 * K.u });
    if (role === 'headGood' || role === 'headBad') return ransom(K, str, box, p, { max: 60, seed: role === 'headGood' ? 5 : 9 });
    if (role === 'body' || role === 'step') { // typed on a torn strip
      if (p <= 0) return; const ctx = K.ctx, u = K.u; ctx.font = K.S.type.body(40 * u); const w = Math.min(box.w, ctx.measureText(str).width + 60 * u), h = box.h, x = o.align === 'center' ? box.x + (box.w - w) / 2 : box.x;
      ctx.save(); ctx.globalAlpha = L.clamp(p * 2); scrap(ctx, x, box.y, w, h, WHITE, str.length + s.i, u, false); ctx.restore();
      return para(K, str, L.inset({ x, y: box.y, w, h }, 22 * u, 8 * u), p, { color: BLK, max: 40, align: o.align === 'center' ? 'center' : 'left', reveal: 'type' });
    }
    return BASE.text(K, str, box, p, role, s, { color: dark ? WHITE : role === 'bad' ? '#6A635A' : BLK, font: sz => K.S.type.bodyEm(sz), ...o });
  },
  panel(K, b, p, s, kind, j = 0) {
    if (p <= 0) return; const ctx = K.ctx, u = K.u, e = L.E.back(p), cx = b.x + b.w / 2, cy = b.y + b.h / 2, rot = ((j * 53) % 7 - 3) * 0.005;
    ctx.save(); ctx.translate(cx + (1 - e) * 40 * u, cy); ctx.rotate(rot + (1 - e) * 0.08); ctx.translate(-cx, -cy); ctx.globalAlpha = L.clamp(p * 3);
    scrap(ctx, b.x, b.y, b.w, b.h, kind === 'good' ? '#E7EEF8' : kind === 'bad' ? '#F6E3DC' : j % 2 ? '#F1E9D6' : WHITE, j * 17 + (kind === 'good' ? 90 : 7), u);
    if (kind === 'good' || kind === 'bad') { tape(ctx, b.x + b.w / 2, b.y + 2 * u, (j % 2 ? 0.05 : -0.05), u, 140); } else staple(ctx, b.x + 26 * u, b.y + 14 * u, -0.2, u);
    ctx.restore();
  },
  bullet(K, i, b, p) { // price-gun sticker
    if (p <= 0) return; const ctx = K.ctx, u = K.u, [cx, cy] = L.center(b), r = Math.min(b.w, b.h) / 2 * L.E.back(p);
    ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.25)'; ctx.shadowBlur = 6 * u; ctx.shadowOffsetY = 2 * u; ctx.fillStyle = [RED, YEL, BLUE, BLK][i % 4]; ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.fill(); ctx.restore();
    L.text(ctx, String(i + 1), cx, cy + r * 0.42, { font: `400 ${r * 1.3}px "Bebas Neue"`, color: i % 4 === 1 ? BLK : WHITE, align: 'center' });
  },
  number(K, str, box, p, s, o = {}) { ransom(K, str, box, p, { align: 'center', max: o.small ? 120 : 230, seed: 3 }); },
  quote(K, str, box, p, s) {
    if (p <= 0) return; const ctx = K.ctx, u = K.u; ctx.save(); ctx.globalAlpha = L.clamp(p * 2); scrap(ctx, box.x, box.y, box.w, box.h, WHITE, 77, u); tape(ctx, box.x + 40 * u, box.y + 4 * u, -0.5, u); tape(ctx, box.x + box.w - 40 * u, box.y + box.h - 4 * u, -0.5, u); ctx.restore();
    para(K, '“' + str + '”', L.inset(box, box.w * 0.06, box.h * 0.12), L.clamp(p * 1.3 - 0.2), { font: sz => K.S.type.em(sz), color: BLK, max: 80, lh: 1.12, reveal: 'words' });
  },
  portrait(K, box, p, s) { // B/W cut-out on a torn colour block
    if (p <= 0) return; const ctx = K.ctx, u = K.u, f = fitSubject(K, { ...box, h: box.h * 0.92 }), img = BW(f.subj.h), e = L.E.out(p);
    const blk = { x: box.x + box.w * 0.08, y: box.y + box.h * 0.12, w: box.w * 0.84, h: box.h * 0.8 };
    ctx.save(); ctx.globalAlpha = L.clamp(p * 3); ctx.translate(blk.x + blk.w / 2, blk.y + blk.h / 2); ctx.rotate(-0.03 + (1 - e) * -0.1); ctx.translate(-(blk.x + blk.w / 2), -(blk.y + blk.h / 2));
    scrap(ctx, blk.x, blk.y, blk.w, blk.h, [RED, YEL, BLUE][s.i % 3], 40 + s.i, u); ctx.restore();
    const pad = Math.round(f.subj.h * 0.03); ctx.save(); ctx.globalAlpha = L.clamp(p * 2 - 0.3); ctx.translate(0, (1 - e) * 60 * u); ctx.shadowColor = 'rgba(0,0,0,.35)'; ctx.shadowBlur = 14 * u; ctx.shadowOffsetY = 6 * u;
    ctx.drawImage(img, f.x - pad, box.y + box.h * 0.08 + f.y - box.y - pad * 0.3); ctx.restore();
    tape(ctx, blk.x + blk.w * 0.2, blk.y + 6 * u, -0.4, u);
  },
  mascot(K, box, p, s, mood) {
    if (p <= 0) return; const ctx = K.ctx, e = L.E.back(p), img = MAS(K.spec.mascot, Math.round(box.w), Math.round(box.h), K.P.mascot);
    ctx.save(); ctx.translate(box.x + box.w / 2, box.y + box.h / 2); ctx.rotate(0.08 - (1 - e) * 0.5); ctx.scale(e, e); ctx.shadowColor = 'rgba(0,0,0,.3)'; ctx.shadowBlur = 8 * K.u; ctx.shadowOffsetY = 3 * K.u; ctx.drawImage(img, -img.width / 2, -img.height / 2 + Math.sin(K.t * 3) * 3 * K.u); ctx.restore();
  },
  media(K, img, box, p, s, frame) {
    if (p <= 0) return; const ctx = K.ctx, u = K.u, [cx, cy] = L.center(box); ctx.save(); ctx.translate(cx, cy); ctx.rotate(-0.025 + (1 - L.E.out(p)) * 0.1); ctx.translate(-cx, -cy);
    scrap(ctx, box.x + box.w * 0.08, box.y + box.h * 0.04, box.w * 0.84, box.h * 0.92, YEL, 93, u);
    const o = drawFrame(K, img, box, p, frame, { bezel: BLK, shadowColor: 'rgba(0,0,0,.35)' }); ctx.globalAlpha = L.clamp(p * 2 - 1); staple(ctx, o.x + o.w * 0.5, o.y + 10 * u, 0.1, u); tape(ctx, o.x + 10 * u, o.y + o.h - 10 * u, 0.7, u); ctx.restore();
  },
  prompt(K, str, box, p, s, tp) {
    if (p <= 0) return; const ctx = K.ctx, u = K.u; ctx.save(); ctx.globalAlpha = L.clamp(p * 2); ctx.translate(box.x + box.w / 2, box.y + box.h / 2); ctx.rotate(-0.012); ctx.translate(-(box.x + box.w / 2), -(box.y + box.h / 2));
    scrap(ctx, box.x, box.y, box.w, box.h, WHITE, 101, u); staple(ctx, box.x + 24 * u, box.y + 12 * u, -0.3, u); ctx.restore();
    para(K, str.slice(0, Math.ceil(str.length * tp)) + (tp < 1 || (K.frame >> 3) % 2 ? '_' : ''), L.inset(box, 26 * u, 12 * u), 1, { font: sz => K.S.type.bodyEm(sz), color: BLK, max: 32, valign: 'middle' });
  },
  caption(K, words, act, box, p) { // label-maker tape; the spoken word is punched in yellow
    const ctx = K.ctx, u = K.u; ctx.save(); ctx.globalAlpha = p; ctx.font = K.S.type.label(32 * u); ctx.letterSpacing = 2 * u + 'px';
    const txt = words.map(w => w.toUpperCase()), w = Math.min(box.w, ctx.measureText(txt.join(' ')).width + 60 * u), x = box.x + (box.w - w) / 2;
    ctx.fillStyle = BLK; L.rrect(ctx, x, box.y, w, box.h, 5 * u); ctx.fill(); let cx = x + 30 * u; const y = box.y + box.h * 0.66;
    txt.forEach((wd, i) => { ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillText(wd, cx + 1.5, y + 2); ctx.fillStyle = i === act ? YEL : i < act ? '#F4F1EA' : '#8A857C'; ctx.fillText(wd, cx, y); cx += ctx.measureText(wd + ' ').width; });
    ctx.restore();
  },
  connector(K, a, b, p) { // red string between pins
    if (p <= 0) return; const ctx = K.ctx, u = K.u; ctx.save(); ctx.strokeStyle = RED; ctx.lineWidth = 3 * u; ctx.beginPath(); ctx.moveTo(...a); const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2 + 18 * u; const e = [a[0] + (b[0] - a[0]) * p, a[1] + (b[1] - a[1]) * p]; ctx.quadraticCurveTo(a[0] + (mx - a[0]) * p, a[1] + (my - a[1]) * p, e[0], e[1]); ctx.stroke();
    ctx.fillStyle = RED; for (const q of [a, e]) { ctx.beginPath(); ctx.arc(q[0], q[1], 6 * u, 0, 7); ctx.fill(); } ctx.restore();
  },
  button(K, str, b, p) { dymo(K, str, b, p, { tape: RED, size: Math.min(34 * K.u, b.h * 0.42), rot: -0.02 }); },
  transition(K, A, B, p, info) { // the page is ripped in two along a jagged tear and pulled apart
    const { ctx, W, H, u } = K, e = L.E.inOut(info.raw), r = L.rng(33), pts = []; ctx.drawImage(B, 0, 0);
    for (let y = -20; y <= H + 20; y += 16 * u) pts.push([W * 0.5 + (r() - 0.5) * 60 * u + (y / H - 0.5) * W * 0.12, y]);
    const half = (dir) => { const p2 = new Path2D(); const edge = dir < 0 ? -40 : W + 40; p2.moveTo(edge, -20); pts.forEach(([x, y]) => p2.lineTo(x, y)); p2.lineTo(edge, H + 20); p2.closePath(); return p2; };
    for (const dir of [-1, 1]) {
      ctx.save(); ctx.translate(dir * e * W * 0.62, (dir < 0 ? 1 : -1) * e * 40 * u); ctx.rotate(dir * e * 0.05);
      ctx.shadowColor = 'rgba(0,0,0,.4)'; ctx.shadowBlur = 30 * u; ctx.fillStyle = WHITE; ctx.fill(half(dir)); ctx.shadowColor = 'transparent';
      ctx.save(); ctx.translate(dir * -5 * u, 0); ctx.clip(half(dir)); ctx.drawImage(A, 0, 0); ctx.restore(); ctx.restore();
    }
  },
  overlay(K) { L.drawGrain(K.ctx, grain, K.frame, 0.06, 'overlay'); },
};
