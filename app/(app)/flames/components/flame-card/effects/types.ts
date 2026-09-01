import type { TargetAndTransition } from 'framer-motion';
import type { FlameColor } from '@/app/(app)/components/flames/colors';
import type { FlameState } from '../../../../components/flames/constants/state';
import type { FlameParticleEffect } from '../../particles';

export interface CompletedSmokeEffectConfig {
  type: 'completedSmoke';
  wickY: number;
  wickX?: number;
  /** When true, uses the flame's medium color for the tendril instead of grey smoke */
  useFlameColor?: boolean;
  /** Height of smoke column in SVG units — passed through to CompletedSmokeWisps */
  riseHeight?: number;
  /** When true, renders a single thin strand only — passed through to CompletedSmokeWisps */
  simple?: boolean;
}

export type EffectConfig = FlameParticleEffect | CompletedSmokeEffectConfig;

export type FlameComponentProps = {
  color: FlameColor;
};

export interface FlameDefinition {
  Flame: React.FC<FlameComponentProps>;
  Base?: React.FC;
  CompletedFlame?: React.FC<FlameComponentProps>;

  animation: {
    origin: { x: string; y: string };
    variants: Record<FlameState, TargetAndTransition>;
    durations: Record<FlameState, number>;
  };

  effects: EffectConfig[];
  /** Manual override for particle X bounds (percentage of container width) */
  xBounds?: { min: number; max: number };
}
