-- Refactor user-related tables:
-- 1. Restructure profiles table (bigint PK → uuid PK referencing auth.users)
-- 2. Rename user_inventory → user_items, drop is_equipped column
-- 3. Add is_equippable to items table
-- 4. Remove created_at/updated_at from user_state, add heat_level
-- 5. Tighten RLS: user_items and user_state are read-only for clients
-- 6. Auto-create profiles + user_state on signup via trigger
-- 7. Update RPCs to reflect table/column changes

-- ============================================================
-- 1. RESTRUCTURE PROFILES
-- ============================================================

-- Drop the old profiles table (bigint PK, gen_random_uuid() default on user_id)
drop policy if exists "Enable read access for all users" on public.profiles;
drop table if exists public.profiles;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  bio text,
  avatar_url text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Anyone can view profiles"
  on public.profiles for select
  using (true);

-- Users can update their own profile (no INSERT — trigger handles creation)
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- ============================================================
-- 2. RENAME user_inventory → user_items + DROP is_equipped
-- ============================================================

-- Drop old RLS policies
drop policy if exists "Users can view own user_inventory" on public.user_inventory;
drop policy if exists "Users can insert own user_inventory" on public.user_inventory;
drop policy if exists "Users can update own user_inventory" on public.user_inventory;
drop policy if exists "Users can delete own user_inventory" on public.user_inventory;

-- Rename table
alter table public.user_inventory rename to user_items;

-- Rename index and constraints for clarity
alter index user_inventory_user_id_idx rename to user_items_user_id_idx;
alter index user_inventory_pkey rename to user_items_pkey;
alter index user_inventory_user_id_item_id_key rename to user_items_user_id_item_id_key;

-- Drop is_equipped column (equippability is an item catalog property, not per-user state)
alter table public.user_items drop column is_equipped;

-- Client can only read their own items; all mutations go through RPCs
create policy "Users can view own user_items"
  on public.user_items for select
  using (auth.uid() = user_id);

-- ============================================================
-- 3. ADD is_equippable TO ITEMS
-- ============================================================

alter table public.items
  add column is_equippable boolean not null default false;

-- ============================================================
-- 4. CLEAN UP user_state: drop timestamps, add heat_level,
--    tighten RLS to read-only
-- ============================================================

alter table public.user_state
  drop column created_at,
  drop column updated_at;

alter table public.user_state
  add column heat_level integer not null default 0;

-- Drop overly permissive policies (INSERT/UPDATE/DELETE not needed by clients)
drop policy if exists "Users can insert own user_state" on public.user_state;
drop policy if exists "Users can update own user_state" on public.user_state;
drop policy if exists "Users can delete own user_state" on public.user_state;

-- SELECT policy already exists ("Users can view own user_state") — keep it

-- ============================================================
-- 5. AUTO-CREATE TRIGGER
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.profiles (id) values (new.id);
  insert into public.user_state (user_id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- 6. UPDATE RPCs (remove updated_at refs, rename user_inventory)
-- ============================================================

create or replace function public.purchase_item(
  p_user_id uuid,
  p_item_id uuid,
  p_request_id uuid
)
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_cost integer;
  v_balance integer;
  v_inserted integer;
begin
  select cost_sparks into v_cost
  from public.items
  where id = p_item_id and is_active = true
  for share;

  if not found or v_cost <= 0 then
    return 0;
  end if;

  select sparks_balance into v_balance
  from public.user_state
  where user_id = p_user_id
  for update;

  if not found then
    return 0;
  end if;

  if v_balance < v_cost then
    return 0;
  end if;

  insert into public.spark_transactions (user_id, amount, reason, reference_id)
  values (p_user_id, -v_cost, 'purchase', p_request_id)
  on conflict (reference_id, reason) do nothing;

  get diagnostics v_inserted = row_count;
  if v_inserted = 0 then
    return 0;
  end if;

  update public.user_state
  set sparks_balance = sparks_balance - v_cost
  where user_id = p_user_id;

  insert into public.user_items (user_id, item_id, quantity)
  values (p_user_id, p_item_id, 1)
  on conflict (user_id, item_id)
  do update set quantity = user_items.quantity + 1;

  return v_cost;
end;
$$;

create or replace function public.credit_completion_sparks(
  p_user_id uuid,
  p_session_id uuid,
  p_amount integer
)
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if p_amount <= 0 then
    return 0;
  end if;

  if not exists (
    select 1
    from public.flame_sessions fs
    where fs.id = p_session_id
      and fs.user_id = p_user_id
  ) then
    return 0;
  end if;

  insert into public.spark_transactions (user_id, amount, reason, reference_id)
  values (p_user_id, p_amount, 'completion', p_session_id)
  on conflict (reference_id, reason) do nothing;

  if not found then
    return 0;
  end if;

  -- Atomic balance increment (user_state row guaranteed by signup trigger)
  update public.user_state
  set sparks_balance = sparks_balance + p_amount
  where user_id = p_user_id;

  -- Fallback for users created before the trigger existed
  if not found then
    insert into public.user_state (user_id, sparks_balance)
    values (p_user_id, p_amount)
    on conflict (user_id) do update
    set sparks_balance = user_state.sparks_balance + p_amount;
  end if;

  return p_amount;
end;
$$;

-- Re-revoke execute from client-facing roles (create or replace resets grants)
revoke execute on function public.purchase_item(uuid, uuid, uuid)
  from public, anon, authenticated;

revoke execute on function public.credit_completion_sparks(uuid, uuid, integer)
  from public, anon, authenticated;
