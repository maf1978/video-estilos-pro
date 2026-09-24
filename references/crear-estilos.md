# Cómo está hecho un estilo (styles/<id>.js)

Un estilo es un objeto que decide **cómo se ve** cada cosa. El motor (`engine/core.js`) decide **dónde y cuándo** aparece (layouts de cada tipo de escena) y le pasa al estilo cajas `{x,y,w,h}` y un progreso `p` (0→1, ya con easing) para que anime la entrada. Todo es función pura del tiempo: nada de `Math.random`, `setTimeout` ni estado entre cuadros (usa `L.rng(seed)`, `K.t`, `K.frame`).

## Campos
| campo | qué es |
|---|---|
| `id`, `name` | id = nombre del archivo |
| `fonts` | query de Google Fonts (lo que va después de `family=`) |
| `fontLoads` | lista de fuentes CSS a precargar (`'italic 500 60px Fraunces'`) |
| `palette` | `bg, ink, accent, muted, panel, line, good, bad, mascot` |
| `type` | funciones `size → css font`: `display, em, body, bodyEm, label, mono` (+ las tuyas) |
| `ls`, `lh`, `upper` | tracking/interlineado/mayúsculas de los títulos |
| `sfx` | perfil de sonido: `paper, ink, digital, film, retro, soft, pop, mechanical, cosmic` |
| `music` | prompt para Suno (instrumental, BPM, mood) |
| `transDur`, `push`, `camera`, `beatBump` | duración de transición, zoom lento por escena, cámara on/off |
| `setup(K)` | async, una vez: pre-calcula texturas, fondos, tratamientos de foto |

## Primitivas (todas opcionales; si no las defines se usa BASE)
`background(K,s)` · `decor(K,s)` (encima de la escena) · `overlay(K)` (encima de todo: grano, viñeta)
`headline(K,str,box,p,s,o)` · `text(K,str,box,p,role,s,o)` roles: kicker, body, label, item, step, headGood, headBad, good, bad
`panel(K,box,p,s,kind,j)` kind: row, good, bad, note · `bullet(K,i,box,p,s)` · `number(K,str,box,p,s,o)` (o.small en chapter)
`quote(K,str,box,p,s)` · `portrait(K,box,p,s)` · `mascot(K,box,p,s,mood)` · `media(K,img,box,p,s,frame)` frame: phone, browser, plain
`prompt(K,str,box,p,s,tp)` (tp = progreso de tecleo) · `caption(K,words,act,box,p)` (act = palabra activa)
`connector(K,a,b,p,s)` · `button(K,str,box,p,s)` · `transition(K,A,B,p,info)` (A,B = canvas de la escena que sale/entra; info.raw = progreso lineal)

`s` = `{ i, type, d (datos de la escena), t (seg locales), dur, p }`. Usa `s.i` para variar fondos entre escenas.

## Kit K
`K.ctx, K.W, K.H, K.u` (escala: 1 en 1080p), `K.vertical`, `K.t`, `K.frame`, `K.P` (paleta), `K.S` (el estilo), `K.look` (personaje), `K.person`, `K.photo`, `K.spec`
`K.subject(h)` → la persona como píxeles a altura h (foto recortada o, si no hay foto, el personaje dibujado): `{c, w, h, data, L (luminancia), A (alfa)}`
`K.rich(str)` tokens con *énfasis* · `K.box()` / `K.boxFull()`
Helpers en `engine/base.js`: `title, para, layoutRich, drawRich` (reveal: rise, wipe, fade, type, words · emStyle: color, highlight, underline, box), `drawFrame, fitSubject, fitCharacter, cover, contain`
Helpers en `engine/lib.js`: `character` (personaje con peinados swoop/short/long/bob/bun/ponytail/curly/bald, lentes, barba), `mascot` (clawd/bot/blob), `watercolor, washFill, wobbleStroke, inkPath, cutFill, cutRect, paperTex, paper, halftone, engrave, mapPixels, memo, grainTiles, drawGrain, noise2, rng, E (easing), prog, clamp, lerp, mix, rgba, star, wrap, fit`

## Reglas que hacen que un estilo funcione con cualquier persona y tema
1. **Personaje**: o usas `K.subject(h)` y lo tratas (semitono, grabado, ASCII, duotono, pixel…) — sirve con foto o sin foto — o dibujas `L.character(ctx, x, y, s, K.look, {fill, stroke})` con tu propio relleno/trazo. Nunca dependas de rasgos de una persona concreta.
2. **Texto**: nunca pongas texto fijo del tema; todo viene de la escena. Usa `title/para` (se auto-ajustan a la caja). Respeta *énfasis*.
3. **Caro de calcular = en `setup` o con `L.memo`** (texturas, tratamientos de foto por altura, acuarelas por tamaño). Un cuadro debe dibujarse en < 150 ms.
4. **Transición propia** y motivada por el estilo (papel que se desliza, glitch, tinta que sangra, pixel dissolve…).
5. **Ambiente vivo**: algo se mueve siempre (boil de línea, grano que cambia, luz que respira, partículas deterministas) pero sutil.
6. 16:9 **y** 9:16: revisa las dos. Los subtítulos viven en la franja inferior; no pongas contenido ahí.
7. Madurez: nada de "infantil" salvo que el estilo lo pida; tipografía con carácter, paleta con intención.
