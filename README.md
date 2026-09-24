# Video Estilos Pro — 30 estilos de video animado 100% código

Skill para Claude Code: le das un tema y Claude te entrevista, escribe el guion, elige contigo uno de **30 estilos premium** y renderiza el video animado en MP4 (16:9 o 9:16), con subtítulos, efectos de sonido, música y tu voz en off sincronizada. Todo lo dibuja código (JavaScript + canvas): cero imágenes o video generados con IA.

## Instalar
1. Descomprime `video-estilos-pro.zip` dentro de `~/.claude/skills/` (debe quedar `~/.claude/skills/video-estilos-pro/SKILL.md`).
2. Necesitas: **Node.js 18+**, **Python 3**, **ffmpeg** (`brew install ffmpeg` en Mac, `winget install ffmpeg` en Windows).
3. Abre Claude Code en una carpeta vacía y escribe: *"hazme un video animado sobre …"* — el skill se encarga del resto (la primera vez instala Playwright/Chromium y numpy).

Opcional:
- **Tu foto**: se recorta sola con `rembg` (Claude lo instala si se lo pides).
- **Música**: llave de api.sunoapi.org en `~/.config/video-estilos-pro/keys.env` → `SUNO_API_KEY=...`
- **Tu voz en off**: `faster-whisper` para subtítulos exactos palabra por palabra.

## Los 30 estilos
Mira `catalogo/catalogo.jpg`. Cambiar de estilo = cambiar una palabra (`style: 'noir'`); el guion se queda igual.

01 acuarela · 02 papel · 03 suizo · 04 codigo · 05 riso · 06 patente · 07 pop · 08 noir · 09 pixel · 10 generativo · 11 bauhaus · 12 constructivista · 13 brutalista · 14 artdeco · 15 tarot · 16 keynote · 17 minimal · 18 datos · 19 isometrico · 20 manga · 21 cosmos · 22 plano · 23 cartografia · 24 ukiyoe · 25 collage · 26 cuaderno · 27 crt · 28 glitch · 29 hud · 30 synthwave

## Frases útiles
- "Hazme un reel vertical de 30 s sobre … en estilo manga"
- "Usa mi foto y mi voz en off (audio/vo.wav)"
- "Muéstrame el mismo video en 3 estilos distintos"
- "Ponle el color de mi marca: #00A6A6"

Hecho por Horizontes IA · Exclusivo para miembros de la comunidad. No se redistribuye.
