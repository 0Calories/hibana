import { expect, test } from '@playwright/test';

test('should navigate to the login page', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: /log in/i }).click();
  await expect(page).toHaveURL('/login');
});
