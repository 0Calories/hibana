-- Rename user_state → user_states for plural consistency with other user tables
-- (user_profiles, user_items, etc.)

-- Drop existing RLS policy
drop policy if exists "Users can view own user_state" on public.user_state;

-- Rename table
alter table public.user_state rename to user_states;

-- Rename index and constraints for clarity
alter index user_state_pkey rename to user_states_pkey;
alter table public.user_states rename constraint user_state_user_id_fkey to user_states_user_id_fkey;

-- Recreate RLS policy with consistent naming
create policy "Users can view own user_states"
  on public.user_states for select
  using (auth.uid() = user_id);

-- Update trigger function to reference new table name
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

-- Update RPCs to reference new table name

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

  -- Atomic balance increment (user_states row guaranteed by signup trigger)
  update public.user_states
  set sparks_balance = sparks_balance + p_amount
  where user_id = p_user_id;

  -- Fallback for users created before the trigger existed
  if not found then
    insert into public.user_states (user_id, sparks_balance)
    values (p_user_id, p_amount)
    on conflict (user_id) do update
    set sparks_balance = user_states.sparks_balance + p_amount;
  end if;

  return p_amount;
end;
$$;

-- Re-revoke execute from client-facing roles (create or replace resets grants)
revoke execute on function public.purchase_item(uuid, uuid, uuid)
  from public, anon, authenticated;

revoke execute on function public.credit_completion_sparks(uuid, uuid, integer)
  from public, anon, authenticated;
