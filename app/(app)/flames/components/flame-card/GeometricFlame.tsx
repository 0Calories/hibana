'use client';

import { motion, useReducedMotion } from 'framer-motion';
import type { FlameState } from '../hooks/useFlameTimer';

interface GeometricFlameProps {
  state: FlameState;
  level: number;
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

// Level 1: Ember - tiny glowing dot
function EmberShape({ colors }: { colors: GeometricFlameProps['colors'] }) {
  return (
    <>
      <circle cx="50" cy="70" r="18" fill={colors.dark} opacity={0.6} />
      <circle cx="50" cy="70" r="12" fill={colors.medium} opacity={0.8} />
      <circle cx="50" cy="70" r="6" fill={colors.light} />
    </>
  );
}

// Level 2: Candle - tall, thin, elegant point
function CandleShape({ colors }: { colors: GeometricFlameProps['colors'] }) {
  return (
    <>
      <polygon
        points="50,10 70,80 60,100 40,100 30,80"
        fill={colors.dark}
        opacity={0.8}
      />
      <polygon
        points="50,25 62,75 56,92 44,92 38,75"
        fill={colors.medium}
        opacity={0.9}
      />
      <polygon points="50,40 55,70 52,85 48,85 45,70" fill={colors.light} />
    </>
  );
}

// Level 3: Torch - wider, more dynamic, slight lean
function TorchShape({ colors }: { colors: GeometricFlameProps['colors'] }) {
  return (
    <>
      <polygon
        points="45,5 80,70 70,100 30,100 20,70"
        fill={colors.dark}
        opacity={0.8}
      />
      <polygon
        points="47,20 70,65 62,90 35,90 28,65"
        fill={colors.medium}
        opacity={0.9}
      />
      <polygon points="48,35 60,60 55,80 40,80 38,60" fill={colors.light} />
    </>
  );
}

// Level 4: Bonfire - multiple flame tongues, wide base
function BonfireShape({ colors }: { colors: GeometricFlameProps['colors'] }) {
  return (
    <>
      {/* Left tongue */}
      <polygon
        points="25,20 40,70 35,100 15,100 10,70"
        fill={colors.dark}
        opacity={0.7}
      />
      {/* Right tongue */}
      <polygon
        points="75,25 90,70 85,100 65,100 60,70"
        fill={colors.dark}
        opacity={0.7}
      />
      {/* Center main flame */}
      <polygon
        points="50,5 75,65 68,100 32,100 25,65"
        fill={colors.dark}
        opacity={0.8}
      />
      <polygon
        points="50,20 68,60 62,90 38,90 32,60"
        fill={colors.medium}
        opacity={0.9}
      />
      <polygon points="50,35 58,55 54,80 46,80 42,55" fill={colors.light} />
    </>
  );
}

// Level 5: Blaze - aggressive angles, multiple chaotic peaks
function BlazeShape({ colors }: { colors: GeometricFlameProps['colors'] }) {
  return (
    <>
      {/* Outer chaotic flames */}
      <polygon
        points="20,15 35,50 30,100 10,100 5,60"
        fill={colors.dark}
        opacity={0.6}
      />
      <polygon
        points="80,10 95,55 90,100 70,100 65,50"
        fill={colors.dark}
        opacity={0.6}
      />
      <polygon
        points="35,8 50,45 45,100 25,100 20,55"
        fill={colors.dark}
        opacity={0.7}
      />
      <polygon
        points="65,5 80,50 75,100 55,100 50,45"
        fill={colors.dark}
        opacity={0.7}
      />
      {/* Center blaze */}
      <polygon
        points="50,0 72,55 65,100 35,100 28,55"
        fill={colors.medium}
        opacity={0.9}
      />
      <polygon points="50,20 62,50 57,85 43,85 38,50" fill={colors.light} />
    </>
  );
}

// Level 6: Inferno - swirling, layered, intense
function InfernoShape({ colors }: { colors: GeometricFlameProps['colors'] }) {
  return (
    <>
      {/* Swirling outer layers */}
      <ellipse
        cx="50"
        cy="60"
        rx="45"
        ry="50"
        fill={colors.dark}
        opacity={0.5}
      />
      <polygon
        points="15,25 30,5 50,0 70,5 85,25 90,60 85,90 70,100 30,100 15,90 10,60"
        fill={colors.dark}
        opacity={0.7}
      />
      <polygon
        points="25,30 40,12 60,12 75,30 78,60 72,85 50,95 28,85 22,60"
        fill={colors.medium}
        opacity={0.85}
      />
      <polygon
        points="35,35 45,22 55,22 65,35 67,58 60,78 50,85 40,78 33,58"
        fill={colors.medium}
        opacity={0.95}
      />
      <ellipse cx="50" cy="55" rx="12" ry="18" fill={colors.light} />
    </>
  );
}

// Level 7: Star - radial points, celestial
function StarShape({ colors }: { colors: GeometricFlameProps['colors'] }) {
  return (
    <>
      {/* Outer glow */}
      <circle cx="50" cy="50" r="45" fill={colors.dark} opacity={0.3} />
      {/* Star points */}
      <polygon
        points="50,5 56,35 85,35 62,55 70,85 50,68 30,85 38,55 15,35 44,35"
        fill={colors.dark}
        opacity={0.8}
      />
      <polygon
        points="50,15 54,38 75,38 58,52 64,75 50,62 36,75 42,52 25,38 46,38"
        fill={colors.medium}
        opacity={0.9}
      />
      {/* Inner core */}
      <circle cx="50" cy="50" r="12" fill={colors.light} />
      <circle cx="50" cy="50" r="6" fill="white" opacity={0.8} />
    </>
  );
}

// Level 8: Supernova - burst pattern with rings, maximum intensity
function SupernovaShape({ colors }: { colors: GeometricFlameProps['colors'] }) {
  return (
    <>
      {/* Outer burst ring */}
      <circle
        cx="50"
        cy="50"
        r="48"
        fill="none"
        stroke={colors.dark}
        strokeWidth="4"
        opacity={0.4}
      />
      <circle
        cx="50"
        cy="50"
        r="38"
        fill="none"
        stroke={colors.medium}
        strokeWidth="3"
        opacity={0.5}
      />
      {/* Radial bursts */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
        const rad = (angle * Math.PI) / 180;
        const x1 = 50 + Math.cos(rad) * 15;
        const y1 = 50 + Math.sin(rad) * 15;
        const x2 = 50 + Math.cos(rad) * 45;
        const y2 = 50 + Math.sin(rad) * 45;
        return (
          <line
            key={angle}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={colors.light}
            strokeWidth="3"
            opacity={0.7}
          />
        );
      })}
      {/* Core */}
      <circle cx="50" cy="50" r="20" fill={colors.dark} opacity={0.9} />
      <circle cx="50" cy="50" r="14" fill={colors.medium} />
      <circle cx="50" cy="50" r="8" fill={colors.light} />
      <circle cx="50" cy="50" r="4" fill="white" />
    </>
  );
}

