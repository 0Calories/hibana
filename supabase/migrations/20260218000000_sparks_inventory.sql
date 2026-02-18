-- Sparks currency & inventory foundation
-- Tables: user_state, items, user_inventory, spark_transactions

-- ============================================================
-- user_state — one row per user for hot scalar state
-- ============================================================
create table public.user_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  sparks_balance integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_state enable row level security;

create policy "Users can view own user_state"
  on public.user_state for select
  using (auth.uid() = user_id);

create policy "Users can insert own user_state"
  on public.user_state for insert
  with check (auth.uid() = user_id);

create policy "Users can update own user_state"
  on public.user_state for update
  using (auth.uid() = user_id);

create policy "Users can delete own user_state"
  on public.user_state for delete
  using (auth.uid() = user_id);

-- ============================================================
-- items — catalog of purchasable/earnable items
-- ============================================================
create table public.items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  type text not null,
  cost_sparks integer not null default 0,
  metadata jsonb not null default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.items enable row level security;

create policy "Authenticated users can view active items"
  on public.items for select
  using (auth.uid() is not null);

-- ============================================================
-- user_inventory — items a user owns
-- ============================================================
create table public.user_inventory (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  item_id uuid not null references public.items(id) on delete cascade,
  quantity integer not null default 1,
  is_equipped boolean not null default false,
  acquired_at timestamptz not null default now(),
  unique (user_id, item_id)
);

create index user_inventory_user_id_idx on public.user_inventory(user_id);

alter table public.user_inventory enable row level security;

create policy "Users can view own user_inventory"
  on public.user_inventory for select
  using (auth.uid() = user_id);

create policy "Users can insert own user_inventory"
  on public.user_inventory for insert
  with check (auth.uid() = user_id);

create policy "Users can update own user_inventory"
  on public.user_inventory for update
  using (auth.uid() = user_id);

create policy "Users can delete own user_inventory"
  on public.user_inventory for delete
  using (auth.uid() = user_id);

-- ============================================================
-- spark_transactions — ledger/audit trail
-- ============================================================
create table public.spark_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount integer not null,
  reason text not null,
  reference_id uuid,
  created_at timestamptz not null default now()
);

create index spark_transactions_user_id_idx on public.spark_transactions(user_id);
create index spark_transactions_created_at_idx on public.spark_transactions(created_at);

alter table public.spark_transactions enable row level security;

create policy "Users can view own spark_transactions"
  on public.spark_transactions for select
  using (auth.uid() = user_id);

create policy "Users can insert own spark_transactions"
  on public.spark_transactions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own spark_transactions"
  on public.spark_transactions for update
  using (auth.uid() = user_id);

create policy "Users can delete own spark_transactions"
  on public.spark_transactions for delete
  using (auth.uid() = user_id);
