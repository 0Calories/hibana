import { test as teardown } from '@playwright/test';
import { cleanupTestData } from './helpers/db';

teardown('cleanup test data', () => {
  console.log('Cleaning up test data...');
  cleanupTestData();
  console.log('Test data cleaned up.');
});
