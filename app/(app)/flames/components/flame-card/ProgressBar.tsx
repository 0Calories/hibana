'use client';

import { motion, useReducedMotion } from 'framer-motion';
import type { FlameState } from '../../utils/types';
import { SmokePuffs } from '../SmokePuffs';

interface ProgressBarProps {
  progress: number;
  state: FlameState;
  colors: {
    light: string;
    medium: string;
    dark: string;
  };
  isOverburning?: boolean;
}

const SEALED_BAR_GRADIENT =
  'linear-gradient(to right, #92400e, #d97706, #f59e0b, #fbbf24)';

const OVERBURN_BAR_GRADIENT =
  'linear-gradient(to right, #dc2626, #ef4444, #f87171)';

export function ProgressBar({
  progress,
  state,
  colors,
  isOverburning = false,
}: ProgressBarProps) {
  const shouldReduceMotion = useReducedMotion();
  const isActive = state === 'burning';
  const isSealed = state === 'sealed';

  const percentage = isSealed ? 100 : Math.round(progress * 100);

  const barBackground = isSealed
    ? SEALED_BAR_GRADIENT
    : isOverburning
      ? OVERBURN_BAR_GRADIENT
      : `linear-gradient(to right, ${colors.dark}, ${colors.medium}, ${colors.light})`;

  const barShadow = isActive
    ? isOverburning
      ? '0 0 8px #ef4444, 0 0 16px #ef444440'
      : `0 0 8px ${colors.medium}, 0 0 16px ${colors.medium}40`
    : isSealed
      ? '0 0 6px #d9770640'
      : 'none';

  return (
    <div
      className={`relative h-1.5 w-full rounded-full bg-muted sm:h-2 ${isOverburning ? 'overflow-visible' : 'overflow-hidden'}`}
    >
      <motion.div
        className="absolute inset-y-0 left-0 rounded-full"
        style={{
          background: barBackground,
          boxShadow: barShadow,
        }}
        initial={false}
        animate={{
          width: `${percentage}%`,
        }}
        transition={
          shouldReduceMotion
            ? { duration: 0.1 }
            : {
                type: 'spring',
                stiffness: 100,
                damping: 20,
              }
        }
      />
      {isActive && !shouldReduceMotion && (
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            width: `${percentage}%`,
            background: isOverburning
              ? 'linear-gradient(to right, transparent, #f8717140)'
              : `linear-gradient(to right, transparent, ${colors.light}40)`,
          }}
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}
      {isOverburning && !shouldReduceMotion && (
        <div
          className="pointer-events-none absolute top-0 h-full"
          style={{ left: '100%' }}
        >
          <SmokePuffs color="rgba(120, 113, 108, 0.85)" intensity={1.8} />
        </div>
      )}
    </div>
  );
}
