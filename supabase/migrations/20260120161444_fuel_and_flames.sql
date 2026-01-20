  create table public.flames (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    name text not null,
    icon text,
    color text,
    time_budget_minutes integer,
    tracking_type text not null check (tracking_type in ('time', 'count')),
    count_target integer,
    count_unit text,
    is_daily boolean not null default true,
    is_archived boolean not null default false,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
  );

  -- Index for faster user queries
  create index flames_user_id_idx on public.flames(user_id);

  -- Enable RLS
  alter table public.flames enable row level security;

  -- Flame management
  create policy "Users can view own flames"
    on public.flames for select
    using (auth.uid() = user_id);

  create policy "Users can insert own flames"
    on public.flames for insert
    with check (auth.uid() = user_id);

  create policy "Users can update own flames"
    on public.flames for update
    using (auth.uid() = user_id);

  create policy "Users can delete own flames"
    on public.flames for delete
    using (auth.uid() = user_id);