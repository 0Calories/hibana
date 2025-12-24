import { createBrowserClient } from '@supabase/ssr';
import { getSupabaseCredentials } from './env';

export function createClient() {
  const { publicUrl, publishableKey } = getSupabaseCredentials();

  // Create a supabase client on the browser with project's credentials
  return createBrowserClient(publicUrl, publishableKey);
}
