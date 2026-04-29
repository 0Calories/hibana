-- Heat & Leveling System
-- Adds persistent heat (XP) tracking and level computation for flames and users.

-- ============================================================
-- Add heat + level columns
-- ============================================================
alter table public.flames
  add column heat integer not null default 0,
  add column level integer not null default 1;
alter table public.user_state
  add column heat integer not null default 0,
  add column level integer not null default 1;
-- ============================================================
-- heat_transactions — ledger for heat awards (parallels spark_transactions)
-- ============================================================
create table public.heat_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  flame_id uuid not null references public.flames(id) on delete cascade,
  amount integer not null,
  reason text not null,
  reference_id uuid,
  created_at timestamptz not null default now()
);
create index heat_transactions_user_id_idx on public.heat_transactions(user_id);
create index heat_transactions_created_at_idx on public.heat_transactions(created_at);
-- Idempotency: one heat award per (reference_id, reason)
alter table public.heat_transactions
  add constraint heat_transactions_reference_id_reason_key
  unique (reference_id, reason);
alter table public.heat_transactions enable row level security;
create policy "Users can view own heat_transactions"
  on public.heat_transactions for select
  using (auth.uid() = user_id);
-- ============================================================
-- compute_level_from_heat — SQL helper mirroring lib/heat.ts
-- Formula: 1 + floor(ln(heat/200 + 1) / ln(1.5))
-- ============================================================
create or replace function public.compute_level_from_heat(p_heat integer)
returns integer
language sql
immutable
as $$
  select greatest(1, 1 + floor(ln(p_heat::numeric / 200 + 1) / ln(1.5)))::integer;
$$;
-- ============================================================
-- credit_completion_rewards — unified RPC replacing credit_completion_sparks
-- Atomically credits both sparks and heat for a completed session.
-- Returns jsonb: { sparks, heat, flame_level, user_level }
-- ============================================================
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
  -- 1. Insert spark_transaction (idempotent)
  if p_sparks > 0 then
    insert into public.spark_transactions (user_id, amount, reason, reference_id)
    values (p_user_id, p_sparks, 'completion', p_session_id)
    on conflict (reference_id, reason) do nothing;

    get diagnostics v_rows = row_count;
    v_spark_inserted := v_rows > 0;

    if v_spark_inserted then
      update public.user_state
      set sparks_balance = sparks_balance + p_sparks,
          updated_at = now()
      where user_id = p_user_id;

      if not found then
        insert into public.user_state (user_id, sparks_balance)
        values (p_user_id, p_sparks)
        on conflict (user_id) do update
        set sparks_balance = user_state.sparks_balance + p_sparks,
            updated_at = now();
      end if;
    end if;
  end if;

  -- 2. Insert heat_transaction (idempotent, different table so no conflict with sparks)
  if p_heat > 0 then
    insert into public.heat_transactions (user_id, flame_id, amount, reason, reference_id)
    values (p_user_id, p_flame_id, p_heat, 'completion', p_session_id)
    on conflict (reference_id, reason) do nothing;

    get diagnostics v_rows = row_count;
    v_heat_inserted := v_rows > 0;

    if v_heat_inserted then
      -- Update flame heat + recompute level
      update public.flames
      set heat = heat + p_heat,
          level = compute_level_from_heat(heat + p_heat)
      where id = p_flame_id;

      -- Update user heat + recompute level
      update public.user_state
      set heat = heat + p_heat,
          level = compute_level_from_heat(heat + p_heat),
          updated_at = now()
      where user_id = p_user_id;

      if not found then
        insert into public.user_state (user_id, heat, level)
        values (p_user_id, p_heat, compute_level_from_heat(p_heat))
        on conflict (user_id) do update
        set heat = user_state.heat + p_heat,
            level = compute_level_from_heat(user_state.heat + p_heat),
            updated_at = now();
      end if;
    end if;
  end if;

  -- Read back final levels
  select level into v_flame_level from public.flames where id = p_flame_id;
  select level into v_user_level from public.user_state where user_id = p_user_id;

  return jsonb_build_object(
    'sparks', case when v_spark_inserted then p_sparks else 0 end,
    'heat', case when v_heat_inserted then p_heat else 0 end,
    'flame_level', coalesce(v_flame_level, 1),
    'user_level', coalesce(v_user_level, 1)
  );
end;
$$;
-- Revoke execute from client-facing roles (server-only via service_role)
revoke execute on function public.credit_completion_rewards(uuid, uuid, uuid, integer, integer)
  from public, anon, authenticated;
