'use server';

import { revalidatePath } from 'next/cache';
import { createClientWithAuth } from '@/utils/supabase/server';

export async function getFuelBudget() {
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

export async function setFuelBudget(dayOfWeek: number, fuelMinutes: number) {
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
  return { success: true };
}

export async function getRemainingFuelBudget(date: string) {
  const { supabase, user } = await createClientWithAuth();

  const dayOfWeek = new Date(date).getUTCDay();

  const { data: fuelBudgetData, error: fuelBudgetError } = await supabase
    .from('fuel_budgets')
    .select('minutes')
    .eq('user_id', user.id)
    .eq('day_of_week', dayOfWeek)
    .single();

  if (fuelBudgetError) {
    return { success: false, error: fuelBudgetError };
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
  const remainingFuel = fuelBudgetData.minutes - totalMinutes;

  return { success: true, data: { remainingFuel } };
}
