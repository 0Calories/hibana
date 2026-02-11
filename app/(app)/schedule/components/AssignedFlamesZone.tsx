'use client';

import { useDroppable } from '@dnd-kit/core';
import { Lock } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { getFlameColors } from '@/app/(app)/flames/utils/colors';
import type { FlameColorName } from '@/app/(app)/flames/utils/colors';
import { FlameRenderer } from '@/app/(app)/flames/components/flame-card/effects/FlameRenderer';
import { cn } from '@/lib/utils';
import type { FlameWithSchedule } from '../actions';

interface AssignedFlamesZoneProps {
  flames: FlameWithSchedule[];
  flameLevels: Map<string, number>;
  onRemove: (flameId: string) => void;
}

export function AssignedFlamesZone({
  flames,
  flameLevels,
  onRemove,
}: AssignedFlamesZoneProps) {
  const t = useTranslations('schedule');
  const { isOver, setNodeRef } = useDroppable({ id: 'assigned-zone' });

  const formatMinutes = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h > 0 && m > 0) return `${h}${t('hours')} ${m}${t('minutes')}`;
    if (h > 0) return `${h}${t('hours')}`;
    return `${m}${t('minutes')}`;
  };

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'min-h-[5rem] rounded-lg border-2 border-dashed p-2 transition-colors',
        isOver
          ? 'border-amber-400 bg-amber-50/50 dark:border-amber-500/50 dark:bg-amber-500/5'
          : 'border-muted-foreground/20',
      )}
    >
      {flames.length === 0 ? (
        <p className="flex h-full min-h-[3rem] items-center justify-center text-xs text-muted-foreground">
          {t('dragHere')}
        </p>
      ) : (
        <div className="flex flex-wrap gap-1">
          {flames.map((flame) => {
            const colors = getFlameColors(flame.color as FlameColorName);
            const isDaily = flame.is_daily;

            return (
              <button
                key={flame.id}
                type="button"
                onClick={() => !isDaily && onRemove(flame.id)}
                className={cn(
                  'flex flex-col items-center gap-0.5 rounded-lg p-1.5 transition-colors',
                  isDaily
                    ? 'cursor-default border border-amber-400/30 bg-amber-50/30 dark:border-amber-500/20 dark:bg-amber-500/5'
                    : 'cursor-pointer hover:bg-muted/50',
                )}
              >
                <div className="relative">
                  <FlameRenderer
                    state="untended"
                    level={flameLevels.get(flame.id) ?? 1}
                    colors={colors}
                    className="h-12 w-10"
                  />
                  {isDaily && (
                    <Lock className="absolute -top-0.5 -right-0.5 size-3 text-amber-500" />
                  )}
                </div>
                <span className="max-w-[6rem] truncate text-center text-xs leading-tight">
                  {flame.name}
                </span>
                <div className="flex items-center gap-1">
                  {flame.time_budget_minutes != null && (
                    <span className="text-[10px] text-muted-foreground">
                      {formatMinutes(flame.time_budget_minutes)}
                    </span>
                  )}
                  {isDaily && (
                    <span className="rounded bg-amber-500/10 px-1 py-0.5 text-[10px] font-medium text-amber-600">
                      {t('daily')}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
