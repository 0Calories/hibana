'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { Flame } from '@/utils/supabase/rows';
import { useFlameInteractions } from '../../hooks/useFlameInteractions';
import type { FlameCardActions, FlameEntry } from '../../hooks/useFlames';
import { getFlameColors } from '../../utils/colors';
import { getFlameLevel } from '../../utils/levels';
import type { FlameState } from '../../utils/types';
import { CompletionSummaryModal } from '../CompletionSummaryModal';
import { CompletionCelebration } from './effects/CompletionCelebration';
import { CompletionRingProgress } from './effects/CompletionRingProgress';
import { EffectsRenderer } from './effects/EffectsRenderer';
import { FlameRenderer } from './effects/FlameRenderer';
import { FlameGeometryProvider } from './FlameGeometryContext';
import { FLAME_REGISTRY } from './flames';
import { ProgressBar } from './ProgressBar';
import { TimerDisplay } from './TimerDisplay';

interface FlameCardProps {
  flame: Flame;
  entry?: FlameEntry;
  actions?: FlameCardActions;
  isFuelDepleted?: boolean;
  level?: number;
}

type FlameColors = ReturnType<typeof getFlameColors>;

function getBorderGlow(
  state: FlameState,
  canComplete: boolean,
  isOverburning: boolean,
  colors: FlameColors,
): React.CSSProperties {
  if (state === 'burning') {
    return isOverburning
      ? {
          boxShadow: '0 0 15px #ef444450, 0 0 30px #ef444425',
          borderColor: '#ef4444',
        }
      : {
          boxShadow: `0 0 15px ${colors.medium}50, 0 0 30px ${colors.medium}25`,
          borderColor: colors.medium,
        };
  }
  if (canComplete || state === 'completing') return { borderColor: '#fbbf24' };
  if (state === 'completed') return { borderColor: '#64748b50' };
  return {};
}

