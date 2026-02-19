/**
 * Synthesized sound effects for the spark flyover system.
 * Uses Web Audio API — no audio files needed.
 *
 * Dev only: window.sparkSounds.tick() / .chime() / .burst(8)
 */

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx || ctx.state === 'closed') {
    ctx = new AudioContext();
  }
  if (ctx.state === 'suspended') {
    ctx.resume();
  }
  return ctx;
}

// ─── Tuning knobs (tweak these!) ────────────────────────────────────
const TICK_WAVE: OscillatorType = 'sine';
const TICK_VOLUME = 0.06;
const TICK_DURATION = 0.22;
const TICK_PITCH_BEND = 0.4; // start freq multiplier (>1 = bend down)
const TICK_HARMONIC_MIX = 0.4; // volume of 3rd harmonic relative to fundamental (0 = off)

const CHIME_WAVE: OscillatorType = 'triangle';
const CHIME_VOLUME = 0.06;
const CHIME_DURATION = 0.3;

// Pentatonic scale notes (Hz) — always sounds pleasant in any combination
const TICK_NOTES = [
  1047, // C6
  1175, // D6
  1319, // E6
  1568, // G6
  1760, // A6
];

/** Sparkle tick on each particle landing — sine fundamental + 3rd harmonic for bell shimmer */
export function playSparkTick() {
  const ac = getCtx();
  if (!ac) return;

  const now = ac.currentTime;
  const note = TICK_NOTES[Math.floor(Math.random() * TICK_NOTES.length)];

  // Fundamental
  const osc = ac.createOscillator();
  osc.type = TICK_WAVE;
  osc.frequency.setValueAtTime(note * TICK_PITCH_BEND, now);
  osc.frequency.exponentialRampToValueAtTime(note, now + 0.03);

  const gain = ac.createGain();
  gain.gain.setValueAtTime(TICK_VOLUME, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + TICK_DURATION);

  osc.connect(gain).connect(ac.destination);
  osc.start(now);
  osc.stop(now + TICK_DURATION);

  // 3rd harmonic — adds bell-like shimmer
  if (TICK_HARMONIC_MIX > 0) {
    const osc3 = ac.createOscillator();
    osc3.type = 'sine';
    osc3.frequency.setValueAtTime(note * 3 * TICK_PITCH_BEND, now);
    osc3.frequency.exponentialRampToValueAtTime(note * 3, now + 0.02);

    const gain3 = ac.createGain();
    gain3.gain.setValueAtTime(TICK_VOLUME * TICK_HARMONIC_MIX, now);
    gain3.gain.exponentialRampToValueAtTime(0.001, now + TICK_DURATION * 0.7);

    osc3.connect(gain3).connect(ac.destination);
    osc3.start(now);
    osc3.stop(now + TICK_DURATION * 0.7);
  }
}

/** Completion chime — ascending two-tone */
export function playCompletionChime() {
  const ac = getCtx();
  if (!ac) return;

  const now = ac.currentTime;

  for (const [freq, delay, vol] of [
    [1319, 0, CHIME_VOLUME], // E6
    [1760, 0.08, CHIME_VOLUME * 0.8], // A6
  ] as const) {
    const osc = ac.createOscillator();
    osc.type = CHIME_WAVE;
    osc.frequency.value = freq;

    const gain = ac.createGain();
    gain.gain.setValueAtTime(0, now + delay);
    gain.gain.linearRampToValueAtTime(vol, now + delay + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + delay + CHIME_DURATION);

    osc.connect(gain).connect(ac.destination);
    osc.start(now + delay);
    osc.stop(now + delay + CHIME_DURATION);
  }
}

// ─── Dev console helpers (tree-shaken in production) ────────────────
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  const burstTest = (count = 8) => {
    for (let i = 0; i < count; i++) {
      setTimeout(() => playSparkTick(), i * 70);
    }
    setTimeout(() => playCompletionChime(), count * 70 + 100);
  };
  (window as unknown as Record<string, unknown>).sparkSounds = {
    tick: playSparkTick,
    chime: playCompletionChime,
    burst: burstTest,
  };
}
