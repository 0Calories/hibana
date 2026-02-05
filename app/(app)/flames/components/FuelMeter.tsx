'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Fuel } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface FuelMeterProps {
  budgetSeconds: number | null;
  remainingSeconds: number;
  hasBudget: boolean;
  isBurning: boolean;
}

function formatTime(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds));
  const hours = Math.floor(s / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const seconds = s % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/** Number of faint segments to display inside the bar */
const SEGMENT_COUNT = 20;

export function FuelMeter({
  budgetSeconds,
  remainingSeconds,
  hasBudget,
  isBurning,
}: FuelMeterProps) {
  const t = useTranslations('flames.fuel');
  const shouldReduceMotion = useReducedMotion();

  // Track when burning starts so we can fire the ripple once
  const wasBurningRef = useRef(isBurning);
  const [showRipple, setShowRipple] = useState(false);

  useEffect(() => {
    if (isBurning && !wasBurningRef.current) {
      setShowRipple(true);
      const timeout = setTimeout(() => setShowRipple(false), 600);
      return () => clearTimeout(timeout);
    }
    wasBurningRef.current = isBurning;
  }, [isBurning]);

  if (!hasBudget) {
    return (
      <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 dark:border-white/10 dark:bg-white/5">
        <p className="text-center text-xs text-slate-500 dark:text-white/50">
          {t('noBudget')}
        </p>
      </div>
    );
  }

  const budget = budgetSeconds ?? 0;
  const fraction = budget > 0 ? Math.max(0, remainingSeconds / budget) : 0;
  const isDepleted = remainingSeconds <= 0;
  const isLow = fraction > 0 && fraction <= 0.2;

  // Bar color logic: normal → amber, low → shifts to orange/red, depleted → grey
  const barColor = isDepleted
    ? 'bg-slate-400 dark:bg-white/20'
    : isLow
      ? 'bg-gradient-to-r from-red-500 to-orange-400 dark:from-red-500 dark:to-orange-400'
      : 'bg-gradient-to-r from-amber-500 to-amber-400 dark:from-amber-500 dark:to-amber-400';

  const textColor = isDepleted
    ? 'text-slate-400 dark:text-white/30'
    : isLow
      ? 'text-red-600 dark:text-red-400'
      : 'text-slate-600 dark:text-white/70';

  const iconColor = isDepleted
    ? 'text-slate-400 dark:text-white/30'
    : isLow
      ? 'text-red-500 dark:text-red-400'
      : 'text-amber-600 dark:text-amber-400';

  return (
    <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 dark:border-white/10 dark:bg-white/5">
      <div className="flex items-center gap-2.5">
        {/* Fuel icon + label */}
        <div className={cn('flex shrink-0 items-center gap-1', iconColor)}>
          <Fuel className="h-3.5 w-3.5" />
          <span className="text-xs font-semibold uppercase tracking-wide">
            {t('label')}
          </span>
        </div>

        {/* Bar container */}
        <div className="relative h-3 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
          {/* Segment lines */}
          <div
            className="pointer-events-none absolute inset-0 z-10"
            aria-hidden
          >
            {Array.from({ length: SEGMENT_COUNT - 1 }, (_, i) => (
              <div
                key={`seg-${i + 1}`}
                className="absolute top-0 bottom-0 w-px bg-slate-300/40 dark:bg-white/[0.06]"
                style={{ left: `${((i + 1) / SEGMENT_COUNT) * 100}%` }}
              />
            ))}
          </div>

          {/* Fill bar */}
          <motion.div
            className={cn('absolute inset-y-0 left-0 rounded-full', barColor)}
            initial={false}
            animate={{
              width: `${fraction * 100}%`,
            }}
            transition={
              shouldReduceMotion
                ? { duration: 0.2 }
                : { type: 'spring', stiffness: 300, damping: 30 }
            }
          >
            {/* Consumption shimmer — moves left while burning to suggest depletion */}
            {isBurning && !isDepleted && !shouldReduceMotion && (
              <motion.div
                className="absolute inset-0 rounded-full opacity-30"
                style={{
                  backgroundImage:
                    'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 40%, transparent 60%)',
                  backgroundSize: '200% 100%',
                }}
                animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
                transition={{
                  duration: 2.5,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: 'linear',
                }}
              />
            )}
          </motion.div>

          {/* Low-fuel pulse overlay */}
          <AnimatePresence>
            {isLow && !isDepleted && !shouldReduceMotion && (
              <motion.div
                className="absolute inset-0 rounded-full bg-red-500/10 dark:bg-red-400/10"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.4, 0] }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: 'easeInOut',
                }}
              />
            )}
          </AnimatePresence>

          {/* Burn-start ripple */}
          <AnimatePresence>
            {showRipple && !shouldReduceMotion && (
              <motion.div
                className="absolute inset-0 rounded-full bg-amber-300/30 dark:bg-amber-400/20"
                initial={{ opacity: 0.6, scale: 1 }}
                animate={{ opacity: 0, scale: 1.05 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Time label */}
        <span
          className={cn('shrink-0 text-xs font-medium tabular-nums', textColor)}
        >
          {isDepleted
            ? t('depleted')
            : t('remaining', { time: formatTime(remainingSeconds) })}
        </span>
      </div>
    </div>
  );
}
