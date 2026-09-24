# Problemas comunes

| síntoma | causa | arreglo |
|---|---|---|
| `No encontré Chromium` / `Executable doesn't exist` | falta el navegador de Playwright | `npx playwright install chromium` (render.mjs también busca cualquier versión ya descargada) |
| Todo sale con fuente genérica (Times/Arial) | sin internet: las fuentes vienen de Google Fonts | conecta a internet y vuelve a renderizar |
| Texto cortado o encimado | título demasiado largo para la caja | acorta el título (≤ 7 palabras) o usa `\n`; en listas ≤ 6 palabras por item |
| La foto se ve con halo o fondo | recorte malo | foto de frente con buena luz y fondo liso; vuelve a correr `cutout.py`; revisa `assets/persona.png` |
| La cabeza sale cortada | foto muy cerrada | usa una foto de medio cuerpo con espacio sobre la cabeza |
| Subtítulos desfasados | `dur` no coincide con la voz | corre `vo_words.py`, ajusta `dur` y usa `words: 'audio/words.json'` |
| `Falta SUNO_API_KEY` | no hay llave | guárdala en `~/.config/video-estilos-pro/keys.env` |
| Suno 403/429 | límite de la API o User-Agent | espera y reintenta; el script ya manda User-Agent de navegador |
| `ModuleNotFoundError: numpy` | falta numpy para los SFX | `.venv/bin/pip install numpy` (build.sh usa .venv si existe) |
| Render muy lento | estilo pesado + 60 fps / 4K | usa 30 fps (default); cierra otras apps; los estilos precalculan lo pesado |
| El mp4 pesa demasiado para WhatsApp | calidad máxima | manda `<nombre>-movil.mp4` |
| Página en blanco / `PAGE ERROR` | error de JS en video.js (coma, comilla) | lee el error que imprime render.mjs; valida con `node -e "import('./video.js')"` |
