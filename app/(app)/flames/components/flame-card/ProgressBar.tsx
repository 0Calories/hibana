'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { FlameState } from '../../utils/types';
import { SmokePuffs } from '../SmokePuffs';

interface ProgressBarProps {
  /** Fueled progress, 0..1+. Capped at 1 for display. */
  fueledFraction: number;
  /** Unfueled overflow added past the fueled portion, 0..1+. */
  unfueledFraction: number;
  state: FlameState;
  colors: {
    light: string;
    medium: string;
    dark: string;
  };
  isOverburning?: boolean;
  className?: string;
}

const COMPLETED_BAR_GRADIENT =
  'linear-gradient(to right, #92400e, #d97706, #f59e0b, #fbbf24)';

const OVERBURN_BAR_GRADIENT =
  'linear-gradient(to right, #dc2626, #ef4444, #f87171)';

const SPRING = { type: 'spring' as const, stiffness: 100, damping: 20 };

/**
 * Two-band progress bar:
 *   - The fueled portion uses the flame's color gradient (or completed/overburn
 *     palette) and gets the burning glow + shimmer effects.
 *   - Past the fueled portion, an unfueled portion is drawn as a dim diagonal
 *     stripe pattern, representing tend time that didn't earn rewards.
 *
 * The track uses bg-border (not bg-muted) so the empty state stays visible
 * against the muted footer background it sits on.
 */
export function ProgressBar({
  fueledFraction,
  unfueledFraction,
  state,
  colors,
  isOverburning = false,
  className,
}: ProgressBarProps) {
  const shouldReduceMotion = useReducedMotion();
  const isActive = state === 'burning';
  const isCompleted = state === 'completed';

  const fueled = Math.min(1, Math.max(0, fueledFraction));
  const unfueled = Math.max(0, Math.min(1 - fueled, unfueledFraction));

  const fueledPercent = isCompleted ? 100 : Math.round(fueled * 100);
  const unfueledPercent = Math.round(unfueled * 100);

  const fueledBackground = isCompleted
    ? COMPLETED_BAR_GRADIENT
    : isOverburning
      ? OVERBURN_BAR_GRADIENT
      : `linear-gradient(to right, ${colors.dark}, ${colors.medium}, ${colors.light})`;

  const fueledShadow = isActive
    ? isOverburning
      ? '0 0 8px #ef4444, 0 0 16px #ef444440'
      : `0 0 8px ${colors.medium}, 0 0 16px ${colors.medium}40`
    : isCompleted
      ? '0 0 6px #d9770640'
      : 'none';

  const transition = shouldReduceMotion ? { duration: 0.1 } : SPRING;

  return (
    <div
      className={cn(
        'relative h-1.5 w-full rounded-full bg-border sm:h-2',
        isOverburning ? 'overflow-visible' : 'overflow-hidden',
        className,
      )}
    >
      {/* Fueled fill */}
      <motion.div
        className="absolute inset-y-0 left-0 rounded-full"
        style={{ background: fueledBackground, boxShadow: fueledShadow }}
        initial={false}
        animate={{ width: `${fueledPercent}%` }}
        transition={transition}
      />

      {/* Unfueled overflow — diagonal stripes past the fueled portion */}
      <motion.div
        className="absolute inset-y-0 rounded-full"
        style={{
          left: `${fueledPercent}%`,
          backgroundImage:
            'repeating-linear-gradient(45deg, rgba(255,255,255,0.22) 0 4px, transparent 4px 8px)',
          backgroundColor: 'rgba(255,255,255,0.08)',
        }}
        initial={false}
        animate={{ width: `${unfueledPercent}%` }}
        transition={transition}
      />

      {/* Burning shimmer over the fueled portion */}
      {isActive && !shouldReduceMotion && (
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            width: `${fueledPercent}%`,
            background: isOverburning
              ? 'linear-gradient(to right, transparent, #f8717140)'
              : `linear-gradient(to right, transparent, ${colors.light}40)`,
          }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{
            duration: 1.5,
            repeat: Number.POSITIVE_INFINITY,
            ease: 'easeInOut',
          }}
        />
      )}

      {/* Smoke at the leading edge when overburning */}
      {isOverburning && !shouldReduceMotion && (
        <div
          className="pointer-events-none absolute top-0 h-full"
          style={{ left: '100%' }}
        >
          <SmokePuffs color="rgba(120, 113, 108, 0.85)" intensity={1.8} />
        </div>
      )}
    </div>
  );
}
