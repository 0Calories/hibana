import { SmolderingEmbers } from '../SmolderingEmbers';
import type {
  FlameComponentProps,
  FlameDefinition,
  SealedFlameProps,
} from '../types';
import {
  FLICKER_DURATIONS,
  FLICKER_ORIGIN,
  FLICKER_VARIANTS,
  STANDARD_EMBERS,
} from './presets';

function WispFlame({ colors }: FlameComponentProps) {
  return (
    <>
      <circle cx="50" cy="60" r="20" fill={colors.dark} opacity={0.5} />
      <circle cx="50" cy="60" r="14" fill={colors.medium} opacity={0.7} />
      <circle cx="50" cy="60" r="8" fill={colors.light} />
      <circle cx="50" cy="60" r="4" fill="white" opacity={0.8} />
    </>
  );
}

function WispSealed({ colors }: SealedFlameProps) {
  return <SmolderingEmbers color={colors.medium} />;
}

export const Wisp: FlameDefinition = {
  Flame: WispFlame,
  SealedFlame: WispSealed,
  animation: {
    origin: FLICKER_ORIGIN,
    variants: FLICKER_VARIANTS,
    durations: FLICKER_DURATIONS,
  },
  effects: [STANDARD_EMBERS],
};
