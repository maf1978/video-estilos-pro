export default {
  style: 'hawkguru', format: '9:16', fps: 30, chrome: false, captions: true, person: false, mascot: 'none',
  scenes: [
    { type: 'hook', dur: 3.0, person: false, kicker: 'how they choose', title: 'Not the\n*cheap* one.', prompt: '3 quotes. Same job.', say: 'They don\'t pick cheap.' },
    { type: 'statement', dur: 2.6, kicker: 'the rule', title: 'They book who\n*texted first.*', sub: 'Speed beats the estimate.', say: 'They book whoever texted first.' },
    { type: 'compare', dur: 3.4, title: 'Same lead. *Two endings.*', left: { title: 'Tomorrow', items: ['You call back', 'Job already gone'] }, right: { title: '5 seconds', items: ['Text goes out', 'On your calendar'] }, say: 'Call tomorrow. Job is gone.' },
    { type: 'stat', dur: 3.0, kicker: 'the window', value: 5, suffix: 's', label: 'to text them back', say: 'Five seconds. That is the window.' },
    { type: 'cta', dur: 3.0, title: 'Be first.\n*Keep the job.*', sub: 'hawkguru.com', button: 'Comment "HAWK"', say: 'Comment hawk. Keep the job.' },
  ],
};
