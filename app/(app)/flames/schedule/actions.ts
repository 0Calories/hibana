'use server';

import { revalidatePath } from 'next/cache';
import type { ActionResult } from '@/lib/types';
import type { Flame } from '@/utils/supabase/rows';
import { createClientWithAuth } from '@/utils/supabase/server';
import { getWeekDates } from './utils';

// --- Types ---

export type DayPlan = {
  dayOfWeek: number;
  date: string;
  fuelMinutes: number | null;
  isOverride: boolean;
  assignedFlameIds: string[];
  flameAllocations: Record<string, number>;
};

export type FlameWithSchedule = Flame & {
  defaultSchedule: number[];
};

export type WeeklySchedule = {
  days: DayPlan[];
  flames: FlameWithSchedule[];
};

export async function getWeeklySchedule(
  weekStart: string,
): ActionResult<WeeklySchedule> {
  const { supabase, user } = await createClientWithAuth();
  const dates = getWeekDates(weekStart);

  const [
    defaultFuelResult,
    overridesResult,
    flamesResult,
    flameSchedulesResult,
  ] = await Promise.all([
    supabase.from('fuel_budgets').select('*').eq('user_id', user.id),
    supabase
      .from('weekly_schedule_overrides')
      .select('*')
      .eq('user_id', user.id)
      .eq('week_start', weekStart),
    supabase
      .from('flames')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_archived', false),
    supabase.from('flame_schedules').select('*'),
  ]);

  if (defaultFuelResult.error)
    return { success: false, error: defaultFuelResult.error };
  if (overridesResult.error)
    return { success: false, error: overridesResult.error };
  if (flamesResult.error) return { success: false, error: flamesResult.error };
  if (flameSchedulesResult.error)
    return { success: false, error: flameSchedulesResult.error };

  const defaultFuels = defaultFuelResult.data;
  const overrides = overridesResult.data;
  const flames = flamesResult.data;
  const flameSchedules = flameSchedulesResult.data;

  // Build lookup: day_of_week -> default fuel minutes
  const defaultFuelByDay = new Map(
    defaultFuels.map((f) => [f.day_of_week, f.minutes]),
  );

  // Build lookup: day_of_week -> override row
  const overrideByDay = new Map(overrides.map((o) => [o.day_of_week, o]));

  // Build lookup: flame_id -> default schedule days
  const flameScheduleMap = new Map<string, number[]>();
  for (const fs of flameSchedules) {
    const existing = flameScheduleMap.get(fs.flame_id) ?? [];
    existing.push(fs.day_of_week);
    flameScheduleMap.set(fs.flame_id, existing);
  }

  // Build day plans
  const days: DayPlan[] = dates.map((date, i) => {
    const dayOfWeek = i; // 0=Sun through 6=Sat
    const override = overrideByDay.get(dayOfWeek);

    if (override) {
      // Zip flame_ids and flame_minutes into allocations map
      const flameAllocations: Record<string, number> = {};
      for (let j = 0; j < override.flame_ids.length; j++) {
        const flameId = override.flame_ids[j];
        const mins = override.flame_minutes?.[j];
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
        fuelMinutes: override.minutes,
        isOverride: true,
        assignedFlameIds: override.flame_ids,
        flameAllocations,
      };
    }

    // Default: fuel from fuel_budgets, flames from daily + schedules
    const fuelMinutes = defaultFuelByDay.get(dayOfWeek) ?? null;
    const defaultFlames = flames.filter((f) => {
      if (f.is_daily) return true;
      const schedule = flameScheduleMap.get(f.id) ?? [];
      return schedule.includes(dayOfWeek);
    });
    const assignedFlameIds = defaultFlames.map((f) => f.id);

    // Build default allocations from flame time_budget_minutes
    const flameAllocations: Record<string, number> = {};
    for (const f of defaultFlames) {
      if (f.time_budget_minutes != null) {
        flameAllocations[f.id] = f.time_budget_minutes;
      }
    }

    return {
      dayOfWeek,
      date,
      fuelMinutes,
      isOverride: false,
      assignedFlameIds,
      flameAllocations,
    };
  });

  // Build flames with schedules
  const flamesWithSchedule: FlameWithSchedule[] = flames.map((f) => ({
    ...f,
    defaultSchedule: f.is_daily
      ? [0, 1, 2, 3, 4, 5, 6]
      : (flameScheduleMap.get(f.id) ?? []),
  }));

  return { success: true, data: { days, flames: flamesWithSchedule } };
}

// --- Mutations ---

export async function setWeeklyOverride(
  weekStart: string,
  dayOfWeek: number,
  minutes: number,
  flameIds: string[],
  flameMinutes: number[],
): ActionResult {
  const { supabase, user } = await createClientWithAuth();

  if (dayOfWeek < 0 || dayOfWeek > 6) {
    return {
      success: false,
      error: new Error('Day of week must be in range [0, 6]'),
    };
  }

  const { error } = await supabase.from('weekly_schedule_overrides').upsert(
    {
      user_id: user.id,
      week_start: weekStart,
      day_of_week: dayOfWeek,
      minutes,
      flame_ids: flameIds,
      flame_minutes: flameMinutes,
    },
    { onConflict: 'user_id,week_start,day_of_week' },
  );

  if (error) {
    return { success: false, error };
  }

  revalidatePath('/flames/schedule');
  return { success: true, data: 'Override saved' };
}

export async function clearWeeklyOverrides(weekStart: string): ActionResult {
  const { supabase, user } = await createClientWithAuth();

  const { error } = await supabase
    .from('weekly_schedule_overrides')
    .delete()
    .eq('user_id', user.id)
    .eq('week_start', weekStart);

  if (error) {
    return { success: false, error };
  }

  revalidatePath('/flames/schedule');
  return { success: true, data: 'Weekly overrides cleared' };
}
