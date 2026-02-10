'use client';

import type { TargetAndTransition } from 'framer-motion';
import { motion, useReducedMotion } from 'framer-motion';
import type { FlameState } from '../../../utils/types';
import { FLAME_REGISTRY } from '../flames';
import { ShakeWrapper } from './ShakeWrapper';
import type { ShapeColors } from './types';

const stateVariants: Record<FlameState, TargetAndTransition> = {
  untended: { scale: 0.9, opacity: 0.88, y: 0 },
  burning: { scale: 1.1, opacity: 1, y: -4 },
  paused: { scale: 0.8, opacity: 0.95, y: 0 },
  sealing: { scale: 1.15, opacity: 1, y: -6 },
  sealed: { scale: 0, opacity: 1, y: 0.9 },
};

const DEFAULT_SVG_CLASS = 'h-24 w-20 sm:h-36 sm:w-28 md:h-44 md:w-36';

const springTransition = {
  type: 'spring' as const,
  stiffness: 200,
  damping: 20,
};
const fadeInTransition = { duration: 0.4, ease: 'easeOut' as const };
const sealBounceTransition = {
  type: 'spring' as const,
  stiffness: 120,
  damping: 12,
};

interface FlameRendererProps {
  state: FlameState;
  level: number;
  colors: ShapeColors;
  sealProgress?: number;
  className?: string;
}

export function FlameRenderer({
  state,
  level,
  colors,
  sealProgress = 0,
  className,
}: FlameRendererProps) {
  const shouldReduceMotion = useReducedMotion();
  const clampedLevel = Math.max(1, Math.min(8, level));
  const { Base, Flame, SealedFlame, animation } = FLAME_REGISTRY[clampedLevel];
  const svgClass = className ?? DEFAULT_SVG_CLASS;

  const fadeInInitial = shouldReduceMotion ? {} : { opacity: 0 };

  // Sealed state: bounce from sealing peak then settle into resting visual
  if (state === 'sealed') {
    const hasSealedFlame = !!SealedFlame;
    return (
      <motion.svg
        viewBox="0 0 100 100"
        className={svgClass}
        role="img"
        aria-hidden="true"
        initial={{ scale: 1.2, y: -6, ...fadeInInitial }}
        animate={{
          scale: 0.85,
          opacity: hasSealedFlame ? 1 : 0.7,
          y: 0,
        }}
        transition={{ ...sealBounceTransition, opacity: fadeInTransition }}
      >
        {SealedFlame ? (
          <SealedFlame colors={colors} />
        ) : (
          <>
            {Base && <Base />}
            <Flame colors={colors} />
          </>
        )}
      </motion.svg>
    );
  }

  // Reduced motion: simple static rendering
  if (shouldReduceMotion) {
    return (
      <motion.svg
        viewBox="0 0 100 100"
        className={svgClass}
        role="img"
        aria-hidden="true"
        animate={stateVariants[state]}
        transition={springTransition}
      >
        {Base && <Base />}
        <Flame colors={colors} />
      </motion.svg>
    );
  }

  // Compute SVG animate values: dynamic for sealing, from stateVariants otherwise
  const isSealing = state === 'sealing';
  const svgAnimate = isSealing
    ? { scale: 0.8 + sealProgress * 0.35, y: sealProgress * -6, opacity: 1 }
    : stateVariants[state];
  const svgTransition = isSealing
    ? { type: 'tween' as const, duration: 0.1, ease: 'linear' as const }
    : springTransition;

  const animDuration = animation.durations[state];
  const animTransition = {
    duration: animDuration,
    repeat: Infinity,
    ease: 'easeInOut' as const,
  };

  return (
    <ShakeWrapper
      active={isSealing && !shouldReduceMotion}
      progress={sealProgress}
    >
      <motion.svg
        viewBox="0 0 100 100"
        className={svgClass}
        role="img"
        aria-hidden="true"
        initial={{ ...svgAnimate, ...fadeInInitial }}
        animate={svgAnimate}
        transition={{ ...svgTransition, opacity: fadeInTransition }}
      >
        {Base && <Base />}
        <motion.g
          style={{ originX: animation.origin.x, originY: animation.origin.y }}
          animate={animation.variants[state]}
          transition={animTransition}
        >
          <Flame colors={colors} />
        </motion.g>
      </motion.svg>
    </ShakeWrapper>
  );
}