const FLAME_SHAPES: Record<
  number,
  React.FC<{ colors: GeometricFlameProps['colors'] }>
> = {
  1: EmberShape,
  2: CandleShape,
  3: TorchShape,
  4: BonfireShape,
  5: BlazeShape,
  6: InfernoShape,
  7: StarShape,
  8: SupernovaShape,
};

export function GeometricFlame({ state, level, colors }: GeometricFlameProps) {
  const shouldReduceMotion = useReducedMotion();
  const clampedLevel = Math.max(1, Math.min(8, level));
  const ShapeComponent = FLAME_SHAPES[clampedLevel];

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

  if (shouldReduceMotion) {
    return (
      <motion.svg
        viewBox="0 0 100 100"
        className="h-16 w-12 sm:h-20 sm:w-16 md:h-28 md:w-20"
        role="img"
        aria-hidden="true"
        initial={false}
        animate={stateVariants[state]}
        transition={transition}
      >
        <ShapeComponent colors={colors} />
      </motion.svg>
    );
  }

  return (
    <motion.svg
      viewBox="0 0 100 100"
      className="h-16 w-12 sm:h-20 sm:w-16 md:h-28 md:w-20"
      role="img"
      aria-hidden="true"
      initial={false}
      animate={stateVariants[state]}
      transition={transition}
    >
      <motion.g
        style={{ originX: '50%', originY: '100%' }}
        animate={flickerVariants[state]}
        transition={flickerTransition}
      >
        <ShapeComponent colors={colors} />
      </motion.g>
    </motion.svg>
  );
}
