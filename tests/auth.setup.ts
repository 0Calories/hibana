import path from 'node:path';
import { expect, test as setup } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

const TEST_USER = {
  email: 'e2e-test@hibana.com',
  password: 'e2e-test-password',
};

export const AUTH_FILE = path.join(__dirname, '../playwright/.auth/user.json');

setup('create test user and authenticate', async ({ page }) => {
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

  // Log in via the browser UI to get proper auth cookies
  await page.goto('/login');

  await page.getByLabel(/email/i).fill(TEST_USER.email);
  await page.getByLabel(/password/i).fill(TEST_USER.password);
  await page.getByRole('button', { name: /log in/i }).click();

  // Wait for redirect to dashboard after successful login
  await expect(page).toHaveURL('/dashboard', { timeout: 15_000 });

  // Save authenticated browser state
  await page.context().storageState({ path: AUTH_FILE });
});
