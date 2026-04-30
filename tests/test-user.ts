import path from 'node:path';

export const TEST_USER = {
  email: 'e2e-test@hibana.com',
  password: 'e2e-test-password',
};

export const AUTH_FILE = path.join(__dirname, '../playwright/.auth/user.json');
