import { execSync } from 'node:child_process';
import { test as teardown } from '@playwright/test';

teardown('delete database', async () => {
  console.log('deleting test database...');
  execSync('pnpx supabase db reset', { stdio: 'inherit' });
});
