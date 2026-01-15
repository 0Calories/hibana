import { randomUUID } from 'node:crypto';
import { expect, test } from '@playwright/test';

test('should successfully create a new user when signing up', async ({
  page,
}) => {
  await page.goto('/signup');

  const email = `test${randomUUID()}@hibanatest.com`;
  const password = 'TestPassword123!';

  await page.getByLabel('Email').fill(email);
  await page.getByLabel(/^Password$/).fill(password);
  await page.getByLabel('Confirm password').fill(password);

  await page.getByRole('button', { name: 'Create Account' }).click();

  await page.waitForURL('/dashboard');
  await expect(page.getByText('Welcome to Hibana!')).toBeVisible();
});
