'use server';

import type { FlameSession } from '@/lib/supabase/rows';
import { createClientWithAuth } from '@/lib/supabase/server';
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

    if (error) return { success: false, error };
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
