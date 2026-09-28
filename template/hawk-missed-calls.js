export default {
  style: 'hawkguru', format: '9:16', fps: 30, chrome: false, captions: true, person: false, mascot: 'none',
  scenes: [
    { type: 'hook', dur: 2.8, person: false, kicker: 'after hours', title: 'You *missed*\nthe job.', prompt: '8:14 PM  ·  rang twice', say: 'They called. You missed it.' },
    { type: 'stat', dur: 3.2, kicker: 'voicemail', value: 80, suffix: '%', label: 'call the next company', say: 'Eighty percent call the next guy.' },
    { type: 'statement', dur: 2.8, kicker: 'text-back', title: 'Answer in\n*5 seconds.*', sub: 'The job stays on your truck.', say: 'Text back in five seconds.' },
    { type: 'compare', dur: 3.2, title: 'Missed vs *answered*', left: { title: 'Voicemail', items: ['Nobody picks up', 'They dial the next guy'] }, right: { title: 'Text-back', items: ['Reply in 5 seconds', 'The job stays yours'] }, say: 'Voicemail loses it. Text-back keeps it.' },
    { type: 'cta', dur: 3.0, title: 'Stop losing jobs\n*after 6pm*', sub: 'hawkguru.com', button: 'Comment "HAWK"', say: 'Comment hawk. After six.' },
  ],
};
