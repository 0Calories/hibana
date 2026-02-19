-- Unique constraint to prevent double-credit at DB level
alter table public.spark_transactions
  add constraint spark_transactions_reference_reason_unique
  unique (reference_id, reason);

-- Atomic RPC: credit sparks for sealing a flame session.
-- Returns the number of sparks credited (0 if already credited or invalid).
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
