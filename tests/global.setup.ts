import { test as setup } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import { TEST_USER } from './test-user';

setup('seed test user', async () => {
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

  // Clean up any leftover test user from a previous failed run
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const existing = existingUsers?.users.find(
    (u) => u.email === TEST_USER.email,
  );
  if (existing) {
    await supabase.auth.admin.deleteUser(existing.id);
  }

  // Create a fresh test user
  const { error: createError } = await supabase.auth.admin.createUser({
    email: TEST_USER.email,
    password: TEST_USER.password,
    email_confirm: true,
  });

  if (createError) {
    throw new Error(`Failed to create test user: ${createError.message}`);
  }
});
