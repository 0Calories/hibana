'use client';

import { getLocalDateString } from '@/lib/utils';
import type { DayPlan, FlameWithSchedule } from '../actions';
import { DayCell } from './DayCell';

interface WeekStripProps {
  days: DayPlan[];
  flames: FlameWithSchedule[];
  onSelectDay: (dayOfWeek: number) => void;
}

export function WeekStrip({ days, flames, onSelectDay }: WeekStripProps) {
  const today = getLocalDateString();

  return (
    <div className="overflow-x-auto pb-2">
      <div className="grid min-w-[32rem] grid-cols-7 gap-2">
        {days.map((day) => (
          <DayCell
            key={day.dayOfWeek}
            day={day}
            flames={flames}
            isToday={day.date === today}
            isPast={day.date < today}
            onSelect={() => onSelectDay(day.dayOfWeek)}
          />
        ))}
      </div>
    </div>
  );
}
