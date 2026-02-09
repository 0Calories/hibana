'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { Flame, FlameSession } from '@/utils/supabase/rows';
import { getFlameColors } from '../utils/colors';
import { getFlameLevel } from '../utils/levels';
import { GeometricFlame } from './flame-card/effects/GeometricFlame';
import { GeometricSmoke } from './flame-card/effects/GeometricSmoke';
import { ParticleEmbers } from './flame-card/effects/ParticleEmbers';
import { SealCelebration } from './flame-card/effects/SealCelebration';
import { SealRingProgress } from './flame-card/effects/SealRingProgress';
import { ProgressBar } from './flame-card/ProgressBar';
import { TimerDisplay } from './flame-card/TimerDisplay';
import { useFlameState } from './hooks/useFlameState';
import { useLongPress } from './hooks/useLongPress';
import { SealSummaryModal } from './SealSummaryModal';

interface FlameCardProps {
  flame: Flame;
  session: FlameSession | null;
  date: string;
  onSessionUpdate?: () => void;
  isBlocked?: boolean;
  isFuelDepleted?: boolean;
  level?: number;
}

const SEAL_DURATION_MS = 2000;

export function FlameCard({
  flame,
  session,
  date,
  onSessionUpdate,
  isBlocked = false,
  isFuelDepleted = false,
  level = 1,
}: FlameCardProps) {
  const t = useTranslations('flames.card');
  const tSeal = useTranslations('flames.seal');
  const shouldReduceMotion = useReducedMotion();
  const colors = getFlameColors(flame.color);
  const levelInfo = getFlameLevel(level);

  const {
    state,
    elapsedSeconds,
    targetSeconds,
    progress,
    toggle,
    isLoading,
    isSealReady,
    beginSealing,
    cancelSealing,
    completeSeal,
  } = useFlameState({
    flame,
    session,
    date,
    onSessionUpdate,
  });

  const [showSummary, setShowSummary] = useState(false);
  const [celebrationActive, setCelebrationActive] = useState(false);

  // Threshold: only treat as "long press" after 5% of duration (~100ms)
  const SEAL_INTENT_THRESHOLD = 0.05;

  const handleSealComplete = useCallback(async () => {
    const success = await completeSeal();
    if (success) {
      setCelebrationActive(true);
    } else {
      toast.error(tSeal('error'), { position: 'top-center' });
    }
  }, [completeSeal, tSeal]);

  const handleCelebrationComplete = useCallback(() => {
    setCelebrationActive(false);
    setShowSummary(true);
  }, []);

  const canSeal = isSealReady && !isBlocked;

  const longPress = useLongPress({
    duration: SEAL_DURATION_MS,
    enabled: canSeal,
    onProgress: (p) => {
      // Only enter sealing state after meaningful hold
      if (p > SEAL_INTENT_THRESHOLD && state !== 'sealing') {
        beginSealing();
      }
    },
    onComplete: handleSealComplete,
    onCancel: () => {
      cancelSealing();
    },
  });

  const handleClick = useCallback(() => {
    // Suppress click if a long press just occurred (user held long enough to show intent)
    if (longPress.longPressTriggered) return;
    toggle();
  }, [toggle, longPress.longPressTriggered]);

  const isActive = state === 'active';
  const isSealing = state === 'sealing';
  const isCompleted = state === 'sealed';
  const isFuelBlocked = isFuelDepleted && !isActive;
  const isDisabled =
    isLoading || isCompleted || isBlocked || isFuelBlocked || isSealing;

  const getAriaLabel = () => {
    const baseName = flame.name;
    if (isFuelBlocked) return `${baseName}. ${t('noFuel')}`;
    if (isBlocked) return `${baseName}. ${t('blocked')}`;
    switch (state) {
      case 'untended':
        return `${baseName}. ${t('ready')}`;
      case 'active':
        return `${baseName}. ${t('burning')}`;
      case 'paused':
        return canSeal
          ? `${baseName}. ${t('readyToSeal')}`
          : `${baseName}. ${t('resting')}`;
      case 'sealing':
        return `${baseName}. ${t('sealing')}`;
      case 'sealed':
        return `${baseName}. ${t('sealed')}`;
    }
  };

  const getStateText = () => {
    if (isFuelBlocked) return t('noFuel');
    if (isBlocked) return null;
    switch (state) {
      case 'untended':
        return t('ready');
      case 'active':
        return t('burning');
      case 'paused':
        return canSeal ? t('readyToSeal') : t('resting');
      case 'sealing':
        return t('sealing');
      case 'sealed':
        return t('sealed');
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
    : canSeal || isSealing
      ? {
          boxShadow: '0 0 15px #fbbf2450, 0 0 30px #fbbf2425',
          borderColor: '#fbbf24',
        }
      : {};

  const fuelMinutes = Math.floor(elapsedSeconds / 60);

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

      <SealCelebration
        active={celebrationActive}
        color={colors.medium}
        onComplete={handleCelebrationComplete}
      />

      <motion.button
        type="button"
        onClick={handleClick}
        disabled={isDisabled}
        aria-label={getAriaLabel()}
        className={cn(
          'relative flex w-full flex-col overflow-hidden rounded-xl border transition-colors',
          'border-slate-200 bg-linear-to-b from-white to-slate-50 text-slate-900',
          'dark:border-white/10 dark:from-slate-900 dark:to-slate-950 dark:text-white',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 cursor-pointer',
          isCompleted && 'cursor-default opacity-60',
          isFuelBlocked && 'cursor-default opacity-40',
          isBlocked && 'cursor-default opacity-40',
          isLoading && 'cursor-wait',
        )}
        style={{
          ...borderGlowStyle,
          ...(canSeal ? { touchAction: 'none' } : {}),
        }}
        initial="rest"
        whileTap={isDisabled ? 'rest' : 'pressed'}
        variants={cardVariants}
        transition={cardTransition}
        {...(canSeal || isSealing ? longPress.handlers : {})}
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

          {/* Seal ring progress overlay */}
          <SealRingProgress progress={longPress.progress} visible={isSealing} />
        </div>

        {/* Footer - Timer, Progress, State */}
        <div className="flex flex-col gap-1 bg-slate-200/70 px-2 py-2 dark:bg-black/30 sm:gap-1.5 sm:px-3 sm:py-3">
          {flame.tracking_type === 'time' && targetSeconds > 0 && (
            <TimerDisplay
              elapsedSeconds={elapsedSeconds}
              targetSeconds={targetSeconds}
              state={state}
              color={colors.light}
            />
          )}
          {flame.tracking_type === 'time' && targetSeconds > 0 && (
            <ProgressBar progress={progress} state={state} colors={colors} />
          )}
          <div
            className={cn(
              'text-center text-[10px] sm:text-xs',
              canSeal || isSealing
                ? 'font-medium text-amber-500'
                : 'text-slate-500 dark:text-white/50',
            )}
          >
            {getStateText() ?? '\u00A0'}
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

      <SealSummaryModal
        open={showSummary}
        onOpenChange={setShowSummary}
        minutes={fuelMinutes}
        level={level}
      />
    </div>
  );
}
