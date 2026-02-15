-- Add per-flame time allocations as a parallel array to flame_ids
ALTER TABLE public.weekly_schedule_overrides
  ADD COLUMN flame_minutes integer[] NOT NULL DEFAULT '{}';
