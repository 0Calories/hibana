import { test as setup } from '@playwright/test';
import { cleanupTestData } from './helpers/db';

setup('cleanup test data', async () => {
  console.log('Cleaning up test data...');
  await cleanupTestData();
  console.log('Test data cleaned up.');
});
