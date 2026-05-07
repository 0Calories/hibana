'use server';

import { calculateSparks } from '@/lib/sparks';
import type {
  Item,
  SparkTransaction,
  UserItem,
  UserState,
} from '@/lib/supabase/rows';
import {
  createClientWithAuth,
  createServiceClient,
} from '@/lib/supabase/server';
import type { ActionResult } from '@/lib/types';

/**
 * Returns the user's state row (auto-created on signup by handle_new_user trigger).
 */
export async function getUserState(): ActionResult<UserState> {
  const { supabase, user } = await createClientWithAuth();

  const { data, error } = await supabase
    .from('user_states')
    .select()
    .eq('user_id', user.id)
    .single();

  if (error) {
    return { success: false, error };
  }

  return { success: true, data };
}

type UserItemWithDetails = UserItem & { items: Item };

/**
 * Returns the user's items with joined item details.
 */
export async function getUserItems(): ActionResult<UserItemWithDetails[]> {
  const { supabase, user } = await createClientWithAuth();

  const { data, error } = await supabase
    .from('user_items')
    .select('*, items(*)')
    .eq('user_id', user.id)
    .order('acquired_at', { ascending: false });

  if (error) {
    return { success: false, error };
  }

  return { success: true, data: data as UserItemWithDetails[] };
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

  const { data: session, error: sessionError } = await supabase
    .from('flame_sessions')
    .select('id, fueled_seconds, target_seconds, is_completed')
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
  if (!session.target_seconds) {
    return {
      success: false,
      error: new Error('Session has no target — cannot credit'),
    };
  }

  // Sparks are awarded on fueled_seconds (the rewards-eligible portion).
  // Level hardcoded to 1 until flame leveling is wired into completions.
  const level = 1;
  const sparks = calculateSparks(
    session.fueled_seconds,
    session.target_seconds,
    level,
  );

  if (sparks <= 0) {
    return { success: true, data: { sparks: 0 } };
  }

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
