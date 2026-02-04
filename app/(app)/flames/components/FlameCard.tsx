'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import type { Flame, FlameSession } from '@/utils/supabase/rows';
import { getFlameColors } from '../utils/colors';
import { getFlameLevel } from '../utils/levels';
import { GeometricFlame } from './flame-card/effects/GeometricFlame';
import { GeometricSmoke } from './flame-card/effects/GeometricSmoke';
import { ParticleEmbers } from './flame-card/effects/ParticleEmbers';
import { ProgressBar } from './flame-card/ProgressBar';
import { TimerDisplay } from './flame-card/TimerDisplay';
import { useFlameTimer } from './hooks/useFlameTimer';

interface FlameCardProps {
  flame: Flame;
  session: FlameSession | null;
  date: string;
  onSessionUpdate?: () => void;
  isBlocked?: boolean;
  level?: number;
}

export function FlameCard({
  flame,
  session,
  date,
  onSessionUpdate,
  isBlocked = false,
  level = 1,
}: FlameCardProps) {
  const t = useTranslations('flames.card');
  const shouldReduceMotion = useReducedMotion();
  const colors = getFlameColors(flame.color);
  const levelInfo = getFlameLevel(level);

  const { state, elapsedSeconds, targetSeconds, progress, toggle, isLoading } =
    useFlameTimer({
      flame,
      session,
      date,
      onSessionUpdate,
    });

  const isActive = state === 'active';
  const isCompleted = state === 'completed';
  const isDisabled = isLoading || isCompleted || isBlocked;

  const getAriaLabel = () => {
    const baseName = flame.name;
    if (isBlocked) return `${baseName}. ${t('blocked')}`;
    switch (state) {
      case 'untended':
        return `${baseName}. ${t('ready')}`;
      case 'active':
        return `${baseName}. ${t('burning')}`;
      case 'paused':
        return `${baseName}. ${t('resting')}`;
      case 'completed':
        return `${baseName}. ${t('tended')}`;
    }
  };

  const getStateText = () => {
    if (isBlocked) return t('blocked');
    switch (state) {
      case 'untended':
        return t('ready');
      case 'active':
        return t('burning');
      case 'paused':
        return t('resting');
      case 'completed':
        return t('tended');
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
    <div className="relative w-full">
      {/* Smoke overlay - positioned outside button to avoid clipping */}
      <div className="pointer-events-none absolute inset-0 z-10">
        <div className="relative h-full w-full">
          {/* Position smoke to align with flame visual area */}
          <div className="absolute left-0 right-0 top-8 h-28 sm:top-10 sm:h-40 md:h-52">
            <GeometricSmoke
              state={isBlocked ? 'untended' : state}
              color={colors.medium}
              level={level}
            />
          </div>
        </div>
      </div>

      <motion.button
        type="button"
        onClick={toggle}
        disabled={isDisabled}
        aria-label={getAriaLabel()}
        className={cn(
          'relative flex w-full flex-col overflow-hidden rounded-xl border transition-colors',
          'border-slate-200 bg-linear-to-b from-white to-slate-50 text-slate-900',
          'dark:border-white/10 dark:from-slate-900 dark:to-slate-950 dark:text-white',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 cursor-pointer',
          isCompleted && 'cursor-default opacity-60',
          isBlocked && 'cursor-default opacity-40',
          isLoading && 'cursor-wait',
        )}
        style={borderGlowStyle}
        initial="rest"
        whileTap={isDisabled ? 'rest' : 'pressed'}
        variants={cardVariants}
        transition={cardTransition}
      >
        {/* Header - Name and Level */}
        <div className="px-2 pt-2 sm:px-3 sm:pt-3">
          <h3 className="truncate text-center text-xs font-semibold leading-tight sm:text-sm md:text-base">
            {flame.name}
          </h3>
          <div
            className="text-center text-[10px] font-medium sm:text-xs"
            style={{ color: levelInfo.color }}
          >
            Lv. {levelInfo.level} · {levelInfo.name}
          </div>
        </div>

        {/* Flame visual area */}
        <div className="relative flex h-28 items-center justify-center sm:h-40 md:h-52">
          <ParticleEmbers
            state={isBlocked ? 'untended' : state}
            color={colors.light}
          />
          <GeometricFlame
            state={isBlocked ? 'untended' : state}
            level={level}
            colors={colors}
          />
        </div>

        {/* Footer - Timer, Progress, State */}
        <div className="flex flex-col gap-1 bg-slate-200/70 px-2 py-2 dark:bg-black/30 sm:gap-1.5 sm:px-3 sm:py-3">
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

          {/* State text */}
          <div className="text-center text-[10px] text-slate-500 dark:text-white/50 sm:text-xs">
            {getStateText()}
          </div>
        </div>

        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-black/30">
            <div
              className="h-5 w-5 animate-spin rounded-full border-2 border-t-transparent"
              style={{ borderColor: `${colors.medium} transparent` }}
            />
          </div>
        )}
      </motion.button>
    </div>
  );
}
