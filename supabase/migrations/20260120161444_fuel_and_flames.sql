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

  create table public.fuel_budgets (
    user_id uuid not null references auth.users(id) on delete cascade,
    day_of_week smallint not null check (day_of_week between 0 and 6),
    minutes integer not null default 0,
    primary key (user_id, day_of_week)
  );

  create table public.flame_schedules (
    flame_id uuid not null references public.flames(id) on delete cascade,
    day_of_week smallint not null check (day_of_week between 0 and 6),
    primary key (flame_id, day_of_week)
  );

  create table public.flame_sessions (
    id uuid primary key default gen_random_uuid(),
    flame_id uuid not null references public.flames(id) on delete cascade,
    date date not null default current_date,
    started_at timestamptz,
    ended_at timestamptz,
    duration_seconds integer not null default 0,
    is_completed boolean not null default false,
    notes text,
    created_at timestamptz not null default now()
  );

  -- Index for faster user queries
  create index flames_user_id_idx on public.flames(user_id);
  create index flame_sessions_flame_id_idx on public.flame_sessions(flame_id);
  create index flame_sessions_date_idx on public.flame_sessions(date);

  -- Enable RLS
  alter table public.flames enable row level security;
  alter table public.fuel_budgets enable row level security;
  alter table public.flame_schedules enable row level security;
  alter table public.flame_sessions enable row level security;

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

-- Users can only access their own fuel budgets
  create policy "Users can view own fuel_budgets"
    on public.fuel_budgets for select
    using (auth.uid() = user_id);

  create policy "Users can insert own fuel_budgets"
    on public.fuel_budgets for insert
    with check (auth.uid() = user_id);

  create policy "Users can update own fuel_budgets"
    on public.fuel_budgets for update
    using (auth.uid() = user_id);

  create policy "Users can delete own fuel_budgets"
    on public.fuel_budgets for delete
    using (auth.uid() = user_id);

-- Users can only access schedules for their own flames
  create policy "Users can view own flame_schedules"
    on public.flame_schedules for select
    using (exists (
      select 1 from public.flames
      where flames.id = flame_schedules.flame_id
      and flames.user_id = auth.uid()
    ));

  create policy "Users can insert own flame_schedules"
    on public.flame_schedules for insert
    with check (exists (
      select 1 from public.flames
      where flames.id = flame_schedules.flame_id
      and flames.user_id = auth.uid()
    ));

  create policy "Users can update own flame_schedules"
    on public.flame_schedules for update
    using (exists (
      select 1 from public.flames
      where flames.id = flame_schedules.flame_id
      and flames.user_id = auth.uid()
    ));

  create policy "Users can delete own flame_schedules"
    on public.flame_schedules for delete
    using (exists (
      select 1 from public.flames
      where flames.id = flame_schedules.flame_id
      and flames.user_id = auth.uid()
    ));

-- Users can only access sessions for their own flames
create policy "Users can view own flame_sessions"
    on public.flame_sessions for select
    using (exists (
      select 1 from public.flames
      where flames.id = flame_sessions.flame_id
      and flames.user_id = auth.uid()
    ));

  create policy "Users can insert own flame_sessions"
    on public.flame_sessions for insert
    with check (exists (
      select 1 from public.flames
      where flames.id = flame_sessions.flame_id
      and flames.user_id = auth.uid()
    ));

  create policy "Users can update own flame_sessions"
    on public.flame_sessions for update
    using (exists (
      select 1 from public.flames
      where flames.id = flame_sessions.flame_id
      and flames.user_id = auth.uid()
    ));

  create policy "Users can delete own flame_sessions"
    on public.flame_sessions for delete
    using (exists (
      select 1 from public.flames
      where flames.id = flame_sessions.flame_id
      and flames.user_id = auth.uid()
    ));
