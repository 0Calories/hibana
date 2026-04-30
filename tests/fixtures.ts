import fs from 'node:fs';
import path from 'node:path';
import { test as baseTest, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import { TEST_USER_PASSWORD, testUserEmail } from './test-user';

export { expect } from '@playwright/test';

// biome-ignore lint/complexity/noBannedTypes: Playwright fixture typing requires empty object for test-scoped slot
export const test = baseTest.extend<{}, { workerStorageState: string }>({
  storageState: ({ workerStorageState }, use) => use(workerStorageState),

  workerStorageState: [
    async ({ browser }, use) => {
      const id = test.info().parallelIndex;
      const fileName = path.resolve(
        test.info().project.outputDir,
        `.auth/${id}.json`,
      );

      if (fs.existsSync(fileName)) {
        await use(fileName);
        return;
      }

      // Create a unique test user for this worker
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

      const email = testUserEmail(id);

      const { error: createError } = await supabase.auth.admin.createUser({
        email,
        password: TEST_USER_PASSWORD,
        email_confirm: true,
      });

      if (createError) {
        throw new Error(`Failed to create test user: ${createError.message}`);
      }

      // Authenticate via the browser UI
      const baseURL =
        test.info().project.use.baseURL ?? 'http://localhost:3000';
      const page = await browser.newPage({ storageState: undefined });
      await page.goto(`${baseURL}/login`);

      await page.getByLabel(/email/i).fill(email);
      await page.getByLabel(/password/i).fill(TEST_USER_PASSWORD);
      await page.getByRole('button', { name: /log in/i }).click();

      await expect(page).toHaveURL(`${baseURL}/dashboard`, {
        timeout: 15_000,
      });

      await page.context().storageState({ path: fileName });
      await page.close();
      await use(fileName);
    },
    { scope: 'worker' },
  ],
});
