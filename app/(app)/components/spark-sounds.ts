/**
 * Synthesized sound effects for the spark flyover system.
 * Uses Web Audio API — no audio files needed.
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

// Pentatonic scale notes (Hz) — always sounds pleasant in any combination
const TICK_NOTES = [
  1047, // C6
  1175, // D6
  1319, // E6
  1568, // G6
  1760, // A6
];

/** Videogamey sparkle tick — square wave with pitch bend, pentatonic scale */
export function playSparkTick() {
  const ac = getCtx();
  if (!ac) return;

  const now = ac.currentTime;
  const note = TICK_NOTES[Math.floor(Math.random() * TICK_NOTES.length)];
  const duration = 0.1;

  const osc = ac.createOscillator();
  osc.type = 'square';
  osc.frequency.setValueAtTime(note * 1.5, now);
  osc.frequency.exponentialRampToValueAtTime(note, now + 0.03);

  const gain = ac.createGain();
  gain.gain.setValueAtTime(0.04, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

  osc.connect(gain).connect(ac.destination);
  osc.start(now);
  osc.stop(now + duration);
}

/** Completion chime — ascending two-tone with square wave character */
export function playCompletionChime() {
  const ac = getCtx();
  if (!ac) return;

  const now = ac.currentTime;

  for (const [freq, delay, vol] of [
    [1319, 0, 0.05], // E6
    [1760, 0.08, 0.04], // A6
  ] as const) {
    const osc = ac.createOscillator();
    osc.type = 'square';
    osc.frequency.value = freq;

    const gain = ac.createGain();
    gain.gain.setValueAtTime(0, now + delay);
    gain.gain.linearRampToValueAtTime(vol, now + delay + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.25);

    osc.connect(gain).connect(ac.destination);
    osc.start(now + delay);
    osc.stop(now + delay + 0.25);
  }
}
