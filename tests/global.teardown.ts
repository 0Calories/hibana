import { test as teardown } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import { isTestUserEmail } from './test-user';

teardown('delete all test users', async () => {
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

  const { data: users } = await supabase.auth.admin.listUsers();
  const testUsers =
    users?.users.filter((u) => u.email && isTestUserEmail(u.email)) ?? [];

  for (const user of testUsers) {
    const { error } = await supabase.auth.admin.deleteUser(user.id);
    if (error) {
      console.error(`Failed to delete ${user.email}: ${error.message}`);
    }
  }
});
