'use server';

import { revalidatePath } from 'next/cache';
import type { ActionResult } from '@/lib/types';
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

export async function createFlame(
  flameInput: FlameInput,
  schedule?: number[],
): ActionResult {
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
  flameInput: Partial<FlameInput & { is_archived: boolean }>,
): ActionResult {
  const { supabase, user } = await createClientWithAuth();

  const { error } = await supabase
    .from('flames')
    .update({ ...flameInput })
    .eq('user_id', user.id)
    .eq('id', flameId);

  if (error) {
    return { success: false, error };
  }

  revalidatePath('/flames');
  return {
    success: true,
    data: `Successfully updated flame with id ${flameId}`,
  };
}

/**
 * Configure a schedule for a flame. If the flame already has an existing schedule it will be cleared and replaced
 * @param flameId
 * @param schedule A list of days of the week that the flame should be assigned to (e.g. 1 for Monday, 2 for Tuesday, etc.)
 */
export async function setFlameSchedule(
  flameId: string,
  schedule: number[],
): ActionResult {
  const { supabase } = await createClientWithAuth();

  // Clears schedule if empty array passed
  if (schedule.length === 0) {
    await supabase.from('flame_schedules').delete().eq('flame_id', flameId);
    return { success: true, data: 'Flame schedule cleared successfully' };
  }

  await supabase.from('flame_schedules').delete().eq('flame_id', flameId);

  const { error } = await supabase
    .from('flame_schedules')
    .insert(schedule.map((day) => ({ day_of_week: day, flame_id: flameId })));

  if (error) {
    return { success: false, error };
  }

  revalidatePath('/flames');
  return { success: true, data: 'Flame schedule successfully updated!' };
}

/**
 * Returns the Flames that must be tended to for a specific date
 * @param date  Must be provided in the 'YYYY-MM-DD' format
 */
export async function getFlamesForDay(date: string) {
  const { supabase, user } = await createClientWithAuth();

  // Must ensure we use UTC day to avoid timezone fuckery
  const day = new Date(date).getUTCDay();

  // Daily flames are not included in the schedule so we must retrieve them separately first
  const { data: dailyFlames, error: dailyError } = await supabase
    .from('flames')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_daily', true)
    .eq('is_archived', false);

  if (dailyError) {
    return { success: false, error: dailyError };
  }

  const { data: scheduledFlames, error: scheduledError } = await supabase
    .from('flames')
    .select('*, flame_schedules!inner()')
    .eq('user_id', user.id)
    .eq('is_daily', false)
    .eq('is_archived', false)
    .eq('flame_schedules.day_of_week', day);

  if (scheduledError) {
    return { success: false, error: scheduledError };
  }

  const combinedResult = [...(dailyFlames ?? []), ...(scheduledFlames ?? [])];

  return { success: true, data: combinedResult };
}

export async function deleteFlame(flameId: string) {
  const { supabase, user } = await createClientWithAuth();

  // Schedule data will also be automatically deleted due to cascade, no need to explicitly clean up
  const { data, error } = await supabase
    .from('flames')
    .delete()
    .eq('id', flameId)
    .eq('user_id', user.id)
    .select();

  if (error) {
    return { success: false, error };
  }

  revalidatePath('/flames');
  return { success: true, data };
}
