-- RPC: purchase_item
-- Atomically deducts sparks and adds the item to the user's inventory.
-- Returns the cost on success, 0 on failure (insufficient balance, invalid item, etc.)
-- p_request_id provides idempotency — duplicate calls with the same ID are no-ops.

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
  v_inserted boolean;
begin
  -- Guard: caller must be the target user
  if auth.uid() is null or auth.uid() <> p_user_id then
    return 0;
  end if;

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
