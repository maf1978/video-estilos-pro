// Spec used to render the style catalog (same content in every style so they compare fairly).
export default {
  style: 'suizo', format: '16:9', fps: 30,
  person: { photo: 'assets/persona.png', look: { skin: '#E0AC88', hair: '#231A15', hairStyle: 'swoop', shirt: '#1E1F26' } },
  mascot: 'clawd',
  scenes: [
    { type: 'hook', dur: 4, title: 'Tu idea, *animada* en minutos', kicker: '100% código · cero IA de imágenes', prompt: 'Haz un video animado sobre mi tema', say: 'Le das un tema a Claude y te regresa un video animado.' },
    { type: 'list', dur: 4.5, title: 'Lo que hace *por ti*', items: ['Escribe la historia', 'Diseña cada escena', 'Anima y sincroniza'], say: 'Escribe la historia, diseña cada escena y la anima.' },
    { type: 'stat', dur: 4, kicker: 'estilos incluidos', value: 30, label: 'looks distintos, un solo prompt', say: 'Treinta estilos distintos.' },
  ],
};
