-- record_fuel_burn — decrements the user's fuel balance and records the
-- burned portion as fueled_seconds on the session row.
-- Called from the pauseSession server action after toggleSession completes a pause.
-- Caller passes p_delta_seconds = the seconds elapsed during this pause cycle.
-- The RPC clamps the burn at the available balance (no negative balance possible).
-- Returns the seconds actually burned (0 if balance was empty).

create or replace function public.record_fuel_burn(
  p_user_id uuid,
  p_session_id uuid,
  p_delta_seconds integer
)
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_balance integer;
  v_burnable integer;
begin
  -- Guard: caller authorization
  if auth.uid() is null or auth.uid() <> p_user_id then
    return 0;
  end if;

  -- Guard: positive delta
  if p_delta_seconds is null or p_delta_seconds <= 0 then
    return 0;
  end if;

  -- Guard: session belongs to caller
  if not exists (
    select 1 from public.flame_sessions
    where id = p_session_id and user_id = p_user_id
  ) then
    return 0;
  end if;

  -- Lock balance row, compute burnable
  select fuel_balance_seconds into v_balance
  from public.user_states
  where user_id = p_user_id
  for update;

  if not found then
    return 0;
  end if;

  v_burnable := least(p_delta_seconds, v_balance);

  if v_burnable <= 0 then
    return 0;
  end if;

  -- Atomic: decrement balance, increment session fueled_seconds
  update public.user_states
  set fuel_balance_seconds = fuel_balance_seconds - v_burnable
  where user_id = p_user_id;

  update public.flame_sessions
  set fueled_seconds = fueled_seconds + v_burnable
  where id = p_session_id;

  return v_burnable;
end;
$$;

-- Revoke client-callable execute (caller is the pauseSession server action,
-- which uses createServiceClient or a similar elevated context).
revoke execute on function public.record_fuel_burn(uuid, uuid, integer)
  from public, anon, authenticated;
