// Procedurally synthesizes the "Tom" launch video score:
// a rising ambient -> electronic bed that hushes for the dashboard reveal
// and resolves on a clean bell chime. No external assets, pure DSP.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SAMPLE_RATE = 44100;
const DURATION = 30; // seconds, matches the 900-frame @30fps video
const N = Math.floor(SAMPLE_RATE * DURATION);

// Deterministic PRNG (mulberry32) so re-runs are reproducible.
let seed = 1337;
function rand() {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

const TWO_PI = Math.PI * 2;

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

// Smoothstep-style ease for keyframe interpolation.
function ease(x) {
  return x * x * (3 - 2 * x);
}

function keyframes(t, points) {
  if (t <= points[0][0]) return points[0][1];
  for (let i = 0; i < points.length - 1; i++) {
    const [t0, v0] = points[i];
    const [t1, v1] = points[i + 1];
    if (t >= t0 && t <= t1) {
      const p = t1 === t0 ? 1 : (t - t0) / (t1 - t0);
      return v0 + (v1 - v0) * ease(clamp(p, 0, 1));
    }
  }
  return points[points.length - 1][1];
}

// Overall loudness arc: ambient swell -> electronic climax -> hush -> resolve.
const macroVol = (t) =>
  keyframes(t, [
    [0, 0.1],
    [6, 0.26],
    [12, 0.42],
    [18, 0.62],
    [21, 0.86],
    [23.6, 0.88],
    [24.0, 0.2],
    [25.4, 0.24],
    [27, 0.34],
    [28.5, 0.4],
    [30, 0.0],
  ]);

const brightness = (t) => clamp(macroVol(t) * 1.15, 0, 1);

// Chord progression (Hz), each held with a soft crossfade at boundaries.
const CHORDS = [
  { t: 0, freqs: [220.0, 261.63, 329.63, 392.0, 493.88] }, // Am9
  { t: 6, freqs: [174.61, 220.0, 261.63, 329.63] }, // Fmaj7
  { t: 12, freqs: [261.63, 329.63, 392.0, 493.88] }, // Cmaj7
  { t: 18, freqs: [174.61, 220.0, 261.63, 329.63, 440.0] }, // Fmaj7 (open)
  { t: 21, freqs: [261.63, 329.63, 392.0, 493.88, 523.25] }, // Cmaj7 (climax)
  { t: 24, freqs: [174.61, 220.0, 261.63, 329.63] }, // Fmaj7 (hush)
  { t: 27, freqs: [261.63, 329.63, 392.0, 493.88, 587.33] }, // Cmaj9 (resolve)
];
const CROSSFADE = 0.6;

function chordWeightsAt(t) {
  let idx = 0;
  for (let i = 0; i < CHORDS.length; i++) {
    if (t >= CHORDS[i].t) idx = i;
  }
  const cur = CHORDS[idx];
  const next = CHORDS[idx + 1];
  if (!next) return [{ freqs: cur.freqs, w: 1 }];
  const into = next.t - t;
  if (into > CROSSFADE) return [{ freqs: cur.freqs, w: 1 }];
  const p = ease(clamp(1 - into / CROSSFADE, 0, 1));
  return [
    { freqs: cur.freqs, w: 1 - p },
    { freqs: next.freqs, w: p },
  ];
}

function padSample(t) {
  const bright = brightness(t);
  const weights = chordWeightsAt(t);
  let l = 0;
  let r = 0;
  for (const { freqs, w } of weights) {
    for (const f of freqs) {
      const detuneL = f * 0.997;
      const detuneR = f * 1.003;
      const vib = 1 + 0.0012 * Math.sin(TWO_PI * 0.13 * t);
      const base =
        0.62 * Math.sin(TWO_PI * f * vib * t) +
        0.22 * bright * Math.sin(TWO_PI * f * 2 * vib * t) +
        0.1 * bright * Math.sin(TWO_PI * f * 3 * vib * t);
      l += w * (0.55 * base + 0.35 * Math.sin(TWO_PI * detuneL * vib * t));
      r += w * (0.55 * base + 0.35 * Math.sin(TWO_PI * detuneR * vib * t));
    }
    l /= freqs.length;
    r /= freqs.length;
  }
  return [l, r];
}

function expEnv(tRel, attack, tau) {
  if (tRel < 0) return 0;
  if (tRel < attack) return tRel / attack;
  return Math.exp(-(tRel - attack) / tau);
}

// ---- Arpeggio (starts once search/network scenes kick in) ----
const arpOnsets = [];
function pushRange(start, end, step) {
  for (let t = start; t < end - 1e-9; t += step) arpOnsets.push(t);
}
pushRange(6, 12, 0.5);
pushRange(12, 18, 0.25);
pushRange(18, 24, 0.125);
pushRange(27, 28.5, 0.5);

let arpNoteCounter = 0;
const arpEvents = arpOnsets.map((t) => {
  const weights = chordWeightsAt(t);
  const freqs = weights[weights.length - 1].freqs;
  const pattern = [0, 2, 1, 3, 0, 3, 2, 1];
  const degree = pattern[arpNoteCounter % pattern.length];
  const octaveUp = t >= 18 && t < 24 && arpNoteCounter % 4 === 3;
  arpNoteCounter++;
  const freq = freqs[degree % freqs.length] * (octaveUp ? 2 : 1);
  const pan = arpNoteCounter % 2 === 0 ? 0.72 : 0.28; // ping-pong
  return { t, freq, pan };
});

// ---- Sub bass pulses (compression / data-stream scenes) ----
const bassEvents = [];
for (let t = 12; t < 24 - 1e-9; t += 1) {
  const weights = chordWeightsAt(t);
  const freqs = weights[weights.length - 1].freqs;
  bassEvents.push({ t, freq: freqs[0] / 2 });
}

// ---- Kick (electronic climax, scene 4) ----
const kickEvents = [18, 19, 20, 21, 22, 23, 24.0].map((t, i) => ({
  t,
  big: i === 6,
}));

// ---- Hats (16th notes under the climax) ----
const hatEvents = [];
for (let t = 18; t < 24 - 1e-9; t += 0.125) hatEvents.push(t);

// ---- Chime (final resolving bell) ----
const CHIME_T = 28.5;
const CHIME_PARTIALS = [
  { ratio: 1, amp: 1, tau: 2.6 },
  { ratio: 2.0, amp: 0.5, tau: 2.1 },
  { ratio: 2.4, amp: 0.32, tau: 1.5 },
  { ratio: 3.2, amp: 0.22, tau: 1.0 },
  { ratio: 4.5, amp: 0.14, tau: 0.6 },
];
const CHIME_BASE = 523.25; // C5

function chimeSample(t) {
  const tRel = t - CHIME_T;
  if (tRel < 0) return [0, 0];
  let l = 0;
  let r = 0;
  for (const { ratio, amp, tau } of CHIME_PARTIALS) {
    const env = amp * expEnv(tRel, 0.006, tau);
    l += env * Math.sin(TWO_PI * CHIME_BASE * ratio * 0.998 * tRel);
    r += env * Math.sin(TWO_PI * CHIME_BASE * ratio * 1.002 * tRel);
  }
  return [l * 0.5, r * 0.5];
}

// ---- Riser (whoosh into the chime) ----
const RISER_START = 26.5;
const RISER_END = CHIME_T;

function makePointer(events) {
  let idx = -1;
  return (t) => {
    while (idx + 1 < events.length && t >= events[idx + 1].t) idx++;
    return idx;
  };
}
const arpPtr = makePointer(arpEvents);
const bassPtr = makePointer(bassEvents);
const kickPtr = makePointer(kickEvents);

const left = new Float32Array(N);
const right = new Float32Array(N);

let hatIdx = 0;
let riserLpL = 0;
let riserLpR = 0;
let prevNoiseL = 0;
let prevNoiseR = 0;

for (let n = 0; n < N; n++) {
  const t = n / SAMPLE_RATE;
  const vol = macroVol(t);

  const [pl, pr] = padSample(t);
  let l = pl * vol * 0.55;
  let r = pr * vol * 0.55;

  // Arpeggio (sum current + previous note for a touch of legato overlap)
  const ai = arpPtr(t);
  for (const idx of [ai, ai - 1]) {
    if (idx < 0) continue;
    const ev = arpEvents[idx];
    const tRel = t - ev.t;
    if (tRel < 0 || tRel > 0.5) continue;
    const env = expEnv(tRel, 0.004, 0.12);
    const tone =
      env *
      (0.7 * Math.sin(TWO_PI * ev.freq * tRel) +
        0.3 * Math.sin(TWO_PI * ev.freq * 2 * tRel));
    const gain = 0.22 * vol * (0.6 + 0.4 * brightness(t));
    l += tone * gain * (1 - ev.pan);
    r += tone * gain * ev.pan;
  }

  // Sub bass
  const bi = bassPtr(t);
  if (bi >= 0) {
    const ev = bassEvents[bi];
    const tRel = t - ev.t;
    if (tRel >= 0 && tRel < 0.9) {
      const env = expEnv(tRel, 0.01, 0.5);
      const tone = env * Math.sin(TWO_PI * ev.freq * tRel);
      l += tone * 0.28;
      r += tone * 0.28;
    }
  }

  // Kick
  const ki = kickPtr(t);
  if (ki >= 0) {
    const ev = kickEvents[ki];
    const tRel = t - ev.t;
    const dur = ev.big ? 0.6 : 0.4;
    if (tRel >= 0 && tRel < dur) {
      const freq = 46 + 130 * Math.exp(-tRel / 0.045);
      const ampEnv = Math.exp(-tRel / (ev.big ? 0.45 : 0.32));
      const click = tRel < 0.008 ? (1 - tRel / 0.008) * 0.5 : 0;
      const tone = ampEnv * Math.sin(TWO_PI * freq * tRel) + click * (rand() * 2 - 1);
      const g = (ev.big ? 0.5 : 0.4) * tone;
      l += g;
      r += g;
    }
  }

  // Hats (first-difference highpassed noise bursts)
  const noiseNow = rand() * 2 - 1;
  const hpL = noiseNow - prevNoiseL;
  prevNoiseL = noiseNow;
  while (hatIdx + 1 < hatEvents.length && t >= hatEvents[hatIdx + 1]) hatIdx++;
  if (hatIdx >= 0 && hatEvents[hatIdx] <= t) {
    const tRel = t - hatEvents[hatIdx];
    if (tRel < 0.05) {
      const env = expEnv(tRel, 0.001, 0.02);
      const g = env * 0.12;
      l += hpL * g;
      r += hpL * g;
    }
  }

  // Riser whoosh before the chime
  if (t >= RISER_START && t < RISER_END) {
    const p = (t - RISER_START) / (RISER_END - RISER_START);
    const alpha = 0.02 + 0.35 * p;
    const nL = rand() * 2 - 1;
    const nR = rand() * 2 - 1;
    riserLpL += alpha * (nL - riserLpL);
    riserLpR += alpha * (nR - riserLpR);
    const env = 0.22 * ease(p);
    l += riserLpL * env;
    r += riserLpR * env;
  }

  // Chime
  const [cl, cr] = chimeSample(t);
  l += cl * 0.6;
  r += cr * 0.6;

  left[n] = l;
  right[n] = r;
}

// Normalize + soft clip (tanh) for a clean master.
let peak = 0;
for (let n = 0; n < N; n++) {
  peak = Math.max(peak, Math.abs(left[n]), Math.abs(right[n]));
}
const norm = peak > 0 ? 0.92 / peak : 1;

const buffer = Buffer.alloc(44 + N * 4);
buffer.write("RIFF", 0);
buffer.writeUInt32LE(36 + N * 4, 4);
buffer.write("WAVE", 8);
buffer.write("fmt ", 12);
buffer.writeUInt32LE(16, 16);
buffer.writeUInt16LE(1, 20); // PCM
buffer.writeUInt16LE(2, 22); // stereo
buffer.writeUInt32LE(SAMPLE_RATE, 24);
buffer.writeUInt32LE(SAMPLE_RATE * 2 * 2, 28);
buffer.writeUInt16LE(4, 32);
buffer.writeUInt16LE(16, 34);
buffer.write("data", 36);
buffer.writeUInt32LE(N * 4, 40);

for (let n = 0; n < N; n++) {
  const sl = Math.tanh(left[n] * norm) * 32767;
  const sr = Math.tanh(right[n] * norm) * 32767;
  buffer.writeInt16LE(clamp(Math.round(sl), -32768, 32767), 44 + n * 4);
  buffer.writeInt16LE(clamp(Math.round(sr), -32768, 32767), 44 + n * 4 + 2);
}

const outPath = path.join(__dirname, "..", "public", "audio", "tom-theme.wav");
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, buffer);
console.log(`Wrote ${outPath} (${(buffer.length / 1024 / 1024).toFixed(2)} MB)`);
