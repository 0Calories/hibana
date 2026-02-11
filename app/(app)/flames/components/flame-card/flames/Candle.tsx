import { motion, useReducedMotion } from 'framer-motion';
import type {
  FlameComponentProps,
  FlameDefinition,
  SealedFlameProps,
} from '../effects/types';
import {
  FLICKER_DURATIONS,
  FLICKER_ORIGIN,
  FLICKER_VARIANTS,
  STANDARD_EMBERS,
  sealedSmokeEffect,
  smokeEffect,
} from './presets';

function CandleBase() {
  return (
    <>
      <rect x="44" y="70" width="12" height="25" fill="#8B7355" rx="1" />
      <rect x="42" y="68" width="16" height="4" fill="#A08060" rx="1" />
      <ellipse cx="50" cy="95" rx="14" ry="4" fill="#6B5344" />
      <rect x="49" y="62" width="2" height="10" fill="#333" />
    </>
  );
}

function CandleFlame({ colors }: FlameComponentProps) {
  return (
    <>
      <polygon
        points="50,15 65,55 58,68 42,68 35,55"
        fill={colors.dark}
        opacity={0.8}
      />
      <polygon
        points="50,25 60,52 55,63 45,63 40,52"
        fill={colors.medium}
        opacity={0.9}
      />
      <polygon points="50,35 55,50 52,60 48,60 45,50" fill={colors.light} />
    </>
  );
}

function WickSmolder({ color }: { color: string }) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return (
      <rect x={49} y={61} width={2} height={2} fill={color} opacity={0.5} />
    );
  }

  return (
    <motion.rect
      x={49}
      y={61}
      width={2}
      height={2}
      fill={color}
      initial={{ opacity: 0.4 }}
      animate={{ opacity: [0.4, 0.9, 0.3, 0.7, 0.4] }}
      transition={{
        duration: 1.8,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
}

function CandleSealed({ colors }: SealedFlameProps) {
  return (
    <>
      <CandleBase />
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
        <CandleFlame colors={colors} />
      </motion.g>
      <WickSmolder color={colors.medium} />
    </>
  );
}

export const Candle: FlameDefinition = {
  Base: CandleBase,
  Flame: CandleFlame,
  SealedFlame: CandleSealed,
  animation: {
    origin: FLICKER_ORIGIN,
    variants: FLICKER_VARIANTS,
    durations: FLICKER_DURATIONS,
  },
  effects: [STANDARD_EMBERS, smokeEffect(4), sealedSmokeEffect(65)],
};
