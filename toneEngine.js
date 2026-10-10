// VanguardOS Tone Engine v6 — Pure frequency sweeps & musical intervals only

const ctx = () => {
  if (!window._vosAudioCtx) window._vosAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return window._vosAudioCtx;
};

const getMaster = (ac) => {
  if (!window._vosMasterBus) {
    const comp = ac.createDynamicsCompressor();
    comp.threshold.value = -6; comp.knee.value = 3; comp.ratio.value = 8;
    comp.attack.value = 0.002; comp.release.value = 0.1;
    comp.connect(ac.destination);
    window._vosMasterBus = comp;
  }
  return window._vosMasterBus;
};

// Core sweep — smooth frequency ramp between two pitches
const sweep = (ac, freqA, freqB, gainVal, start, dur, type = 'sawtooth') => {
  const o = ac.createOscillator();
  const g = ac.createGain();
  const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 3200;
  const hp = ac.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 120;
  o.type = type;
  o.connect(lp); lp.connect(hp); hp.connect(g); g.connect(getMaster(ac));
  o.frequency.setValueAtTime(freqA, ac.currentTime + start);
  o.frequency.exponentialRampToValueAtTime(freqB, ac.currentTime + start + dur * 0.55);
  o.frequency.exponentialRampToValueAtTime(freqA, ac.currentTime + start + dur);
  g.gain.setValueAtTime(0, ac.currentTime + start);
  g.gain.linearRampToValueAtTime(gainVal, ac.currentTime + start + 0.04);
  g.gain.setValueAtTime(gainVal, ac.currentTime + start + dur - 0.06);
  g.gain.linearRampToValueAtTime(0, ac.currentTime + start + dur);
  o.start(ac.currentTime + start);
  o.stop(ac.currentTime + start + dur + 0.02);
};

// Fast yelp — rapid short rise (musical minor 7th interval)
const yelp = (ac, start) => {
  const dur = 0.16;
  sweep(ac, 330, 880, 0.55, start, dur, 'sawtooth');
};

// Interval tone — plays a held frequency for a duration (pure musical pitch)
const tone = (ac, freq, gainVal, start, dur, type = 'sawtooth') => {
  const o = ac.createOscillator();
  const g = ac.createGain();
  const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 3200;
  const hp = ac.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 120;
  o.type = type;
  o.connect(lp); lp.connect(hp); hp.connect(g); g.connect(getMaster(ac));
  o.frequency.setValueAtTime(freq, ac.currentTime + start);
  g.gain.setValueAtTime(0, ac.currentTime + start);
  g.gain.linearRampToValueAtTime(gainVal, ac.currentTime + start + 0.012);
  g.gain.setValueAtTime(gainVal, ac.currentTime + start + dur - 0.04);
  g.gain.linearRampToValueAtTime(0, ac.currentTime + start + dur);
  o.start(ac.currentTime + start);
  o.stop(ac.currentTime + start + dur + 0.02);
};

