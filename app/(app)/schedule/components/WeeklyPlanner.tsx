'use client';

import { useCallback, useState } from 'react';
import { getLocalDateString } from '@/lib/utils';
import type { DayPlan, WeeklySchedule } from '../actions';
import { DayRow } from './DayRow';

interface WeeklyPlannerProps {
  initialSchedule: WeeklySchedule;
  weekStart: string;
}

export function WeeklyPlanner({
  initialSchedule,
  weekStart,
}: WeeklyPlannerProps) {
  const [schedule, setSchedule] = useState<WeeklySchedule>(initialSchedule);
  const [expandedDay, setExpandedDay] = useState<number | null>(null);

  const today = getLocalDateString();

  const handleToggleExpand = useCallback((dayOfWeek: number) => {
    setExpandedDay((prev) => (prev === dayOfWeek ? null : dayOfWeek));
  }, []);

  const handleDayUpdate = useCallback((updatedDay: DayPlan) => {
    setSchedule((prev) => ({
      ...prev,
      days: prev.days.map((d) =>
        d.dayOfWeek === updatedDay.dayOfWeek ? updatedDay : d,
      ),
    }));
  }, []);

  return (
    <div className="flex flex-col gap-2">
      {schedule.days.map((day) => (
        <DayRow
          key={day.dayOfWeek}
          day={day}
          flames={schedule.flames}
          isToday={day.date === today}
          isPast={day.date < today}
          isExpanded={expandedDay === day.dayOfWeek}
          onToggleExpand={() => handleToggleExpand(day.dayOfWeek)}
          weekStart={weekStart}
          onUpdate={handleDayUpdate}
        />
      ))}
    </div>
  );
}
