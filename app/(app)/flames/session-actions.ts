'use server';

import type { ActionResult } from '@/lib/types';
import { isValidDateString } from '@/lib/utils';
import type { FlameSession } from '@/utils/supabase/rows';
import { createClientWithAuth } from '@/utils/supabase/server';

export async function startSession(
  flameId: string,
  date: string,
): ActionResult {
  const { supabase, user } = await createClientWithAuth();

  if (!isValidDateString(date)) {
    return {
      success: false,
      error: new Error('Date string must be of the format YYYY-MM-DD'),
    };
  }

  const { data: existingSession, error: existingSessionError } = await supabase
    .from('flame_sessions')
    .select()
    .eq('flame_id', flameId)
    .eq('date', date)
    .limit(1)
    .maybeSingle();

  if (existingSessionError) {
    return {
      success: false,
      error: existingSessionError,
    };
  }

  if (existingSession && !existingSession.ended_at) {
    return {
      success: false,
      error: new Error(
        `A session for this flame on date ${date} already exists. Please end it before starting a new session`,
      ),
    };
  }

  // Update the existing session by resetting the start time and clearing the end time
  if (existingSession) {
    const { error: updateExistingError } = await supabase
      .from('flame_sessions')
      .update({ started_at: new Date().toISOString(), ended_at: null })
      .eq('id', existingSession.id);

    if (updateExistingError) {
      return { success: false, error: updateExistingError };
    }

    return {
      success: true,
      data: `Successfully resumed flame session on date: ${date}`,
    };
  }

  // Simply create a new session if there aren't any existing on the given date
  const { error } = await supabase.from('flame_sessions').insert({
    flame_id: flameId,
    date,
    started_at: new Date().toISOString(),
    ended_at: null,
    user_id: user.id,
  });

  if (error) {
    return { success: false, error };
  }

  return {
    success: true,
    data: `Successfully started a new flame session on date: ${date}`,
  };
}

export async function endSession(
  flameId: string,
  date: string,
  clientDuration?: number,
): ActionResult {
  const { supabase } = await createClientWithAuth();

  if (!isValidDateString(date)) {
    return {
      success: false,
      error: new Error('Date string must be of the format YYYY-MM-DD'),
    };
  }

  const { data: lastSessionData, error: lastSessionError } = await supabase
    .from('flame_sessions')
    .select()
    .eq('flame_id', flameId)
    .eq('date', date)
    .is('ended_at', null) // Get the session that is still in progress
    .limit(1)
    .maybeSingle();

  if (lastSessionError) {
    return { success: false, error: lastSessionError };
  }

  if (!lastSessionData) {
    return {
      success: false,
      error: new Error('Could not find an existing flame session'),
    };
  }

  if (!lastSessionData.started_at) {
    return {
      success: false,
      error: new Error('Session is missing start time'),
    };
  }

  const now = new Date();
  const currentDuration = Math.max(0, lastSessionData.duration_seconds);
  const startTime = new Date(lastSessionData.started_at);
  let totalDuration: number;

  if (clientDuration != null) {
    // Client-provided duration — validate bounds
    const wallClockMax =
      currentDuration +
      Math.floor((now.getTime() - startTime.getTime()) / 1000) +
      60; // 60s tolerance for clock skew

    if (clientDuration < 0 || clientDuration < currentDuration) {
      return {
        success: false,
        error: new Error('Client duration cannot go backwards'),
      };
    }
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

  const { data, error } = await supabase
    .from('flame_sessions')
    .update({
      ended_at: now.toISOString(),
      duration_seconds: totalDuration,
    })
    .eq('id', lastSessionData.id)
    .select()
    .single();

  if (error) {
    return { success: false, error };
  }

  return {
    success: true,
    data: `Successfully ended flame session on date ${date} - Duration: ${data.duration_seconds}s`,
  };
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