export function FlameCard({
  flame,
  entry,
  actions,
  isFuelDepleted = false,
  level: levelProp,
}: FlameCardProps) {
  const t = useTranslations('flames.card');
  const tCompletion = useTranslations('flames.completion');
  const shouldReduceMotion = useReducedMotion();
  const colors = getFlameColors(flame.color);
  const level = entry?.level ?? levelProp ?? 1;
  const levelInfo = getFlameLevel(level);
  const flameDef = FLAME_REGISTRY[level];
  const { effects } = flameDef;

  // State from entry or defaults for static display
  const state: FlameState = entry?.state ?? 'untended';
  const elapsedSeconds = entry?.elapsedSeconds ?? 0;
  const targetSeconds = entry?.targetSeconds ?? 0;
  const progress = entry?.progress ?? 0;
  const isOverburning = entry?.isOverburning ?? false;
  const isLoading = entry?.isLoading ?? false;
  const isBlocked = entry?.isBlocked ?? false;

  // Derived flags
  const canComplete = (entry?.isCompletionReady ?? false) && !isBlocked;
  const isDimmed = isBlocked || (isFuelDepleted && !canComplete);
  const isDisabled =
    !actions ||
    isLoading ||
    state === 'completed' ||
    isBlocked ||
    (isFuelDepleted && !canComplete) ||
    state === 'completing';

  // Interaction hook (narrow — only event wiring + celebration)
  // actions is always provided by FlamesList; when InteractiveFlameCard
  // wrapper is introduced, it will always provide actions too
  const { handleClick, longPress, celebration } = useFlameInteractions({
    actions: actions!,
    state,
    canComplete,
    onCompletionError: () =>
      toast.error(tCompletion('error'), { position: 'top-center' }),
  });

  // State text
  const stateText = ((): string | null => {
    if (isFuelDepleted && !canComplete && state !== 'completed')
      return t('noFuel');
    if (isBlocked && state !== 'completed') return null;
    switch (state) {
      case 'untended':
        return t('ready');
      case 'burning':
        return isOverburning ? t('overburning') : t('burning');
      case 'paused':
        return canComplete ? t('readyToComplete') : t('resting');
      case 'completing':
        return t('completing');
      case 'completed':
        return t('completed');
    }
  })();

  const stateTextClass =
    canComplete || state === 'completing'
      ? 'font-medium text-amber-500'
      : isOverburning
        ? 'font-medium text-red-500'
        : state === 'completed'
          ? 'font-medium'
          : 'text-muted-foreground';

  const ariaLabel = `${flame.name}.${stateText ?? ''}`;

  const borderGlowStyle = getBorderGlow(
    state,
    canComplete,
    isOverburning,
    colors,
  );

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

  // Measure flame SVG position for particle X-axis constraint
  const cardRef = useRef<HTMLDivElement>(null);
  const [autoXBounds, setAutoXBounds] = useState<
    { min: number; max: number } | undefined
  >();

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const measure = () => {
      const svg = card.querySelector('svg[role="img"]');
      if (!svg || !card) return;
      const cardRect = card.getBoundingClientRect();
      const svgRect = svg.getBoundingClientRect();
      if (cardRect.width === 0) return;
      const min = ((svgRect.left - cardRect.left) / cardRect.width) * 100;
      const max = ((svgRect.right - cardRect.left) / cardRect.width) * 100;
      setAutoXBounds({ min: Math.max(0, min), max: Math.min(100, max) });
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(card);
    return () => observer.disconnect();
  }, []);

  const flameGeometry = useMemo(
    () => ({ xBounds: flameDef.xBounds ?? autoXBounds }),
    [flameDef.xBounds, autoXBounds],
  );

  return (
    <div ref={cardRef} className="relative w-full">
      {/* Particle effects overlay - positioned outside button to avoid clipping */}
      <FlameGeometryProvider value={flameGeometry}>
        <div className="pointer-events-none absolute inset-0 z-10">
          <div className="relative h-full w-full">
            <div className="absolute left-0 right-0 top-8 h-28 sm:top-10 sm:h-40 md:h-52">
              <EffectsRenderer
                effects={effects}
                state={state}
                colors={colors}
                isOverburning={isOverburning}
                isCompletionReady={canComplete}
              />
            </div>
          </div>
        </div>
      </FlameGeometryProvider>

      {actions && (
        <CompletionCelebration
          active={celebration.active}
          color={colors.medium}
          onComplete={celebration.onComplete}
        />
      )}

      <motion.button
        type="button"
        onClick={actions ? handleClick : undefined}
        disabled={isDisabled}
        aria-label={ariaLabel}
        className={cn(
          'relative flex w-full flex-col overflow-hidden rounded-xl border transition-colors',
          'border-border bg-card text-foreground',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          (canComplete || state === 'completing') &&
            'animate-completion-ready-glow',
          isDimmed && 'opacity-40',
          isDisabled ? 'cursor-default' : 'cursor-pointer',
          isLoading && 'cursor-wait',
        )}
        style={{
          ...borderGlowStyle,
          ...(canComplete ? { touchAction: 'none' } : {}),
        }}
        initial="rest"
        whileTap={isDisabled ? 'rest' : 'pressed'}
        variants={cardVariants}
        transition={cardTransition}
        {...(actions && (canComplete || state === 'completing')
          ? longPress.handlers
          : {})}
      >
        {/* Header - Name and Level */}
        <div
          className={cn(
            'px-2 pt-2 sm:px-3 sm:pt-3',
            state === 'completed' && 'opacity-50',
          )}
        >
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
          <FlameRenderer
            state={state}
            level={level}
            colors={colors}
            completionProgress={state === 'completing' ? longPress.progress : 0}
            isOverburning={isOverburning}
          />

          {/* Completion ring progress overlay */}
          {actions && (
            <CompletionRingProgress
              progress={longPress.progress}
              visible={state === 'completing'}
            />
          )}
        </div>

        {/* Footer - Timer, Progress, State (only when entry is provided) */}
        {entry ? (
          <div className="flex flex-col gap-1 bg-muted px-2 py-2 sm:gap-1.5 sm:px-3 sm:py-3">
            {flame.tracking_type === 'time' && targetSeconds > 0 && (
              <div className={cn(state === 'completed' && 'opacity-40')}>
                <TimerDisplay
                  elapsedSeconds={elapsedSeconds}
                  targetSeconds={targetSeconds}
                  state={state}
                  color={colors.light}
                  isOverburning={isOverburning}
                />
              </div>
            )}
            {flame.tracking_type === 'time' && targetSeconds > 0 && (
              <ProgressBar
                progress={progress}
                state={state}
                colors={colors}
                isOverburning={isOverburning}
              />
            )}
            <div
              className={cn(
                'text-center text-[10px] sm:text-xs',
                stateTextClass,
              )}
            >
              {state === 'completed' ? (
                <span
                  className="bg-clip-text text-transparent"
                  style={{
                    backgroundImage:
                      'linear-gradient(to right, #d97706, #fbbf24, #fde68a, #fbbf24, #d97706)',
                  }}
                >
                  {stateText}
                </span>
              ) : (
                (stateText ?? '\u00A0')
              )}
            </div>
          </div>
        ) : (
          <div className="bg-muted px-2 py-2 sm:px-3 sm:py-3">
            <div className="text-center text-[10px] text-muted-foreground sm:text-xs">
              {'\u00A0'}
            </div>
          </div>
        )}

        {/* Loading overlay — hidden during optimistic transitions */}
        {isLoading && state !== 'paused' && state !== 'burning' && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-black/30">
            <div
              className="h-5 w-5 animate-spin rounded-full border-2 border-t-transparent"
              style={{ borderColor: `${colors.medium} transparent` }}
            />
          </div>
        )}
      </motion.button>

      {actions && (
        <CompletionSummaryModal
          open={celebration.showSummary}
          onOpenChange={celebration.setShowSummary}
          flameName={flame.name}
          colors={colors}
          level={level}
          effects={effects}
          elapsedSeconds={elapsedSeconds}
          targetSeconds={targetSeconds}
        />
      )}
    </div>
  );
}
