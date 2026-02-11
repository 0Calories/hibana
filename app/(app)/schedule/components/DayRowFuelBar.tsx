'use client';

import { useMemo } from 'react';
import type { FlameColorName } from '@/app/(app)/flames/utils/colors';
import {
  FLAME_HEX_COLORS,
  getFlameColors,
} from '@/app/(app)/flames/utils/colors';
import { cn } from '@/lib/utils';
import type { FlameWithSchedule } from '../actions';

const WARM_COLORS = new Set<string>([
  FLAME_HEX_COLORS.amber.medium,
  FLAME_HEX_COLORS.orange.medium,
]);

interface DayRowFuelBarProps {
  fuelMinutes: number;
  assignedFlames: FlameWithSchedule[];
}

export function DayRowFuelBar({
  fuelMinutes,
  assignedFlames,
}: DayRowFuelBarProps) {
  const allocatedMinutes = assignedFlames.reduce(
    (sum, f) => sum + (f.time_budget_minutes ?? 0),
    0,
  );
  const isOverCapacity = fuelMinutes > 0 && allocatedMinutes > fuelMinutes;

  const segments = useMemo(() => {
    if (fuelMinutes <= 0) return [];

    type Segment = {
      startPct: number;
      widthPct: number;
      colors: { light: string; medium: string; dark: string };
      needsOutline: boolean;
    };

    let cursor = 0;
    const result: Segment[] = [];

    for (const flame of assignedFlames) {
      const budget = flame.time_budget_minutes ?? 0;
      if (budget <= 0) continue;

      const startPct = (cursor / fuelMinutes) * 100;
      cursor += budget;
      const endPct = Math.min((cursor / fuelMinutes) * 100, 100);
      const colors = getFlameColors(flame.color as FlameColorName);

      result.push({
        startPct,
        widthPct: endPct - startPct,
        colors,
        needsOutline: WARM_COLORS.has(colors.medium),
      });
    }

    return result;
  }, [fuelMinutes, assignedFlames]);

  // Overflow segment for over-capacity
  const overflowPct =
    isOverCapacity
      ? Math.min(((allocatedMinutes - fuelMinutes) / fuelMinutes) * 100, 20)
      : 0;

  return (
    <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
      {segments.map((seg) => (
        <div
          key={`seg-${seg.startPct}`}
          className={cn(
            'absolute inset-y-0',
            seg.needsOutline &&
              'ring-1 ring-inset ring-black/20 dark:ring-white/20',
          )}
          style={{
            left: `${seg.startPct}%`,
            width: `${seg.widthPct}%`,
            background: `linear-gradient(to right, ${seg.colors.dark}, ${seg.colors.medium}, ${seg.colors.light})`,
          }}
        />
      ))}

      {/* Gray remainder for unallocated budget */}
      {!isOverCapacity && allocatedMinutes < fuelMinutes && (
        <div
          className="absolute inset-y-0 bg-amber-400/30 dark:bg-amber-500/20"
          style={{
            left: `${(allocatedMinutes / fuelMinutes) * 100}%`,
            width: `${((fuelMinutes - allocatedMinutes) / fuelMinutes) * 100}%`,
          }}
        />
      )}

      {/* Red overflow indicator */}
      {isOverCapacity && (
        <div
          className="absolute inset-y-0 right-0 bg-red-500"
          style={{ width: `${overflowPct}%` }}
        />
      )}
    </div>
  );
}
