import type { FlameState } from '@/app/(app)/flames/utils/types';
import type { ShapeColors } from '../types';

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
}

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
