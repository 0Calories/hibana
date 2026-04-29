import { expect, test } from '@playwright/test';

test('should navigate to the login page', async ({ page }) => {
  await page.goto('/');
  await page.click('text=Log In');
  await expect(page).toHaveURL('/login');
});
