'use client';

import { motion, useReducedMotion } from 'framer-motion';
import type { FlameState } from '../hooks/useFlameTimer';

interface GeometricFlameProps {
  state: FlameState;
  colors: {
    light: string;
    medium: string;
    dark: string;
  };
}

const stateVariants = {
  idle: {
    scale: 0.9,
    opacity: 0.7,
    y: 0,
  },
  active: {
    scale: 1.2,
    opacity: 1,
    y: -4,
  },
  paused: {
    scale: 0.8,
    opacity: 0.5,
    y: 0,
  },
  completed: {
    scale: 0,
    opacity: 0,
    y: -10,
  },
};

const flickerVariants = {
  idle: {
    scaleY: [1, 0.95, 1.02, 0.98, 1],
    scaleX: [1, 1.02, 0.98, 1.01, 1],
  },
  active: {
    scaleY: [1, 1.1, 0.95, 1.15, 0.9, 1.05, 1],
    scaleX: [1, 0.95, 1.05, 0.92, 1.08, 0.97, 1],
  },
  paused: {
    scaleY: [1, 0.98, 1.01, 0.99, 1],
    scaleX: [1, 1.01, 0.99, 1.005, 1],
  },
  completed: {
    scaleY: 1,
    scaleX: 1,
  },
};

export function GeometricFlame({ state, colors }: GeometricFlameProps) {
  const shouldReduceMotion = useReducedMotion();

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

  // Simplified animations for reduced motion preference
  if (shouldReduceMotion) {
    return (
      <motion.svg
        viewBox="0 0 100 140"
        className="h-16 w-12 sm:h-20 sm:w-16 md:h-28 md:w-20"
        role="img"
        aria-hidden="true"
        initial={false}
        animate={stateVariants[state]}
        transition={transition}
      >
        <polygon
          points="50,0 85,90 70,140 30,140 15,90"
          fill={colors.dark}
          opacity={0.8}
        />
        <polygon
          points="50,20 72,85 62,125 38,125 28,85"
          fill={colors.medium}
          opacity={0.9}
        />
        <polygon points="50,40 60,80 55,110 45,110 40,80" fill={colors.light} />
      </motion.svg>
    );
  }

  return (
    <motion.svg
      viewBox="0 0 100 140"
      className="h-16 w-12 sm:h-20 sm:w-16 md:h-28 md:w-20"
      role="img"
      aria-hidden="true"
      initial={false}
      animate={stateVariants[state]}
      transition={transition}
    >
      <motion.polygon
        points="50,0 85,90 70,140 30,140 15,90"
        fill={colors.dark}
        opacity={0.8}
        style={{ originX: '50%', originY: '100%' }}
        animate={flickerVariants[state]}
        transition={{
          ...flickerTransition,
          duration: state === 'active' ? 1.2 : 3,
        }}
      />
      <motion.polygon
        points="50,20 72,85 62,125 38,125 28,85"
        fill={colors.medium}
        opacity={0.9}
        style={{ originX: '50%', originY: '100%' }}
        animate={flickerVariants[state]}
        transition={{
          ...flickerTransition,
          duration: state === 'active' ? 0.9 : 2.5,
          delay: 0.1,
        }}
      />
      <motion.polygon
        points="50,40 60,80 55,110 45,110 40,80"
        fill={colors.light}
        style={{ originX: '50%', originY: '100%' }}
        animate={flickerVariants[state]}
        transition={{
          ...flickerTransition,
          duration: state === 'active' ? 0.6 : 2,
          delay: 0.2,
        }}
      />
    </motion.svg>
  );
}
