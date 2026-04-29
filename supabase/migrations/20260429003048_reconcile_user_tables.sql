-- Reconcile user tables: restructure user_profiles, rename user_inventory → user_items,
-- clean up user_state → user_states, tighten RLS, update RPCs and triggers.
--
-- Replaces the out-of-order migrations 20260428204748 and 20260428220400.
-- Accounts for remote state: profiles already renamed to user_profiles (20260428213825),
-- heat/level columns on user_state (20260404000000 leveling migration).

-- ============================================================
-- 1. RESTRUCTURE user_profiles (table is empty — safe to recreate)
--    Currently has old schema (bigint PK, no FK to auth.users).
--    Recreate with uuid PK referencing auth.users.
-- ============================================================

drop policy if exists "Anyone can view user_profiles" on public.user_profiles;
drop policy if exists "Users can update own user_profile" on public.user_profiles;
drop table if exists public.user_profiles;

create table public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  bio text,
  avatar_url text,
  created_at timestamptz not null default now()
);

alter table public.user_profiles enable row level security;

create policy "Anyone can view user_profiles"
  on public.user_profiles for select
  using (true);

create policy "Users can update own user_profile"
  on public.user_profiles for update
  using (auth.uid() = id);

-- ============================================================
-- 2. RENAME user_inventory → user_items + DROP is_equipped
--    (table is empty — renames and column drop are safe)
-- ============================================================

drop policy if exists "Users can view own user_inventory" on public.user_inventory;
drop policy if exists "Users can insert own user_inventory" on public.user_inventory;
drop policy if exists "Users can update own user_inventory" on public.user_inventory;
drop policy if exists "Users can delete own user_inventory" on public.user_inventory;

alter table public.user_inventory rename to user_items;

alter index user_inventory_user_id_idx rename to user_items_user_id_idx;
alter index user_inventory_pkey rename to user_items_pkey;
alter index user_inventory_user_id_item_id_key rename to user_items_user_id_item_id_key;

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
--    Note: heat + level columns from leveling migration are preserved.
-- ============================================================

alter table public.user_state
  drop column created_at,
  drop column updated_at;

alter table public.user_state
  add column heat_level integer not null default 0;

-- Drop overly permissive policies
drop policy if exists "Users can insert own user_state" on public.user_state;
drop policy if exists "Users can update own user_state" on public.user_state;
drop policy if exists "Users can delete own user_state" on public.user_state;

-- ============================================================
-- 5. RENAME user_state → user_states
-- ============================================================

drop policy if exists "Users can view own user_state" on public.user_state;

alter table public.user_state rename to user_states;

alter index user_state_pkey rename to user_states_pkey;
alter table public.user_states rename constraint user_state_user_id_fkey to user_states_user_id_fkey;

create policy "Users can view own user_states"
  on public.user_states for select
  using (auth.uid() = user_id);

-- ============================================================
-- 6. AUTO-CREATE TRIGGER (user_profiles + user_states)
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.user_profiles (id) values (new.id);
  insert into public.user_states (user_id) values (new.id);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- 7. UPDATE RPCs — use new table names, remove updated_at refs
-- ============================================================

-- Drop stale 2-arg purchase_item left over from migration 20260309000000
-- (20260311100000 tried to drop the 3-arg version, missing this one)
drop function if exists public.purchase_item(uuid, uuid);

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
  from public.user_states
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

  update public.user_states
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

  update public.user_states
  set sparks_balance = sparks_balance + p_amount
  where user_id = p_user_id;

  if not found then
    insert into public.user_states (user_id, sparks_balance)
    values (p_user_id, p_amount)
    on conflict (user_id) do update
    set sparks_balance = user_states.sparks_balance + p_amount;
  end if;

  return p_amount;
end;
$$;

-- Update credit_completion_rewards (from leveling migration) to use new table names
create or replace function public.credit_completion_rewards(
  p_user_id uuid,
  p_session_id uuid,
  p_flame_id uuid,
  p_sparks integer,
  p_heat integer
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_spark_inserted boolean := false;
  v_heat_inserted boolean := false;
  v_flame_level integer;
  v_user_level integer;
  v_rows integer;
begin
  if p_sparks > 0 then
    insert into public.spark_transactions (user_id, amount, reason, reference_id)
    values (p_user_id, p_sparks, 'completion', p_session_id)
    on conflict (reference_id, reason) do nothing;

    get diagnostics v_rows = row_count;
    v_spark_inserted := v_rows > 0;

    if v_spark_inserted then
      update public.user_states
      set sparks_balance = sparks_balance + p_sparks
      where user_id = p_user_id;

      if not found then
        insert into public.user_states (user_id, sparks_balance)
        values (p_user_id, p_sparks)
        on conflict (user_id) do update
        set sparks_balance = user_states.sparks_balance + p_sparks;
      end if;
    end if;
  end if;

  if p_heat > 0 then
    insert into public.heat_transactions (user_id, flame_id, amount, reason, reference_id)
    values (p_user_id, p_flame_id, p_heat, 'completion', p_session_id)
    on conflict (reference_id, reason) do nothing;

    get diagnostics v_rows = row_count;
    v_heat_inserted := v_rows > 0;

    if v_heat_inserted then
      update public.flames
      set heat = heat + p_heat,
          level = compute_level_from_heat(heat + p_heat)
      where id = p_flame_id;

      update public.user_states
      set heat = heat + p_heat,
          level = compute_level_from_heat(heat + p_heat)
      where user_id = p_user_id;

      if not found then
        insert into public.user_states (user_id, heat, level)
        values (p_user_id, p_heat, compute_level_from_heat(p_heat))
        on conflict (user_id) do update
        set heat = user_states.heat + p_heat,
            level = compute_level_from_heat(user_states.heat + p_heat);
      end if;
    end if;
  end if;

  select level into v_flame_level from public.flames where id = p_flame_id;
  select level into v_user_level from public.user_states where user_id = p_user_id;

  return jsonb_build_object(
    'sparks', case when v_spark_inserted then p_sparks else 0 end,
    'heat', case when v_heat_inserted then p_heat else 0 end,
    'flame_level', coalesce(v_flame_level, 1),
    'user_level', coalesce(v_user_level, 1)
  );
end;
$$;

-- Re-revoke execute from client-facing roles (create or replace resets grants)
revoke execute on function public.purchase_item(uuid, uuid, uuid)
  from public, anon, authenticated;

revoke execute on function public.credit_completion_sparks(uuid, uuid, integer)
  from public, anon, authenticated;

revoke execute on function public.credit_completion_rewards(uuid, uuid, uuid, integer, integer)
  from public, anon, authenticated;
