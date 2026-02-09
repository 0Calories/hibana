'use client';

import { motion, useMotionValue, useReducedMotion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import type { FlameState } from '../../../utils/types';
import { FLAME_REGISTRY } from './flames';
import type { ShapeColors } from './types';
import { flickerVariants, radiateVariants, stateVariants } from './variants';

interface GeometricFlameProps {
  state: FlameState;
  level: number;
  colors: ShapeColors;
  /** 0-1 progress value during sealing, drives gradual growth + shake */
  sealProgress?: number;
}

export function GeometricFlame({
  state,
  level,
  colors,
  sealProgress = 0,
}: GeometricFlameProps) {
  const shouldReduceMotion = useReducedMotion();
  const clampedLevel = Math.max(1, Math.min(8, level));
  const { Base, Flame, isCelestial } = FLAME_REGISTRY[clampedLevel];

  const springTransition = {
    type: 'spring' as const,
    stiffness: 200,
    damping: 20,
  };

  const flickerDuration =
    state === 'sealing' ? 0 : state === 'active' ? 0.8 : 2;

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

  // Continuous shake driven by rAF + sin()
  const shakeX = useMotionValue(0);
  const shakeY = useMotionValue(0);
  const sealProgressRef = useRef(sealProgress);
  sealProgressRef.current = sealProgress;

  useEffect(() => {
    if (state !== 'sealing' || shouldReduceMotion) {
      shakeX.set(0);
      shakeY.set(0);
      return;
    }

    let rafId: number;
    const startTime = Date.now();

    const tick = () => {
      const p = sealProgressRef.current;
      const amp = 1 + p * 1;
      const freq = 8 + p * 2;
      const elapsed = (Date.now() - startTime) / 1000;
      shakeX.set(Math.sin(elapsed * freq * 2 * Math.PI) * amp);
      shakeY.set(Math.sin(elapsed * freq * 2 * Math.PI) * amp);
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [state, shouldReduceMotion, shakeX, shakeY]);

  // Sealed state: bounce from sealing peak then settle into resting visual.
  // The SealCelebration burst overlay masks the render branch switch.
  if (state === 'sealed') {
    const sealBounceTransition = {
      type: 'spring' as const,
      stiffness: 120,
      damping: 12,
    };

    if (isCelestial) {
      // Celestial: bounce-settle, flame transitions to ghost glow
      return (
        <motion.svg
          viewBox="0 0 100 100"
          className="h-24 w-20 sm:h-36 sm:w-28 md:h-44 md:w-36"
          role="img"
          aria-hidden="true"
          initial={{ scale: 1.2, y: -6 }}
          animate={{ scale: 0.85, opacity: 1, y: 0 }}
          transition={sealBounceTransition}
        >
          {Base && <Base />}
          <motion.g
            style={{ originX: '50%', originY: '50%' }}
            initial={{ opacity: 1 }}
            animate={
              shouldReduceMotion
                ? { opacity: 0.17 }
                : { opacity: [0.12, 0.22, 0.12] }
            }
            transition={
              shouldReduceMotion
                ? { duration: 0.3 }
                : {
                    duration: 4,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: 0.4,
                  }
            }
          >
            <Flame colors={colors} />
          </motion.g>
        </motion.svg>
      );
    }

    // Earthly: bounce-settle, flame fades out during bounce, base remains
    return (
      <motion.svg
        viewBox="0 0 100 100"
        className="h-24 w-20 sm:h-36 sm:w-28 md:h-44 md:w-36"
        role="img"
        aria-hidden="true"
        initial={{ scale: 1.2, opacity: 1, y: -6 }}
        animate={{ scale: 0.85, opacity: 0.7, y: 0 }}
        transition={sealBounceTransition}
      >
        {Base && <Base />}
        {/* Flame fades out during the bounce-down */}
        <motion.g
          initial={{ opacity: 1 }}
          animate={{ opacity: 0, scale: 2 }}
          transition={{ ...sealBounceTransition, duration: 1.5 }}
        >
          <Flame colors={colors} />
        </motion.g>
      </motion.svg>
    );
  }

  // Reduced motion: simple static rendering, no shake wrapper needed
  if (shouldReduceMotion) {
    return (
      <motion.svg
        viewBox="0 0 100 100"
        className="h-24 w-20 sm:h-36 sm:w-28 md:h-44 md:w-36"
        role="img"
        aria-hidden="true"
        initial={false}
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
    ? {
        scale: 0.8 + sealProgress * 0.35,
        y: sealProgress * -6,
        opacity: 1,
      }
    : stateVariants[state];
  // Sealing uses fast tween to follow progress; other states spring back naturally
  const svgTransition = isSealing
    ? { type: 'tween' as const, duration: 0.1, ease: 'linear' as const }
    : springTransition;

  // Stable DOM tree: always motion.div > motion.svg so spring-back works on release
  return (
    <motion.div style={{ x: shakeX, y: shakeY }}>
      <motion.svg
        viewBox="0 0 100 100"
        className="h-24 w-20 sm:h-36 sm:w-28 md:h-44 md:w-36"
        role="img"
        aria-hidden="true"
        initial={false}
        animate={svgAnimate}
        transition={svgTransition}
      >
        {Base && <Base />}
        <motion.g
          style={{ originX: '50%', originY: isCelestial ? '50%' : '100%' }}
          animate={
            isCelestial ? radiateVariants[state] : flickerVariants[state]
          }
          transition={isCelestial ? radiateTransition : flickerTransition}
        >
          <Flame colors={colors} />
        </motion.g>
      </motion.svg>
    </motion.div>
  );
}
