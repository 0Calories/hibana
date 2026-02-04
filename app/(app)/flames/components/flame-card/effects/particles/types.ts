import type { FlameState } from '../../../hooks/useFlameTimer';

/** Base particle properties shared by all particle types */
export interface Particle {
  id: number;
  x: number;
  size: number;
  delay: number;
  duration: number;
  drift: number;
}

export interface ParticleStateConfig {
  active: { count: number; sizeMultiplier: number };
  paused: { count: number; sizeMultiplier: number };
  untended: { count: number; sizeMultiplier: number };
}

export interface AnimationIntensity {
  opacity: number;
  speed: number;
}

export interface BaseParticleProps {
  state: FlameState;
  color: string;
}

export interface LevelAwareParticleProps extends BaseParticleProps {
  level: number;
}
