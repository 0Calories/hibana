-- Denormalize user_id onto flame_sessions for simpler RLS, better indexes,
-- and explicit query filtering without joining through flames.

-- 1. Add nullable column with FK
alter table public.flame_sessions
  add column user_id uuid references auth.users(id) on delete cascade;

-- 2. Backfill from flames
update public.flame_sessions
set user_id = f.user_id
from public.flames f
where f.id = flame_sessions.flame_id;

-- 3. Make NOT NULL now that all rows are populated
alter table public.flame_sessions
  alter column user_id set not null;

-- 4. Composite index for (user_id, date) queries
create index flame_sessions_user_id_date_idx
  on public.flame_sessions (user_id, date);

-- 5. Drop standalone date index (composite covers date-only lookups)
drop index if exists public.flame_sessions_date_idx;

-- 6. Recreate RLS policies with simple user_id check
drop policy if exists "Users can view own flame_sessions" on public.flame_sessions;
drop policy if exists "Users can insert own flame_sessions" on public.flame_sessions;
drop policy if exists "Users can update own flame_sessions" on public.flame_sessions;
drop policy if exists "Users can delete own flame_sessions" on public.flame_sessions;

create policy "Users can view own flame_sessions"
  on public.flame_sessions for select
  using (auth.uid() = user_id);

create policy "Users can insert own flame_sessions"
  on public.flame_sessions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own flame_sessions"
  on public.flame_sessions for update
  using (auth.uid() = user_id);

create policy "Users can delete own flame_sessions"
  on public.flame_sessions for delete
  using (auth.uid() = user_id);

-- 7. Update credit_seal_sparks RPC to check user_id directly
create or replace function public.credit_seal_sparks(
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
  values (p_user_id, p_amount, 'seal', p_session_id)
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
