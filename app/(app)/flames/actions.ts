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

export async function createFlame(flameInput: FlameInput, schedule?: number[]) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: authError };
  }

  const flameInsertData: TablesInsert<'flames'> = {
    user_id: user.id,
    ...flameInput,
  };

  const { data, error: insertError } = await supabase
    .from('flames')
    .insert(flameInsertData)
    .single();
  if (insertError) {
    return { success: false, error: insertError };
  }

  // If this flame was created alongside a schedule, we must also update the data accordingly
  if (!flameInput.is_daily && schedule) {
    // TODO: Perform an insert in flame_schedules as well
  }

  revalidatePath('/flames');
  return { success: true, data };
}
