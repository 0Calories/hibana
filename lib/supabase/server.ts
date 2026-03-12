import { createServerClient } from '@supabase/ssr';
import { createClient as createJsClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { getSupabaseCredentials } from './env';
import type { ServiceDatabase } from './service-types';
import type { Database } from './types';

export async function createClient() {
  const cookieStore = await cookies();
  const { publicUrl, publishableKey } = getSupabaseCredentials();

  // Create a server's supabase client with newly configured cookie,
  // which could be used to maintain user's session
  return createServerClient<Database>(publicUrl, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have proxy refreshing
          // user sessions.
        }
      },
    },
  });
}

/**
 * For use within server components only!
 * Wrapper function for `createClient()` that includes auth checks and throws an error if not authorized
 */
export async function createClientWithAuth() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error('Unauthorized');
  }

  return { supabase, user };
}

/**
 * Service-role client for calling REVOKE'd RPCs from Server Actions.
 * Bypasses RLS — only use for server-only operations.
 */
export function createServiceClient() {
  const { publicUrl } = getSupabaseCredentials();
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!secretKey) {
    throw new Error(
      'SUPABASE_SECRET_KEY is missing from environment variables',
    );
  }

  return createJsClient<ServiceDatabase>(publicUrl, secretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
