'use server';

import { revalidatePath } from 'next/cache';
import { createClientWithAuth } from '@/utils/supabase/server';

export async function setFuelBudget(dayOfWeek: number, fuelMinutes: number) {
  const { supabase, user } = await createClientWithAuth();

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
