import { test as setup } from '@playwright/test';
import { createAdminClient } from './supabase';
import { isTestUserEmail } from './test-user';

setup('clean up stale test users', async () => {
  const supabase = createAdminClient();

  // Remove any leftover test users from a previous failed run
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const staleUsers =
    existingUsers?.users.filter((u) => u.email && isTestUserEmail(u.email)) ??
    [];

  for (const user of staleUsers) {
    await supabase.auth.admin.deleteUser(user.id);
  }
});
