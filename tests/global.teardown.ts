import { test as teardown } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

const TEST_USER_EMAIL = 'e2e-test@hibana.com';

teardown('delete test user and clean up data', async () => {
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

  // Find and delete the test user — cascading deletes clean up related data
  const { data: users } = await supabase.auth.admin.listUsers();
  const testUser = users?.users.find((u) => u.email === TEST_USER_EMAIL);

  if (testUser) {
    const { error } = await supabase.auth.admin.deleteUser(testUser.id);
    if (error) {
      console.error(`Failed to delete test user: ${error.message}`);
    }
  }
});
