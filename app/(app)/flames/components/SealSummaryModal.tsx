'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { FlameIcon, Fuel, SparklesIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/dialog';
import { EffectsRenderer } from './flame-card/effects/EffectsRenderer';
import { FlameRenderer } from './flame-card/effects/FlameRenderer';
import { SealCelebration } from './flame-card/effects/SealCelebration';
import type { EffectConfig, ShapeColors } from './flame-card/effects/types';
import { SealEmbers } from './SealEmbers';

interface SealSummaryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  flameName: string;
  colors: ShapeColors;
  level: number;
  effects: EffectConfig[];
  elapsedSeconds: number;
  targetSeconds: number;
}

function calculateRewards(minutes: number, level: number) {
  const levelMultiplier = 1 + (level - 1) * 0.1;
  return {
    sparks: Math.floor(minutes * 2 * levelMultiplier),
    xp: Math.floor(minutes * 1.5 * levelMultiplier),
  };
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

function useCountUp(target: number, active: boolean) {
  const shouldReduceMotion = useReducedMotion();
  const [value, setValue] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!active) {
      setValue(0);
      return;
    }

    if (shouldReduceMotion || target === 0) {
      setValue(target);
      return;
    }

    const duration = 1000;
    const start = performance.now();

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      setValue(Math.floor(eased * target));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [target, active, shouldReduceMotion]);

  return value;
}

function SealFuelMeter({
  elapsedSeconds,
  targetSeconds,
  animate,
}: {
  elapsedSeconds: number;
  targetSeconds: number;
  animate: boolean;
}) {
  const shouldReduceMotion = useReducedMotion();
  const tFuel = useTranslations('flames.fuel');

  const fraction = Math.min(elapsedSeconds / targetSeconds, 1);
  const isOverburn = elapsedSeconds > targetSeconds;

  const barGradient = isOverburn
    ? 'linear-gradient(to right, #dc2626, #ef4444, #f87171)'
    : 'linear-gradient(to right, #f59e0b, #fbbf24)';

  const glowColor = isOverburn ? '#ef4444' : '#f59e0b';

  return (
    <div className="w-full">
      <div className="flex items-center gap-2.5">
        {/* Fuel icon + label */}
        <div
          className={`flex shrink-0 items-center gap-1 ${isOverburn ? 'text-red-500' : 'text-amber-400'}`}
        >
          <Fuel className="h-3.5 w-3.5" />
          <span className="text-xs font-semibold uppercase tracking-wide">
            {tFuel('label')}
          </span>
        </div>

        {/* Bar */}
        <div className="relative h-3 flex-1 overflow-hidden rounded-full bg-muted">
          {/* Segment ticks — matching real FuelMeter */}
          <div
            className="pointer-events-none absolute inset-0 z-10 rounded-full"
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
              opacity: 0.2,
            }}
          />
          {/* Fill */}
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{
              background: barGradient,
              boxShadow: `0 0 8px ${glowColor}60, 0 0 16px ${glowColor}30`,
            }}
            initial={{ width: '0%' }}
            animate={
              animate ? { width: `${fraction * 100}%` } : { width: '0%' }
            }
            transition={
              shouldReduceMotion
                ? { duration: 0.1 }
                : { type: 'spring', stiffness: 60, damping: 20 }
            }
          />
        </div>

        {/* Time label */}
        <span className="shrink-0 text-xs font-medium tabular-nums text-muted-foreground">
          {formatTime(elapsedSeconds)} / {formatTime(targetSeconds)}
        </span>
      </div>
    </div>
  );
}

