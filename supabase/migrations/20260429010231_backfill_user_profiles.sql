-- Backfill user_profiles rows for existing auth.users who were created
-- before the on_auth_user_created trigger was added.

insert into public.user_profiles (id)
select id from auth.users
where id not in (select id from public.user_profiles)
on conflict (id) do nothing;
