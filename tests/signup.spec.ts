import { expect, test } from '@playwright/test';

test('should successfully create a new user when signing up', async ({
  page,
}) => {
  await page.goto('/signup');

  const email = `test${new Date().toDateString}@example.com`;
  const password = 'TestPassword123!';

  await page.getByLabel('Email').fill(email);
  await page.getByLabel(/^Password$/).fill(password);
  await page.getByLabel('Confirm password').fill(password);

  await page.getByRole('button', { name: 'Create Account' }).click();

  await expect(page.getByText('Welcome back!')).toBeVisible();
});