const tones = {

  // ── STANDARD — 3 short ascending pitch steps (low severity)
  standard: (ac) => {
    tone(ac, 600, 0.58, 0,    0.22, 'sawtooth');
    tone(ac, 700, 0.58, 0.28, 0.22, 'sawtooth');
    tone(ac, 800, 0.58, 0.56, 0.22, 'sawtooth');
  },

  // ── PRIORITY — two-pitch interval, held (medium severity)
  priority: (ac) => {
    tone(ac, 500, 0.62, 0,    0.8, 'sawtooth');
    tone(ac, 750, 0.62, 0.85, 0.8, 'sawtooth');
    tone(ac, 500, 0.62, 1.70, 0.8, 'sawtooth');
    tone(ac, 750, 0.62, 2.55, 0.8, 'sawtooth');
  },

  // ── EMERGENCY — real paging tone: two-tone sequential burst (A-tone + B-tone) x3, then long hold
  emergency: (ac) => {
    const masterGain = ac.createGain();
    masterGain.gain.setValueAtTime(1.0, ac.currentTime);
    masterGain.connect(getMaster(ac));

    // Two-tone fire paging: 1270 Hz (A) then 554 Hz (B), repeated 3 times, then long B-tone hold
    const playPageTone = (freq, start, dur, vol = 0.85) => {
      const o = ac.createOscillator();
      const g = ac.createGain();
      // Add slight harmonic richness with a second osc
      const o2 = ac.createOscillator();
      const g2 = ac.createGain();
      o.type = 'sawtooth'; o2.type = 'square';
      o.frequency.value = freq; o2.frequency.value = freq * 1.5;
      o.connect(g); o2.connect(g2);
      g.connect(masterGain); g2.connect(masterGain);
      g2.gain.setValueAtTime(vol * 0.18, ac.currentTime + start);
      g.gain.setValueAtTime(0, ac.currentTime + start);
      g.gain.linearRampToValueAtTime(vol, ac.currentTime + start + 0.015);
      g.gain.setValueAtTime(vol, ac.currentTime + start + dur - 0.03);
      g.gain.linearRampToValueAtTime(0, ac.currentTime + start + dur);
      g2.gain.setValueAtTime(0, ac.currentTime + start);
      g2.gain.linearRampToValueAtTime(vol * 0.18, ac.currentTime + start + 0.015);
      g2.gain.setValueAtTime(vol * 0.18, ac.currentTime + start + dur - 0.03);
      g2.gain.linearRampToValueAtTime(0, ac.currentTime + start + dur);
      o.start(ac.currentTime + start); o.stop(ac.currentTime + start + dur + 0.02);
      o2.start(ac.currentTime + start); o2.stop(ac.currentTime + start + dur + 0.02);
    };

    // 3x A-tone (1270 Hz, 0.35s) + B-tone (554 Hz, 0.35s) pairs
    for (let i = 0; i < 3; i++) {
      playPageTone(1270, i * 0.78, 0.34);
      playPageTone(554,  i * 0.78 + 0.38, 0.34);
    }
    // Long final B-tone hold (3s)
    playPageTone(554, 3 * 0.78, 3.0, 0.90);
  },

  // ── SIGNAL 100 — authoritative alert tones mimicking a real emergency alerting system
  signal100: (ac) => {
    const masterGain = ac.createGain();
    masterGain.gain.setValueAtTime(1.0, ac.currentTime);
    masterGain.connect(getMaster(ac));

    const alertTone = (freq, start, dur, vol = 0.88) => {
      const o = ac.createOscillator();
      const g = ac.createGain();
      const o2 = ac.createOscillator();
      const g2 = ac.createGain();
      o.type = 'sawtooth'; o2.type = 'square';
      o.frequency.value = freq; o2.frequency.value = freq * 2;
      o.connect(g); o2.connect(g2);
      g.connect(masterGain); g2.connect(masterGain);
      g.gain.setValueAtTime(0, ac.currentTime + start);
      g.gain.linearRampToValueAtTime(vol, ac.currentTime + start + 0.012);
      g.gain.setValueAtTime(vol, ac.currentTime + start + dur - 0.04);
      g.gain.linearRampToValueAtTime(0, ac.currentTime + start + dur);
      g2.gain.setValueAtTime(0, ac.currentTime + start);
      g2.gain.linearRampToValueAtTime(vol * 0.15, ac.currentTime + start + 0.012);
      g2.gain.setValueAtTime(vol * 0.15, ac.currentTime + start + dur - 0.04);
      g2.gain.linearRampToValueAtTime(0, ac.currentTime + start + dur);
      o.start(ac.currentTime + start); o.stop(ac.currentTime + start + dur + 0.02);
      o2.start(ac.currentTime + start); o2.stop(ac.currentTime + start + dur + 0.02);
    };

    // Attention tone burst: 3 rapid high beeps
    for (let i = 0; i < 3; i++) {
      alertTone(1480, i * 0.22, 0.16, 0.92);
    }
    // Then the classic two-tone page: high sweep then low hold
    // High tone 1270 Hz x2
    alertTone(1270, 0.72, 0.55, 0.92);
    alertTone(1270, 1.32, 0.55, 0.92);
    // Drop to low tone 554 Hz — long hold (signal all-clear)
    alertTone(554, 1.92, 4.5, 0.95);
  },

  // ── Legacy tones (pure frequency / interval only)

  triple_beep: (ac) => {
    [0, 0.32, 0.64].forEach(t => tone(ac, 1100, 0.6, t, 0.24, 'square'));
  },

  pager: (ac) => {
    [[697,0],[770,0.28],[852,0.56],[941,0.84]].forEach(([f,t]) => tone(ac, f, 0.55, t, 0.22, 'sine'));
  },

  two_tone_fire: (ac) => {
    // Perfect fifth interval (C#5 / A4) — classic two-tone alert
    tone(ac, 554, 0.65, 0,   1.6, 'square');
    tone(ac, 440, 0.65, 1.7, 1.6, 'square');
  },

  long_horn: (ac) => {
    tone(ac, 220, 0.65, 0, 2.5, 'sawtooth');
    tone(ac, 330, 0.38, 0, 2.5, 'sawtooth'); // perfect fifth harmony
  },

  quick_double: (ac) => {
    tone(ac, 1050, 0.62, 0,    0.26, 'square');
    tone(ac, 1050, 0.62, 0.38, 0.26, 'square');
  },

  five_beep: (ac) => {
    [0, 0.24, 0.48, 0.72, 0.96].forEach(t => tone(ac, 1000, 0.58, t, 0.18, 'square'));
  },

  descending: (ac) => {
    [[1200,0],[950,0.34],[700,0.68],[500,1.02]].forEach(([f,t]) => tone(ac, f, 0.55, t, 0.26, 'square'));
  },

  ascending: (ac) => {
    [[500,0],[700,0.30],[950,0.60],[1200,0.90]].forEach(([f,t]) => tone(ac, f, 0.55, t, 0.24, 'square'));
  },

  air_horn: (ac) => {
    // Chord: root + major third + fifth (F2, A2, C3)
    tone(ac, 185, 0.70, 0, 1.8, 'sawtooth');
    tone(ac, 233, 0.48, 0, 1.8, 'sawtooth');
    tone(ac, 277, 0.28, 0, 1.8, 'sawtooth');
  },

  low_pulse: (ac) => {
    [0, 0.40, 0.80, 1.20].forEach(t => tone(ac, 440, 0.60, t, 0.28, 'sawtooth'));
  },

  rapid_burst: (ac) => {
    [0, 0.14, 0.28, 0.42, 0.56, 0.70].forEach(t => tone(ac, 900, 0.50, t, 0.09, 'square'));
  },

  alert_chime: (ac) => {
    // C5 → E5 → G5 → E5 (major triad arpeggio)
    [[523,0],[659,0.30],[784,0.60],[659,0.90]].forEach(([f,t]) => tone(ac, f, 0.50, t, 0.24, 'sine'));
  },

  yelp: (ac) => {
    for (let i = 0; i < 7; i++) yelp(ac, i * 0.18);
  },

  wail: (ac) => {
    sweep(ac, 350, 1000, 0.65, 0,    2.0, 'sawtooth');
    sweep(ac, 350, 1000, 0.65, 2.05, 2.0, 'sawtooth');
  },

  tone_noise: (ac) => {
    // Tritone interval (unsettling, attention-grabbing)
    tone(ac, 740, 0.58, 0,    0.25, 'square');
    tone(ac, 1050, 0.58, 0.28, 0.25, 'square');
  },

  phaser: (ac) => {
    sweep(ac, 350, 750, 0.55, 0,    0.42, 'square');
    sweep(ac, 350, 750, 0.55, 0.48, 0.42, 'square');
    sweep(ac, 350, 750, 0.55, 0.96, 0.42, 'square');
  },

  // Dispatch auto-tones
  dispatch_p1: (ac) => {
    // Rapid alternating interval (minor second — urgent)
    for (let i = 0; i < 6; i++) tone(ac, i % 2 === 0 ? 1200 : 800, 0.62, i * 0.17, 0.12, 'square');
  },

  dispatch_p2: (ac) => {
    tone(ac, 1050, 0.58, 0,    0.32, 'square');
    tone(ac, 800,  0.58, 0.40, 0.32, 'square');
  },

  dispatch_p3: (ac) => {
    tone(ac, 1050, 0.50, 0, 0.45, 'square');
  },

  radio_click: (ac) => {
    // Short sharp tone burst — simulates PTT click
    tone(ac, 1800, 0.35, 0, 0.04, 'square');
    tone(ac, 900,  0.20, 0.04, 0.04, 'square');
  },
};

