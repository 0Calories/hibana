'use server';

import { isValidDateString } from '@/lib/utils';
import { createClientWithAuth } from '@/utils/supabase/server';

export async function startSession(flameId: string, date: string) {
  const { supabase } = await createClientWithAuth();

  if (!isValidDateString(date)) {
    return {
      success: false,
      error: new Error('Date string must be of the format YYYY-MM-DD'),
    };
  }

  // If there is already a session in progress that has not been ended yet, return an error
  const { data: existingSession, error: existingSessionError } = await supabase
    .from('flame_sessions')
    .select()
    .eq('flame_id', flameId)
    .eq('date', date)
    .is('ended_at', null)
    .maybeSingle();

  if (existingSessionError) {
    return {
      success: false,
      error: existingSessionError,
    };
  }

  if (existingSession) {
    return {
      success: false,
      error: new Error('An ongoing session for this flame already exists'),
    };
  }

  const { error } = await supabase
    .from('flame_sessions')
    .insert({ flame_id: flameId, date, started_at: new Date().toISOString() });

  if (error) {
    return { success: false, error };
  }

  return {
    success: true,
    data: `Successfully started a new flame session on date: ${date}`,
  };
}

export async function endSession(flameId: string, date: string) {
  const { supabase } = await createClientWithAuth();

  if (!isValidDateString(date)) {
    return {
      success: false,
      error: new Error('Date string must be of the format YYYY-MM-DD'),
    };
  }

  // Errors automatically if there was no existing session
  const { data: lastSessionData, error: lastSessionError } = await supabase
    .from('flame_sessions')
    .select()
    .eq('flame_id', flameId)
    .eq('date', date)
    .is('ended_at', null) // Get the session that is still in progress
    .single();

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

  // Math.max compensates for potential clock skew fuckery by avoiding negative values
  const currentDuration = Math.max(0, lastSessionData.duration_seconds);
  const startTime = new Date(lastSessionData.started_at);
  const endTime = new Date();

  const sessionDurationSeconds = Math.max(
    0,
    Math.floor((endTime.getTime() - startTime.getTime()) / 1000),
  );
  const totalDuration = currentDuration + sessionDurationSeconds;

  const { data, error } = await supabase
    .from('flame_sessions')
    .update({
      ended_at: endTime.toISOString(),
      duration_seconds: totalDuration,
    })
    .eq('id', lastSessionData.id)
    .select()
    .single();

  if (error) {
    return { success: false, error };
  }

  return { success: true, data };
}

// Edge cases to consider for the future:
// - If a user never ends their session, it should be automatically closed or cleaned up at some point via a job
