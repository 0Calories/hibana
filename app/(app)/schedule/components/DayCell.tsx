'use client';

import { useTranslations } from 'next-intl';
import { parseLocalDate } from '@/lib/utils';
import type { DayPlan, FlameWithSchedule } from '../actions';
import { MiniFlame } from './MiniFlame';

// TODO: Use i18n instead of this hardcoded shiet
const DAY_ABBREVS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

interface DayCellProps {
  day: DayPlan;
  flames: FlameWithSchedule[];
  isToday: boolean;
  isPast: boolean;
  onSelect: () => void;
}

export function DayCell({
  day,
  flames,
  isToday,
  isPast,
  onSelect,
}: DayCellProps) {
  const t = useTranslations('schedule');
  const dateNum = parseLocalDate(day.date).getDate();
  const assignedFlames = flames.filter((f) =>
    day.assignedFlameIds.includes(f.id),
  );

  const fuelNeeded = assignedFlames.reduce(
    (sum, f) => sum + (f.time_budget_minutes ?? 0),
    0,
  );
  const capacityRatio =
    day.fuelMinutes && day.fuelMinutes > 0 ? fuelNeeded / day.fuelMinutes : 0;
  const isOverAllocated = capacityRatio > 1;

  const formatMinutes = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h > 0 && m > 0) return `${h}h${m}m`;
    if (h > 0) return `${h}h`;
    return `${m}m`;
  };

  return (
    <button
      type="button"
      onClick={isPast ? undefined : onSelect}
      disabled={isPast}
      className={`flex min-w-18 flex-col items-center gap-1 rounded-xl border p-2 transition-all ${
        isPast
          ? 'cursor-default opacity-50'
          : 'cursor-pointer hover:bg-muted/50 active:scale-[0.97]'
      } ${
        isToday
          ? 'border-amber-500/50 shadow-[0_0_8px_rgba(245,158,11,0.2)]'
          : 'border-border'
      } ${day.isOverride ? 'border-dashed' : ''}`}
    >
      {/* Day of week text */}
      <span className="text-[10px] font-medium text-muted-foreground">
        {DAY_ABBREVS[day.dayOfWeek]}
      </span>

      {/* Date number */}
      <span
        className={`text-sm font-semibold ${isToday ? 'text-amber-500' : ''}`}
      >
        {dateNum}
      </span>

      {/* Today label */}
      {isToday && (
        <span className="text-[9px] font-medium text-amber-500">
          {t('today')}
        </span>
      )}

      {/* Fuel budget */}
      <span className="text-[10px] text-muted-foreground">
        {day.fuelMinutes != null ? formatMinutes(day.fuelMinutes) : t('noFuel')}
      </span>

      {/* Mini flames row */}
      {assignedFlames.length > 0 && (
        <div className="flex flex-wrap justify-center gap-0.5">
          {assignedFlames.slice(0, 4).map((f) => (
            <MiniFlame key={f.id} color={f.color} />
          ))}
          {assignedFlames.length > 4 && (
            <span className="text-[9px] text-muted-foreground">
              +{assignedFlames.length - 4}
            </span>
          )}
        </div>
      )}

      {/* Capacity bar */}
      {day.fuelMinutes != null && day.fuelMinutes > 0 && (
        <div className="mt-auto h-1 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full rounded-full transition-all ${
              isOverAllocated
                ? 'bg-red-500'
                : 'bg-linear-to-r from-amber-400 to-amber-600'
            }`}
            style={{ width: `${Math.min(capacityRatio * 100, 100)}%` }}
          />
        </div>
      )}
    </button>
  );
}
