import type { TargetAndTransition } from 'framer-motion';
import type { FlameState } from '../../../utils/types';
import type { ParticleStateConfig } from '../../particles';

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
  stateConfig: ParticleStateConfig;
}

export interface SmokeEffectConfig {
  type: 'smoke';
  stateConfig: ParticleStateConfig;
  baseSize: number;
}

export interface SealedSmokeEffectConfig {
  type: 'sealedSmoke';
  wickY: number;
  wickX?: number;
  /** When true, uses the flame's medium color for the tendril instead of grey smoke */
  useFlameColor?: boolean;
  /** Height of smoke column in SVG units — passed through to SealedSmokeWisps */
  riseHeight?: number;
  /** When true, renders a single thin strand only — passed through to SealedSmokeWisps */
  simple?: boolean;
}

export type EffectConfig =
  | EmberEffectConfig
  | SmokeEffectConfig
  | SealedSmokeEffectConfig;

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
