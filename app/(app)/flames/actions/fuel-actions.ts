'use server';

import { revalidatePath } from 'next/cache';
import type { ActionResult } from '@/lib/types';
import { isValidDateString, parseLocalDate } from '@/lib/utils';
import type { FlameSchedule } from '@/utils/supabase/rows';
import { createClientWithAuth } from '@/utils/supabase/server';

export async function getFuelBudget(): ActionResult<FlameSchedule[]> {
  const { supabase, user } = await createClientWithAuth();

  const { data, error } = await supabase
    .from('flame_schedules')
    .select('*')
    .eq('user_id', user.id);

  if (error) {
    return { success: false, error };
  }

  return { success: true, data };
}

export async function setFuelBudget(
  dayOfWeek: number,
  fuelMinutes: number,
): ActionResult {
  const { supabase, user } = await createClientWithAuth();

  if (dayOfWeek < 0 || dayOfWeek > 6) {
    return {
      success: false,
      error: new Error('Day of week must be in range [0, 6]'),
    };
  }

  // Upsert into the consolidated flame_schedules table
  const { error } = await supabase
    .from('flame_schedules')
    .upsert(
      { user_id: user.id, day_of_week: dayOfWeek, fuel_budget: fuelMinutes },
      { onConflict: 'user_id,day_of_week' },
    );

  if (error) {
    return { success: false, error };
  }

  revalidatePath('/flames');
  return {
    success: true,
    data: `Successfully set fuel budget for day ${dayOfWeek}`,
  };
}

export type FuelBudgetStatus = {
  budgetMinutes: number;
  remainingMinutes: number;
} | null;

export async function getRemainingFuelBudget(
  date: string,
): ActionResult<FuelBudgetStatus> {
  const { supabase, user } = await createClientWithAuth();

  if (!isValidDateString(date)) {
    return {
      success: false,
      error: new Error('Date string must be of the format YYYY-MM-DD'),
    };
  }

  const d = parseLocalDate(date);
  const dayOfWeek = d.getDay();

  // Single query to the consolidated flame_schedules table
  const { data: schedule, error: scheduleError } = await supabase
    .from('flame_schedules')
    .select('fuel_budget')
    .eq('user_id', user.id)
    .eq('day_of_week', dayOfWeek)
    .maybeSingle();

  if (scheduleError) {
    return { success: false, error: scheduleError };
  }

  const budgetMinutes = schedule?.fuel_budget ?? null;

  if (budgetMinutes === null) {
    return { success: true, data: null };
  }

  const { data: sessions, error: fuelSpentError } = await supabase
    .from('flame_sessions')
    .select('duration_seconds')
    .eq('date', date);

  if (fuelSpentError) {
    return { success: false, error: fuelSpentError };
  }

  const totalSeconds = sessions.reduce(
    (sum, entry) => sum + entry.duration_seconds,
    0,
  );
  const totalMinutes = totalSeconds / 60;
  const remainingMinutes = budgetMinutes - totalMinutes;

  return {
    success: true,
    data: { budgetMinutes, remainingMinutes },
  };
}
