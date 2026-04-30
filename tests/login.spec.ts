import { test as baseTest, expect } from '@playwright/test';
import { test } from './fixtures';

baseTest.describe('login (unauthenticated)', () => {
  baseTest('should navigate to the login page', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /log in/i }).click();
    await expect(page).toHaveURL('/login');
  });
});

test.describe('login (authenticated)', () => {
  test('should redirect to dashboard when already logged in', async ({
    page,
  }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/dashboard');
  });
});
