'use client';

import { motion, useReducedMotion } from 'framer-motion';
import type { FlameState } from '../../../utils/types';
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
  const { Base, Flame, isCelestial } = FLAME_REGISTRY[clampedLevel];

  const transition = {
    type: 'spring' as const,
    stiffness: 200,
    damping: 20,
  };

  const flickerDuration =
    state === 'sealing' ? 0.5 : state === 'active' ? 0.8 : 2;

  const flickerTransition = {
    duration: flickerDuration,
    repeat: Infinity,
    ease: 'easeInOut' as const,
  };

  const radiateDuration =
    state === 'sealing' ? 1.2 : state === 'active' ? 2 : 3;

  const radiateTransition = {
    duration: radiateDuration,
    repeat: Infinity,
    ease: 'easeInOut' as const,
  };

  if (state === 'sealed') {
    if (isCelestial) {
      return (
        <motion.svg
          viewBox="0 0 100 100"
          className="h-24 w-20 sm:h-36 sm:w-28 md:h-44 md:w-36"
          role="img"
          aria-hidden="true"
          initial={false}
          animate={{ scale: 0.85, opacity: 1, y: 0 }}
          transition={transition}
        >
          {Base && <Base />}
          <motion.g
            style={{ originX: '50%', originY: '50%' }}
            animate={
              shouldReduceMotion
                ? { opacity: 0.17 }
                : { opacity: [0.12, 0.22, 0.12] }
            }
            transition={
              shouldReduceMotion
                ? { duration: 0.3 }
                : { duration: 4, repeat: Infinity, ease: 'easeInOut' }
            }
          >
            <Flame colors={colors} />
          </motion.g>
        </motion.svg>
      );
    }

    // Earthly sealed: flame hidden, base remains
    return (
      <motion.svg
        viewBox="0 0 100 100"
        className="h-24 w-20 sm:h-36 sm:w-28 md:h-44 md:w-36"
        role="img"
        aria-hidden="true"
        initial={false}
        animate={{ scale: 0.85, opacity: 0.7, y: 0 }}
        transition={transition}
      >
        {Base && <Base />}
        {/* No Flame rendered - it's been sealed */}
      </motion.svg>
    );
  }

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
        {Base && <Base />}
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
