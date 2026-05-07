'use client';

import { useTranslations } from 'next-intl';
import type { Flame } from '@/lib/supabase/rows';
import { cn } from '@/lib/utils';
import { getFlameColors } from '../utils/colors';
import {
  formatPlannedMinutes,
  PLAN_SUM_BAR_MAX_SECONDS,
} from '../utils/format';

interface PlanSumBarProps {
  picks: Array<{ flame: Flame; targetSeconds: number }>;
}

/**
 * Thin horizontal bar showing today's planned total as flame-colored segments.
 * Hardset max = PLAN_SUM_BAR_MAX_SECONDS (12h). Past that, segments visually
 * overflow with a banded/saturated style — soft signal, no enforcement.
 */
export function PlanSumBar({ picks }: PlanSumBarProps) {
  const t = useTranslations('flames.plan');
  const total = picks.reduce((sum, p) => sum + p.targetSeconds, 0);
  const overflow = total > PLAN_SUM_BAR_MAX_SECONDS;

  const denom = overflow ? total : PLAN_SUM_BAR_MAX_SECONDS;

  return (
    <div className="flex items-center gap-3">
      <div
        className={cn(
          'relative h-3 flex-1 overflow-hidden rounded-full bg-muted',
          overflow && 'ring-1 ring-amber-500/40',
        )}
      >
        <div className="absolute inset-0 flex">
          {picks.map((p) => {
            const colors = getFlameColors(p.flame.color);
            const w = (p.targetSeconds / denom) * 100;
            return (
              <div
                key={p.flame.id}
                style={{
                  width: `${w}%`,
                  background: `linear-gradient(90deg, ${colors.medium}, ${colors.light})`,
                }}
                className={cn('h-full', overflow && 'opacity-90')}
              />
            );
          })}
        </div>
      </div>
      <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
        {t('summary', {
          time: formatPlannedMinutes(total),
          count: picks.length,
        })}
      </span>
    </div>
  );
}
