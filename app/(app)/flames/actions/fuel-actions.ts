'use server';

import { revalidatePath } from 'next/cache';
import type { ActionResult } from '@/lib/types';
import { isValidDateString } from '@/lib/utils';
import type { FuelBudget } from '@/utils/supabase/rows';
import { createClientWithAuth } from '@/utils/supabase/server';

export async function getFuelBudget(): ActionResult<FuelBudget[]> {
  const { supabase, user } = await createClientWithAuth();

  const { data, error } = await supabase
    .from('fuel_budgets')
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

  // Use upsert to replace existing budget for the day if already set
  const { error } = await supabase
    .from('fuel_budgets')
    .upsert(
      { user_id: user.id, day_of_week: dayOfWeek, minutes: fuelMinutes },
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

  const d = new Date(`${date}T00:00:00`);
  const dayOfWeek = d.getDay();

  // Compute week start (Sunday) for override lookup
  const weekStartDate = new Date(d);
  weekStartDate.setDate(weekStartDate.getDate() - weekStartDate.getDay());
  const weekStart = `${weekStartDate.getFullYear()}-${String(weekStartDate.getMonth() + 1).padStart(2, '0')}-${String(weekStartDate.getDate()).padStart(2, '0')}`;

  // Check for a weekly override first
  const { data: override, error: overrideError } = await supabase
    .from('weekly_schedule_overrides')
    .select('minutes')
    .eq('user_id', user.id)
    .eq('week_start', weekStart)
    .eq('day_of_week', dayOfWeek)
    .maybeSingle();

  if (overrideError) {
    return { success: false, error: overrideError };
  }

  // Determine budget minutes: override takes priority over default
  let budgetMinutes: number | null = null;

  if (override) {
    budgetMinutes = override.minutes;
  } else {
    const { data: fuelBudgetData, error: fuelBudgetError } = await supabase
      .from('fuel_budgets')
      .select('minutes')
      .eq('user_id', user.id)
      .eq('day_of_week', dayOfWeek)
      .maybeSingle();

    if (fuelBudgetError) {
      return { success: false, error: fuelBudgetError };
    }

    budgetMinutes = fuelBudgetData?.minutes ?? null;
  }

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
