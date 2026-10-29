// All sound is made here, no files: little synthesised effects, and the music — a small sequencer playing each
// tune's chord progression with a bass, a pad, a lead melody (motifs grown from the chords) and drums.
let ac = null, master, musicBus, sfxBus, verb, cur = null, vols = { bgm: 0.7, sfx: 0.8 };
export function wake() {
  if (!ac) {
    ac = new (window.AudioContext || window.webkitAudioContext)();
    master = ac.createGain(); master.gain.value = 0.9; const comp = ac.createDynamicsCompressor(); master.connect(comp).connect(ac.destination);
    musicBus = ac.createGain(); musicBus.gain.value = vols.bgm * 0.5; sfxBus = ac.createGain(); sfxBus.gain.value = vols.sfx; musicBus.connect(master); sfxBus.connect(master);
    verb = ac.createConvolver(); verb.buffer = impulse(2.2); const vg = ac.createGain(); vg.gain.value = 0.25; verb.connect(vg).connect(master);
  }
  if (ac.state === 'suspended') ac.resume();
}
export function setVolume(k, v) { vols[k] = v; if (!ac) return; if (k === 'bgm') musicBus.gain.value = v * 0.5; else sfxBus.gain.value = v; }
function impulse(sec) { const n = ac.sampleRate * sec, b = ac.createBuffer(2, n, ac.sampleRate); for (let c = 0; c < 2; c++) { const d = b.getChannelData(c); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 3); } return b; }
const noiseBuf = () => { if (noiseBuf.b) return noiseBuf.b; const n = ac.sampleRate, b = ac.createBuffer(1, n, ac.sampleRate), d = b.getChannelData(0); for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1; return (noiseBuf.b = b); };
const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);

