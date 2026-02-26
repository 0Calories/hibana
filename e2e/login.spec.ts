import { expect, test } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

const TEST_PASSWORD = 'TestPass1!';
let testEmail: string;

// Create a dedicated test user via the Supabase Admin API before running
// the login tests. This keeps the login suite independent of the signup flow.
test.beforeAll(async () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'Missing env vars: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.\n' +
        'Run `pnpx supabase status` to retrieve the service_role key for your local instance.',
    );
  }

  testEmail = `test+login-${Date.now()}@example.com`;

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { error } = await supabase.auth.admin.createUser({
    email: testEmail,
    password: TEST_PASSWORD,
    email_confirm: true,
  });

  if (error) {
    throw new Error(`Failed to create test user: ${error.message}`);
  }
});

test.describe('Login', () => {
  test('should log in with valid credentials and redirect to dashboard', async ({
    page,
  }) => {
    await page.goto('/login');

    await page.getByLabel('Email').fill(testEmail);
    await page.getByLabel('Password').fill(TEST_PASSWORD);

    await page.getByRole('button', { name: 'Log In' }).click();

    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });
  });
});
