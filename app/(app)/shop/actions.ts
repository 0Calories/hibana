'use server';

import { calculateHeat } from '@/lib/heat';
import { calculateSparks } from '@/lib/sparks';
import type {
  Item,
  SparkTransaction,
  UserInventory,
  UserState,
} from '@/lib/supabase/rows';
import {
  createClientWithAuth,
  createServiceClient,
} from '@/lib/supabase/server';
import type { ActionResult } from '@/lib/types';
import { parseLocalDate } from '@/lib/utils';

/**
 * Returns the user's state row, lazy-creating one if it doesn't exist yet.
 */
export async function getOrCreateUserState(): ActionResult<UserState> {
  const { supabase, user } = await createClientWithAuth();

  const { data, error } = await supabase
    .from('user_state')
    .select()
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) {
    return { success: false, error };
  }

  if (data) {
    return { success: true, data };
  }

  // Lazy-insert a fresh row
  const { data: created, error: insertError } = await supabase
    .from('user_state')
    .insert({ user_id: user.id })
    .select()
    .single();

  if (insertError) {
    return { success: false, error: insertError };
  }

  return { success: true, data: created };
}

type InventoryItemWithDetails = UserInventory & { items: Item };

/**
 * Returns the user's inventory with joined item details.
 */
export async function getUserInventory(): ActionResult<
  InventoryItemWithDetails[]
> {
  const { supabase, user } = await createClientWithAuth();

  const { data, error } = await supabase
    .from('user_inventory')
    .select('*, items(*)')
    .eq('user_id', user.id)
    .order('acquired_at', { ascending: false });

  if (error) {
    return { success: false, error };
  }

  return { success: true, data: data as InventoryItemWithDetails[] };
}

/**
 * Credits sparks to the user for completing a flame session.
 * Idempotent: if the session was already credited, returns { sparks: 0 }.
 * Uses an atomic RPC to prevent race conditions on double-credit and balance update.
 */
export async function creditCompletionReward(
  flameId: string,
  date: string,
): ActionResult<{ sparks: number; heat: number }> {
  const { supabase, user } = await createClientWithAuth();

  // Fetch the completed session, the schedule-based budget, and flame level
  const dayOfWeek = parseLocalDate(date).getDay();
  const [sessionResult, scheduleResult, flameResult] = await Promise.all([
    supabase
      .from('flame_sessions')
      .select('id, duration_seconds, is_completed')
      .eq('flame_id', flameId)
      .eq('date', date)
      .maybeSingle(),
    supabase
      .from('flame_schedules')
      .select('flame_ids, flame_minutes')
      .eq('user_id', user.id)
      .eq('day_of_week', dayOfWeek)
      .maybeSingle(),
    supabase.from('flames').select('level').eq('id', flameId).single(),
  ]);

  if (sessionResult.error) {
    return { success: false, error: sessionResult.error };
  }
  if (scheduleResult.error) {
    return { success: false, error: scheduleResult.error };
  }
  if (flameResult.error) {
    return { success: false, error: flameResult.error };
  }

  const session = sessionResult.data;
  if (!session || !session.is_completed) {
    return {
      success: false,
      error: new Error('No completed session found'),
    };
  }

  // Resolve the flame's budget from the schedule (same logic as getFlamesForDay)
  const schedule = scheduleResult.data;
  const flameIndex = schedule?.flame_ids?.indexOf(flameId) ?? -1;
  if (!schedule?.flame_minutes?.[flameIndex]) {
    return {
      success: false,
      error: new Error('No scheduled budget found for completed flame session'),
    };
  }

  const scheduledMinutes = schedule.flame_minutes[flameIndex];
  const flameLevel = flameResult.data.level;
  const elapsedSeconds = session.duration_seconds;
  const targetSeconds = scheduledMinutes * 60;
  const sparks = calculateSparks(elapsedSeconds, targetSeconds, flameLevel);
  const heat = calculateHeat(elapsedSeconds, flameLevel);

  if (sparks <= 0 && heat <= 0) {
    return { success: true, data: { sparks: 0, heat: 0 } };
  }

  // Atomic: insert transactions (idempotent) + increment balances + recompute levels
  // Uses service-role client because execute is REVOKE'd from authenticated
  const serviceClient = createServiceClient();
  const { data: result, error: rpcError } = await serviceClient.rpc(
    'credit_completion_rewards',
    {
      p_user_id: user.id,
      p_session_id: session.id,
      p_flame_id: flameId,
      p_sparks: sparks,
      p_heat: heat,
    },
  );

  if (rpcError) {
    return { success: false, error: rpcError };
  }

  // No revalidatePath here — the completion action already revalidates
  // /flames, and premature revalidation would update the profile badge before
  // the flyover animation finishes.

  const credited = result as { sparks: number; heat: number } | null;
  return {
    success: true,
    data: { sparks: credited?.sparks ?? 0, heat: credited?.heat ?? 0 },
  };
}

/**
 * Returns recent spark transactions, newest-first.
 */
export async function getSparkTransactions(
  limit = 50,
): ActionResult<SparkTransaction[]> {
  const { supabase, user } = await createClientWithAuth();

  const { data, error } = await supabase
    .from('spark_transactions')
    .select()
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    return { success: false, error };
  }

  return { success: true, data };
}
