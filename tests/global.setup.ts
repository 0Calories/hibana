import { test as setup } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import { isTestUserEmail } from './test-user';

setup('clean up stale test users', async () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !serviceKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY env vars',
    );
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  // Remove any leftover test users from a previous failed run
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const staleUsers =
    existingUsers?.users.filter((u) => u.email && isTestUserEmail(u.email)) ??
    [];

  for (const user of staleUsers) {
    await supabase.auth.admin.deleteUser(user.id);
  }
});
