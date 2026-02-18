import type { TargetAndTransition } from 'framer-motion';
import type { FlameState } from '../../../utils/types';
import type { FlameParticleEffect, ParticleStateConfig } from '../../particles';
import { generateHash } from '../../particles';
import type { SealedSmokeEffectConfig } from './types';

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

const RISE_HEIGHT = 140;

const STANDARD_EMBER_STATES: ParticleStateConfig = {
  burning: { count: 16, sizeMultiplier: 1.4 },
  paused: { count: 5, sizeMultiplier: 1 },
  untended: { count: 1, sizeMultiplier: 1 },
  sealing: { count: 12, sizeMultiplier: 1.6 },
  sealed: { count: 0, sizeMultiplier: 0 },
};

const WISP_EMBER_STATES: ParticleStateConfig = {
  burning: { count: 12, sizeMultiplier: 2.4 },
  paused: { count: 5, sizeMultiplier: 1 },
  untended: { count: 3, sizeMultiplier: 1 },
  sealing: { count: 24, sizeMultiplier: 1.6 },
  sealed: { count: 3, sizeMultiplier: 0.6 },
};

const SEAL_READY_PALETTE: FlameParticleEffect['modifiers'] = [
  {
    condition: 'sealReady',
    palette: (colors) => [
      colors.light,
      '#fbbf24',
      colors.medium,
      '#f59e0b',
      '#fde68a',
    ],
  },
];

export const EMBER_EFFECT: FlameParticleEffect = {
  key: 'embers',
  constrainToFlame: true,
  stateConfig: STANDARD_EMBER_STATES,
  palette: (colors) => [colors.light, colors.light, colors.medium],
  animation: {
    bottom: '40%',
    className: 'rounded-full',
    initial: { opacity: 0, y: 0, x: 0 },
    animate: (particle, opacity) => ({
      opacity: [0, opacity, opacity * 0.6, 0],
      y: -RISE_HEIGHT,
      x: [0, particle.drift],
    }),
  },
  modifiers: SEAL_READY_PALETTE,
};

const S_PATH_EMBER_STATES: ParticleStateConfig = {
  burning: { count: 2, sizeMultiplier: 1 },
  paused: { count: 1, sizeMultiplier: 1 },
  untended: { count: 0, sizeMultiplier: 1 },
  sealing: { count: 3, sizeMultiplier: 1 },
  sealed: { count: 0, sizeMultiplier: 0 },
};

/** Fast wiggly embers that rise in an S-shaped sine path */
export const DANCING_EMBER_EFFECT: FlameParticleEffect = {
  key: 'dancingEmbers',
  constrainToFlame: true,
  stateConfig: S_PATH_EMBER_STATES,
  seed: 888,
  rangeConfig: { sizeRange: { min: 2, max: 3 } },
  palette: (colors) => [colors.light, colors.light, colors.medium],
  extras: (index, seed) => {
    const h = generateHash(index, seed + 555);
    return {
      sAmplitude: 4 + (h % 6), // 4–9px
      sinePeriod: 0.3 + ((h % 100) / 100) * 0.2, // 0.3–0.5s per oscillation
      speedJitter: 0.8 + ((h % 100) / 100) * 0.1, // 0.80–0.90
      opacityJitter: 1, // stay fully opaque
    };
  },
  animation: {
    bottom: '40%',
    className: 'rounded-full',
    initial: { opacity: 0, y: 0, x: 0 },
    animate: (particle, opacity) => {
      const amp = particle.sAmplitude ?? 8;
      return {
        opacity: [0, opacity, opacity, opacity * 0.6, 0],
        y: -RISE_HEIGHT * 1.4,
        x: [0, amp, 0, -amp, 0],
      };
    },
    transition: (particle, duration) => {
      const sinePeriod = particle.sinePeriod ?? 0.4;
      return {
        x: {
          duration: sinePeriod,
          ease: 'easeInOut',
          repeat: Math.ceil(duration / sinePeriod),
          repeatType: 'loop' as const,
        },
      };
    },
  },
  modifiers: SEAL_READY_PALETTE,
};

export const WISP_EMBER_EFFECT: FlameParticleEffect = {
  ...EMBER_EFFECT,
  stateConfig: WISP_EMBER_STATES,
};

const STANDARD_SMOKE_STATES: ParticleStateConfig = {
  burning: { count: 15, sizeMultiplier: 1.5 },
  paused: { count: 4, sizeMultiplier: 1 },
  untended: { count: 2, sizeMultiplier: 1 },
  sealing: { count: 10, sizeMultiplier: 1.3 },
  sealed: { count: 0, sizeMultiplier: 0 },
};

const OVERBURN_GREY_PALETTE = [
  '#6b7280',
  '#9ca3af',
  '#4b5563',
  '#78716c',
  '#a8a29e',
  '#57534e',
  '#d1d5db',
] as const;

export function smokeEffect(
  stateConfig?: ParticleStateConfig,
): FlameParticleEffect {
  return {
    key: 'smoke',
    constrainToFlame: true,
    stateConfig: stateConfig ?? STANDARD_SMOKE_STATES,
    seed: 777,
    palette: (colors) => [
      colors.medium,
      colors.dark,
      colors.medium,
      '#6b7280',
      '#9ca3af',
      '#4b5563',
      '#d1d5db',
    ],
    extras: (index, seed) => ({
      rotation: (generateHash(index, seed + 333) % 90) - 45,
    }),
    animation: {
      bottom: '35%',
      className: '',
      initial: { y: 0, x: 0, opacity: 0, rotate: 0, scale: 0.5 },
      animate: (particle, opacity) => ({
        y: [-10, -80, -140],
        x: [0, particle.drift * 0.5, particle.drift],
        opacity: [0, opacity, opacity * 0.6, 0],
        rotate: [0, (particle.rotation ?? 0) * 0.5, particle.rotation ?? 0],
        scale: [0.5, 1, 1.3, 0.8],
      }),
      ease: 'linear' as const,
    },
    modifiers: [
      {
        condition: 'overburning',
        palette: OVERBURN_GREY_PALETTE,
        stateOverrides: {
          burning: { count: 25, sizeMultiplier: 1.8 },
        },
        speedMultiplier: 0.65,
      },
    ],
  };
}

export function sealedSmokeEffect(
  wickY: number,
  wickX?: number,
): SealedSmokeEffectConfig {
  return { type: 'sealedSmoke', wickY, wickX };
}

export function simpleSealedSmokeEffect(
  wickY: number,
): SealedSmokeEffectConfig {
  return {
    type: 'sealedSmoke',
    wickY,
    useFlameColor: true,
    riseHeight: 70,
    simple: true,
  };
}
