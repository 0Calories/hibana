import { test as teardown } from '@playwright/test';
import { cleanupTestData } from './helpers/db';

teardown('cleanup test data', async () => {
  console.log('Cleaning up test data...');
  await cleanupTestData();
  console.log('Test data cleaned up.');
});
