'use client';

import { useReducedMotion } from 'framer-motion';
import { FlameIcon, SparklesIcon, StarIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface SealSummaryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  minutes: number;
  level: number;
}

function calculateRewards(minutes: number, level: number) {
  const levelMultiplier = 1 + (level - 1) * 0.1;
  return {
    sparks: Math.floor(minutes * 2 * levelMultiplier),
    xp: Math.floor(minutes * 1.5 * levelMultiplier),
  };
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
      // Ease out cubic
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

function StatRow({
  icon,
  label,
  value,
  suffix,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  suffix: string;
  color: string;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-2 text-sm text-white/70">
        <span style={{ color }}>{icon}</span>
        {label}
      </div>
      <div className="text-sm font-semibold" style={{ color }}>
        {suffix}
        {value}
      </div>
    </div>
  );
}

export function SealSummaryModal({
  open,
  onOpenChange,
  minutes,
  level,
}: SealSummaryModalProps) {
  const t = useTranslations('flames.seal');
  const rewards = calculateRewards(minutes, level);

  const fuelCount = useCountUp(minutes, open);
  const sparksCount = useCountUp(rewards.sparks, open);
  const xpCount = useCountUp(rewards.xp, open);

  const handleDismiss = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="border-amber-900/30 bg-slate-950 text-white"
      >
        <DialogHeader className="items-center text-center">
          <DialogTitle className="text-lg font-bold text-amber-400">
            {t('title')}
          </DialogTitle>
          <p className="text-sm text-white/50">{t('subtitle')}</p>
        </DialogHeader>

        <div className="divide-y divide-white/10 px-2">
          <StatRow
            icon={<FlameIcon className="size-4" />}
            label={t('fuelSpent')}
            value={fuelCount}
            suffix=""
            color="#fb923c"
          />
          <StatRow
            icon={<SparklesIcon className="size-4" />}
            label={t('sparksEarned')}
            value={sparksCount}
            suffix="+"
            color="#fbbf24"
          />
          <StatRow
            icon={<StarIcon className="size-4" />}
            label={t('xpEarned')}
            value={xpCount}
            suffix="+"
            color="#a78bfa"
          />
        </div>

        <DialogFooter>
          <Button
            onClick={handleDismiss}
            className="w-full bg-amber-500 text-slate-950 hover:bg-amber-400"
          >
            {t('dismiss')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
