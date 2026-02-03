'use client';

import { motion, useReducedMotion } from 'framer-motion';
import type { FlameState } from '../hooks/useFlameTimer';

interface ProgressBarProps {
  progress: number;
  state: FlameState;
  colors: {
    light: string;
    medium: string;
    dark: string;
  };
}

export function ProgressBar({ progress, state, colors }: ProgressBarProps) {
  const shouldReduceMotion = useReducedMotion();
  const isActive = state === 'active';
  const isCompleted = state === 'completed';

  const percentage = Math.round(progress * 100);

  return (
    <div className="w-full px-4">
      <div className="relative h-3 w-full overflow-hidden rounded-full bg-white/10">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            background: `linear-gradient(to right, ${colors.dark}, ${colors.medium}, ${colors.light})`,
            boxShadow: isActive
              ? `0 0 12px ${colors.medium}, 0 0 24px ${colors.medium}40`
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
        {/* Glow overlay when active */}
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
      {/* Percentage label */}
      <div className="mt-1 text-right">
        <span
          className="text-xs font-medium"
          style={{ color: isCompleted ? colors.light : colors.medium }}
        >
          {percentage}%
        </span>
      </div>
    </div>
  );
}
