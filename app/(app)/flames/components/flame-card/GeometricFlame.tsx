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
    scale: 1.15,
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
      <circle cx="50" cy="60" r="20" fill={colors.dark} opacity={0.5} />
      <circle cx="50" cy="60" r="14" fill={colors.medium} opacity={0.7} />
      <circle cx="50" cy="60" r="8" fill={colors.light} />
      <circle cx="50" cy="60" r="4" fill="white" opacity={0.8} />
    </>
  );
}

// Level 2: Candle - flame on candlestick
function CandleShape({ colors }: { colors: GeometricFlameProps['colors'] }) {
  return (
    <>
      {/* Candlestick base */}
      <rect x="44" y="70" width="12" height="25" fill="#8B7355" rx="1" />
      <rect x="42" y="68" width="16" height="4" fill="#A08060" rx="1" />
      <ellipse cx="50" cy="95" rx="14" ry="4" fill="#6B5344" />
      {/* Wick */}
      <rect x="49" y="62" width="2" height="10" fill="#333" />
      {/* Flame */}
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

// Level 3: Torch - flame on wooden torch handle
function TorchShape({ colors }: { colors: GeometricFlameProps['colors'] }) {
  return (
    <>
      {/* Torch handle */}
      <polygon points="42,65 58,65 54,98 46,98" fill="#5D4037" />
      <polygon points="44,65 56,65 53,98 47,98" fill="#6D4C41" />
      {/* Torch head wrap */}
      <ellipse cx="50" cy="65" rx="12" ry="5" fill="#4E342E" />
      <ellipse cx="50" cy="63" rx="10" ry="4" fill="#3E2723" />
      {/* Flame - wider and more dynamic */}
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

// Level 4: Bonfire - flames on log pile
function BonfireShape({ colors }: { colors: GeometricFlameProps['colors'] }) {
  return (
    <>
      {/* Log pile base */}
      <ellipse cx="50" cy="88" rx="35" ry="8" fill="#3E2723" opacity={0.5} />
      <rect
        x="15"
        y="78"
        width="32"
        height="8"
        rx="4"
        fill="#5D4037"
        transform="rotate(-15 31 82)"
      />
      <rect
        x="53"
        y="78"
        width="32"
        height="8"
        rx="4"
        fill="#4E342E"
        transform="rotate(15 69 82)"
      />
      <rect
        x="28"
        y="72"
        width="28"
        height="7"
        rx="3.5"
        fill="#6D4C41"
        transform="rotate(-8 42 75)"
      />
      <rect
        x="44"
        y="72"
        width="28"
        height="7"
        rx="3.5"
        fill="#5D4037"
        transform="rotate(8 58 75)"
      />
      <rect x="38" y="68" width="24" height="6" rx="3" fill="#4E342E" />
      {/* Main flames */}
      <polygon
        points="25,30 38,60 32,72 12,72 8,55"
        fill={colors.dark}
        opacity={0.7}
      />
      <polygon
        points="75,25 88,55 92,72 68,72 62,60"
        fill={colors.dark}
        opacity={0.7}
      />
      <polygon
        points="50,5 78,55 70,72 30,72 22,55"
        fill={colors.dark}
        opacity={0.85}
      />
      <polygon
        points="50,18 70,52 64,68 36,68 30,52"
        fill={colors.medium}
        opacity={0.9}
      />
      <polygon points="50,30 60,48 56,62 44,62 40,48" fill={colors.light} />
    </>
  );
}

// Level 5: Blaze - chaotic raging flames
function BlazeShape({ colors }: { colors: GeometricFlameProps['colors'] }) {
  return (
    <>
      {/* Multiple chaotic flame tongues */}
      <polygon
        points="15,20 28,45 22,95 5,95 2,50"
        fill={colors.dark}
        opacity={0.6}
      />
      <polygon
        points="85,15 98,50 95,95 78,95 72,45"
        fill={colors.dark}
        opacity={0.6}
      />
      <polygon
        points="30,10 45,40 40,95 20,95 15,50"
        fill={colors.dark}
        opacity={0.7}
      />
      <polygon
        points="70,8 85,45 80,95 60,95 55,40"
        fill={colors.dark}
        opacity={0.7}
      />
      {/* Center blaze */}
      <polygon
        points="50,2 80,50 72,95 28,95 20,50"
        fill={colors.medium}
        opacity={0.9}
      />
      <polygon
        points="50,18 68,48 62,85 38,85 32,48"
        fill={colors.light}
        opacity={0.95}
      />
      <polygon
        points="50,32 58,50 54,75 46,75 42,50"
        fill="white"
        opacity={0.6}
      />
    </>
  );
}

// Level 6: Inferno - wild raging flames everywhere
function InfernoShape({ colors }: { colors: GeometricFlameProps['colors'] }) {
  return (
    <>
      {/* Wild outer flames */}
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
      {/* Inner intense flames */}
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
      {/* Central core */}
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

// Level 7: Star - brilliant celestial body
function StarShape({ colors }: { colors: GeometricFlameProps['colors'] }) {
  return (
    <>
      {/* Outer corona/glow */}
      <circle cx="50" cy="50" r="45" fill={colors.dark} opacity={0.25} />
      <circle cx="50" cy="50" r="38" fill={colors.dark} opacity={0.35} />
      {/* Solar flare rays */}
      {[0, 60, 120, 180, 240, 300].map((angle) => {
        const rad = (angle * Math.PI) / 180;
        const x2 = 50 + Math.cos(rad) * 44;
        const y2 = 50 + Math.sin(rad) * 44;
        return (
          <polygon
            key={angle}
            points={`50,50 ${50 + Math.cos(rad - 0.15) * 30},${50 + Math.sin(rad - 0.15) * 30} ${x2},${y2} ${50 + Math.cos(rad + 0.15) * 30},${50 + Math.sin(rad + 0.15) * 30}`}
            fill={colors.medium}
            opacity={0.7}
          />
        );
      })}
      {/* Star body - layered circles for depth */}
      <circle cx="50" cy="50" r="28" fill={colors.dark} opacity={0.9} />
      <circle cx="50" cy="50" r="22" fill={colors.medium} />
      <circle cx="50" cy="50" r="15" fill={colors.light} />
      <circle cx="50" cy="50" r="8" fill="white" opacity={0.9} />
      <circle cx="45" cy="45" r="3" fill="white" opacity={0.5} />
    </>
  );
}

// Level 8: Supernova - explosive cosmic event
function SupernovaShape({ colors }: { colors: GeometricFlameProps['colors'] }) {
  return (
    <>
      {/* Outer shockwave rings */}
      <circle
        cx="50"
        cy="50"
        r="48"
        fill="none"
        stroke={colors.dark}
        strokeWidth="3"
        opacity={0.3}
      />
      <circle
        cx="50"
        cy="50"
        r="42"
        fill="none"
        stroke={colors.medium}
        strokeWidth="2"
        opacity={0.4}
      />
      {/* Explosion rays */}
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle) => {
        const rad = (angle * Math.PI) / 180;
        const length = angle % 60 === 0 ? 46 : 38;
        const x1 = 50 + Math.cos(rad) * 12;
        const y1 = 50 + Math.sin(rad) * 12;
        const x2 = 50 + Math.cos(rad) * length;
        const y2 = 50 + Math.sin(rad) * length;
        return (
          <line
            key={angle}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={angle % 60 === 0 ? colors.light : colors.medium}
            strokeWidth={angle % 60 === 0 ? 4 : 2}
            opacity={0.8}
          />
        );
      })}
      {/* Glowing core */}
      <circle cx="50" cy="50" r="22" fill={colors.dark} />
      <circle cx="50" cy="50" r="16" fill={colors.medium} />
      <circle cx="50" cy="50" r="10" fill={colors.light} />
      <circle cx="50" cy="50" r="5" fill="white" />
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
        className="h-20 w-16 sm:h-28 sm:w-24 md:h-36 md:w-28"
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
      className="h-20 w-16 sm:h-28 sm:w-24 md:h-36 md:w-28"
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
