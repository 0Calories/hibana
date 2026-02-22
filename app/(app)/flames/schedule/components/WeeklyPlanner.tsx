'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { DayPlan, WeeklySchedule } from '../actions';
import { DayRow } from './DayRow';

interface WeeklyPlannerProps {
  initialSchedule: WeeklySchedule;
  today: string;
}

export function WeeklyPlanner({ initialSchedule, today }: WeeklyPlannerProps) {
  const [schedule, setSchedule] = useState<WeeklySchedule>(initialSchedule);
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const todayRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to today on mount
  useEffect(() => {
    todayRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

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
    <div className="flex flex-col gap-3">
      {schedule.days.map((day) => {
        const isToday = day.date === today;
        return (
          <div key={day.dayOfWeek} ref={isToday ? todayRef : undefined}>
            <DayRow
              day={day}
              flames={schedule.flames}
              isToday={isToday}
              isPast={day.date < today}
              isExpanded={expandedDay === day.dayOfWeek}
              onToggleExpand={() => handleToggleExpand(day.dayOfWeek)}
              onUpdate={handleDayUpdate}
            />
          </div>
        );
      })}
    </div>
  );
}
