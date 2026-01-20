'use server';

import { revalidatePath } from 'next/cache';
import type { Flame } from '@/utils/supabase/rows';
import { createClient } from '@/utils/supabase/server';
import type { TablesInsert } from '@/utils/supabase/types';

type FlameInput = Pick<
  Flame,
  | 'name'
  | 'color'
  | 'icon'
  | 'time_budget_minutes'
  | 'tracking_type'
  | 'count_target'
  | 'count_unit'
  | 'is_daily'
>;

export async function createFlame(data: FlameInput) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: authError };
  }

  const flameData: TablesInsert<'flames'> = {
    user_id: user.id,
    ...data,
  };

  const { error: insertError } = await supabase
    .from('flames')
    .insert(flameData);
  if (insertError) {
    return { success: false, error: insertError };
  }

  revalidatePath('/flames');
  return { success: true };
}
