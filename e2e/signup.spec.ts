import { expect, test } from '@playwright/test';

const TEST_PASSWORD = 'TestPass1!';

test.describe('Signup', () => {
  test('should create a new account and redirect to dashboard', async ({
    page,
  }) => {
    const testEmail = `test+signup-${Date.now()}@example.com`;

    await page.goto('/signup');

    await page.getByLabel('Email').fill(testEmail);
    await page.getByLabel('Password', { exact: true }).fill(TEST_PASSWORD);
    await page.getByLabel('Confirm password').fill(TEST_PASSWORD);

    await page.getByRole('button', { name: 'Create Account' }).click();

    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });
  });
});
