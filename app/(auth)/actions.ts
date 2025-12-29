'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';

export async function signup(email: string, password: string) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({ email, password });

  if (error) {
    return { success: false, error };
  }

  // TODO: Should redirect to email confirmation flow in the future
  revalidatePath('/', 'layout');
  redirect('/dashboard');
}

export async function login(email: string, password: string) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { success: false, error };
  }

  revalidatePath('/', 'layout');
  redirect('/dashboard');
}
