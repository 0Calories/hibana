'use client';

import { motion, useReducedMotion } from 'framer-motion';
import type { FlameState } from '../../hooks/useFlameTimer';
import { FLAME_REGISTRY } from './flames';
import type { ShapeColors } from './types';
import { flickerVariants, radiateVariants, stateVariants } from './variants';

interface GeometricFlameProps {
  state: FlameState;
  level: number;
  colors: ShapeColors;
}

export function GeometricFlame({ state, level, colors }: GeometricFlameProps) {
  const shouldReduceMotion = useReducedMotion();
  const clampedLevel = Math.max(1, Math.min(8, level));
  const flameDefinition = FLAME_REGISTRY[clampedLevel];
  const { Base, Flame, isCelestial } = flameDefinition;

  const transition = {
    type: 'spring' as const,
    stiffness: 200,
    damping: 20,
  };

  const flickerTransition = {
    duration: state === 'active' ? 0.8 : 2,
    repeat: Infinity,
    ease: 'easeInOut' as const,
  };

  const radiateTransition = {
    duration: state === 'active' ? 2 : 3,
    repeat: Infinity,
    ease: 'easeInOut' as const,
  };

  if (shouldReduceMotion) {
    return (
      <motion.svg
        viewBox="0 0 100 100"
        className="h-24 w-20 sm:h-36 sm:w-28 md:h-44 md:w-36"
        role="img"
        aria-hidden="true"
        initial={false}
        animate={stateVariants[state]}
        transition={transition}
      >
        <Flame colors={colors} />
      </motion.svg>
    );
  }

  return (
    <motion.svg
      viewBox="0 0 100 100"
      className="h-24 w-20 sm:h-36 sm:w-28 md:h-44 md:w-36"
      role="img"
      aria-hidden="true"
      initial={false}
      animate={stateVariants[state]}
      transition={transition}
    >
      {/* Static base - not animated */}
      {Base && <Base />}
      {/* Animated flame/celestial body */}
      <motion.g
        style={{ originX: '50%', originY: isCelestial ? '50%' : '100%' }}
        animate={isCelestial ? radiateVariants[state] : flickerVariants[state]}
        transition={isCelestial ? radiateTransition : flickerTransition}
      >
        <Flame colors={colors} />
      </motion.g>
    </motion.svg>
  );
}
