'use client';

import { useCallback, useState } from 'react';
import type { DayPlan, WeeklySchedule } from '../actions';
import { DayEditorDialog } from './dialog/DayEditorDialog';
import { WeekStrip } from './WeekStrip';

interface WeeklyPlannerProps {
  initialSchedule: WeeklySchedule;
  weekStart: string;
}

export function WeeklyPlanner({
  initialSchedule,
  weekStart,
}: WeeklyPlannerProps) {
  const [schedule, setSchedule] = useState<WeeklySchedule>(initialSchedule);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const handleSelectDay = useCallback((dayOfWeek: number) => {
    setSelectedDay(dayOfWeek);
  }, []);

  const handleDayUpdate = useCallback((updatedDay: DayPlan) => {
    setSchedule((prev) => ({
      ...prev,
      days: prev.days.map((d) =>
        d.dayOfWeek === updatedDay.dayOfWeek ? updatedDay : d,
      ),
    }));
  }, []);

  const selectedDayData =
    selectedDay !== null ? schedule.days[selectedDay] : null;

  return (
    <>
      <WeekStrip
        days={schedule.days}
        flames={schedule.flames}
        onSelectDay={handleSelectDay}
      />

      {selectedDayData && (
        <DayEditorDialog
          open={selectedDay !== null}
          onOpenChange={(open) => {
            if (!open) setSelectedDay(null);
          }}
          day={selectedDayData}
          flames={schedule.flames}
          weekStart={weekStart}
          onUpdate={handleDayUpdate}
        />
      )}
    </>
  );
}
