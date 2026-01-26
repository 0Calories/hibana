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

  const { data, error } = await supabase
    .from('flame_sessions')
    .insert({ flame_id: flameId, date, started_at: new Date().toISOString() })
    .single();

  if (error) {
    return { success: false, error };
  }

  return { success: true, data };
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

  if (!lastSessionData.started_at) {
    return {
      success: false,
      error: new Error('Session is missing start time'),
    };
  }

  const currentDuration = lastSessionData.duration_seconds;
  const startTime = new Date(lastSessionData.started_at);
  const endTime = new Date();
  // TODO:
  // - store endTime as a timestamp string in ended_at in the record
  // - calculate the total duration of the session by timestamp mathing the diff between started_at and ended_at,
  // then add it on duration_seconds and save the result in the record
  // Calculate total duration here via timestamp math (diff between lastSessionData.started_at and endTime)

  const sessionDurationSeconds = Math.floor(
    (endTime.getTime() - startTime.getTime()) / 1000,
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
    return { success: false };
  }

  return { success: true, data };
}
