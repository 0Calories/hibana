-- Rename profiles → user_profiles for consistency with other user tables.
-- The reconcile migration that follows drops and recreates user_profiles
-- with the proper schema, so this migration only needs to do the rename.

-- Drop existing RLS policy (original name from initial migration)
drop policy if exists "Enable read access for all users" on public.profiles;

-- Rename table
alter table public.profiles rename to user_profiles;

-- Update trigger function to reference new table name
-- (plpgsql validates at call time, and the trigger doesn't exist yet,
-- so the bigint/uuid mismatch on user_profiles.id is harmless here)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.user_profiles (id) values (new.id);
  insert into public.user_state (user_id) values (new.id);
  return new;
end;
$$;
