import {
  EMBER_EFFECT,
  FLICKER_DURATIONS,
  FLICKER_ORIGIN,
  FLICKER_VARIANTS,
  smokeEffect,
} from '../effects/presets';
import type { FlameComponentProps, FlameDefinition } from '../effects/types';

function InfernoFlame({ colors }: FlameComponentProps) {
  return (
    <>
      <polygon
        points="8,25 20,50 15,95 0,95 0,45"
        fill={colors.dark}
        opacity={0.5}
      />
      <polygon
        points="92,20 100,45 100,95 85,95 80,50"
        fill={colors.dark}
        opacity={0.5}
      />
      <polygon
        points="18,12 32,42 25,95 8,95 5,48"
        fill={colors.dark}
        opacity={0.6}
      />
      <polygon
        points="82,8 95,45 92,95 75,95 68,42"
        fill={colors.dark}
        opacity={0.6}
      />
      <polygon
        points="28,5 45,38 38,95 18,95 12,45"
        fill={colors.dark}
        opacity={0.7}
      />
      <polygon
        points="72,3 88,42 82,95 62,95 55,38"
        fill={colors.dark}
        opacity={0.7}
      />
      <polygon
        points="38,8 55,35 48,95 28,95 22,42"
        fill={colors.medium}
        opacity={0.8}
      />
      <polygon
        points="62,5 78,40 72,95 52,95 45,35"
        fill={colors.medium}
        opacity={0.8}
      />
      <polygon
        points="50,0 72,45 65,95 35,95 28,45"
        fill={colors.medium}
        opacity={0.95}
      />
      <polygon points="50,15 62,42 58,80 42,80 38,42" fill={colors.light} />
      <polygon
        points="50,28 55,45 52,70 48,70 45,45"
        fill="white"
        opacity={0.7}
      />
    </>
  );
}

export const Inferno: FlameDefinition = {
  Flame: InfernoFlame,
  animation: {
    origin: FLICKER_ORIGIN,
    variants: FLICKER_VARIANTS,
    durations: FLICKER_DURATIONS,
  },
  effects: [EMBER_EFFECT, smokeEffect()],
};
