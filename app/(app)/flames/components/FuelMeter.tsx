'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Fuel } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatFuelBalance } from '../utils/format';

interface FuelMeterProps {
  balanceSeconds: number;
  /** True if any of today's sessions has unfueled time the user could claim. */
  hasUnfueled: boolean;
  isStuck?: boolean;
  onRefillClick: () => void;
}

/**
 * Balance-based fuel meter. Displays current fuel as H:MM/Nm; surfaces a refill
 * affordance when balance hits 0 OR when there's unfueled time to claim.
 */
export function FuelMeter({
  balanceSeconds,
  hasUnfueled,
  isStuck = false,
  onRefillClick,
}: FuelMeterProps) {
  const t = useTranslations('flames.fuel');
  const shouldReduceMotion = useReducedMotion();

  const isEmpty = balanceSeconds <= 0;
  const showRefillCTA = isEmpty || hasUnfueled;

  // Visual fill: balance vs a soft visual cap (4 hours = 14400 s) so the bar
  // doesn't max out forever. Past the cap we show full-bar with a subtle glow.
  const visualCap = 14400;
  const fraction = Math.min(1, balanceSeconds / visualCap);

  return (
    <motion.div
      className={cn(
        'h-full rounded-lg border border-border px-3 py-2.5 backdrop-blur-sm transition-[colors,opacity] duration-1000',
        isStuck ? 'bg-card/50 opacity-90' : 'bg-card',
        isEmpty && 'border-red-500/40',
      )}
    >
      <div className="flex items-center gap-2.5">
        <div
          className={cn(
            'flex shrink-0 items-center gap-1',
            isEmpty
              ? 'text-red-500 dark:text-red-400'
              : 'text-amber-600 dark:text-amber-400',
          )}
        >
          <Fuel className="size-3.5" />
          <span className="text-xs font-semibold uppercase tracking-wide">
            {t('label')}
          </span>
        </div>

        <div className="relative h-3 flex-1 overflow-hidden rounded-full bg-muted">
          <motion.div
            className={cn(
              'absolute inset-y-0 left-0 rounded-full',
              isEmpty
                ? 'bg-red-500/40'
                : 'bg-gradient-to-r from-amber-500 to-amber-400',
            )}
            initial={{ width: 0 }}
            animate={{ width: `${fraction * 100}%` }}
            transition={
              shouldReduceMotion
                ? { duration: 0.2 }
                : { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] as const }
            }
          />
        </div>

        <span
          className={cn(
            'shrink-0 text-xs font-medium tabular-nums',
            isEmpty
              ? 'text-red-500 dark:text-red-400'
              : 'text-muted-foreground',
          )}
        >
          {formatFuelBalance(balanceSeconds)}
        </span>

        {showRefillCTA && (
          <Button
            size="sm"
            variant={isEmpty ? 'default' : 'outline'}
            onClick={onRefillClick}
            className="h-7 px-2 text-xs"
          >
            {t('refill')}
          </Button>
        )}
      </div>
    </motion.div>
  );
}
