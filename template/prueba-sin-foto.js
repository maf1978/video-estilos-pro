// QA spec #2: another topic, no photo (drawn character), different mascot. Every style must look good with this too.
export default {
  style: 'suizo', format: '16:9', fps: 30,
  person: { look: { skin: '#C98E6B', hair: '#3B2418', hairStyle: 'curly', shirt: '#2F5D62', glasses: true } },
  mascot: 'blob',
  scenes: [
    { type: 'hook', dur: 4.5, title: 'Ahorra *$2,000* al mes sin sufrir', kicker: 'finanzas personales', prompt: '¿Cuánto gasto en suscripciones?', say: 'Te voy a enseñar a ahorrar dos mil pesos al mes sin sufrir.' },
    { type: 'list', dur: 5, title: 'Las 3 fugas de *dinero*', items: ['Suscripciones olvidadas', 'Comida a domicilio', 'Compras por impulso'], say: 'Estas son las tres fugas de dinero más comunes.' },
    { type: 'stat', dur: 4, kicker: 'promedio en México', value: 1850.5, prefix: '$', decimals: 2, label: 'gastados al mes en apps que no usas', say: 'En promedio, mil ochocientos pesos al mes.' },
    { type: 'cta', dur: 4, title: 'Empieza *hoy*', sub: 'Descarga la plantilla gratis', button: 'Link en la descripción', say: 'Empieza hoy con la plantilla gratis.' },
  ],
};
