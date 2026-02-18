import { motion } from 'framer-motion';
import {
  EMBER_EFFECT,
  FLICKER_DURATIONS,
  FLICKER_ORIGIN,
  FLICKER_VARIANTS,
  DANCING_EMBER_EFFECT,
  sealedSmokeEffect,
  smokeEffect,
} from '../effects/presets';
import type {
  FlameComponentProps,
  FlameDefinition,
  SealedFlameProps,
} from '../effects/types';

function TorchBase() {
  return (
    <>
      <polygon points="42,65 58,65 54,98 46,98" fill="#5D4037" />
      <polygon points="44,65 56,65 53,98 47,98" fill="#6D4C41" />
      <ellipse cx="50" cy="65" rx="12" ry="5" fill="#4E342E" />
      <ellipse cx="50" cy="63" rx="10" ry="4" fill="#3E2723" />
    </>
  );
}

function TorchFlame({ colors }: FlameComponentProps) {
  return (
    <>
      <polygon
        points="50,5 75,50 65,65 35,65 25,50"
        fill={colors.dark}
        opacity={0.8}
      />
      <polygon
        points="50,15 68,48 60,60 40,60 32,48"
        fill={colors.medium}
        opacity={0.9}
      />
      <polygon points="50,25 58,45 54,55 46,55 42,45" fill={colors.light} />
    </>
  );
}

function TorchSealed({ colors }: SealedFlameProps) {
  return (
    <>
      <TorchBase />
      <motion.g
        initial={{ opacity: 1 }}
        animate={{ opacity: 0, scale: 2 }}
        transition={{
          type: 'spring',
          stiffness: 120,
          damping: 12,
          duration: 1.5,
        }}
      >
        <TorchFlame colors={colors} />
      </motion.g>
    </>
  );
}

export const Torch: FlameDefinition = {
  Base: TorchBase,
  Flame: TorchFlame,
  SealedFlame: TorchSealed,
  animation: {
    origin: FLICKER_ORIGIN,
    variants: FLICKER_VARIANTS,
    durations: FLICKER_DURATIONS,
  },
  effects: [
    EMBER_EFFECT,
    DANCING_EMBER_EFFECT,
    smokeEffect(),
    sealedSmokeEffect(65),
  ],
};
