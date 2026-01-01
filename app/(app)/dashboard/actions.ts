'use server';

import { createClient } from '@/utils/supabase/server';
import type { TablesInsert } from '@/utils/supabase/types';

export async function createTodo(content: string) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: authError };
  }

  const todoData: TablesInsert<'todos'> = {
    content: content,
    user: user.id,
  };

  const { error: insertError } = await supabase.from('todos').insert(todoData);
  if (insertError) {
    return { success: false, error: insertError };
  }

  return { success: true };
}
