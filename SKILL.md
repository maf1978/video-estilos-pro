---
name: video-estilos-pro
description: Crea videos animados 100% con código (JavaScript + canvas, sin IA de imágenes ni de video) en 30 estilos visuales premium — acuarela, papel recortado, tipografía suiza, noir, código vivo, risografía, patente grabada, neo-pop, pixel art, arte generativo, bauhaus, manga, synthwave, keynote, periodismo de datos y más — para cualquier tema y cualquier persona, en 16:9 o 9:16, con música (Suno), efectos de sonido sintetizados, subtítulos y voz en off sincronizada. Úsalo siempre que el usuario pida un video animado, una intro de YouTube, un explainer, un reel/short animado, un video "con estilo X", un video para su curso/negocio/marca, o quiera convertir un guion, tema o voz en off en un video animado, aunque no mencione este skill.
---

# Video Estilos Pro

Motor de video por código: el usuario da un tema, tú escribes el guion como una lista de escenas, eliges uno de 30 estilos y el motor lo dibuja cuadro por cuadro (canvas + Playwright + ffmpeg). Cada estilo cambia **todo**: tipografía, personajes, fondos, animaciones de entrada, transiciones, subtítulos, sonidos y música.

Archivos del skill:
- `template/` — el proyecto que se copia (motor, 30 estilos, scripts)
- `references/estilos.md` — catálogo de los 30 estilos: cuándo usar cada uno. **Léelo antes de recomendar un estilo.**
- `references/guion.md` — tipos de escena, campos y cómo escribir un guion que retenga. **Léelo antes de escribir el guion.**
- `references/historia.md` — **modo historia**: personaje continuo, cámara, transiciones dentro de la historia, escenarios, lápiz que dibuja en vivo. Para intros, historias y todo lo que deba sentirse como un solo video.
- `references/errores.md` — errores reales que ya se cometieron con este skill. **Léelo antes de mostrar cualquier borrador.**
- `references/crear-estilos.md` — contrato de un estilo (para ajustar uno o crear el 31)
- `references/problemas.md` — errores comunes y cómo arreglarlos
- `catalogo/` — una imagen por estilo (`<id>.jpg`, `<id>-2.jpg`) y `catalogo.jpg` con todos

## 0 · Preparar (solo la primera vez en cada máquina)
```bash
cp -r ~/.claude/skills/video-estilos-pro/template ./<nombre-proyecto> && cd <nombre-proyecto>
npm install && npx playwright install chromium
python3 -m venv .venv && .venv/bin/pip install numpy          # SFX
# opcionales: .venv/bin/pip install "rembg[cpu]" pillow  (recortar foto)   ·   faster-whisper  (voz en off)
```
Música: guarda la llave de Suno (api.sunoapi.org) en `~/.config/video-estilos-pro/keys.env` como `SUNO_API_KEY=...` (chmod 600). Nunca la imprimas.

## 1 · Entrevista (un solo mensaje, antes de construir nada)
Pregunta lo que falte, con opciones sugeridas para que conteste rápido:
1. **Tema y objetivo** del video (¿qué debe sentir/hacer quien lo ve?) y público.
2. **Formato y duración**: YouTube 16:9 o Reel/TikTok/Short 9:16; 20–90 s.
3. **Voz**: ¿vas a narrar tú (ya grabado / lo grabas después) o solo texto en pantalla?
4. **Persona en el video**: una foto de frente, medio cuerpo (se recorta sola) — o descríbete para el personaje dibujado (piel, pelo y peinado: swoop/short/long/bob/bun/ponytail/curly/bald, lentes, barba, color de ropa). O sin persona.
5. **Mascota**: clawd / bot / blob / ninguna.
6. **Estilo**: manda `catalogo/catalogo.jpg` (o las imágenes individuales) y recomienda 3 estilos que encajen con el tema y el tono, explicando en una línea por qué. Si el usuario ya sabe cuál, úsalo.
7. **Material real**: capturas, cifras, testimonios, logos (se muestran con `media`); CTA final.

