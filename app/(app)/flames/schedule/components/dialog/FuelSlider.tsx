'use client';

import { FuelIcon } from 'lucide-react';
import { useCallback, useMemo, useRef, useState } from 'react';
import type { FlameColorName } from '@/app/(app)/flames/utils/colors';
import {
  FLAME_HEX_COLORS,
  getFlameColors,
} from '@/app/(app)/flames/utils/colors';
import { cn } from '@/lib/utils';
import type { Flame } from '@/utils/supabase/rows';

const MAX_MINUTES = 720; // 12 hours
const SNAP_INCREMENT = 15;

// Amber-ish flame colors that blend into the fuel bar
const WARM_COLORS = new Set<string>([
  FLAME_HEX_COLORS.amber.medium,
  FLAME_HEX_COLORS.orange.medium,
]);

interface FuelSliderProps {
  value: number;
  onChange: (minutes: number) => void;
  assignedFlames: Flame[];
  allocations?: Record<string, number>;
  onAllocationChange?: (flameId: string, minutes: number) => void;
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

function parseTime(input: string): number | null {
  // Accept H:MM or just a number (treated as hours)
  const colonMatch = input.match(/^(\d{1,2}):(\d{0,2})$/);
  if (colonMatch) {
    const h = Number.parseInt(colonMatch[1], 10);
    const m = Number.parseInt(colonMatch[2] || '0', 10);
    if (h >= 0 && h <= 12 && m >= 0 && m < 60) {
      return Math.min(h * 60 + m, MAX_MINUTES);
    }
  }
  // Try as plain number of hours
  const num = Number.parseFloat(input);
  if (!Number.isNaN(num) && num >= 0) {
    return Math.min(Math.round(num * 60), MAX_MINUTES);
  }
  return null;
}

const MIN_ALLOCATION = 15;

export function FuelSlider({
  value,
  onChange,
  assignedFlames,
  allocations,
  onAllocationChange,
  disabled = false,
}: FuelSliderProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const resizingRef = useRef<{
    flameId: string;
    startX: number;
    startMinutes: number;
  } | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState('');

  const getAllocation = (flame: Flame) =>
    allocations?.[flame.id] ?? flame.time_budget_minutes ?? 0;

  const fraction = MAX_MINUTES > 0 ? Math.min(value / MAX_MINUTES, 1) : 0;
  const allocatedMinutes = assignedFlames.reduce(
    (sum, f) => sum + getAllocation(f),
    0,
  );
  const isOverCapacity = allocatedMinutes > value;

  // Build colored segments for the gauge from assigned flames

  const segments = useMemo(() => {
    type FuelSegment = {
      flameId: string;
      startFrac: number;
      endFrac: number;
      colors: {
        light: string;
        medium: string;
        dark: string;
      };
      needsOutline: boolean;
    };

    const result = assignedFlames.reduce(
      (acc: { segments: FuelSegment[]; cursor: number }, flame) => {
        const budget = getAllocation(flame);
        if (budget <= 0) {
          return acc;
        }

        const startFrac = acc.cursor / MAX_MINUTES;
        acc.cursor += budget;
        const endFrac = Math.min(acc.cursor / MAX_MINUTES, 1);
        const colors = getFlameColors(flame.color as FlameColorName);
        acc.segments.push({
          flameId: flame.id,
          startFrac,
          endFrac,
          colors,
          needsOutline: WARM_COLORS.has(colors.medium),
        });

        return acc;
      },
      { segments: [], cursor: 0 },
    );

    return result.segments;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignedFlames, allocations]);

  const renderRemainderSegment = () => {
    const allocFrac = Math.min(allocatedMinutes / MAX_MINUTES, 1);
    if (fraction > allocFrac) {
      return (
        <div
          className={cn(
            'absolute inset-y-0',
            isOverCapacity
              ? 'bg-red-500'
              : 'bg-linear-to-r from-amber-500 to-amber-400',
          )}
          style={{
            left: `${allocFrac * 100}%`,
            width: `${(fraction - allocFrac) * 100}%`,
          }}
        />
      );
    }
    return null;
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
      // Don't start slider drag if we're on a resize handle
      if (resizingRef.current) return;
      e.preventDefault();
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      draggingRef.current = true;
      updateFromPointer(e.clientX);
    },
    [disabled, updateFromPointer],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (resizingRef.current && barRef.current && onAllocationChange) {
        const rect = barRef.current.getBoundingClientRect();
        const deltaX = e.clientX - resizingRef.current.startX;
        const deltaMinutes = (deltaX / rect.width) * MAX_MINUTES;
        const newMinutes = snapTo(
          resizingRef.current.startMinutes + deltaMinutes,
        );
        onAllocationChange(
          resizingRef.current.flameId,
          Math.max(newMinutes, MIN_ALLOCATION),
        );
        return;
      }
      if (!draggingRef.current) return;
      updateFromPointer(e.clientX);
    },
    [updateFromPointer, onAllocationChange],
  );

  const handlePointerUp = useCallback(() => {
    draggingRef.current = false;
    resizingRef.current = null;
  }, []);

  const handleResizePointerDown = useCallback(
    (e: React.PointerEvent, flameId: string, currentMinutes: number) => {
      if (disabled || !onAllocationChange) return;
      e.preventDefault();
      e.stopPropagation();
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      resizingRef.current = {
        flameId,
        startX: e.clientX,
        startMinutes: currentMinutes,
      };
    },
    [disabled, onAllocationChange],
  );

  const handleLabelClick = () => {
    if (disabled) return;
    setEditText(formatTime(value));
    setIsEditing(true);
  };

  const commitEdit = () => {
    const parsed = parseTime(editText);
    if (parsed !== null) {
      onChange(snapTo(parsed));
    }
    setIsEditing(false);
  };

  return (
    <div className="flex items-center gap-2.5">
      {/* Fuel icon */}
      <div
        className={cn(
          'flex shrink-0 items-center gap-1',
          isOverCapacity
            ? 'text-destructive'
            : 'text-amber-600 dark:text-amber-400',
        )}
      >
        <FuelIcon className="h-3.5 w-3.5" />
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
        <div className="relative h-full overflow-hidden rounded-full bg-muted">
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
          {segments.map((seg) => (
            <div
              key={`segment-${seg.flameId}`}
              className={cn(
                'absolute inset-y-0',
                seg.needsOutline &&
                  'ring-1 ring-inset ring-black/20 dark:ring-white/20',
              )}
              style={{
                left: `${seg.startFrac * 100}%`,
                width: `${(seg.endFrac - seg.startFrac) * 100}%`,
                background: `linear-gradient(to right, ${seg.colors.dark}, ${seg.colors.medium}, ${seg.colors.light})`,
                opacity: seg.endFrac <= fraction ? 1 : 0.35,
              }}
            />
          ))}

          {/* Drag handles at segment boundaries */}
          {onAllocationChange &&
            segments.map((seg) => (
              <div
                key={`handle-${seg.flameId}`}
                className="absolute inset-y-0 z-10 w-3 -translate-x-1/2 cursor-col-resize touch-none"
                style={{ left: `${seg.endFrac * 100}%` }}
                onPointerDown={(e) =>
                  handleResizePointerDown(
                    e,
                    seg.flameId,
                    getAllocation(
                      assignedFlames.find((f) => f.id === seg.flameId)!,
                    ),
                  )
                }
              >
                <div className="mx-auto h-full w-0.5 bg-white/60 dark:bg-white/40 opacity-0 hover:opacity-100 transition-opacity" />
              </div>
            ))}

          {/* Amber fill for unallocated portion up to the slider position */}
          {renderRemainderSegment()}
        </div>

        {/* Thumb — pill notch */}
        <div
          className="absolute top-1/2 z-20 -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${fraction * 100}%` }}
        >
          <div
            className={cn(
              'h-5 w-2 rounded-full shadow-md',
              isOverCapacity
                ? 'bg-red-400 shadow-red-500/30'
                : 'bg-amber-300 shadow-amber-500/30',
            )}
          />
        </div>
      </div>

      {/* Time label — click to edit, fixed width to prevent layout shift */}
      {isEditing ? (
        <input
          type="text"
          className={cn(
            'w-14 shrink-0 border-b border-amber-400 bg-transparent text-center text-sm font-medium tabular-nums outline-none',
            isOverCapacity ? 'text-destructive' : 'text-muted-foreground',
          )}
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commitEdit();
            if (e.key === 'Escape') setIsEditing(false);
          }}
          // biome-ignore lint/a11y/noAutofocus: Editing mode
          autoFocus
        />
      ) : (
        <button
          type="button"
          onClick={handleLabelClick}
          disabled={disabled}
          className={cn(
            'w-14 shrink-0 cursor-text border-b border-transparent text-center text-sm font-medium tabular-nums hover:border-amber-400/50',
            isOverCapacity ? 'text-destructive' : 'text-muted-foreground',
          )}
        >
          {formatTime(value)}
        </button>
      )}
    </div>
  );
}
