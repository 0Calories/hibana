'use server';

import { revalidatePath } from 'next/cache';
import type { ActionResult } from '@/lib/types';
import { createClientWithAuth } from '@/utils/supabase/server';

export async function setDaySchedule(
  dayOfWeek: number,
  fuelBudget: number,
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

  const { error } = await supabase.from('flame_schedules').upsert(
    {
      user_id: user.id,
      day_of_week: dayOfWeek,
      fuel_budget: fuelBudget,
      flame_ids: flameIds,
      flame_minutes: flameMinutes,
    },
    { onConflict: 'user_id,day_of_week' },
  );

  if (error) {
    return { success: false, error };
  }

  revalidatePath('/flames/schedule');
  return { success: true, data: 'Schedule saved' };
}

export async function clearSchedule(): ActionResult {
  const { supabase, user } = await createClientWithAuth();

  const { error } = await supabase
    .from('flame_schedules')
    .delete()
    .eq('user_id', user.id);

  if (error) {
    return { success: false, error };
  }

  revalidatePath('/flames/schedule');
  return { success: true, data: 'Schedule cleared' };
}
