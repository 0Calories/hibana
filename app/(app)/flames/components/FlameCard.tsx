'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import type { Flame, FlameSession } from '@/utils/supabase/rows';
import { getFlameColors } from '../utils/colors';
import { GeometricFlame } from './flame-card/GeometricFlame';
import { ParticleEmbers } from './flame-card/ParticleEmbers';
import { ProgressBar } from './flame-card/ProgressBar';
import { TimerDisplay } from './flame-card/TimerDisplay';
import { useFlameTimer } from './hooks/useFlameTimer';

interface FlameCardProps {
  flame: Flame;
  session: FlameSession | null;
  date: string;
  onSessionUpdate?: () => void;
}

export function FlameCard({
  flame,
  session,
  date,
  onSessionUpdate,
}: FlameCardProps) {
  const t = useTranslations('flames.card');
  const shouldReduceMotion = useReducedMotion();
  const colors = getFlameColors(flame.color);

  const { state, elapsedSeconds, targetSeconds, progress, toggle, isLoading } =
    useFlameTimer({
      flame,
      session,
      date,
      onSessionUpdate,
    });

  const isActive = state === 'active';
  const isCompleted = state === 'completed';

  // Get accessible label based on state
  const getAriaLabel = () => {
    const baseName = flame.name;
    switch (state) {
      case 'idle':
        return `${baseName}. ${t('tapToStart')}`;
      case 'active':
        return `${baseName}. ${t('tapToPause')}`;
      case 'paused':
        return `${baseName}. ${t('tapToResume')}`;
      case 'completed':
        return `${baseName}. ${t('completed')}`;
    }
  };

  // Press animation variants
  const cardVariants = {
    rest: { scale: 1 },
    pressed: { scale: 0.97 },
  };

  const cardTransition = shouldReduceMotion
    ? { duration: 0.1 }
    : {
        type: 'spring' as const,
        stiffness: 400,
        damping: 25,
      };

  // Border glow styles
  const borderGlowStyle = isActive
    ? {
        boxShadow: `0 0 20px ${colors.medium}60, 0 0 40px ${colors.medium}30, inset 0 0 20px ${colors.dark}20`,
        borderColor: colors.medium,
      }
    : {};

  return (
    <motion.button
      type="button"
      onClick={toggle}
      disabled={isLoading || isCompleted}
      aria-label={getAriaLabel()}
      className={cn(
        'relative flex w-full flex-col items-center overflow-hidden rounded-2xl border-2 border-white/10 bg-gradient-to-b from-slate-900 to-slate-950 p-6 text-white transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        isCompleted && 'cursor-default opacity-60',
        isLoading && 'cursor-wait',
      )}
      style={{
        ...borderGlowStyle,
        minHeight: '320px',
      }}
      initial="rest"
      whileTap={isCompleted ? 'rest' : 'pressed'}
      variants={cardVariants}
      transition={cardTransition}
    >
      {/* Particle embers layer */}
      <ParticleEmbers state={state} color={colors.light} />

      {/* Geometric flame */}
      <div className="relative flex flex-1 items-center justify-center">
        <GeometricFlame state={state} colors={colors} />
      </div>

      {/* Flame name */}
      <h3 className="mt-4 text-xl font-semibold">{flame.name}</h3>

      {/* Timer display (only for time tracking) */}
      {flame.tracking_type === 'time' && targetSeconds > 0 && (
        <div className="mt-2">
          <TimerDisplay
            elapsedSeconds={elapsedSeconds}
            targetSeconds={targetSeconds}
            state={state}
            color={colors.light}
          />
        </div>
      )}

      {/* Progress bar (only for time tracking) */}
      {flame.tracking_type === 'time' && targetSeconds > 0 && (
        <div className="mt-4 w-full">
          <ProgressBar progress={progress} state={state} colors={colors} />
        </div>
      )}

      {/* State hint text */}
      <div className="mt-2 text-sm text-white/60">
        {state === 'idle' && t('tapToStart')}
        {state === 'active' && t('tapToPause')}
        {state === 'paused' && t('tapToResume')}
        {state === 'completed' && t('completed')}
      </div>

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <div
            className="h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"
            style={{ borderColor: `${colors.medium} transparent` }}
          />
        </div>
      )}
    </motion.button>
  );
}
