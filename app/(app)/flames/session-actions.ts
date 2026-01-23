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

  supabase
    .from('flame_sessions')
    .insert({ flame_id: flameId, date, started_at: new Date().toTimeString() });
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

  supabase.from('flame_sessions').insert({ flame_id: flameId, date });
}
