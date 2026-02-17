import type { FlameState } from '@/app/(app)/flames/utils/types';
import type {
  AnimationIntensity,
  Particle,
  ParticleStateConfig,
} from './types';

export interface ParticleRangeConfig {
  xRange?: { min: number; max: number };
  sizeRange?: { min: number; max: number };
  delayRange?: { min: number; max: number };
  durationRange?: { min: number; max: number };
  driftRange?: { min: number; max: number };
}

/** Seed for deterministic random generation (avoids hydration mismatch) */
const DEFAULT_SEED = 420;
const HASH_PRIME = 9973;
const HASH_MOD = 10000;

/**
 * Generate a deterministic hash value for a given index.
 * Uses a seeded algorithm to ensure consistent values between server and client.
 */
export function generateHash(
  index: number,
  seed: number = DEFAULT_SEED,
): number {
  return (seed * (index + 1) * HASH_PRIME) % HASH_MOD;
}

/**
 * Generates a base upward floating particle using deterministic randomization.
 */
export function generateFloatingParticle(
  index: number,
  seed: number = DEFAULT_SEED,
  config?: ParticleRangeConfig,
): Particle {
  const xRange = config?.xRange ?? { min: 35, max: 65 };
  const sizeRange = config?.sizeRange ?? { min: 3, max: 6 };
  const delayRange = config?.delayRange ?? { min: 0, max: 1.5 };
  const durationRange = config?.durationRange ?? { min: 1.5, max: 2.5 };
  const driftRange = config?.driftRange ?? { min: -10, max: 10 };

  const hash = generateHash(index, seed);
  const colorHash = generateHash(index, seed + 77);

  return {
    id: index,
    x: xRange.min + (hash % (xRange.max - xRange.min)),
    size:
      sizeRange.min + ((hash % 100) / 100) * (sizeRange.max - sizeRange.min),
    delay:
      delayRange.min +
      ((hash % 1000) / 1000) * (delayRange.max - delayRange.min),
    duration:
      durationRange.min +
      ((hash % 1000) / 1000) * (durationRange.max - durationRange.min),
    drift: driftRange.min + (hash % (driftRange.max - driftRange.min + 1)),
    colorIndex: colorHash,
  };
}

export function generateParticles<T extends Particle>(
  state: FlameState,
  stateConfig: ParticleStateConfig,
  particleFactory: (index: number, sizeMultiplier: number) => T,
): T[] {
  const config = stateConfig[state as keyof ParticleStateConfig];
  if (!config) return [];

  return Array.from({ length: config.count }, (_, i) =>
    particleFactory(i, config.sizeMultiplier),
  );
}

/**
 * Get particle opacity and animation speed values based on flame state.
 */
export function getParticleIntensity(
  state: FlameState,
  config?: {
    activeOpacity?: number;
    inactiveOpacity?: number;
    activeSpeed?: number;
    inactiveSpeed?: number;
  },
): AnimationIntensity {
  switch (state) {
    case 'burning':
      return {
        opacity: config?.activeOpacity ?? 1,
        speed: config?.activeSpeed ?? 1,
      };
    case 'untended':
    case 'paused':
    case 'sealed':
    case 'sealing':
      return {
        opacity: config?.inactiveOpacity ?? 0.4,
        speed: config?.inactiveSpeed ?? 1,
      };
  }
}

export function shouldShowParticles(state: FlameState): boolean {
  return (
    state === 'burning' ||
    state === 'paused' ||
    state === 'untended' ||
    state === 'sealing'
  );
}
