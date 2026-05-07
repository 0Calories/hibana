'use server';

import type { FlameSession } from '@/lib/supabase/rows';
import {
  createClientWithAuth,
  createServiceClient,
} from '@/lib/supabase/server';
import type { ActionResult } from '@/lib/types';
import { isValidDateString } from '@/lib/utils';

export async function toggleSession(
  flameId: string,
  date: string,
  intent: 'start' | 'pause',
  clientDuration?: number,
): ActionResult {
  const { supabase, user } = await createClientWithAuth();

  if (!isValidDateString(date)) {
    return {
      success: false,
      error: new Error('Date string must be of the format YYYY-MM-DD'),
    };
  }

  const { data: existingSession, error: lookupError } = await supabase
    .from('flame_sessions')
    .select()
    .eq('flame_id', flameId)
    .eq('date', date)
    .limit(1)
    .maybeSingle();

  if (lookupError) {
    return { success: false, error: lookupError };
  }

  if (intent === 'start') {
    // Already running → idempotent no-op
    if (existingSession && !existingSession.ended_at) {
      return { success: true, data: 'Session already running' };
    }

    // Paused session → resume by resetting start time and clearing end time
    if (existingSession) {
      const { error } = await supabase
        .from('flame_sessions')
        .update({ started_at: new Date().toISOString(), ended_at: null })
        .eq('id', existingSession.id);

      if (error) return { success: false, error };
      return { success: true, data: 'Session resumed' };
    }

    // No session → create new
    const { error } = await supabase.from('flame_sessions').insert({
      flame_id: flameId,
      date,
      started_at: new Date().toISOString(),
      ended_at: null,
      user_id: user.id,
    });

    // Unique constraint violation (23505) = concurrent insert race — treat as no-op
    if (error) {
      if (error.code === '23505') {
        return { success: true, data: 'Session already exists (concurrent)' };
      }
      return { success: false, error };
    }
    return { success: true, data: 'Session started' };
  }

  // intent === 'pause'

  // No session or already paused → idempotent no-op
  if (!existingSession || existingSession.ended_at) {
    return { success: true, data: 'Session already paused' };
  }

  // Running session → end it
  if (!existingSession.started_at) {
    return {
      success: false,
      error: new Error('Session is missing start time'),
    };
  }

  const now = new Date();
  const currentDuration = Math.max(0, existingSession.duration_seconds);
  const startTime = new Date(existingSession.started_at);
  let totalDuration: number;

  if (clientDuration != null) {
    // Client-provided duration — validate bounds
    if (
      !Number.isFinite(clientDuration) ||
      clientDuration < 0 ||
      clientDuration < currentDuration
    ) {
      return {
        success: false,
        error: new Error('Client duration cannot go backwards'),
      };
    }

    const wallClockMax = Math.max(
      currentDuration,
      currentDuration +
        Math.floor((now.getTime() - startTime.getTime()) / 1000) +
        60, // 60s tolerance for clock skew
    );

    // Clamp to wall clock max rather than rejecting — avoids spurious failures
    totalDuration = Math.min(clientDuration, wallClockMax);
  } else {
    // Fallback: server-computed duration (used by fuel auto-stop)
    const sessionDurationSeconds = Math.max(
      0,
      Math.floor((now.getTime() - startTime.getTime()) / 1000),
    );
    totalDuration = currentDuration + sessionDurationSeconds;
  }

  const { error } = await supabase
    .from('flame_sessions')
    .update({
      ended_at: now.toISOString(),
      duration_seconds: totalDuration,
    })
    .eq('id', existingSession.id);

  if (error) return { success: false, error };
  return { success: true, data: `Session paused — ${totalDuration}s` };
}

export async function getAllSessionsForDate(
  date: string,
): ActionResult<FlameSession[]> {
  const { supabase, user } = await createClientWithAuth();

  const { data, error } = await supabase
    .from('flame_sessions')
    .select('*')
    .eq('user_id', user.id)
    .eq('date', date);

  if (error) {
    return { success: false, error };
  }

  return { success: true, data };
}

// Edge cases to consider for the future:
// - If a user never ends their session, it should be automatically closed or cleaned up at some point via a job

/**
 * Wraps the pause branch of toggleSession with fuel accounting.
 * 1. Reads the session's pre-pause duration_seconds.
 * 2. Calls toggleSession to commit the pause (writes the new duration_seconds).
 * 3. Computes the delta and calls record_fuel_burn via the service client.
 *
 * toggleSession itself is left untouched per the project's "don't modify
 * the time-tracking mechanism in this rework" constraint.
 */
export async function pauseSession(
  flameId: string,
  date: string,
  clientDuration?: number,
): ActionResult {
  const { supabase, user } = await createClientWithAuth();

  // 1. Snapshot pre-pause duration
  const { data: before, error: beforeError } = await supabase
    .from('flame_sessions')
    .select('id, duration_seconds')
    .eq('user_id', user.id)
    .eq('flame_id', flameId)
    .eq('date', date)
    .maybeSingle();

  if (beforeError) return { success: false, error: beforeError };
  if (!before)
    return { success: false, error: new Error('No session to pause') };

  const beforeDuration = before.duration_seconds;

  // 2. Run the existing pause logic
  const pauseResult = await toggleSession(
    flameId,
    date,
    'pause',
    clientDuration,
  );
  if (!pauseResult.success) return pauseResult;

  // 3. Re-read after the pause to compute the delta
  const { data: after, error: afterError } = await supabase
    .from('flame_sessions')
    .select('id, duration_seconds')
    .eq('id', before.id)
    .single();

  if (afterError) return { success: false, error: afterError };

  const deltaSeconds = after.duration_seconds - beforeDuration;
  if (deltaSeconds <= 0) {
    return { success: true, data: 'paused (no fuel burn)' };
  }

  // 4. Burn fuel via SECURITY DEFINER RPC
  const serviceClient = createServiceClient();
  const { error: rpcError } = await serviceClient.rpc('record_fuel_burn', {
    p_user_id: user.id,
    p_session_id: after.id,
    p_delta_seconds: deltaSeconds,
  });

  if (rpcError) return { success: false, error: rpcError };

  return { success: true, data: 'paused and fuel recorded' };
}
