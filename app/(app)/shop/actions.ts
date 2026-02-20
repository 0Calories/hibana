'use server';

import { calculateSparks } from '@/lib/sparks';
import type { ActionResult } from '@/lib/types';
import type {
  Item,
  SparkTransaction,
  UserInventory,
  UserState,
} from '@/utils/supabase/rows';
import { createClientWithAuth } from '@/utils/supabase/server';

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
 * Credits sparks to the user for sealing a flame session.
 * Idempotent: if the session was already credited, returns { sparks: 0 }.
 * Uses an atomic RPC to prevent race conditions on double-credit and balance update.
 */
export async function creditSealReward(
  flameId: string,
  date: string,
): ActionResult<{ sparks: number }> {
  const { supabase, user } = await createClientWithAuth();

  // Fetch the completed session for this flame+date, joined with flame budget
  const { data: session, error: sessionError } = await supabase
    .from('flame_sessions')
    .select('id, duration_seconds, is_completed, flames(time_budget_minutes)')
    .eq('flame_id', flameId)
    .eq('date', date)
    .maybeSingle();

  if (sessionError) {
    return { success: false, error: sessionError };
  }

  if (!session || !session.is_completed) {
    return {
      success: false,
      error: new Error('No completed session found'),
    };
  }

  // Compute sparks (level hardcoded to 1 until flame leveling ships)
  const level = 1;
  const elapsedSeconds = session.duration_seconds;
  const flame = session.flames as unknown as {
    time_budget_minutes: number | null;
  };
  const targetSeconds = (flame?.time_budget_minutes ?? 0) * 60;
  const sparks = calculateSparks(elapsedSeconds, targetSeconds, level);

  if (sparks <= 0) {
    return { success: true, data: { sparks: 0 } };
  }

  // Atomic: insert transaction (idempotent) + increment balance
  const { data: credited, error: rpcError } = await supabase.rpc(
    'credit_seal_sparks',
    {
      p_user_id: user.id,
      p_session_id: session.id,
      p_amount: sparks,
    },
  );

  if (rpcError) {
    return { success: false, error: rpcError };
  }

  // No revalidatePath here — the seal completion action already revalidates
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
