'use server';

import { revalidatePath } from 'next/cache';
import type { ActionResult } from '@/lib/types';
import { isValidDateString, parseLocalDate } from '@/lib/utils';
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
>;

export async function createFlame(flameInput: FlameInput): ActionResult<Flame> {
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

  revalidatePath('/flames');
  revalidatePath('/flames/manage');
  return { success: true, data };
}

export async function getAllFlamesForManagement(): ActionResult<Flame[]> {
  const { supabase, user } = await createClientWithAuth();

  const { data, error } = await supabase
    .from('flames')
    .select()
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return { success: false, error };
  }

  return { success: true, data };
}

export async function archiveFlame(
  flameId: string,
  archive: boolean,
): ActionResult {
  return updateFlame(flameId, { is_archived: archive });
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
  revalidatePath('/flames/manage');
  return {
    success: true,
    data: `Successfully updated flame with id ${flameId}`,
  };
}

/**
 * Returns the Flames that must be tended to for a specific date.
 * Queries the consolidated flame_schedules table for the day_of_week.
 *
 * @param date  Must be provided in the 'YYYY-MM-DD' format
 */
export async function getFlamesForDay(date: string) {
  const { supabase, user } = await createClientWithAuth();

  const d = parseLocalDate(date);
  const dayOfWeek = d.getDay();

  // Query the consolidated schedule for this day
  const { data: schedule, error: scheduleError } = await supabase
    .from('flame_schedules')
    .select('flame_ids, flame_minutes')
    .eq('user_id', user.id)
    .eq('day_of_week', dayOfWeek)
    .maybeSingle();

  if (scheduleError) {
    return { success: false, error: scheduleError };
  }

  if (!schedule?.flame_ids || schedule.flame_ids.length === 0) {
    return { success: true, data: [] };
  }

  // Fetch the assigned flames by ID
  const { data: flames, error } = await supabase
    .from('flames')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_archived', false)
    .in('id', schedule.flame_ids);

  if (error) {
    return { success: false, error };
  }

  // Apply per-flame time allocations and preserve the user's custom order
  const flameMap = new Map((flames ?? []).map((f) => [f.id, f]));
  const orderedFlames = schedule.flame_ids
    .map((id, i) => {
      const flame = flameMap.get(id);
      if (!flame) return null;
      const minutes = schedule.flame_minutes?.[i];
      if (minutes != null && minutes > 0) {
        return { ...flame, time_budget_minutes: minutes };
      }
      return flame;
    })
    .filter((f): f is NonNullable<typeof f> => f !== null);

  return { success: true, data: orderedFlames };
}

export async function getAllFlames(): ActionResult<Flame[]> {
  const { supabase, user } = await createClientWithAuth();

  const { data, error } = await supabase
    .from('flames')
    .select()
    .eq('user_id', user.id)
    .eq('is_archived', false);

  if (error) {
    return { success: false, error };
  }

  return { success: true, data };
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
  revalidatePath('/flames/manage');
  return { success: true, data };
}

export async function setFlameCompletion(
  flameId: string,
  date: string,
  isCompleted: boolean,
): ActionResult {
  const { supabase } = await createClientWithAuth();

  if (!isValidDateString(date)) {
    return {
      success: false,
      error: new Error('Date string must be of the format YYYY-MM-DD'),
    };
  }

  // Check if session exists for this date
  const { data: session, error: fetchError } = await supabase
    .from('flame_sessions')
    .select()
    .eq('flame_id', flameId)
    .eq('date', date)
    .maybeSingle();

  if (fetchError) {
    return { success: false, error: fetchError };
  }

  if (!session) {
    return {
      success: false,
      error: new Error(`No session found for this flame on date ${date}`),
    };
  }

  // RLS already enforces that the user can only manage their own flame session records
  const { error } = await supabase
    .from('flame_sessions')
    .update({ is_completed: isCompleted })
    .eq('id', session.id);

  if (error) {
    return { success: false, error };
  }

  revalidatePath('/flames');
  return {
    success: true,
    data: `Successfully marked flame session as ${isCompleted ? 'complete' : 'incomplete'}`,
  };
}
