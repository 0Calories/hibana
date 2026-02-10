import type { TargetAndTransition } from 'framer-motion';
import type { FlameState } from '../../../utils/types';
import type { ParticleStateConfig } from './particles';

export interface ShapeColors {
  light: string;
  medium: string;
  dark: string;
}

export interface FlameComponentProps {
  colors: ShapeColors;
}

export interface SealedFlameProps {
  colors: ShapeColors;
}

export interface EmberEffectConfig {
  type: 'embers';
  states: ParticleStateConfig;
}

export interface SmokeEffectConfig {
  type: 'smoke';
  states: ParticleStateConfig;
  baseSize: number;
}

export type EffectConfig = EmberEffectConfig | SmokeEffectConfig;

export interface FlameDefinition {
  Flame: React.FC<FlameComponentProps>;
  Base?: React.FC;
  SealedFlame?: React.FC<SealedFlameProps>;

  animation: {
    origin: { x: string; y: string };
    variants: Record<FlameState, TargetAndTransition>;
    durations: Record<FlameState, number>;
  };

  effects: EffectConfig[];
}
