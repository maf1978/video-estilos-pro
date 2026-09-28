export default {
  id: 'hawkguru', name: 'Hawk Guru',
  fonts: 'Inter:wght@500;600;800;900&family=Anton',
  fontLoads: ['900 80px Inter', '800 40px Inter', '600 40px Inter', '500 30px Inter', '400 80px Anton'],
  palette: {
    bg: '#0B0F14', ink: '#F2F2F7', accent: '#F4B91A', accent2: '#F4B91A',
    muted: '#8B9099', panel: '#141A22', line: 'rgba(242,242,247,.16)',
    good: '#10B981', bad: '#E63946', mascot: '#F4B91A',
  },
  type: {
    display: s => `900 ${s}px Inter`,
    em: s => `900 ${s}px Inter`,
    body: s => `500 ${s}px Inter`,
    bodyEm: s => `800 ${s}px Inter`,
    label: s => `800 ${s}px Inter`,
    mono: s => `600 ${s}px Inter`,
    number: s => `400 ${s}px Anton`,
  },
  ls: -0.045, lh: 0.9, safeTop: 0.12,
  sfx: 'digital', transDur: 0.4, push: 0.01,
};
