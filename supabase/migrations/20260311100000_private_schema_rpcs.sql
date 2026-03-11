-- Create a private schema for server-only RPC functions.
-- PostgREST only exposes schemas listed in config (public, graphql_public),
-- so functions in this schema are invisible to client-side supabase.rpc() calls.
-- Only service_role connections (used by Server Actions) can invoke them.

create schema if not exists private;

-- Move purchase_item to private schema
drop function if exists public.purchase_item(uuid, uuid, uuid);

create or replace function private.purchase_item(
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
  -- Guard: item must exist, be active, and have a valid cost
  select cost_sparks into v_cost
  from public.items
  where id = p_item_id and is_active = true
  for share;

  if not found or v_cost <= 0 then
    return 0;
  end if;

  -- Lock user_state row to prevent double-spend race
  select sparks_balance into v_balance
  from public.user_state
  where user_id = p_user_id
  for update;

  if not found then
    return 0;
  end if;

  -- Check sufficient balance
  if v_balance < v_cost then
    return 0;
  end if;

  -- Record transaction (idempotent via unique constraint on reference_id + reason)
  insert into public.spark_transactions (user_id, amount, reason, reference_id)
  values (p_user_id, -v_cost, 'purchase', p_request_id)
  on conflict (reference_id, reason) do nothing;

  -- If the row already existed, this is a duplicate request — abort
  get diagnostics v_inserted = row_count;
  if v_inserted = 0 then
    return 0;
  end if;

  -- Decrement balance
  update public.user_state
  set sparks_balance = sparks_balance - v_cost,
      updated_at = now()
  where user_id = p_user_id;

  -- Upsert inventory
  insert into public.user_inventory (user_id, item_id, quantity)
  values (p_user_id, p_item_id, 1)
  on conflict (user_id, item_id)
  do update set quantity = user_inventory.quantity + 1;

  return v_cost;
end;
$$;

-- Move credit_completion_sparks to private schema
drop function if exists public.credit_completion_sparks(uuid, uuid, integer);

create or replace function private.credit_completion_sparks(
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
  -- Guard: amount must be positive
  if p_amount <= 0 then
    return 0;
  end if;

  -- Guard: session must belong to the caller
  if not exists (
    select 1
    from public.flame_sessions fs
    where fs.id = p_session_id
      and fs.user_id = p_user_id
  ) then
    return 0;
  end if;

  -- Attempt insert; ON CONFLICT means already credited
  insert into public.spark_transactions (user_id, amount, reason, reference_id)
  values (p_user_id, p_amount, 'completion', p_session_id)
  on conflict (reference_id, reason) do nothing;

  -- FOUND is true if the INSERT affected a row, false if ON CONFLICT skipped it
  if not found then
    return 0;
  end if;

  -- Atomic balance increment
  update public.user_state
  set sparks_balance = sparks_balance + p_amount,
      updated_at = now()
  where user_id = p_user_id;

  -- If no row existed yet, create one
  if not found then
    insert into public.user_state (user_id, sparks_balance)
    values (p_user_id, p_amount)
    on conflict (user_id) do update
    set sparks_balance = user_state.sparks_balance + p_amount,
        updated_at = now();
  end if;

  return p_amount;
end;
$$;
