export default {
  style: 'hawkguru',
  format: '9:16',
  fps: 30,
  chrome: false,
  captions: true,
  person: false,
  mascot: 'none',
  palette: {
    bg: '#0B0F14', ink: '#F2F2F7', accent: '#F4B91A', muted: '#8B9099',
    panel: '#141A22', line: 'rgba(242,242,247,.16)', good: '#10B981', bad: '#E63946', mascot: '#F4B91A',
  },
  scenes: [
    {
      type: 'hook', dur: 3.0, person: false,
      kicker: 'this week only',
      title: 'Taking *2*\nclients.',
      prompt: 'Home services. Not everyone.',
      say: 'Two spots. This week.',
    },
    {
      type: 'list', dur: 4.4,
      title: 'What I run',
      items: [
        'Facebook + Instagram ads',
        'Follow-up the second they inquire',
        'No lead sitting in the DMs',
      ],
      say: 'Ads. Instant follow-up. No missed lead.',
    },
    {
      type: 'statement', dur: 3.8,
      kicker: 'the demo',
      title: 'I build the\n*demo first.*',
      sub: 'You see the plan before you pay.',
      say: 'I record the demo for your shop first.',
    },
    {
      type: 'cta', dur: 3.8,
      title: 'Tag them.\nOr *DM me.*',
      sub: '2 spots. Then I close the door.',
      button: 'Comment "HAWK"',
      say: 'Tag them. Or DM me.',
    },
  ],
};