function tone(f0, f1, dur, { at = 0, vol = 0.3, type = 'sine', a = 0.005, out = sfxBus, rev = 0 } = {}) {
  const t = ac.currentTime + at, o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.setValueAtTime(f0, t); if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(g).connect(out); if (rev) { const s = ac.createGain(); s.gain.value = rev; g.connect(s).connect(verb); } o.start(t); o.stop(t + dur + 0.05);
}
function noise(dur, { at = 0, f0 = 1000, f1 = 1000, q = 1, vol = 0.3, type = 'bandpass', a = 0.005, out = sfxBus, rev = 0 } = {}) {
  const t = ac.currentTime + at, s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(); s.buffer = noiseBuf(); s.loop = true; f.type = type; f.Q.value = q; f.frequency.setValueAtTime(f0, t); f.frequency.exponentialRampToValueAtTime(Math.max(30, f1), t + dur);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); s.connect(f).connect(g).connect(out); if (rev) { const r = ac.createGain(); r.gain.value = rev; g.connect(r).connect(verb); } s.start(t, Math.random()); s.stop(t + dur + 0.05);
}
const SFX = {
  blip: () => tone(880, 880, 0.03, { vol: 0.04, type: 'square' }),
  tick: () => tone(1200, 1200, 0.04, { vol: 0.08, type: 'triangle' }),
  ok: () => { tone(880, 880, 0.06, { vol: 0.12, type: 'triangle' }); tone(1320, 1320, 0.08, { at: 0.05, vol: 0.1, type: 'triangle' }); },
  back: () => tone(660, 440, 0.08, { vol: 0.1, type: 'triangle' }),
  buzz: () => tone(140, 120, 0.15, { vol: 0.15, type: 'square' }),
  step: () => noise(0.05, { f0: 400, f1: 200, vol: 0.05, type: 'lowpass' }),
  slash: () => { noise(0.18, { f0: 5000, f1: 1500, q: 2, vol: 0.35 }); tone(300, 90, 0.12, { vol: 0.25, type: 'triangle', at: 0.04 }); },
  pierce: () => { noise(0.1, { f0: 6000, f1: 3000, q: 4, vol: 0.3 }); tone(500, 120, 0.1, { vol: 0.2, type: 'square', at: 0.03 }); },
  strike: () => { tone(160, 40, 0.22, { vol: 0.55, type: 'sine' }); noise(0.12, { f0: 1200, f1: 200, vol: 0.4, type: 'lowpass' }); },
  shot: () => { noise(0.15, { f0: 3000, f1: 300, vol: 0.5, type: 'lowpass', a: 0.001 }); tone(200, 50, 0.15, { vol: 0.4 }); },
  fire: () => { noise(0.6, { f0: 800, f1: 3000, q: 0.6, vol: 0.35, rev: 0.4 }); tone(120, 60, 0.4, { vol: 0.25, type: 'sawtooth' }); },
  ice: () => { for (let i = 0; i < 6; i++) tone(2000 + i * 400, 2600 + i * 300, 0.15, { at: i * 0.04, vol: 0.08, type: 'sine', rev: 0.5 }); noise(0.3, { f0: 7000, f1: 4000, q: 3, vol: 0.15 }); },
  thunder: () => { noise(0.5, { f0: 3000, f1: 100, q: 0.5, vol: 0.6, type: 'lowpass', a: 0.001, rev: 0.5 }); tone(80, 30, 0.6, { vol: 0.4, type: 'sawtooth' }); },
  water: () => { for (let i = 0; i < 5; i++) tone(400 + Math.random() * 600, 900 + Math.random() * 400, 0.12, { at: i * 0.06, vol: 0.12, rev: 0.4 }); noise(0.5, { f0: 600, f1: 300, vol: 0.2, type: 'lowpass' }); },
  wind: () => noise(0.8, { f0: 400, f1: 2400, q: 3, vol: 0.3, rev: 0.4 }),
  earth: () => { tone(90, 30, 0.6, { vol: 0.6 }); noise(0.5, { f0: 500, f1: 100, vol: 0.4, type: 'lowpass' }); },
  light: () => { for (let i = 0; i < 4; i++) tone(1046 * Math.pow(1.26, i), 1046 * Math.pow(1.26, i), 0.5, { at: i * 0.06, vol: 0.08, type: 'triangle', rev: 0.8 }); },
  dark: () => { tone(220, 55, 0.7, { vol: 0.3, type: 'sawtooth', rev: 0.5 }); tone(233, 58, 0.7, { vol: 0.2, type: 'sawtooth' }); },
  heal: () => { for (let i = 0; i < 5; i++) tone(660 * Math.pow(1.122, i * 2), 660 * Math.pow(1.122, i * 2), 0.3, { at: i * 0.07, vol: 0.08, type: 'sine', rev: 0.8 }); },
  buff: () => { tone(440, 880, 0.3, { vol: 0.12, type: 'triangle', rev: 0.6 }); tone(660, 1320, 0.3, { at: 0.1, vol: 0.1, type: 'triangle', rev: 0.6 }); },
  debuff: () => tone(600, 200, 0.4, { vol: 0.15, type: 'square', rev: 0.3 }),
  miss: () => noise(0.15, { f0: 2000, f1: 4000, q: 2, vol: 0.15 }),
  crit: () => { tone(1800, 1800, 0.06, { vol: 0.2, type: 'square' }); noise(0.25, { f0: 6000, f1: 2000, q: 1, vol: 0.4 }); },
  weak: () => { tone(1200, 1600, 0.08, { vol: 0.18, type: 'square' }); tone(1600, 2400, 0.1, { at: 0.06, vol: 0.15, type: 'square' }); },
  brk: () => { for (let i = 0; i < 10; i++) tone(2000 + Math.random() * 4000, 1000 + Math.random() * 2000, 0.25, { at: Math.random() * 0.12, vol: 0.06, type: 'triangle' }); tone(110, 40, 0.5, { vol: 0.6 }); noise(0.4, { f0: 8000, f1: 2000, q: 1, vol: 0.3 }); },
  extra: () => { tone(880, 1760, 0.15, { vol: 0.15, type: 'triangle' }); tone(1320, 2640, 0.15, { at: 0.08, vol: 0.12, type: 'triangle' }); },
  ko: () => { tone(400, 60, 0.6, { vol: 0.3, type: 'square' }); noise(0.4, { f0: 2000, f1: 200, vol: 0.2, type: 'lowpass' }); },
  bricks: () => { for (let i = 0; i < 14; i++) tone(1500 + Math.random() * 2500, 800 + Math.random() * 1500, 0.05, { at: Math.random() * 0.5, vol: 0.08, type: 'triangle' }); },
  levelup: () => { [0, 4, 7, 12].forEach((n, i) => tone(mtof(72 + n), mtof(72 + n), 0.3, { at: i * 0.1, vol: 0.15, type: 'square', rev: 0.4 })); },
  chest: () => { tone(300, 200, 0.1, { vol: 0.2, type: 'square' }); [0, 4, 7, 12, 16].forEach((n, i) => tone(mtof(76 + n), mtof(76 + n), 0.25, { at: 0.15 + i * 0.07, vol: 0.1, type: 'triangle', rev: 0.5 })); },
  save: () => { [0, 7, 12, 19].forEach((n, i) => tone(mtof(72 + n), mtof(72 + n), 0.8, { at: i * 0.12, vol: 0.08, type: 'sine', rev: 0.9 })); },
  coin: () => { tone(1976, 1976, 0.08, { vol: 0.12, type: 'square' }); tone(2637, 2637, 0.25, { at: 0.07, vol: 0.12, type: 'square' }); },
  encounter: () => { noise(0.9, { f0: 200, f1: 6000, q: 1, vol: 0.4, rev: 0.4 }); for (let i = 0; i < 8; i++) tone(200 + i * 120, 200 + i * 120, 0.1, { at: i * 0.05, vol: 0.08, type: 'square' }); },
  flee: () => { for (let i = 0; i < 6; i++) noise(0.06, { at: i * 0.07, f0: 600, f1: 300, vol: 0.15, type: 'lowpass' }); },
  ult: () => { tone(55, 220, 1.2, { vol: 0.4, type: 'sawtooth', rev: 0.6 }); noise(1.2, { f0: 200, f1: 8000, q: 0.8, vol: 0.3, rev: 0.6 }); [0, 7, 12, 16, 19, 24].forEach((n, i) => tone(mtof(60 + n), mtof(60 + n), 0.9, { at: 0.3 + i * 0.06, vol: 0.09, type: 'square', rev: 0.8 })); },
  charge: () => { tone(200, 800, 0.8, { vol: 0.15, type: 'sawtooth', rev: 0.4 }); },
  echo: () => { [0, 4, 7, 11, 14, 19].forEach((n, i) => tone(mtof(67 + n), mtof(67 + n), 1.4, { at: i * 0.11, vol: 0.07, type: 'sine', rev: 1 })); },
  door: () => { noise(0.25, { f0: 300, f1: 150, vol: 0.2, type: 'lowpass' }); tone(150, 100, 0.2, { vol: 0.15, type: 'square' }); },
  quake: () => { tone(50, 30, 1.5, { vol: 0.5 }); noise(1.5, { f0: 300, f1: 80, vol: 0.4, type: 'lowpass' }); },
};
export function sfx(name) { if (!ac || !SFX[name]) return; try { SFX[name](); } catch (e) { } }

