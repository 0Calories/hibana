'use client';

import { motion, useReducedMotion } from 'framer-motion';
import type { FlameState } from '../hooks/useFlameTimer';

interface TimerDisplayProps {
  elapsedSeconds: number;
  targetSeconds: number;
  state: FlameState;
  color: string;
}

function formatTime(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds]
    .map((unit) => unit.toString().padStart(2, '0'))
    .join(':');
}

export function TimerDisplay({
  elapsedSeconds,
  targetSeconds,
  state,
  color,
}: TimerDisplayProps) {
  const shouldReduceMotion = useReducedMotion();
  const isActive = state === 'active';

  const elapsedFormatted = formatTime(elapsedSeconds);
  const targetFormatted = formatTime(targetSeconds);

  const displayText =
    targetSeconds > 0
      ? `${elapsedFormatted} / ${targetFormatted}`
      : elapsedFormatted;

  // Pulse animation for active state
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
      className="font-mono text-lg tracking-wider"
      style={{
        color: state === 'completed' ? color : 'rgba(255, 255, 255, 0.9)',
      }}
      animate={pulseAnimation}
      transition={pulseTransition}
    >
      {displayText}
    </motion.div>
  );
}
