'use server';

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

  // Double-credit check
  const { data: existing } = await supabase
    .from('spark_transactions')
    .select('id')
    .eq('reference_id', session.id)
    .eq('reason', 'seal')
    .maybeSingle();

  if (existing) {
    return { success: true, data: { sparks: 0 } };
  }

  // Compute sparks (level hardcoded to 1 until flame leveling ships)
  const level = 1;
  const levelMultiplier = 1 + (level - 1) * 0.1;
  const elapsedSeconds = session.duration_seconds;
  const minutes = Math.floor(elapsedSeconds / 60);
  const flame = session.flames as unknown as {
    time_budget_minutes: number | null;
  };
  const targetSeconds = (flame?.time_budget_minutes ?? 0) * 60;
  const completionBonus =
    targetSeconds > 0 && elapsedSeconds >= targetSeconds
      ? Math.floor((targetSeconds / 60) * 0.5)
      : 0;
  const sparks = Math.floor(minutes * 1 * levelMultiplier) + completionBonus;

  if (sparks <= 0) {
    return { success: true, data: { sparks: 0 } };
  }

  // Insert transaction
  const { error: txError } = await supabase.from('spark_transactions').insert({
    user_id: user.id,
    amount: sparks,
    reason: 'seal',
    reference_id: session.id,
  });

  if (txError) {
    return { success: false, error: txError };
  }

  // Upsert user_state balance
  const { data: state } = await supabase
    .from('user_state')
    .select('sparks_balance')
    .eq('user_id', user.id)
    .single();

  const currentBalance = state?.sparks_balance ?? 0;

  const { error: upsertError } = await supabase.from('user_state').upsert(
    {
      user_id: user.id,
      sparks_balance: currentBalance + sparks,
    },
    { onConflict: 'user_id' },
  );

  if (upsertError) {
    return { success: false, error: upsertError };
  }

  const { revalidatePath } = await import('next/cache');
  revalidatePath('/flames');

  return { success: true, data: { sparks } };
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
