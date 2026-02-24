-- Rename "seal" terminology to "completion" across columns, RPCs, and data.

-- 1. Rename column: flames.seal_threshold_minutes → completion_threshold_minutes
alter table public.flames
  rename column seal_threshold_minutes to completion_threshold_minutes;

-- 2. Update existing spark transaction reasons: 'seal' → 'completion'
update public.spark_transactions
set reason = 'completion'
where reason = 'seal';

-- 3. Recreate RPC with new name: credit_completion_sparks
--    (uses 'completion' as the transaction reason)
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
  -- Guard: caller must be the target user, and amount must be positive
  if auth.uid() is null or auth.uid() <> p_user_id or p_amount <= 0 then
    return 0;
  end if;

  -- Guard: session must belong to the caller (direct column check)
  if not exists (
    select 1
    from public.flame_sessions fs
    where fs.id = p_session_id
      and fs.user_id = auth.uid()
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

-- 4. Drop the old RPC
drop function if exists public.credit_seal_sparks(uuid, uuid, integer);
