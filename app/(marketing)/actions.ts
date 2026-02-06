'use server';

import { createClient } from '@/utils/supabase/server';

export async function joinWaitlist(email: string) {
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, error: 'Please enter a valid email address.' };
  }

  const supabase = await createClient();
  const { error } = await supabase.from('waitlist').insert({ email });

  if (error) {
    if (error.code === '23505') {
      return { success: true }; // Already on the list — treat as success
    }
    return { success: false, error: 'Something went wrong. Please try again.' };
  }

  return { success: true };
}
