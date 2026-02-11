'use client';

import { motion, useReducedMotion } from 'framer-motion';
import type { FlameState } from '../../utils/types';

interface ProgressBarProps {
  progress: number;
  state: FlameState;
  colors: {
    light: string;
    medium: string;
    dark: string;
  };
}

const SEALED_BAR_GRADIENT =
  'linear-gradient(to right, #92400e, #d97706, #f59e0b, #fbbf24)';

export function ProgressBar({ progress, state, colors }: ProgressBarProps) {
  const shouldReduceMotion = useReducedMotion();
  const isActive = state === 'burning';
  const isSealed = state === 'sealed';

  const percentage = isSealed ? 100 : Math.round(progress * 100);

  return (
    <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-white/10 sm:h-2">
      <motion.div
        className="absolute inset-y-0 left-0 rounded-full"
        style={{
          background: isSealed
            ? SEALED_BAR_GRADIENT
            : `linear-gradient(to right, ${colors.dark}, ${colors.medium}, ${colors.light})`,
          boxShadow: isActive
            ? `0 0 8px ${colors.medium}, 0 0 16px ${colors.medium}40`
            : isSealed
              ? '0 0 6px #d9770640'
              : 'none',
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
            background: `linear-gradient(to right, transparent, ${colors.light}40)`,
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
    </div>
  );
}
