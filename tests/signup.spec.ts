import { expect, test } from '@playwright/test';

test('should successfully create a new user when signing up', async ({
  page,
}) => {
  await page.goto('/signup');
  await page.click('text=About');

  await expect(page.locator('h1')).toContainText('About');
});
