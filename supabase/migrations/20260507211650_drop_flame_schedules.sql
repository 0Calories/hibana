-- Drop the flame_schedules table now that the rolling weekly template is
-- replaced by per-day session rows in flame_sessions. The daily-intent
-- planning ritual replaces this table's role entirely.

drop table public.flame_schedules;
