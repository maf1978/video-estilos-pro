// Loads the video spec + its style and boots the engine.  ?style=<id> and ?spec=<file> override (used by the catalog).
import { boot } from './engine/core.js';
const q = new URLSearchParams(location.search);
const spec = (await import('./' + (q.get('spec') || 'video.js'))).default;
if (q.get('style')) spec.style = q.get('style');
if (q.get('format')) spec.format = q.get('format');
const style = (await import(`./styles/${spec.style}.js`)).default;
await boot(spec, style);