export function SealSummaryModal({
  open,
  onOpenChange,
  flameName,
  colors,
  level,
  effects,
  elapsedSeconds,
  targetSeconds,
}: SealSummaryModalProps) {
  const t = useTranslations('flames.seal');
  const shouldReduceMotion = useReducedMotion();
  const minutes = Math.floor(elapsedSeconds / 60);
  const rewards = calculateRewards(minutes, level);

  // Pick a contextual subtitle based on fuel percentage
  const subtitle = useMemo(() => {
    const pick = (key: string) => {
      const list = t.raw(key) as string[];
      return list[Math.floor(Math.random() * list.length)];
    };
    if (targetSeconds <= 0) return pick('subtitlesPartial');
    const fuelPercent = elapsedSeconds / targetSeconds;
    if (fuelPercent > 1) return pick('subtitlesOverburn');
    if (fuelPercent >= 0.9) return pick('subtitlesFull');
    if (fuelPercent >= 0.5) return pick('subtitlesPartial');
    return pick('subtitlesMinimal');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetSeconds, elapsedSeconds, t]);

  // Animation sequence state
  const [burstActive, setBurstActive] = useState(false);
  const [showFlame, setShowFlame] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [showGauge, setShowGauge] = useState(false);
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    if (!open) {
      setBurstActive(false);
      setShowFlame(false);
      setShowContent(false);
      setShowGauge(false);
      setShowStats(false);
      return;
    }

    if (shouldReduceMotion) {
      setShowFlame(true);
      setShowContent(true);
      setShowGauge(true);
      setShowStats(true);
      return;
    }

    // Staggered animation sequence:
    // 200ms: Dialog open animation settles, fire celebration burst
    // 500ms: Burst nearing end, reveal sealed flame (it has its own bounce-in)
    // 700ms: Title + subtitle fade in
    // 1000ms: Fuel gauge animates
    // 1200ms: Stats slide up
    const timers = [
      setTimeout(() => setBurstActive(true), 200),
      setTimeout(() => setShowFlame(true), 500),
      setTimeout(() => setShowContent(true), 700),
      setTimeout(() => setShowGauge(true), 1000),
      setTimeout(() => setShowStats(true), 1200),
    ];

    return () => timers.forEach(clearTimeout);
  }, [open, shouldReduceMotion]);

  const handleBurstComplete = useCallback(() => {
    setBurstActive(false);
  }, []);

  const sparksCount = useCountUp(rewards.sparks, showStats);
  const xpCount = useCountUp(rewards.xp, showStats);

  const handleDismiss = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  const titleGradient = `linear-gradient(to right, ${colors.dark}, ${colors.medium}, ${colors.light})`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="overflow-visible border bg-card text-card-foreground"
        style={{
          borderColor: `${colors.medium}40`,
          boxShadow: `0 0 30px ${colors.medium}20, 0 0 60px ${colors.medium}10`,
        }}
      >
        {/* Accessible title (sr-only) */}
        <DialogTitle className="sr-only">
          {flameName} {t('title')}
        </DialogTitle>

        {/* Floating ember particles */}
        {open && !shouldReduceMotion && <SealEmbers color={colors.light} />}

        <div className="relative flex flex-col items-center gap-3 py-2">
          {/* Header text — at top */}
          <motion.div
            className="text-center"
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 8 }}
            animate={showContent ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <h2
              className="bg-clip-text text-xl font-bold text-transparent"
              style={{ backgroundImage: titleGradient }}
            >
              {flameName} {t('title')}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          </motion.div>

          {/* Hero flame visual — center of dialog */}
          <div className="relative flex h-36 w-36 items-center justify-center overflow-visible">
            {/* Celebration burst — plays on open */}
            <SealCelebration
              active={burstActive}
              color={colors.medium}
              onComplete={handleBurstComplete}
            />

            {/* Sealed flame — revealed after burst */}
            {showFlame && (
              <FlameRenderer
                state="sealed"
                level={level}
                colors={colors}
                className="h-28 w-24"
              />
            )}

            {/* Effects container — aligned with flame, overflow visible for embers */}
            {showFlame && (
              <div className="pointer-events-none absolute inset-0 overflow-visible">
                <div className="relative h-full w-full">
                  <EffectsRenderer
                    effects={effects}
                    state="sealed"
                    colors={colors}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Fuel meter */}
          {targetSeconds > 0 && (
            <motion.div
              className="w-full px-2"
              initial={shouldReduceMotion ? {} : { opacity: 0 }}
              animate={showGauge ? { opacity: 1 } : {}}
              transition={{ duration: 0.3 }}
            >
              <SealFuelMeter
                elapsedSeconds={elapsedSeconds}
                targetSeconds={targetSeconds}
                animate={showGauge}
              />
            </motion.div>
          )}

          {/* Stat rows */}
          <div className="flex w-full justify-center gap-8 px-4">
            <motion.div
              className="flex flex-col items-center"
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 12 }}
              animate={showStats ? { opacity: 1, y: 0 } : {}}
              transition={
                shouldReduceMotion
                  ? { duration: 0 }
                  : { duration: 0.4, ease: 'easeOut' }
              }
            >
              <div className="flex items-center gap-1.5">
                <SparklesIcon className="size-4" style={{ color: '#E60076' }} />
                <span className="text-2xl font-bold tabular-nums">
                  +{sparksCount}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                {t('sparksEarned')}
              </span>
            </motion.div>

            <motion.div
              className="flex flex-col items-center"
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 12 }}
              animate={showStats ? { opacity: 1, y: 0 } : {}}
              transition={
                shouldReduceMotion
                  ? { duration: 0 }
                  : { duration: 0.4, ease: 'easeOut', delay: 0.2 }
              }
            >
              <div className="flex items-center gap-1.5">
                <FlameIcon className="size-4" style={{ color: '#f59e0b' }} />
                <span className="text-2xl font-bold tabular-nums">
                  +{xpCount}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                {t('xpEarned')}
              </span>
            </motion.div>
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={handleDismiss}
            className="w-full text-white hover:brightness-110"
            style={{ backgroundColor: colors.medium }}
          >
            {t('dismiss')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
