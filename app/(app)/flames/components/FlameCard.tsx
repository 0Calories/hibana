'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Check } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { Flame, FlameSession } from '@/utils/supabase/rows';
import { getFlameColors } from '../utils/colors';
import { getFlameLevel } from '../utils/levels';
import {
  CompletionSummaryDialog,
  type CompletionStats,
} from './CompletionSummaryDialog';
import { CompleteButton } from './flame-card/CompleteButton';
import { EmberBurst } from './flame-card/effects/EmberBurst';
import { GeometricFlame } from './flame-card/effects/GeometricFlame';
import { GeometricSmoke } from './flame-card/effects/GeometricSmoke';
import { GoldenPulse } from './flame-card/effects/GoldenPulse';
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
  isFuelDepleted?: boolean;
  level?: number;
}

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
    isCompleting,
    markComplete,
    resetCompleting,
  } = useFlameTimer({
    flame,
    session,
    date,
    onSessionUpdate,
  });

  const [showConfirm, setShowConfirm] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [completionStats, setCompletionStats] =
    useState<CompletionStats | null>(null);
  const summaryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isActive = state === 'active';
  const isCompleted = state === 'completed';
  const isPaused = state === 'paused';
  const isFuelBlocked = isFuelDepleted && !isActive;
  const isDisabled = isLoading || isCompleted || isBlocked || isFuelBlocked;

  const handleConfirmComplete = useCallback(async () => {
    setShowConfirm(false);

    // Snapshot stats before completing
    setCompletionStats({
      flameName: flame.name,
      flameColor: colors.medium,
      elapsedSeconds,
      targetSeconds,
      progress,
    });

    setShowCelebration(true);
    await markComplete();

    // Show summary dialog after celebration animation
    summaryTimeoutRef.current = setTimeout(() => {
      setShowSummary(true);
      setShowCelebration(false);
      resetCompleting();
    }, 1200);
  }, [
    flame.name,
    colors.medium,
    elapsedSeconds,
    targetSeconds,
    progress,
    markComplete,
    resetCompleting,
  ]);

  const handleDismissSummary = useCallback((open: boolean) => {
    if (!open) {
      setShowSummary(false);
      if (summaryTimeoutRef.current) {
        clearTimeout(summaryTimeoutRef.current);
        summaryTimeoutRef.current = null;
      }
    }
  }, []);

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
        return `${baseName}. ${t('resting')}`;
      case 'completed':
        return `${baseName}. ${t('tended')}`;
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
    : isCompleted
      ? {
          boxShadow: '0 0 10px rgba(251, 191, 36, 0.15)',
        }
      : {};

  return (
    <div className="relative w-full">
      {/* Smoke overlay - positioned outside button to avoid clipping */}
      {!isCompleted && (
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
      )}

      {/* Celebration effects */}
      <EmberBurst
        show={showCelebration}
        flameColor={colors.medium}
        flameColorLight={colors.light}
      />
      <GoldenPulse show={showCelebration} />

      {/* Complete button - top-right corner, outside button to avoid nesting */}
      {isPaused && !isCompleting && !isBlocked && elapsedSeconds > 0 && (
        <CompleteButton
          color={colors.medium}
          onClick={() => setShowConfirm(true)}
        />
      )}

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
          isCompleted && 'cursor-default',
          isFuelBlocked && 'cursor-default opacity-40',
          isBlocked && 'cursor-default opacity-40',
          isLoading && 'cursor-wait',
        )}
        style={borderGlowStyle}
        initial="rest"
        whileTap={isDisabled ? 'rest' : 'pressed'}
        variants={cardVariants}
        transition={cardTransition}
      >
        {/* Completed checkmark badge */}
        {isCompleted && (
          <motion.div
            className="absolute right-1.5 top-1.5 z-10 flex h-5 w-5 items-center justify-center rounded-full sm:right-2 sm:top-2 sm:h-6 sm:w-6"
            style={{ backgroundColor: colors.medium }}
            initial={shouldReduceMotion ? { opacity: 1 } : { scale: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={
              shouldReduceMotion
                ? { duration: 0.1 }
                : { type: 'spring', stiffness: 400, damping: 20, delay: 0.2 }
            }
          >
            <Check className="h-3 w-3 text-white sm:h-3.5 sm:w-3.5" />
          </motion.div>
        )}

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
          {isCompleted ? (
            <motion.div
              className="flex items-center justify-center rounded-full"
              style={{
                width: 64,
                height: 64,
                backgroundColor: `${colors.medium}20`,
              }}
              initial={
                shouldReduceMotion ? { opacity: 1 } : { scale: 0, opacity: 0 }
              }
              animate={{ scale: 1, opacity: 1 }}
              transition={
                shouldReduceMotion
                  ? { duration: 0.1 }
                  : { type: 'spring', stiffness: 300, damping: 20 }
              }
            >
              <Check
                className="h-8 w-8"
                style={{ color: `${colors.medium}80` }}
              />
            </motion.div>
          ) : (
            <>
              <ParticleEmbers
                state={isBlocked ? 'untended' : state}
                color={colors.light}
              />
              <GeometricFlame
                state={isBlocked ? 'untended' : state}
                level={level}
                colors={colors}
              />
            </>
          )}
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

      {/* Confirmation dialog */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>{t('confirmTitle')}</DialogTitle>
            <DialogDescription>{t('confirmDescription')}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirm(false)}>
              {t('confirmCancel')}
            </Button>
            <Button onClick={handleConfirmComplete}>
              {t('confirmAction')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Completion summary dialog */}
      <CompletionSummaryDialog
        open={showSummary}
        onOpenChange={handleDismissSummary}
        stats={completionStats}
      />
    </div>
  );
}
