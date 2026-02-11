-- Weekly fuel budget overrides (per-week customization over defaults)
create table public.weekly_fuel_overrides (
  user_id uuid not null references auth.users(id) on delete cascade,
  week_start date not null,
  day_of_week smallint not null check (day_of_week between 0 and 6),
  minutes integer not null,
  primary key (user_id, week_start, day_of_week)
);

-- Weekly flame assignment overrides
create table public.weekly_flame_overrides (
  user_id uuid not null references auth.users(id) on delete cascade,
  week_start date not null,
  flame_id uuid not null references public.flames(id) on delete cascade,
  day_of_week smallint not null check (day_of_week between 0 and 6),
  primary key (user_id, week_start, flame_id, day_of_week)
);

-- Indexes for faster queries
create index weekly_fuel_overrides_user_week_idx
  on public.weekly_fuel_overrides(user_id, week_start);
create index weekly_flame_overrides_user_week_idx
  on public.weekly_flame_overrides(user_id, week_start);

-- Enable RLS
alter table public.weekly_fuel_overrides enable row level security;
alter table public.weekly_flame_overrides enable row level security;

-- Weekly fuel overrides: direct user_id checks (same pattern as fuel_budgets)
create policy "Users can view own weekly_fuel_overrides"
  on public.weekly_fuel_overrides for select
  using (auth.uid() = user_id);

create policy "Users can insert own weekly_fuel_overrides"
  on public.weekly_fuel_overrides for insert
  with check (auth.uid() = user_id);

create policy "Users can update own weekly_fuel_overrides"
  on public.weekly_fuel_overrides for update
  using (auth.uid() = user_id);

create policy "Users can delete own weekly_fuel_overrides"
  on public.weekly_fuel_overrides for delete
  using (auth.uid() = user_id);

-- Weekly flame overrides: direct user_id checks
create policy "Users can view own weekly_flame_overrides"
  on public.weekly_flame_overrides for select
  using (auth.uid() = user_id);

create policy "Users can insert own weekly_flame_overrides"
  on public.weekly_flame_overrides for insert
  with check (auth.uid() = user_id);

create policy "Users can update own weekly_flame_overrides"
  on public.weekly_flame_overrides for update
  using (auth.uid() = user_id);

create policy "Users can delete own weekly_flame_overrides"
  on public.weekly_flame_overrides for delete
  using (auth.uid() = user_id);