export function playTone(toneKey) {
  const ac = ctx();
  if (ac.state === 'suspended') ac.resume();
  window._vosMasterBus = null;
  const fn = tones[toneKey];
  if (fn) fn(ac);
}

export function playDispatchTone(priority) {
  const map = { P1: 'dispatch_p1', P2: 'dispatch_p2', P3: 'dispatch_p3', P4: 'dispatch_p3' };
  playTone(map[priority] || 'dispatch_p3');
}

export function getToneOptions() {
  return [
    { value: 'standard', label: 'Manual Siren (3 Blasts)' },
    { value: 'priority', label: 'Wail Siren' },
    { value: 'emergency', label: 'Wail + Yelp Combined' },
    { value: 'signal100', label: 'Signal 100 Siren' },
    { value: 'triple_beep', label: 'Triple Beep' },
    { value: 'pager', label: 'Pager 4-Tone' },
    { value: 'two_tone_fire', label: 'Two-Tone (Fire)' },
    { value: 'long_horn', label: 'Long Horn Blast' },
    { value: 'quick_double', label: 'Quick Double' },
    { value: 'five_beep', label: 'Five Beep Alert' },
    { value: 'descending', label: 'Descending Tones' },
    { value: 'ascending', label: 'Ascending Escalation' },
    { value: 'air_horn', label: 'Air Horn' },
    { value: 'low_pulse', label: 'Low Pulse' },
    { value: 'rapid_burst', label: 'Rapid Burst' },
    { value: 'alert_chime', label: 'Alert Chime' },
    { value: 'yelp', label: 'Yelp Siren' },
    { value: 'wail', label: 'Wail Siren' },
    { value: 'tone_noise', label: 'Tone Interval' },
    { value: 'phaser', label: 'Phaser Alert' },
  ];
}

export function getDefaultTones() {
  return {
    standard:  { name: 'Standard',  sound: 'standard'  },
    priority:  { name: 'Priority',  sound: 'priority'  },
    emergency: { name: 'Emergency', sound: 'emergency' },
  };
}