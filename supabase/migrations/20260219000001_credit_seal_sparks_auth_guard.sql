-- Add auth.uid() and session ownership validation to credit_seal_sparks.
-- SECURITY DEFINER bypasses RLS, so we must guard against cross-user abuse.
create or replace function public.credit_seal_sparks(
  p_user_id uuid,
  p_session_id uuid,
  p_amount integer
)
returns integer
language plpgsql
security definer
as $$
declare
  v_inserted boolean;
begin
  -- Guard: caller must be the target user, and amount must be positive
  if auth.uid() is null or auth.uid() <> p_user_id or p_amount <= 0 then
    return 0;
  end if;

  -- Guard: session must belong to the caller
  if not exists (
    select 1
    from public.flame_sessions fs
    join public.flames f on f.id = fs.flame_id
    where fs.id = p_session_id
      and f.user_id = auth.uid()
  ) then
    return 0;
  end if;

  -- Attempt insert; ON CONFLICT means already credited
  insert into public.spark_transactions (user_id, amount, reason, reference_id)
  values (p_user_id, p_amount, 'seal', p_session_id)
  on conflict (reference_id, reason) do nothing;

  -- Check if the row was actually inserted
  get diagnostics v_inserted = row_count;

  if not v_inserted then
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
