import type { Easing } from 'framer-motion';
import type { FlameState } from '@/app/(app)/flames/utils/types';
import type { ShapeColors } from '../flame-card/effects/types';
import type { ParticleRangeConfig } from './utils';

/** Base particle properties shared by all particle types */
export interface Particle {
  id: number;
  x: number;
  size: number;
  delay: number;
  duration: number;
  drift: number;
  /** Deterministic index for picking a color shade from a palette */
  colorIndex: number;
  /** 0.70–0.99 multiplier on base state opacity */
  opacityJitter: number;
  /** 0.80–1.19 multiplier on animation duration */
  speedJitter: number;
}

/** Particle with extra deterministic fields (rotation, etc.) */
export type ExtendedParticle = Particle & Record<string, number>;

export interface ParticleStateConfig {
  burning: { count: number; sizeMultiplier: number };
  paused: { count: number; sizeMultiplier: number };
  untended: { count: number; sizeMultiplier: number };
  sealing?: { count: number; sizeMultiplier: number };
  sealed?: { count: number; sizeMultiplier: number };
}

export interface AnimationIntensity {
  opacity: number;
  speed: number;
}

export interface BaseParticleProps {
  state: FlameState;
  colors: ShapeColors;
}

// ---------------------------------------------------------------------------
// Unified particle effect types
// ---------------------------------------------------------------------------

export type PaletteFn = (colors: ShapeColors) => readonly string[];

export interface StateModifier {
  condition: 'sealReady' | 'overburning';
  palette?: PaletteFn | readonly string[];
  stateOverrides?: Partial<ParticleStateConfig>;
  speedMultiplier?: number;
}

export interface FlameParticleEffect {
  key: string;
  stateConfig: ParticleStateConfig;
  rangeConfig?: ParticleRangeConfig;
  seed?: number;
  palette: PaletteFn;
  animation: {
    bottom: string;
    className: string;
    initial: Record<string, number>;
    animate: (
      particle: ExtendedParticle,
      opacity: number,
    ) => Record<string, number | number[]>;
    ease?: Easing;
    /** Per-property transition overrides, merged on top of the base transition */
    transition?: (
      particle: ExtendedParticle,
      duration: number,
    ) => Record<string, unknown>;
  };
  extras?: (index: number, seed: number) => Record<string, number>;
  showWhen?: (state: FlameState) => boolean;
  modifiers?: StateModifier[];
}

export interface ParticleConditions {
  sealReady: boolean;
  overburning: boolean;
}
