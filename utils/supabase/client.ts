import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY } =
    process.env;

  if (!NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || !NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error('Supabase Environment variables are not configured!');
  }

  // Create a supabase client on the browser with project's credentials
  return createBrowserClient(
    NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
}