## 2 · Elige el modo
- **Modo historia** (recomendado para intros, historias, explicaciones con narrativa): un personaje continuo recorre escenarios; la cámara lo sigue; cada escena tiene un objeto con el que interactúa; se pueden mezclar estilos. Ver `references/historia.md` y `template/historia.example.js`.
- **Modo escenas** (listicles rápidos, videos de datos): tipos `hook/list/stat/compare…` con layouts automáticos. Ver `references/guion.md`.
Si dudas, pregunta: "¿lo quieres como una historia continua o como explicación rápida por puntos?".

## 2b · Guion y storyboard (muestra antes de renderizar)
Sigue `references/guion.md`. Primero escribe lo que se **dice** (`say`) como una historia con gancho en los primeros 3 s; luego asigna a cada frase el tipo de escena que mejor la muestra. Presenta una tabla: # · tipo · título en pantalla · lo que se dice · duración. Ajusta con el usuario.

## 3 · Construir `video.js`
Un solo objeto (ver `template/video.js`): `style`, `format`, `person`, `mascot`, `scenes[]`. `*asteriscos*` marcan las palabras enfatizadas. Rutas de imágenes relativas al proyecto (`assets/...`).
Foto: `python3 cutout.py foto.jpg` → `assets/persona.png`.

## 4 · QA visual (obligatorio)
```bash
node render.mjs --scenes              # un cuadro por escena → stills/
python3 contact.py stills qa.jpg      # hoja de contacto
```
Mira la hoja (Read) y repasa `references/errores.md`. Busca: textos cortados o encimados, títulos demasiado largos (acórtalos), escenas vacías, capturas ilegibles. Revisa también una transición: `node render.mjs --stills <inicio_escena+0.25>`. Corrige y repite hasta que todo esté limpio. Para cambiar de estilo solo cambia `style` (prueba con `--query "style=noir"` sin editar).

## 5 · Audio
- **Voz en off** (si hay): ponla en `audio/vo.wav|mp3`, corre `python3 vo_words.py audio/vo.wav` (usa AssemblyAI si hay `ASSEMBLYAI_API_KEY`; es lo recomendado para cortes y sincronía). Con las marcas de tiempo, ajusta `dur` de cada escena para que empiece cuando empieza su frase, y pon `words: 'audio/words.json'` en `video.js` (subtítulos palabra por palabra exactos).
- **Música**: toma el `music` del estilo (en `styles/<id>.js`), adáptalo al tema y genera: `python3 suno_music.py "<prompt>" "<título>" audio/music.mp3`. Opcional: `python3 beats.py audio/music.mp3` y `beats: 'audio/beats.json'` en `video.js` para que los cortes caigan en el beat.
- Los SFX salen solos del perfil del estilo (no hay que hacer nada).

## 6 · Render y entrega
```bash
./build.sh <nombre>     # → <nombre>.mp4 (máxima calidad) y <nombre>-movil.mp4 (<30 MB para mandar)
```
Mira 3–4 cuadros del mp4 final (ffmpeg -ss) antes de entregar. Entrega ambos archivos y di duración, estilo y qué puede pedir cambiar (textos, estilo, ritmo, música).

## Reglas
- 100% código: nunca generes imágenes o video con IA para el video. La música de Suno sí es IA (audio): no digas que la música es código.
- Una idea por escena; títulos cortos (≤ 7 palabras); nada de texto de relleno.
- No uses la misma escena dos veces seguidas; alterna ritmo (escenas rápidas de 2.5–3 s con otras de 5 s).
- Datos, cifras y testimonios deben ser reales y del usuario. Si falta uno, pregunta o usa un marcador evidente y avisa.
- Si el usuario pide "otro estilo", re-renderiza con `style` distinto: el guion no cambia.
- Nunca pongas en pantalla el nombre de un tercero (miembro, cliente, alumno) sin permiso: usa "un miembro de la comunidad".
- Lo que muestras debe coincidir con lo que regalas/vendes (no enseñes estilos que el espectador no va a recibir sin aclararlo).
- En historias usa `chrome: false` (sin encabezados de página) y pocas cosas por escena.
