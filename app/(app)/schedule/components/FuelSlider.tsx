'use client';

import { useTranslations } from 'next-intl';
import { useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

const MAX_MINUTES = 960; // 16 hours
const SNAP_INCREMENT = 15;

interface FuelSliderProps {
  value: number;
  onChange: (minutes: number) => void;
  allocatedMinutes: number;
  disabled?: boolean;
}

function snapTo(minutes: number): number {
  return Math.round(minutes / SNAP_INCREMENT) * SNAP_INCREMENT;
}

export function FuelSlider({
  value,
  onChange,
  allocatedMinutes,
  disabled = false,
}: FuelSliderProps) {
  const t = useTranslations('schedule');
  const barRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  const hours = Math.floor(value / 60);
  const mins = value % 60;

  const fraction = MAX_MINUTES > 0 ? Math.min(value / MAX_MINUTES, 1) : 0;
  const capacityRatio = value > 0 ? allocatedMinutes / value : 0;
  const isOverCapacity = capacityRatio > 1;

  const formatMinutes = (total: number) => {
    const h = Math.floor(total / 60);
    const m = total % 60;
    if (h > 0 && m > 0) return `${h}${t('hours')} ${m}${t('minutes')}`;
    if (h > 0) return `${h}${t('hours')}`;
    return `${m}${t('minutes')}`;
  };

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

      {/* Capacity label */}
      {value > 0 && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{t('capacity')}</span>
          <span
            className={cn(
              'text-xs font-medium',
              isOverCapacity ? 'text-red-500' : 'text-muted-foreground',
            )}
          >
            {formatMinutes(allocatedMinutes)} / {formatMinutes(value)}
            {capacityRatio >= 1 && ` — ${t('full')}`}
          </span>
        </div>
      )}

      {/* Slider bar */}
      <div
        ref={barRef}
        className={cn(
          'relative h-3 cursor-pointer touch-none select-none',
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
          {/* Fill */}
          <div
            className={cn(
              'absolute inset-y-0 left-0 rounded-full transition-[width] duration-75',
              isOverCapacity
                ? 'bg-red-500'
                : 'bg-gradient-to-r from-amber-500 to-amber-400',
            )}
            style={{ width: `${fraction * 100}%` }}
          />
        </div>

        {/* Thumb */}
        <div
          className={cn(
            'absolute top-1/2 z-20 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-md transition-[left] duration-75',
            isOverCapacity ? 'bg-red-500' : 'bg-amber-500',
          )}
          style={{ left: `${fraction * 100}%` }}
        />
      </div>
    </div>
  );
}
