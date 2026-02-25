'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
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

interface FlameCardProps {
  flame: Flame;
  entry?: FlameEntry;
  actions?: FlameCardActions;
  isFuelDepleted?: boolean;
  level?: number;
  size?: 'default' | 'medium' | 'small' | 'mini';
  footer?: React.ReactNode;
  onCompletionError?: () => void;
}

type FlameColors = ReturnType<typeof getFlameColors>;

const SIZE_CONFIG = {
  default: {
    card: 'w-full',
    flameArea: 'h-28 sm:h-40 md:h-52',
    effectsArea: 'top-8 h-28 sm:top-10 sm:h-40 md:h-52',
    headerPadding: 'px-2 pt-2 sm:px-3 sm:pt-3',
    footerPadding: 'px-2 py-2 sm:px-3 sm:py-3',
    nameText: 'text-xs sm:text-sm md:text-base',
    flameSvg: undefined as string | undefined,
  },
  medium: {
    card: 'w-36 shrink-0 sm:w-44',
    flameArea: 'h-24 sm:h-36',
    effectsArea: 'top-8 h-24 sm:top-10 sm:h-36',
    headerPadding: 'px-2 pt-2 sm:px-2.5 sm:pt-2.5',
    footerPadding: 'px-2 py-2 sm:px-2.5',
    nameText: 'text-xs sm:text-sm',
    flameSvg: 'h-20 w-16 sm:h-28 sm:w-24',
  },
  small: {
    card: 'w-32 shrink-0 sm:w-40',
    flameArea: 'h-22 sm:h-32',
    effectsArea: 'top-8 h-22 sm:top-10 sm:h-32',
    headerPadding: 'px-1.5 pt-2 sm:px-2',
    footerPadding: 'px-1.5 py-1.5 sm:px-2',
    nameText: 'text-xs sm:text-sm',
    flameSvg: 'h-18 w-14 sm:h-24 sm:w-20',
  },
  mini: {
    card: 'w-28 shrink-0 sm:w-36',
    flameArea: 'h-20 sm:h-28',
    effectsArea: 'top-8 h-20 sm:top-10 sm:h-28',
    headerPadding: 'px-1.5 pt-2 sm:px-2',
    footerPadding: 'px-1.5 py-1.5 sm:px-2',
    nameText: 'text-xs sm:text-sm',
    flameSvg: 'h-16 w-14 sm:h-24 sm:w-20',
  },
} as const;

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
  size = 'default',
  footer,
  onCompletionError,
}: FlameCardProps) {
  const shouldReduceMotion = useReducedMotion();
  const colors = getFlameColors(flame.color);
  const level = entry?.level ?? levelProp ?? 1;
  const levelInfo = getFlameLevel(level);
  const flameDef = FLAME_REGISTRY[level];
  const { effects } = flameDef;
  const sizeConfig = SIZE_CONFIG[size];

  // State from entry or defaults for static display
  const state: FlameState = entry?.state ?? 'untended';
  const elapsedSeconds = entry?.elapsedSeconds ?? 0;
  const targetSeconds = entry?.targetSeconds ?? 0;
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
    (isFuelDepleted && !canComplete);

  const { handleClick, longPress, celebration } = useFlameInteractions({
    actions,
    state,
    canComplete,
    onCompletionError,
  });

  const ariaLabel = flame.name;

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

  const cardBody = (
    <>
      {/* Header - Name and Level */}
      <div
        className={cn(
          sizeConfig.headerPadding,
          state === 'completed' && 'opacity-50',
        )}
      >
        <h3
          className={cn(
            'truncate text-center font-semibold leading-tight',
            sizeConfig.nameText,
          )}
        >
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
      <div
        className={cn(
          'relative flex items-center justify-center',
          sizeConfig.flameArea,
        )}
      >
        <FlameRenderer
          state={state}
          level={level}
          colors={colors}
          completionProgress={state === 'completing' ? longPress.progress : 0}
          isOverburning={isOverburning}
          className={sizeConfig.flameSvg}
        />

        {/* Completion ring progress overlay */}
        {actions && (
          <CompletionRingProgress
            progress={longPress.progress}
            visible={state === 'completing'}
          />
        )}
      </div>

      {/* Footer */}
      <div className={cn('bg-muted', sizeConfig.footerPadding)}>
        {footer ?? (
          <div className="text-center text-[10px] text-muted-foreground sm:text-xs">
            {'\u00A0'}
          </div>
        )}
      </div>

      {/* Loading overlay — hidden during optimistic transitions */}
      {isLoading && state !== 'paused' && state !== 'burning' && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-black/30">
          <div
            className="h-5 w-5 animate-spin rounded-full border-2 border-t-transparent"
            style={{ borderColor: `${colors.medium} transparent` }}
          />
        </div>
      )}
    </>
  );

  const cardClassName = cn(
    'relative flex flex-col overflow-hidden rounded-xl border transition-colors',
    sizeConfig.card,
    'border-border bg-card text-foreground',
    (canComplete || state === 'completing') && 'animate-completion-ready-glow',
    isDimmed && 'opacity-40',
  );

  const cardStyle = {
    ...borderGlowStyle,
    ...(canComplete ? { touchAction: 'none' as const } : {}),
  };

  return (
    <div ref={cardRef} className={cn('relative', sizeConfig.card)}>
      {/* Particle effects overlay - positioned outside button to avoid clipping */}
      <FlameGeometryProvider value={flameGeometry}>
        <div className="pointer-events-none absolute inset-0 z-10">
          <div className="relative h-full w-full">
            <div
              className={cn('absolute left-0 right-0', sizeConfig.effectsArea)}
            >
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

      {actions ? (
        <motion.button
          type="button"
          onClick={handleClick}
          disabled={isDisabled}
          aria-label={ariaLabel}
          className={cn(
            cardClassName,
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
            isDisabled ? 'cursor-default' : 'cursor-pointer',
            isLoading && 'cursor-wait',
          )}
          style={cardStyle}
          initial="rest"
          whileTap={isDisabled ? 'rest' : 'pressed'}
          variants={cardVariants}
          transition={cardTransition}
          {...(canComplete || state === 'completing' ? longPress.handlers : {})}
        >
          {cardBody}
        </motion.button>
      ) : (
        <div className={cardClassName} style={cardStyle}>
          {cardBody}
        </div>
      )}

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
