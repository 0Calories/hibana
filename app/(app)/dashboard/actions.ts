'use server';

import { createClient } from '@/utils/supabase/server';
import type { TablesInsert } from '@/utils/supabase/types';

export async function createTask(content: string) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: authError };
  }

  const todoData: TablesInsert<'tasks'> = {
    content: content,
    user: user.id,
  };

  const { error: insertError } = await supabase.from('tasks').insert(todoData);
  if (insertError) {
    return { success: false, error: insertError };
  }

  return { success: true };
}
