import { createClient } from '@supabase/supabase-js';

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
console.log(URL);
console.log(ANON_KEY);

if (!URL || !ANON_KEY) {
  throw new Error('Missing Supabase env variables');
}

const supabase = createClient(URL, ANON_KEY);

/**
 * Cleans up test data by deleting users with @hibanatest.com emails.
 * All related data in app tables is automatically deleted via CASCADE.
 */
export async function cleanupTestData() {
  const { error } = await supabase.rpc('cleanup_test_data');

  if (error) {
    console.error('Failed to cleanup test data:', error.message);
    throw error;
  }
}
