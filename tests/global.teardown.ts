import { test as teardown } from '@playwright/test';
import { createAdminClient } from './supabase';
import { isTestUserEmail } from './test-user';

teardown('delete all test users', async () => {
  const supabase = createAdminClient();

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
