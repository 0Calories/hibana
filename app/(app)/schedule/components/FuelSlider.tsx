'use client';

import { Fuel } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';
import { getFlameColors } from '@/app/(app)/flames/utils/colors';
import type { FlameColorName } from '@/app/(app)/flames/utils/colors';
import { Input } from '@/components/ui/input';
import type { FlameWithSchedule } from '../actions';

const MAX_MINUTES = 960; // 16 hours
const SNAP_INCREMENT = 15;

interface FuelSliderProps {
  value: number;
  onChange: (minutes: number) => void;
  assignedFlames: FlameWithSchedule[];
  disabled?: boolean;
}

function snapTo(minutes: number): number {
  return Math.round(minutes / SNAP_INCREMENT) * SNAP_INCREMENT;
}

function formatTime(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${h}:${String(m).padStart(2, '0')}`;
}

export function FuelSlider({
  value,
  onChange,
  assignedFlames,
  disabled = false,
}: FuelSliderProps) {
  const t = useTranslations('schedule');
  const barRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  const hours = Math.floor(value / 60);
  const mins = value % 60;

  const fraction = MAX_MINUTES > 0 ? Math.min(value / MAX_MINUTES, 1) : 0;
  const allocatedMinutes = assignedFlames.reduce(
    (sum, f) => sum + (f.time_budget_minutes ?? 0),
    0,
  );
  const isOverCapacity = value > 0 && allocatedMinutes > value;

  // Build colored segments for the gauge from assigned flames
  const segments = (() => {
    if (value === 0) return [];
    const result: { startFrac: number; endFrac: number; color: string }[] = [];
    let cursor = 0;
    for (const flame of assignedFlames) {
      const budget = flame.time_budget_minutes ?? 0;
      if (budget <= 0) continue;
      const startFrac = cursor / MAX_MINUTES;
      cursor += budget;
      const endFrac = Math.min(cursor / MAX_MINUTES, 1);
      const hex = getFlameColors(flame.color as FlameColorName);
      result.push({ startFrac, endFrac, color: hex.medium });
    }
    return result;
  })();

  const updateFromPointer = useCallback(
    (clientX: number) => {
      if (!barRef.current || disabled) return;
      const rect = barRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const ratio = Math.max(0, Math.min(1, x / rect.width));
      const rawMinutes = ratio * MAX_MINUTES;
      onChange(snapTo(rawMinutes));
    },
    [disabled, onChange],
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (disabled) return;
      e.preventDefault();
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      draggingRef.current = true;
      updateFromPointer(e.clientX);
    },
    [disabled, updateFromPointer],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!draggingRef.current) return;
      updateFromPointer(e.clientX);
    },
    [updateFromPointer],
  );

  const handlePointerUp = useCallback(() => {
    draggingRef.current = false;
  }, []);

  const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const h = Math.max(0, Math.min(16, Number.parseInt(e.target.value, 10) || 0));
    const newTotal = Math.min(h * 60 + mins, MAX_MINUTES);
    onChange(newTotal);
  };

  const handleMinsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const m = Math.max(0, Math.min(59, Number.parseInt(e.target.value, 10) || 0));
    const newTotal = Math.min(hours * 60 + m, MAX_MINUTES);
    onChange(newTotal);
  };

  return (
    <div className="space-y-2">
      {/* Hour/min inputs */}
      <div className="flex items-center gap-2">
        <Input
          type="number"
          min={0}
          max={16}
          value={hours}
          onChange={handleHoursChange}
          disabled={disabled}
          className="w-16 text-center"
        />
        <span className="text-xs text-muted-foreground">{t('hours')}</span>
        <Input
          type="number"
          min={0}
          max={59}
          value={mins}
          onChange={handleMinsChange}
          disabled={disabled}
          className="w-16 text-center"
        />
        <span className="text-xs text-muted-foreground">{t('minutes')}</span>
      </div>

      {/* Gauge bar with FUEL icon + time label */}
      <div className="flex items-center gap-2.5">
        {/* Fuel icon + label */}
        <div
          className={cn(
            'flex shrink-0 items-center gap-1',
            isOverCapacity
              ? 'text-red-500'
              : 'text-amber-600 dark:text-amber-400',
          )}
        >
          <Fuel className="h-3.5 w-3.5" />
        </div>

        {/* Bar container */}
        <div
          ref={barRef}
          className={cn(
            'relative h-3 flex-1 cursor-pointer touch-none select-none',
            disabled && 'pointer-events-none opacity-50',
          )}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          {/* Track */}
          <div className="relative h-full overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
            {/* Segment ticks */}
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

            {/* Colored flame segments */}
            {segments.map((seg, i) => (
              <div
                key={i}
                className="absolute inset-y-0"
                style={{
                  left: `${seg.startFrac * 100}%`,
                  width: `${(seg.endFrac - seg.startFrac) * 100}%`,
                  backgroundColor: seg.color,
                  opacity: seg.endFrac <= fraction ? 1 : 0.4,
                }}
              />
            ))}

            {/* Amber fill for unallocated portion up to the slider position */}
            {(() => {
              const allocFrac = Math.min(allocatedMinutes / MAX_MINUTES, 1);
              if (fraction > allocFrac) {
                return (
                  <div
                    className={cn(
                      'absolute inset-y-0',
                      isOverCapacity
                        ? 'bg-red-500'
                        : 'bg-gradient-to-r from-amber-500 to-amber-400',
                    )}
                    style={{
                      left: `${allocFrac * 100}%`,
                      width: `${(fraction - allocFrac) * 100}%`,
                    }}
                  />
                );
              }
              return null;
            })()}
          </div>

          {/* Thumb — pill-shaped with inner glow */}
          <div
            className="absolute top-1/2 z-20 -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${fraction * 100}%` }}
          >
            <div
              className={cn(
                'h-4.5 w-2.5 rounded-full shadow-md ring-2 ring-white/90 dark:ring-white/70',
                isOverCapacity ? 'bg-red-500' : 'bg-amber-400',
              )}
            />
          </div>
        </div>

        {/* Time label */}
        <span
          className={cn(
            'shrink-0 text-xs font-medium tabular-nums',
            isOverCapacity
              ? 'text-red-500'
              : 'text-slate-600 dark:text-white/70',
          )}
        >
          {formatTime(value)}
        </span>
      </div>
    </div>
  );
}
