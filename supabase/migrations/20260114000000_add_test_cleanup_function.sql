-- Function to clean up test data (for e2e tests)
-- Runs with elevated privileges to bypass RLS
-- Only deletes users with @hibanatest.com emails

CREATE OR REPLACE FUNCTION public.cleanup_test_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  -- Delete test users from auth.users
  -- CASCADE will automatically delete related data from all app tables
  DELETE FROM auth.users
  WHERE email LIKE '%@hibanatest.com';
END;
$$;

REVOKE ALL ON FUNCTION public.cleanup_test_data() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.cleanup_test_data() TO anon;
GRANT EXECUTE ON FUNCTION public.cleanup_test_data() TO authenticated;
GRANT EXECUTE ON FUNCTION public.cleanup_test_data() TO service_role;
