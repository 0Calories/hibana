'use client';

import { motion, useReducedMotion } from 'framer-motion';
import type { FlameState } from '../hooks/useFlameTimer';

interface TimerDisplayProps {
  elapsedSeconds: number;
  targetSeconds: number;
  state: FlameState;
  color: string;
}

function formatTimeCompact(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function TimerDisplay({
  elapsedSeconds,
  targetSeconds,
  state,
  color,
}: TimerDisplayProps) {
  const shouldReduceMotion = useReducedMotion();
  const isActive = state === 'active';

  const elapsedFormatted = formatTimeCompact(elapsedSeconds);
  const targetFormatted = formatTimeCompact(targetSeconds);

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

  return (
    <motion.div
      className="text-center font-mono text-[10px] tracking-tight sm:text-xs md:text-sm"
      style={{
        color: state === 'completed' ? color : 'rgba(255, 255, 255, 0.8)',
      }}
      animate={pulseAnimation}
      transition={pulseTransition}
    >
      {displayText}
    </motion.div>
  );
}
