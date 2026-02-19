/**
 * Synthesized seal sound — plays during the long-press "seal" gesture.
 * Crackling tension: noise grains that fire faster and faster,
 * building to a booming finish when the seal completes.
 *
 * Uses Web Audio API — no audio files needed.
 *
 * Dev only: window.sealSound.demo() / .start() / .update(0.5) / .complete() / .cancel()
 */

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx || ctx.state === 'closed') {
    ctx = new AudioContext();
  }
  if (ctx.state === 'suspended') {
    void ctx.resume().catch(() => {
      /* ignore rejection; will resume on next gesture */
    });
  }
  return ctx;
}

// ─── Tuning knobs ───────────────────────────────────────────────────

// Crackle grains
const GRAIN_DURATION = 0.03;
const INTERVAL_START = 0.22; // seconds between grains at p=0
const INTERVAL_END = 0.035; // seconds between grains at p=1
const GRAIN_VOL_START = 0.04;
const GRAIN_VOL_END = 0.09;
const GRAIN_FILTER_MIN = 1500;
const GRAIN_FILTER_MAX = 6000;

// Underlying drone
const DRONE_FREQ = 110;
const DRONE_VOL = 0.02;

// Boom on completion
const BOOM_VOL = 0.2;
const BOOM_FREQ_START = 320; // higher start = more punch before dropping
const BOOM_FREQ_END = 30;
const BOOM_DURATION = 0.45;
const BOOM_NOISE_VOL = 0.18;
const BOOM_NOISE_DURATION = 0.15;

// ─── Shared noise buffer ────────────────────────────────────────────
let noiseBuffer: AudioBuffer | null = null;

