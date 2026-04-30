export const TEST_USER_EMAIL_PREFIX = 'e2e-test-';
export const TEST_USER_EMAIL_DOMAIN = '@hibana.com';
export const TEST_USER_PASSWORD = 'e2e-test-password';

export function testUserEmail(workerIndex: number) {
  return `${TEST_USER_EMAIL_PREFIX}${workerIndex}${TEST_USER_EMAIL_DOMAIN}`;
}

export function isTestUserEmail(email: string) {
  return (
    email.startsWith(TEST_USER_EMAIL_PREFIX) &&
    email.endsWith(TEST_USER_EMAIL_DOMAIN)
  );
}
