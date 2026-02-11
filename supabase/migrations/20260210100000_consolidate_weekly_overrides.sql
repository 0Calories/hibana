-- Consolidate weekly_fuel_overrides and weekly_flame_overrides into a single table
drop table if exists public.weekly_flame_overrides;
drop table if exists public.weekly_fuel_overrides;

create table public.weekly_schedule_overrides (
  user_id uuid not null references auth.users(id) on delete cascade,
  week_start date not null,
  day_of_week smallint not null check (day_of_week between 0 and 6),
  minutes integer not null,
  flame_ids uuid[] not null default '{}',
  primary key (user_id, week_start, day_of_week)
);

create index weekly_schedule_overrides_user_week_idx
  on public.weekly_schedule_overrides(user_id, week_start);

alter table public.weekly_schedule_overrides enable row level security;

create policy "Users can view own weekly_schedule_overrides"
  on public.weekly_schedule_overrides for select
  using (auth.uid() = user_id);

create policy "Users can insert own weekly_schedule_overrides"
  on public.weekly_schedule_overrides for insert
  with check (auth.uid() = user_id);

create policy "Users can update own weekly_schedule_overrides"
  on public.weekly_schedule_overrides for update
  using (auth.uid() = user_id);

create policy "Users can delete own weekly_schedule_overrides"
  on public.weekly_schedule_overrides for delete
  using (auth.uid() = user_id);
