'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { formatTimer } from '@/lib/time';
import type { FlameState } from '../../utils/types';

interface TimerDisplayProps {
  elapsedSeconds: number;
  targetSeconds: number;
  state: FlameState;
  color: string;
  isOverburning?: boolean;
}

export function TimerDisplay({
  elapsedSeconds,
  targetSeconds,
  state,
  color,
  isOverburning = false,
}: TimerDisplayProps) {
  const shouldReduceMotion = useReducedMotion();
  const isActive = state === 'burning';

  const elapsedFormatted = formatTimer(elapsedSeconds);
  const targetFormatted = formatTimer(targetSeconds);

  const displayText =
    targetSeconds > 0
      ? `${elapsedFormatted} / ${targetFormatted}`
      : elapsedFormatted;

  const pulseAnimation =
    isActive && !shouldReduceMotion
      ? {
          opacity: [1, 0.7, 1],
        }
      : {};

  const pulseTransition = {
    duration: 2,
    repeat: Infinity,
    ease: 'easeInOut' as const,
  };

  const textColorClass =
    state === 'completed'
      ? '' // Use inline color prop for completed state
      : isOverburning
        ? 'text-red-500 dark:text-red-400'
        : 'text-foreground';

  return (
    <motion.div
      className={`text-center font-mono text-[10px] tracking-tight sm:text-xs md:text-sm ${textColorClass}`}
      style={state === 'completed' ? { color } : undefined}
      animate={pulseAnimation}
      transition={pulseTransition}
    >
      {displayText}
    </motion.div>
  );
}
