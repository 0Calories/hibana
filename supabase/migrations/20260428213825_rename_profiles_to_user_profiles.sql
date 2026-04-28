-- Rename profiles → user_profiles for consistency with other user tables
-- (user_state, user_items, etc.)

-- Drop existing RLS policies (they reference the old table name)
drop policy if exists "Anyone can view profiles" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;

-- Rename table
alter table public.profiles rename to user_profiles;

-- Rename indexes for clarity
alter index profiles_pkey rename to user_profiles_pkey;
alter index profiles_username_key rename to user_profiles_username_key;

-- Recreate RLS policies with consistent naming
create policy "Anyone can view user_profiles"
  on public.user_profiles for select
  using (true);

create policy "Users can update own user_profile"
  on public.user_profiles for update
  using (auth.uid() = id);

-- Update trigger function to reference new table name
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
