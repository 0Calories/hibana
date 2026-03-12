'use server';

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
): ActionResult<{ sparks: number }> {
  const { supabase, user } = await createClientWithAuth();

  // Fetch the completed session and the schedule-based budget for this day
  const dayOfWeek = parseLocalDate(date).getDay();
  const [sessionResult, scheduleResult] = await Promise.all([
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
  ]);

  if (sessionResult.error) {
    return { success: false, error: sessionResult.error };
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
  const scheduledMinutes =
    flameIndex >= 0 ? (schedule?.flame_minutes?.[flameIndex] ?? 0) : 0;

  // Compute sparks (level hardcoded to 1 until flame leveling ships)
  const level = 1;
  const elapsedSeconds = session.duration_seconds;
  const targetSeconds = scheduledMinutes * 60;
  const sparks = calculateSparks(elapsedSeconds, targetSeconds, level);

  if (sparks <= 0) {
    return { success: true, data: { sparks: 0 } };
  }

  // Atomic: insert transaction (idempotent) + increment balance
  // Uses service-role client because execute is REVOKE'd from authenticated
  const serviceClient = createServiceClient();
  const { data: credited, error: rpcError } = await serviceClient.rpc(
    'credit_completion_sparks',
    {
      p_user_id: user.id,
      p_session_id: session.id,
      p_amount: sparks,
    },
  );

  if (rpcError) {
    return { success: false, error: rpcError };
  }

  // No revalidatePath here — the completion action already revalidates
  // /flames, and premature revalidation would update the profile badge before
  // the flyover animation finishes.

  return { success: true, data: { sparks: credited ?? 0 } };
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
