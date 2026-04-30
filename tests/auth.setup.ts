import { expect, test as setup } from '@playwright/test';
import { AUTH_FILE, TEST_USER } from './test-user';

setup('authenticate test user', async ({ page }) => {
  await page.goto('/login');

  await page.getByLabel(/email/i).fill(TEST_USER.email);
  await page.getByLabel(/password/i).fill(TEST_USER.password);
  await page.getByRole('button', { name: /log in/i }).click();

  await expect(page).toHaveURL('/dashboard', { timeout: 15_000 });

  await page.context().storageState({ path: AUTH_FILE });
});
