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

  const cardVariants = {
    rest: { scale: 1 },
    pressed: { scale: 0.96 },
  };

  const cardTransition = shouldReduceMotion
    ? { duration: 0.1 }
    : {
        type: 'spring' as const,
        stiffness: 400,
        damping: 25,
      };

  const borderGlowStyle = isActive
    ? {
        boxShadow: `0 0 15px ${colors.medium}50, 0 0 30px ${colors.medium}25`,
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
        'relative flex w-full flex-col overflow-hidden rounded-xl border border-white/10 bg-gradient-to-b from-slate-900 to-slate-950 text-white transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        isCompleted && 'cursor-default opacity-60',
        isLoading && 'cursor-wait',
      )}
      style={borderGlowStyle}
      initial="rest"
      whileTap={isCompleted ? 'rest' : 'pressed'}
      variants={cardVariants}
      transition={cardTransition}
    >
      {/* Flame visual area */}
      <div className="relative flex h-28 items-center justify-center sm:h-36 md:h-44">
        <ParticleEmbers state={state} color={colors.light} />
        <GeometricFlame state={state} colors={colors} />
      </div>

      {/* Info footer */}
      <div className="flex flex-col gap-1 bg-black/30 px-2 py-2 sm:gap-1.5 sm:px-3 sm:py-3">
        {/* Flame name - prominent */}
        <h3 className="truncate text-center text-xs font-semibold leading-tight sm:text-sm md:text-base">
          {flame.name}
        </h3>

        {/* Timer display */}
        {flame.tracking_type === 'time' && targetSeconds > 0 && (
          <TimerDisplay
            elapsedSeconds={elapsedSeconds}
            targetSeconds={targetSeconds}
            state={state}
            color={colors.light}
          />
        )}

        {/* Progress bar */}
        {flame.tracking_type === 'time' && targetSeconds > 0 && (
          <ProgressBar progress={progress} state={state} colors={colors} />
        )}

        {/* State hint */}
        <div className="text-center text-[10px] text-white/50 sm:text-xs">
          {state === 'idle' && t('tapToStart')}
          {state === 'active' && t('tapToPause')}
          {state === 'paused' && t('tapToResume')}
          {state === 'completed' && t('completed')}
        </div>
      </div>

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <div
            className="h-5 w-5 animate-spin rounded-full border-2 border-t-transparent"
            style={{ borderColor: `${colors.medium} transparent` }}
          />
        </div>
      )}
    </motion.button>
  );
}
