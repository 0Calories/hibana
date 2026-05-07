'use server';

import { revalidatePath } from 'next/cache';
import type { Flame, FlameSession } from '@/lib/supabase/rows';
import { createClientWithAuth } from '@/lib/supabase/server';
import type { TablesInsert } from '@/lib/supabase/types';
import type { ActionResult } from '@/lib/types';
import { isValidDateString, parseLocalDate } from '@/lib/utils';

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

type PlanPick = { flameId: string; targetSeconds: number };

/**
 * Locks in today's lineup. Inserts session rows in a single transaction.
 * Idempotent at the DB level via the (flame_id, date) unique constraint —
 * if a row already exists for a flame on that date, we update its
 * target_seconds rather than erroring (the user re-locked-in).
 */
export async function setDailyPlan(
  date: string,
  picks: PlanPick[],
): ActionResult {
  const { supabase, user } = await createClientWithAuth();

  if (!isValidDateString(date)) {
    return {
      success: false,
      error: new Error('Date string must be of the format YYYY-MM-DD'),
    };
  }

  if (picks.length === 0) {
    return { success: true, data: 'no picks' };
  }

  const rows = picks.map((p) => ({
    user_id: user.id,
    flame_id: p.flameId,
    date,
    target_seconds: p.targetSeconds,
    duration_seconds: 0,
    fueled_seconds: 0,
  }));

  const { error } = await supabase
    .from('flame_sessions')
    .upsert(rows, { onConflict: 'flame_id,date' });

  if (error) return { success: false, error };

  revalidatePath('/flames');
  return { success: true, data: `Saved plan for ${date}` };
}

/**
 * Mid-day add of a single flame to today's lineup.
 */
export async function addToDailyPlan(
  date: string,
  flameId: string,
  targetSeconds: number,
): ActionResult {
  return setDailyPlan(date, [{ flameId, targetSeconds }]);
}

// New: replaces getFlamesPageData. Returns today's plan as a list of session
// rows joined with their flame, plus the user's fuel balance.

export type DailyPlanEntry = {
  flame: Flame;
  session: FlameSession; // always present — session row IS the plan record
};

export type DailyPlanData = {
  entries: DailyPlanEntry[];
  fuelBalanceSeconds: number;
};

export async function getDailyPlan(date: string): ActionResult<DailyPlanData> {
  const { supabase, user } = await createClientWithAuth();

  if (!isValidDateString(date)) {
    return {
      success: false,
      error: new Error('Date string must be of the format YYYY-MM-DD'),
    };
  }

  const [sessionsResult, stateResult] = await Promise.all([
    supabase
      .from('flame_sessions')
      .select('*, flames!inner(*)')
      .eq('user_id', user.id)
      .eq('date', date)
      .eq('flames.is_archived', false)
      .order('created_at', { ascending: true }),
    supabase
      .from('user_states')
      .select('fuel_balance_seconds')
      .eq('user_id', user.id)
      .single(),
  ]);

  if (sessionsResult.error)
    return { success: false, error: sessionsResult.error };
  if (stateResult.error) return { success: false, error: stateResult.error };

  // Reshape: pull the joined flame off each session row.
  const entries: DailyPlanEntry[] = (sessionsResult.data ?? []).map((row) => {
    const { flames, ...session } = row as FlameSession & { flames: Flame };
    return { flame: flames, session };
  });

  return {
    success: true,
    data: {
      entries,
      fuelBalanceSeconds: stateResult.data.fuel_balance_seconds,
    },
  };
}
