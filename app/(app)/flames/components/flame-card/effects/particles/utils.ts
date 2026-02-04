import type { FlameState } from '../../../hooks/useFlameTimer';
import type {
  AnimationIntensity,
  Particle,
  ParticleStateConfig,
} from './types';

/** Seed for deterministic random generation (avoids hydration mismatch) */
const DEFAULT_SEED = 42;
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
 * Generate base particle properties using deterministic randomization.
 */
export function generateBaseParticle(
  index: number,
  seed: number = DEFAULT_SEED,
  config?: {
    xRange?: { min: number; max: number };
    sizeRange?: { min: number; max: number };
    delayRange?: { min: number; max: number };
    durationRange?: { min: number; max: number };
    driftRange?: { min: number; max: number };
  },
): Particle {
  const hash = generateHash(index, seed);

  const xRange = config?.xRange ?? { min: 35, max: 65 };
  const sizeRange = config?.sizeRange ?? { min: 3, max: 6 };
  const delayRange = config?.delayRange ?? { min: 0, max: 1.5 };
  const durationRange = config?.durationRange ?? { min: 1.5, max: 2.5 };
  const driftRange = config?.driftRange ?? { min: -10, max: 10 };

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
 * Get animation intensity values based on flame state.
 */
export function getAnimationIntensity(
  state: FlameState,
  config?: {
    activeOpacity?: number;
    pausedOpacity?: number;
    untendedOpacity?: number;
    activeSpeed?: number;
    pausedSpeed?: number;
    untendedSpeed?: number;
  },
): AnimationIntensity {
  const isActive = state === 'active';
  const isPaused = state === 'paused';

  return {
    opacity: isActive
      ? (config?.activeOpacity ?? 1)
      : isPaused
        ? (config?.pausedOpacity ?? 0.4)
        : (config?.untendedOpacity ?? 0.4),
    speed: isActive
      ? (config?.activeSpeed ?? 1)
      : isPaused
        ? (config?.pausedSpeed ?? 2)
        : (config?.untendedSpeed ?? 2.5),
  };
}

export function shouldShowParticles(state: FlameState): boolean {
  return state === 'active' || state === 'paused' || state === 'untended';
}
