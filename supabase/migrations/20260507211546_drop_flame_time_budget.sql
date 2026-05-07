-- Drop time_budget_minutes from flames now that the daily-intent flow stores
-- per-day target_seconds on flame_sessions. Flame creation no longer takes a
-- time goal; targets are set per session via the planning canvas.

alter table public.flames
  drop column time_budget_minutes;
