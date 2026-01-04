'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/utils/supabase/server';
import type { TablesInsert } from '@/utils/supabase/types';

export async function createTask(title: string, content?: string) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: authError };
  }

  const taskData: TablesInsert<'tasks'> = {
    title,
    content,
    user: user.id,
  };

  const { error: insertError } = await supabase.from('tasks').insert(taskData);
  if (insertError) {
    return { success: false, error: insertError };
  }

  revalidatePath('/dashboard');
  return { success: true };
}
