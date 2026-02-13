'use client';

import { FlameRenderer } from '@/app/(app)/flames/components/flame-card/effects/FlameRenderer';
import type { FlameColorName } from '@/app/(app)/flames/utils/colors';
import { getFlameColors } from '@/app/(app)/flames/utils/colors';
import { getFlameLevel } from '@/app/(app)/flames/utils/levels';
import { cn } from '@/lib/utils';
import type { FlameWithSchedule } from '../actions';

interface MiniFlameCardProps {
  flame: FlameWithSchedule;
  level: number;
  budgetLabel?: string;
}

export function MiniFlameCard({
  flame,
  level,
  budgetLabel,
}: MiniFlameCardProps) {
  const colors = getFlameColors(flame.color as FlameColorName);
  const levelInfo = getFlameLevel(level);

  return (
    <div
      className={cn(
        'flex w-28 shrink-0 flex-col overflow-hidden rounded-xl border sm:w-36',
        'border-slate-200 bg-linear-to-b from-white to-slate-50',
        'dark:border-white/10 dark:from-slate-900 dark:to-slate-950',
      )}
    >
      {/* Header */}
      <div className="px-1.5 pt-2 sm:px-2">
        <h3 className="truncate text-center text-xs font-semibold leading-tight sm:text-sm">
          {flame.name}
        </h3>
        <div
          className="text-center text-[10px] font-medium sm:text-xs"
          style={{ color: levelInfo.color }}
        >
          Lv. {levelInfo.level} · {levelInfo.name}
        </div>
      </div>

      {/* Flame visual */}
      <div className="relative flex h-20 items-center justify-center sm:h-28">
        <FlameRenderer
          state="untended"
          level={level}
          colors={colors}
          className="h-16 w-14 sm:h-24 sm:w-20"
        />
      </div>

      {/* Footer — time budget */}
      {budgetLabel && (
        <div className="bg-slate-200/70 px-1.5 py-1.5 dark:bg-black/30 sm:px-2">
          <p className="text-center text-[10px] text-slate-500 dark:text-white/50 sm:text-xs">
            {budgetLabel}
          </p>
        </div>
      )}
    </div>
  );
}