function ensureNoiseBuffer(ac: AudioContext) {
  if (!noiseBuffer || noiseBuffer.sampleRate !== ac.sampleRate) {
    const length = ac.sampleRate; // 1 second
    noiseBuffer = ac.createBuffer(1, length, ac.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
  }
  return noiseBuffer;
}

// ─── State ──────────────────────────────────────────────────────────
let lastGrainTime = 0;
let running = false;
let currentProgress = 0;

let droneNodes: {
  osc: OscillatorNode;
  gain: GainNode;
  filter: BiquadFilterNode;
} | null = null;

function playGrain(ac: AudioContext, p: number) {
  const buf = ensureNoiseBuffer(ac);
  const now = ac.currentTime;

  const source = ac.createBufferSource();
  source.buffer = buf;
  const offset = Math.random() * (buf.duration - GRAIN_DURATION);

  const filter = ac.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value =
    GRAIN_FILTER_MIN + (GRAIN_FILTER_MAX - GRAIN_FILTER_MIN) * p;
  filter.Q.value = 1.5 + p * 3;

  const gain = ac.createGain();
  const vol = GRAIN_VOL_START + (GRAIN_VOL_END - GRAIN_VOL_START) * p;
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(vol, now + 0.003);
  gain.gain.linearRampToValueAtTime(vol * 0.8, now + GRAIN_DURATION * 0.6);
  gain.gain.exponentialRampToValueAtTime(0.001, now + GRAIN_DURATION);

  source.connect(filter).connect(gain).connect(ac.destination);
  source.start(now, offset, GRAIN_DURATION);
}

function stopDrone() {
  if (!droneNodes) return;
  try {
    droneNodes.osc.stop();
  } catch {
    /* already stopped */
  }
  droneNodes = null;
}

// ─── Public API ─────────────────────────────────────────────────────

/** Start the crackling seal sound. Call once when sealing begins. */
export function startSealSound() {
  const ac = getCtx();
  if (!ac) return;
  running = true;
  currentProgress = 0;
  lastGrainTime = 0;

  // Quiet sine drone underneath for body
  stopDrone();
  const now = ac.currentTime;
  const osc = ac.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(DRONE_FREQ, now);

  const filter = ac.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(200, now);

  const gain = ac.createGain();
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(DRONE_VOL, now + 0.1);

  osc.connect(filter).connect(gain).connect(ac.destination);
  osc.start(now);
  droneNodes = { osc, gain, filter };
}

/** Update crackling based on seal progress (0 → 1). Call every frame. */
export function updateSealSound(progress: number) {
  if (!running) return;
  const ac = getCtx();
  if (!ac) return;

  currentProgress = Math.max(0, Math.min(1, progress));
  const now = ac.currentTime;

  // Schedule grain if interval has elapsed
  const interval =
    INTERVAL_START + (INTERVAL_END - INTERVAL_START) * currentProgress;
  if (now - lastGrainTime >= interval) {
    playGrain(ac, currentProgress);
    lastGrainTime = now;
  }

  // Update drone — pitch and filter open with progress
  if (droneNodes) {
    const freq = DRONE_FREQ + currentProgress * DRONE_FREQ;
    droneNodes.osc.frequency.setTargetAtTime(freq, now, 0.05);
    droneNodes.filter.frequency.setTargetAtTime(
      200 + currentProgress * 600,
      now,
      0.05,
    );
    droneNodes.gain.gain.setTargetAtTime(
      DRONE_VOL + currentProgress * DRONE_VOL,
      now,
      0.05,
    );
  }
}

/** Soft-clip waveshaper for adding grit/harmonics */
function makeDistortion(ac: AudioContext, amount: number): WaveShaperNode {
  const ws = ac.createWaveShaper();
  const samples = 256;
  const curve = new Float32Array(samples);
  for (let i = 0; i < samples; i++) {
    const x = (i * 2) / samples - 1;
    curve[i] = ((Math.PI + amount) * x) / (Math.PI + amount * Math.abs(x));
  }
  ws.curve = curve;
  ws.oversample = '2x';
  return ws;
}

/** Seal completed — stop crackle, play boom. */
export function completeSealSound() {
  running = false;
  stopDrone();
  const ac = getCtx();
  if (!ac) return;

  const now = ac.currentTime;

  // ── Rapid final crackle volley ──
  for (let i = 0; i < 8; i++) {
    setTimeout(() => playGrain(ac, 1), i * 15);
  }

  // ── Layer 1: Distorted boom body ──
  // Square wave through soft-clip distortion for gritty midrange
  const boom = ac.createOscillator();
  boom.type = 'square';
  boom.frequency.setValueAtTime(BOOM_FREQ_START, now);
  boom.frequency.exponentialRampToValueAtTime(
    BOOM_FREQ_END,
    now + BOOM_DURATION * 0.5,
  );

  const dist = makeDistortion(ac, 8);
  const boomGain = ac.createGain();
  boomGain.gain.setValueAtTime(BOOM_VOL, now);
  boomGain.gain.exponentialRampToValueAtTime(0.001, now + BOOM_DURATION);

  // Low-pass to tame the harsh square harmonics post-distortion
  const boomLP = ac.createBiquadFilter();
  boomLP.type = 'lowpass';
  boomLP.frequency.setValueAtTime(800, now);
  boomLP.frequency.exponentialRampToValueAtTime(100, now + BOOM_DURATION * 0.7);

  boom.connect(dist).connect(boomLP).connect(boomGain).connect(ac.destination);
  boom.start(now);
  boom.stop(now + BOOM_DURATION);

  // ── Layer 2: Noise crack (attack transient) ──
  const buf = ensureNoiseBuffer(ac);
  const noiseSrc = ac.createBufferSource();
  noiseSrc.buffer = buf;

  const noiseFilter = ac.createBiquadFilter();
  noiseFilter.type = 'lowpass';
  noiseFilter.frequency.setValueAtTime(5000, now);
  noiseFilter.frequency.exponentialRampToValueAtTime(
    150,
    now + BOOM_NOISE_DURATION,
  );

  const noiseGain = ac.createGain();
  noiseGain.gain.setValueAtTime(BOOM_NOISE_VOL, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + BOOM_NOISE_DURATION);

  noiseSrc.connect(noiseFilter).connect(noiseGain).connect(ac.destination);
  noiseSrc.start(now, Math.random() * 0.5, BOOM_NOISE_DURATION);

  // ── Layer 3: Sub-bass thump ──
  const sub = ac.createOscillator();
  sub.type = 'sine';
  sub.frequency.setValueAtTime(70, now);
  sub.frequency.exponentialRampToValueAtTime(22, now + 0.25);

  const subGain = ac.createGain();
  subGain.gain.setValueAtTime(BOOM_VOL * 0.9, now);
  subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

  sub.connect(subGain).connect(ac.destination);
  sub.start(now);
  sub.stop(now + 0.35);

  // ── Layer 4: Mid-range impact body ──
  // Short sine at ~200Hz for the "punch" you feel
  const mid = ac.createOscillator();
  mid.type = 'sine';
  mid.frequency.setValueAtTime(200, now);
  mid.frequency.exponentialRampToValueAtTime(80, now + 0.15);

  const midGain = ac.createGain();
  midGain.gain.setValueAtTime(BOOM_VOL * 0.6, now);
  midGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

  mid.connect(midGain).connect(ac.destination);
  mid.start(now);
  mid.stop(now + 0.2);
}

/** Seal cancelled — crackle fades out. */
export function cancelSealSound() {
  running = false;
  if (droneNodes) {
    const ac = getCtx();
    if (ac) {
      const now = ac.currentTime;
      droneNodes.gain.gain.setTargetAtTime(0.001, now, 0.04);
    }
    const n = droneNodes;
    droneNodes = null;
    setTimeout(() => {
      try {
        n.osc.stop();
      } catch {
        /* already stopped */
      }
    }, 180);
  }
}

// ─── Dev console helpers (tree-shaken in production) ────────────────
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  function runDemo() {
    startSealSound();
    const start = Date.now();
    const duration = 2000;
    const tick = () => {
      const p = Math.min((Date.now() - start) / duration, 1);
      updateSealSound(p);
      if (p < 1) {
        requestAnimationFrame(tick);
      } else {
        completeSealSound();
      }
    };
    requestAnimationFrame(tick);
  }

  (window as unknown as Record<string, unknown>).sealSound = {
    start: startSealSound,
    update: updateSealSound,
    complete: completeSealSound,
    cancel: cancelSealSound,
    demo: runDemo,
  };
}
