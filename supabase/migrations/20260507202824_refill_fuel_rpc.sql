-- refill_fuel — opens a canister and applies its fuel.
-- Auto-claim policy: leftover fuel after canister consumption is applied
-- first to any unfueled time on today's incomplete sessions (oldest first),
-- then any remainder is added to the user's balance.
--
-- Returns jsonb:
--   { applied: [{flame_id, seconds_applied}, ...],
--     remainder_seconds_added: int,
--     canister_seconds: int }
--
-- Errors return jsonb { error: 'reason' } with no state changes.

create or replace function public.refill_fuel(
  p_user_id uuid,
  p_item_id uuid,
  p_date date
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_canister_seconds integer;
  v_quantity integer;
  v_to_add integer;
  v_apply integer;
  v_session record;
  v_applied jsonb := '[]'::jsonb;
begin
  -- Guard: caller authorization
  if auth.uid() is null or auth.uid() <> p_user_id then
    return jsonb_build_object('error', 'unauthorized');
  end if;

  -- Guard: item exists, is a fuel canister, has metadata.seconds
  select (metadata->>'seconds')::integer into v_canister_seconds
  from public.items
  where id = p_item_id and is_active = true and type = 'fuel_canister';

  if v_canister_seconds is null or v_canister_seconds <= 0 then
    return jsonb_build_object('error', 'invalid_canister');
  end if;

  -- Guard + atomic decrement: user must own at least 1
  select quantity into v_quantity
  from public.user_items
  where user_id = p_user_id and item_id = p_item_id
  for update;

  if not found or v_quantity < 1 then
    return jsonb_build_object('error', 'no_inventory');
  end if;

  if v_quantity = 1 then
    delete from public.user_items
    where user_id = p_user_id and item_id = p_item_id;
  else
    update public.user_items
    set quantity = quantity - 1
    where user_id = p_user_id and item_id = p_item_id;
  end if;

  -- Catch-up loop: oldest incomplete session first
  v_to_add := v_canister_seconds;
  for v_session in
    select id, flame_id, duration_seconds, fueled_seconds
    from public.flame_sessions
    where user_id = p_user_id
      and date = p_date
      and is_completed = false
      and duration_seconds > fueled_seconds
    order by created_at asc
    for update
  loop
    exit when v_to_add <= 0;
    v_apply := least(v_session.duration_seconds - v_session.fueled_seconds, v_to_add);
    update public.flame_sessions
    set fueled_seconds = fueled_seconds + v_apply
    where id = v_session.id;
    v_applied := v_applied || jsonb_build_object('flame_id', v_session.flame_id, 'seconds_applied', v_apply);
    v_to_add := v_to_add - v_apply;
  end loop;

  -- Bank the remainder
  if v_to_add > 0 then
    update public.user_states
    set fuel_balance_seconds = fuel_balance_seconds + v_to_add
    where user_id = p_user_id;
  end if;

  return jsonb_build_object(
    'applied', v_applied,
    'remainder_seconds_added', v_to_add,
    'canister_seconds', v_canister_seconds
  );
end;
$$;

revoke execute on function public.refill_fuel(uuid, uuid, date)
  from public, anon, authenticated;
