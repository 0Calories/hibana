'use server';

import { revalidatePath } from 'next/cache';
import type { Flame } from '@/utils/supabase/rows';
import { createClientWithAuth } from '@/utils/supabase/server';
import type { TablesInsert } from '@/utils/supabase/types';

type FlameInput = Pick<
  Flame,
  | 'name'
  | 'color'
  | 'icon'
  | 'time_budget_minutes'
  | 'tracking_type'
  | 'count_target'
  | 'count_unit'
  | 'is_daily'
>;

export async function createFlame(flameInput: FlameInput, schedule?: number[]) {
  const { supabase, user } = await createClientWithAuth();

  const flameInsertData: TablesInsert<'flames'> = {
    user_id: user.id,
    ...flameInput,
  };

  const { data, error: insertError } = await supabase
    .from('flames')
    .insert(flameInsertData)
    .select()
    .single();
  if (insertError) {
    return { success: false, error: insertError };
  }

  // If this flame was created alongside a schedule, we must also update the data accordingly
  if (!flameInput.is_daily && schedule && schedule.length > 0) {
    const flameId = data.id;
    const { error: scheduleInsertError } = await supabase
      .from('flame_schedules')
      .insert(
        schedule.map((day) => ({
          day_of_week: day,
          flame_id: flameId,
        })),
      );

    // If there was a problem when attempting to update the schedule, clean up the orphaned flame
    if (scheduleInsertError) {
      await supabase.from('flames').delete().eq('id', data.id);
      return { success: false, error: scheduleInsertError };
    }
  }

  revalidatePath('/flames');
  return { success: true, data };
}

export async function updateFlame(
  flameId: string,
  flameInput: Partial<FlameInput>,
) {
  const { supabase, user } = await createClientWithAuth();

  const { data, error } = await supabase
    .from('flames')
    .update({ ...flameInput })
    .eq('user_id', user.id)
    .eq('id', flameId);

  if (error) {
    return { success: false, error };
  }

  revalidatePath('/flames');
  return { success: true, data };
}

/**
 * Returns the Flames that must be tended to for a specific date
 * @param date - Must be provided in the 'YYYY-MM-DD' format
 */
export async function getFlamesForDay(date: string) {
  const { supabase, user } = await createClientWithAuth();

  const day = new Date(date).getDay();

  const { data, error } = await supabase
    .from('flame_schedules')
    .select()
    .eq('user_id', user.id)
    .eq('day_of_week', day);

  if (error) {
    return { success: false, error };
  }

  return data;
}
