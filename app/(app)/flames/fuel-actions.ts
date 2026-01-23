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
