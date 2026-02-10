import type { TargetAndTransition } from 'framer-motion';
import type { FlameState } from '../../../utils/types';
import type { ParticleStateConfig } from '../effects/particles';
import type { EmberEffectConfig, SmokeEffectConfig } from '../effects/types';

// ---------------------------------------------------------------------------
// Animation variant maps
// ---------------------------------------------------------------------------

export const FLICKER_VARIANTS: Record<FlameState, TargetAndTransition> = {
  untended: {
    scaleY: [1, 0.95, 1.02, 0.98, 1],
    scaleX: [1, 1.02, 0.98, 1.01, 1],
  },
  burning: {
    scaleY: [1, 1.1, 0.95, 1.15, 0.9, 1.05, 1],
    scaleX: [1, 0.95, 1.05, 0.92, 1.08, 0.97, 1],
  },
  paused: {
    scaleY: [1, 0.98, 1.01, 0.99, 1],
    scaleX: [1, 1.01, 0.99, 1.005, 1],
  },
  sealing: {
    scaleY: [1, 1.12, 0.88, 1.15, 0.85, 1.1, 1],
    scaleX: [1, 0.9, 1.1, 0.88, 1.12, 0.92, 1],
  },
  sealed: {
    scaleY: 1,
    scaleX: 1,
  },
};

export const RADIATE_VARIANTS: Record<FlameState, TargetAndTransition> = {
  untended: {
    scale: [1, 1.08, 1.03, 1.06, 1],
    rotate: [0, 3, -2, 1, 0],
  },
  burning: {
    scale: [1, 1.15, 1.08, 1.12, 1.05, 1.1, 1],
    rotate: [0, 5, -3, 4, -2, 3, 0],
  },
  paused: {
    scale: [1, 1.05, 1.02, 1.04, 1],
    rotate: [0, 2, -1, 1, 0],
  },
  sealing: {
    scale: [1, 1.18, 1.05, 1.2, 1.08, 1.15, 1],
    rotate: [0, 6, -4, 5, -3, 4, 0],
  },
  sealed: {
    scale: 1,
    rotate: 0,
  },
};

// ---------------------------------------------------------------------------
// Animation duration maps
// ---------------------------------------------------------------------------

export const FLICKER_DURATIONS: Record<FlameState, number> = {
  untended: 2,
  burning: 0.8,
  paused: 2,
  sealing: 0,
  sealed: 0,
};

export const RADIATE_DURATIONS: Record<FlameState, number> = {
  untended: 3,
  burning: 2,
  paused: 3,
  sealing: 1.2,
  sealed: 0,
};

// ---------------------------------------------------------------------------
// Animation origins
// ---------------------------------------------------------------------------

export const FLICKER_ORIGIN = { x: '50%', y: '100%' } as const;
export const RADIATE_ORIGIN = { x: '50%', y: '50%' } as const;

// ---------------------------------------------------------------------------
// Effect presets
// ---------------------------------------------------------------------------

const STANDARD_EMBER_STATES: ParticleStateConfig = {
  burning: { count: 8, sizeMultiplier: 1.4 },
  paused: { count: 3, sizeMultiplier: 1 },
  untended: { count: 1, sizeMultiplier: 1 },
  sealing: { count: 12, sizeMultiplier: 1.6 },
  sealed: { count: 1, sizeMultiplier: 1 },
};

export const STANDARD_EMBERS: EmberEffectConfig = {
  type: 'embers',
  states: STANDARD_EMBER_STATES,
};

export const STANDARD_SMOKE_STATES: ParticleStateConfig = {
  burning: { count: 15, sizeMultiplier: 1.5 },
  paused: { count: 4, sizeMultiplier: 1 },
  untended: { count: 2, sizeMultiplier: 1 },
  sealing: { count: 10, sizeMultiplier: 1.3 },
  sealed: { count: 0, sizeMultiplier: 0 },
};

export function smokeEffect(baseSize: number): SmokeEffectConfig {
  return { type: 'smoke', states: STANDARD_SMOKE_STATES, baseSize };
}