// ---------------------------------------------------------------- music
// a tune: bpm, root (midi), scale, chords (scale degrees, one per bar), lead style, drums pattern, and the instruments
const SC = { maj: [0, 2, 4, 5, 7, 9, 11], min: [0, 2, 3, 5, 7, 8, 10], dor: [0, 2, 3, 5, 7, 9, 10], harm: [0, 2, 3, 5, 7, 8, 11], pent: [0, 2, 4, 7, 9], mix: [0, 2, 4, 5, 7, 9, 10], jp: [0, 1, 5, 7, 8] };
export const TUNES = {
  title: { bpm: 76, root: 62, sc: 'maj', ch: [0, 4, 5, 3, 0, 4, 3, 4], lead: 'bell', pad: 0.5, drum: '', seed: 3 },
  whitehawk: { bpm: 104, root: 65, sc: 'maj', ch: [0, 3, 4, 0, 5, 3, 1, 4], lead: 'flute', pad: 0.35, drum: 'march', seed: 11 },
  town: { bpm: 112, root: 67, sc: 'maj', ch: [0, 5, 3, 4, 0, 5, 1, 4], lead: 'pluck', pad: 0.3, drum: 'light', seed: 21 },
  village: { bpm: 96, root: 64, sc: 'pent', ch: [0, 3, 4, 0, 3, 4, 2, 4], lead: 'flute', pad: 0.3, drum: 'light', seed: 31 },
  port: { bpm: 120, root: 69, sc: 'mix', ch: [0, 6, 3, 0, 0, 6, 4, 0], lead: 'pluck', pad: 0.3, drum: 'shuffle', seed: 41 },
  snow: { bpm: 84, root: 62, sc: 'min', ch: [0, 5, 2, 6, 0, 5, 3, 4], lead: 'bell', pad: 0.5, drum: '', seed: 51 },
  desert: { bpm: 100, root: 62, sc: 'harm', ch: [0, 0, 5, 4, 0, 3, 4, 4], lead: 'reed', pad: 0.3, drum: 'tribal', seed: 61 },
  sakura: { bpm: 88, root: 64, sc: 'jp', ch: [0, 3, 2, 0, 0, 3, 4, 0], lead: 'koto', pad: 0.3, drum: 'light', seed: 71 },
  field: { bpm: 132, root: 62, sc: 'maj', ch: [0, 4, 5, 3, 0, 4, 1, 4], lead: 'brass', pad: 0.35, drum: 'rock', seed: 81 },
  field2: { bpm: 124, root: 64, sc: 'dor', ch: [0, 3, 0, 6, 0, 3, 4, 4], lead: 'flute', pad: 0.35, drum: 'rock', seed: 91 },
  world: { bpm: 116, root: 60, sc: 'maj', ch: [0, 4, 5, 3, 0, 3, 4, 4, 5, 3, 0, 4, 5, 1, 4, 4], lead: 'brass', pad: 0.4, drum: 'march', seed: 101 },
  dungeon: { bpm: 92, root: 57, sc: 'min', ch: [0, 0, 5, 5, 3, 3, 4, 4], lead: 'bell', pad: 0.55, drum: 'slow', seed: 111 },
  dungeon2: { bpm: 100, root: 59, sc: 'harm', ch: [0, 5, 0, 4, 0, 5, 3, 4], lead: 'reed', pad: 0.5, drum: 'slow', seed: 121 },
  temple: { bpm: 80, root: 62, sc: 'dor', ch: [0, 6, 3, 0, 0, 6, 4, 4], lead: 'bell', pad: 0.6, drum: '', seed: 131 },
  battle: { bpm: 156, root: 57, sc: 'min', ch: [0, 5, 6, 4, 0, 5, 3, 4], lead: 'saw', pad: 0.3, drum: 'battle', bass: 'run', seed: 141 },
  boss: { bpm: 168, root: 55, sc: 'harm', ch: [0, 0, 5, 4, 0, 1, 4, 4], lead: 'saw', pad: 0.4, drum: 'battle', bass: 'run', seed: 151 },
  final: { bpm: 176, root: 53, sc: 'harm', ch: [0, 5, 3, 4, 0, 1, 6, 4, 0, 5, 3, 4, 5, 1, 4, 4], lead: 'saw', pad: 0.5, drum: 'battle', bass: 'run', seed: 161 },
  sad: { bpm: 66, root: 60, sc: 'min', ch: [0, 5, 3, 4, 0, 5, 6, 4], lead: 'bell', pad: 0.6, drum: '', seed: 171 },
  tension: { bpm: 110, root: 56, sc: 'harm', ch: [0, 1, 0, 1, 5, 4, 5, 4], lead: 'reed', pad: 0.5, drum: 'slow', seed: 181 },
  hope: { bpm: 92, root: 65, sc: 'maj', ch: [0, 4, 5, 3, 0, 4, 3, 4], lead: 'brass', pad: 0.5, drum: 'march', seed: 191 },
  void: { bpm: 72, root: 50, sc: 'harm', ch: [0, 1, 0, 6, 5, 1, 4, 4], lead: 'bell', pad: 0.7, drum: 'slow', seed: 201 },
  airship: { bpm: 138, root: 65, sc: 'mix', ch: [0, 6, 3, 0, 4, 6, 3, 4], lead: 'brass', pad: 0.4, drum: 'rock', seed: 211 },
  victory: { bpm: 140, root: 67, sc: 'maj', ch: [0, 3, 4, 0], lead: 'fanfare', pad: 0.3, drum: 'march', seed: 221, once: true },
};
function rngf(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
// the melody: two motifs (rhythm + contour) grown from the seed, set over the chords, answered and varied
function compose(T) {
  const r = rngf(T.seed * 977), sc = SC[T.sc], deg = (d) => { const o = Math.floor(d / sc.length), i = ((d % sc.length) + sc.length) % sc.length; return sc[i] + 12 * o; };
  const RH = [[1, 1, 1, 1], [2, 1, 1], [1, 1, 2], [1.5, 0.5, 1, 1], [3, 1], [1, 0.5, 0.5, 2], [0.5, 0.5, 1, 0.5, 0.5, 1], [2, 2]];
  const motif = () => { const rh = RH[Math.floor(r() * RH.length)].concat(RH[Math.floor(r() * RH.length)]); let d = Math.floor(r() * 3) * 2; return rh.map((len) => { const n = { len, d }; d += Math.round((r() - 0.45) * 4); d = Math.max(-2, Math.min(9, d)); return n; }); };
  const A = motif(), Bm = motif(), bars = [];
  T.ch.forEach((c, i) => {
    const m = i % 4 === 3 ? Bm : A, shift = c - (i % 2 ? 1 : 0); const notes = []; let t = 0;
    for (const n of m) { if (t >= 4) break; const len = Math.min(n.len, 4 - t); const dd = n.d + shift + (i % 8 >= 4 ? 2 : 0); notes.push({ t, len, m: T.root + 12 + deg(dd) }); t += len; }
    if (i % 4 === 3 && notes.length) { notes[notes.length - 1].m = T.root + 12 + deg(c); }
    bars.push(notes);
  });
  return bars;
}
const DRUMS = {
  march: { k: [0, 2], s: [1, 3], h: [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5] }, light: { k: [0, 2.5], s: [], h: [1, 3] }, shuffle: { k: [0, 2], s: [1, 3], h: [0, 0.66, 1, 1.66, 2, 2.66, 3, 3.66] },
  tribal: { k: [0, 1.5, 2, 3.5], s: [], h: [1, 3], t: [0.5, 2.75, 3.25] }, rock: { k: [0, 1.5, 2], s: [1, 3], h: [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5] }, slow: { k: [0], s: [2], h: [] },
  battle: { k: [0, 0.75, 1.5, 2, 2.75, 3.5], s: [1, 3], h: [0, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 2.75, 3, 3.25, 3.5, 3.75] },
};
function voice(kind, m, t, len, vol, out) {
  const f = mtof(m), o = ac.createOscillator(), g = ac.createGain(), fl = ac.createBiquadFilter(); fl.type = 'lowpass';
  const env = (a, d, s, rl) => { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + a); g.gain.exponentialRampToValueAtTime(Math.max(0.0001, vol * s), t + a + d); g.gain.setValueAtTime(Math.max(0.0001, vol * s), t + len); g.gain.exponentialRampToValueAtTime(0.0001, t + len + rl); };
  if (kind === 'bell') { o.type = 'sine'; fl.frequency.value = 6000; env(0.005, 0.3, 0.3, 0.8); const o2 = ac.createOscillator(); o2.type = 'sine'; o2.frequency.value = f * 3.01; const g2 = ac.createGain(); g2.gain.value = 0.25; o2.connect(g2).connect(g); o2.start(t); o2.stop(t + len + 1); }
  else if (kind === 'flute') { o.type = 'triangle'; fl.frequency.value = 3000; env(0.06, 0.1, 0.8, 0.15); }
  else if (kind === 'pluck' || kind === 'koto') { o.type = kind === 'koto' ? 'sawtooth' : 'triangle'; fl.frequency.setValueAtTime(4000, t); fl.frequency.exponentialRampToValueAtTime(600, t + 0.4); env(0.003, 0.25, 0.15, 0.3); }
  else if (kind === 'reed') { o.type = 'square'; fl.frequency.value = 1800; env(0.04, 0.1, 0.7, 0.12); }
  else if (kind === 'brass' || kind === 'fanfare') { o.type = 'sawtooth'; fl.frequency.setValueAtTime(800, t); fl.frequency.linearRampToValueAtTime(2600, t + 0.08); env(0.03, 0.15, 0.7, 0.12); }
  else if (kind === 'saw') { o.type = 'sawtooth'; fl.frequency.value = 2400; env(0.01, 0.1, 0.6, 0.08); }
  else if (kind === 'pad') { o.type = 'sawtooth'; fl.frequency.value = 900; env(0.4, 0.5, 0.7, 0.8); }
  else if (kind === 'bass') { o.type = 'triangle'; fl.frequency.value = 900; env(0.01, 0.15, 0.6, 0.08); }
  o.frequency.value = f; o.connect(fl).connect(g).connect(out); o.start(t); o.stop(t + len + 1.2);
  if (kind !== 'bass' && kind !== 'pad') { const s = ac.createGain(); s.gain.value = 0.3; g.connect(s).connect(verb); }
}
function drum(kind, t, vol, out) {
  if (kind === 'k') { const o = ac.createOscillator(), g = ac.createGain(); o.frequency.setValueAtTime(130, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.15); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.25); o.connect(g).connect(out); o.start(t); o.stop(t + 0.3); }
  else { const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(); s.buffer = noiseBuf(); f.type = kind === 'h' ? 'highpass' : 'bandpass'; f.frequency.value = kind === 'h' ? 7000 : kind === 't' ? 400 : 1800; const d = kind === 'h' ? 0.04 : 0.15; g.gain.setValueAtTime(vol * (kind === 'h' ? 0.35 : 0.8), t); g.gain.exponentialRampToValueAtTime(0.0001, t + d); s.connect(f).connect(g).connect(out); s.start(t, Math.random()); s.stop(t + d + 0.02); }
}
export function music(name, o = {}) {
  if (!ac) { music.want = name; return; }
  if (cur && cur.name === name && !o.restart) return;
  stopMusic(o.fade ?? 0.6);
  const T = TUNES[name]; if (!T) return;
  const bus = ac.createGain(); bus.gain.value = 0.0001; bus.connect(musicBus); bus.gain.exponentialRampToValueAtTime(1, ac.currentTime + 0.5);
  const st = { name, bus, bar: 0, next: ac.currentTime + 0.1, bars: compose(T), T, timer: null };
  const beat = 60 / T.bpm, sc = SC[T.sc];
  const chordNotes = (c) => [0, 2, 4].map((k) => { const d = c + k, o2 = Math.floor(d / sc.length); return T.root + sc[((d % sc.length) + sc.length) % sc.length] + 12 * o2; });
  const sched = () => {
    while (st.next < ac.currentTime + 0.6) {
      const i = st.bar % T.ch.length, t0 = st.next, c = T.ch[i], cn = chordNotes(c);
      if (T.once && st.bar >= T.ch.length) { clearInterval(st.timer); return; }
      for (const m of cn) voice('pad', m - 12, t0, beat * 4 - 0.1, 0.05 * (T.pad ?? 0.4) * 2, bus);
      if (T.bass === 'run') for (let k = 0; k < 8; k++) voice('bass', cn[0] - 24 + (k % 4 === 3 ? 7 : k % 2 ? 12 : 0), t0 + k * beat / 2, beat / 2 - 0.02, 0.22, bus);
      else for (let k = 0; k < 4; k++) voice('bass', cn[0] - 24 + (k === 2 ? 7 : 0), t0 + k * beat, beat * 0.9, 0.2, bus);
      const lead = T.lead === 'fanfare' ? 'brass' : T.lead;
      for (const n of st.bars[i]) voice(lead, n.m, t0 + n.t * beat, n.len * beat * 0.92, T.lead === 'bell' ? 0.12 : 0.09, bus);
      if (st.bar % 2 === 1 && T.lead !== 'bell') for (const n of st.bars[i]) if (n.len >= 1) voice('bell', n.m + 12, t0 + n.t * beat, n.len * beat * 0.5, 0.03, bus);
      const dp = DRUMS[T.drum]; if (dp) { for (const b of dp.k) drum('k', t0 + b * beat, 0.5, bus); for (const b of dp.s) drum('s', t0 + b * beat, 0.35, bus); for (const b of dp.h) drum('h', t0 + b * beat, 0.25, bus); for (const b of dp.t || []) drum('t', t0 + b * beat, 0.4, bus); }
      st.next += beat * 4; st.bar++;
    }
  };
  sched(); st.timer = setInterval(sched, 150); cur = st;
}
export function stopMusic(fade = 0.6) { if (!cur) return; const c = cur; cur = null; clearInterval(c.timer); try { c.bus.gain.cancelScheduledValues(ac.currentTime); c.bus.gain.setValueAtTime(c.bus.gain.value, ac.currentTime); c.bus.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + fade); } catch (e) { } setTimeout(() => c.bus.disconnect(), fade * 1000 + 800); }
export const nowPlaying = () => cur?.name;
