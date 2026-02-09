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

  const transition = {
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
  const shakeX = useMotionValue(20);
  const shakeY = useMotionValue(20);
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
      // Amplitude: baseline → 4px at full progress
      const amp = 1 + p * 1;
      // Frequency: starts at 5Hz, accelerates to 10Hz
      const freq = 8 + p * 2;
      const elapsed = (Date.now() - startTime) / 1000;
      shakeX.set(Math.sin(elapsed * freq * 2 * Math.PI) * amp);
      shakeY.set(Math.sin(elapsed * freq * 2 * Math.PI) * amp);
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [state, shouldReduceMotion, shakeX, shakeY]);

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
      </motion.svg>
    );
  }

  // Sealing state: gradual growth + shake driven by sealProgress
  if (state === 'sealing') {
    const scale = 0.8 + sealProgress * 0.35; // 0.8 → 1.15
    const y = sealProgress * -6;

    return (
      <motion.div style={{ x: shakeX, y: shakeY }}>
        <motion.svg
          viewBox="0 0 100 100"
          className="h-24 w-20 sm:h-36 sm:w-28 md:h-44 md:w-36"
          role="img"
          aria-hidden="true"
          initial={false}
          animate={{ scale, y }}
          transition={{ type: 'tween', duration: 0.1, ease: 'linear' }}
        >
          {Base && <Base />}
          {!shouldReduceMotion ? (
            <motion.g
              style={{
                originX: '50%',
                originY: isCelestial ? '50%' : '100%',
              }}
              animate={
                isCelestial ? radiateVariants[state] : flickerVariants[state]
              }
              transition={isCelestial ? radiateTransition : flickerTransition}
            >
              <Flame colors={colors} />
            </motion.g>
          ) : (
            <Flame colors={colors} />
          )}
        </motion.svg>
      </motion.div>
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
      {Base && <Base />}
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
