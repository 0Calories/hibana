'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Fuel } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { FuelDroplets } from './FuelDroplets';
import { SmokePuffs } from './SmokePuffs';

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
      <div className="sticky top-0 z-20 -mx-4 mb-4 bg-background/80 px-4 pt-4 pb-0 backdrop-blur-sm">
        <div className="rounded-lg border border-border bg-card px-3 py-2">
          <p className="text-center text-xs text-muted-foreground">
            {t('noBudget')}
          </p>
        </div>
      </div>
    );
  }

  const budget = budgetSeconds ?? 0;
  const fraction = budget > 0 ? Math.max(0, remainingSeconds / budget) : 0;
  const isDepleted = remainingSeconds <= 0;
  const isLow = fraction > 0 && fraction <= 0.2;

  // Bar color logic: normal → amber, low → shifts to orange/red, depleted → grey
  const barColor = isDepleted
    ? 'bg-muted-foreground/40'
    : isLow
      ? 'bg-gradient-to-r from-red-500 to-orange-400 dark:from-red-500 dark:to-orange-400'
      : 'bg-gradient-to-r from-amber-500 to-amber-400 dark:from-amber-500 dark:to-amber-400';

  const textColor = isDepleted
    ? 'text-muted-foreground/60'
    : isLow
      ? 'text-red-600 dark:text-red-400'
      : 'text-muted-foreground';

  const iconColor = isDepleted
    ? 'text-muted-foreground/60'
    : isLow
      ? 'text-red-500 dark:text-red-400'
      : 'text-amber-600 dark:text-amber-400';

  // Glow color for the container when burning
  const glowColor = isLow
    ? 'rgba(239, 68, 68, 0.15)'
    : 'rgba(245, 158, 11, 0.12)';
  const glowColorStrong = isLow
    ? 'rgba(239, 68, 68, 0.3)'
    : 'rgba(245, 158, 11, 0.25)';

  return (
    <div className="sticky top-0 z-20 -mx-4 mb-4 bg-background/80 px-4 pt-4 pb-0 backdrop-blur-sm">
      <motion.div
        className="rounded-lg border border-border bg-card px-3 py-2.5"
        initial={false}
        animate={
          isBurning && !isDepleted && !shouldReduceMotion
            ? {
                boxShadow: [
                  `0 0 8px ${glowColor}, 0 0 16px ${glowColor}`,
                  `0 0 12px ${glowColorStrong}, 0 0 24px ${glowColor}`,
                  `0 0 8px ${glowColor}, 0 0 16px ${glowColor}`,
                ],
              }
            : { boxShadow: '0 0 0px transparent' }
        }
        transition={
          isBurning && !isDepleted
            ? {
                duration: 3,
                repeat: Number.POSITIVE_INFINITY,
                ease: 'easeInOut',
              }
            : { duration: 0.4 }
        }
      >
        <div className="flex items-center gap-2.5">
          {/* Fuel icon + label */}
          <div className={cn('flex shrink-0 items-center gap-1', iconColor)}>
            <Fuel className="h-3.5 w-3.5" />
            <span className="text-xs font-semibold uppercase tracking-wide">
              {t('label')}
            </span>
          </div>

          {/* Bar container */}
          <div className="relative h-3 flex-1 overflow-visible">
            <div className="relative h-full overflow-hidden rounded-full bg-muted">
              {/* Segment ticks — repeating gradient overlay, auto-adapts to width */}
              <div
                className="pointer-events-none absolute inset-0 z-10 rounded-full opacity-20 dark:opacity-15"
                aria-hidden
                style={{
                  backgroundImage: `
                    repeating-linear-gradient(
                      to right,
                      transparent 0px,
                      transparent 30px,
                      rgba(0, 0, 0, 0.5) 30px,
                      rgba(0, 0, 0, 0.5) 32px
                    )
                  `,
                }}
              />
              {/* Fill bar */}
              <motion.div
                className={cn(
                  'absolute inset-y-0 left-0 rounded-full',
                  barColor,
                )}
                initial={{ width: 0 }}
                animate={{ width: `${fraction * 100}%` }}
                transition={
                  shouldReduceMotion
                    ? { duration: 0.2 }
                    : { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] as const }
                }
              >
                {/* Glowing tip — hot-spot at the leading edge while burning */}
                {isBurning && !isDepleted && (
                  <motion.div
                    className="absolute top-0 right-0 bottom-0 w-3 rounded-full"
                    style={{
                      background: isLow
                        ? 'linear-gradient(to left, rgba(255,200,180,0.9), transparent)'
                        : 'linear-gradient(to left, rgba(255,240,200,0.9), transparent)',
                      boxShadow: isLow
                        ? '0 0 6px rgba(239,68,68,0.6), 0 0 12px rgba(239,68,68,0.3)'
                        : '0 0 6px rgba(251,191,36,0.6), 0 0 12px rgba(251,191,36,0.3)',
                    }}
                    initial={false}
                    animate={
                      shouldReduceMotion
                        ? {}
                        : {
                            opacity: [0.7, 1, 0.7],
                          }
                    }
                    transition={{
                      duration: 1.5,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: 'easeInOut',
                    }}
                  />
                )}

                {/* Consumption shimmer */}
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

            {/* Tip effects — positioned at the leading edge of the fill */}
            {isBurning && !isDepleted && !shouldReduceMotion && (
              <div
                className="pointer-events-none absolute top-0 h-full"
                style={{ left: `${fraction * 100}%` }}
              >
                {/* Fuel droplets — drip downward */}
                <FuelDroplets
                  className={
                    isLow
                      ? 'bg-red-400/80 dark:bg-red-300/80'
                      : 'bg-amber-500/70 dark:bg-amber-300/70'
                  }
                />

                {/* Smoke puffs — soft blurred circles that accumulate into smoke */}
                <SmokePuffs
                  color={
                    isLow
                      ? 'rgba(252, 165, 165, 0.8)'
                      : 'rgba(220, 180, 100, 0.7)'
                  }
                />
              </div>
            )}
          </div>

          {/* Time label */}
          <span
            className={cn(
              'shrink-0 text-xs font-medium tabular-nums',
              textColor,
            )}
          >
            {isDepleted
              ? t('depleted')
              : t('remaining', { time: formatTime(remainingSeconds) })}
          </span>
        </div>
      </motion.div>
    </div>
  );
}
