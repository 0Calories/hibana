export function getSupabaseCredentials() {
  const publicUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

  if (!publicUrl) {
    throw new Error(
      'Supabase public URL is missing from environment variables',
    );
  }

  if (!publishableKey) {
    throw new Error(
      'Supabase publishable key is missing from environment variables',
    );
  }

  return { publicUrl, publishableKey };
}
