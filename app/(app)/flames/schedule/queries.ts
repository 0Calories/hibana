import 'server-only';

import type { ActionResult } from '@/lib/types';
import { parseLocalDate } from '@/lib/utils';
import type { Flame } from '@/utils/supabase/rows';
import { createClientWithAuth } from '@/utils/supabase/server';
import { getWeekDates, getWeekStartDate } from './utils';

// --- Types ---

export type DayPlan = {
  dayOfWeek: number;
  date: string;
  fuelBudget: number | null;
  assignedFlameIds: string[];
  flameAllocations: Record<string, number>;
};

export type WeeklySchedule = {
  days: DayPlan[];
  flames: Flame[];
};

export async function getWeeklySchedule(
  today: string,
): ActionResult<WeeklySchedule> {
  const { supabase, user } = await createClientWithAuth();

  // Compute current week dates for display
  const weekStart = getWeekStartDate(parseLocalDate(today));
  const dates = getWeekDates(weekStart);

  const [schedulesResult, flamesResult] = await Promise.all([
    supabase.from('flame_schedules').select('*').eq('user_id', user.id),
    supabase
      .from('flames')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_archived', false),
  ]);

  if (schedulesResult.error)
    return { success: false, error: schedulesResult.error };
  if (flamesResult.error) return { success: false, error: flamesResult.error };

  const schedules = schedulesResult.data;
  const flames = flamesResult.data;

  // Build lookup: day_of_week -> schedule row
  const scheduleByDay = new Map(schedules.map((s) => [s.day_of_week, s]));

  // Build day plans
  const days: DayPlan[] = dates.map((date, i) => {
    const dayOfWeek = i; // 0=Sun through 6=Sat
    const schedule = scheduleByDay.get(dayOfWeek);

    if (schedule) {
      // Zip flame_ids and flame_minutes into allocations map
      const flameAllocations: Record<string, number> = {};
      for (let j = 0; j < schedule.flame_ids.length; j++) {
        const flameId = schedule.flame_ids[j];
        const mins = schedule.flame_minutes?.[j];
        if (mins != null && mins > 0) {
          flameAllocations[flameId] = mins;
        } else {
          // Fall back to the flame's default time_budget_minutes
          const flame = flames.find((f) => f.id === flameId);
          if (flame?.time_budget_minutes != null) {
            flameAllocations[flameId] = flame.time_budget_minutes;
          }
        }
      }

      return {
        dayOfWeek,
        date,
        fuelBudget: schedule.fuel_budget,
        assignedFlameIds: schedule.flame_ids,
        flameAllocations,
      };
    }

    // No schedule configured for this day
    return {
      dayOfWeek,
      date,
      fuelBudget: null,
      assignedFlameIds: [],
      flameAllocations: {},
    };
  });

  return { success: true, data: { days, flames } };
}
