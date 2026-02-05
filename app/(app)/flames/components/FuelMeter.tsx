'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

interface FuelMeterProps {
  budgetSeconds: number | null;
  remainingSeconds: number;
  hasBudget: boolean;
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
}: FuelMeterProps) {
  const t = useTranslations('flames.fuel');

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

  return (
    <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 dark:border-white/10 dark:bg-white/5">
      <div className="flex items-center justify-between gap-3">
        {/* Progress bar */}
        <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
          <motion.div
            className={cn(
              'absolute inset-y-0 left-0 rounded-full',
              isDepleted && 'bg-slate-400 dark:bg-white/20',
              isLow && 'bg-red-500 dark:bg-red-400',
              !isDepleted && !isLow && 'bg-amber-500 dark:bg-amber-400',
            )}
            initial={false}
            animate={{ width: `${fraction * 100}%` }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
        </div>

        {/* Time label */}
        <span
          className={cn(
            'shrink-0 text-xs font-medium tabular-nums',
            isDepleted && 'text-slate-400 dark:text-white/30',
            isLow && 'text-red-600 dark:text-red-400',
            !isDepleted && !isLow && 'text-slate-600 dark:text-white/70',
          )}
        >
          {isDepleted
            ? t('depleted')
            : t('remaining', { time: formatTime(remainingSeconds) })}
        </span>
      </div>
    </div>
  );
}
