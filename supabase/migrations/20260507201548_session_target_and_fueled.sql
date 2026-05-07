-- Add target_seconds and fueled_seconds to flame_sessions.
-- target_seconds: the user's daily commitment for this flame, set when the
--   session row is inserted via the daily-plan flow. Nullable so historical
--   rows (created under the old schedule-driven flow) remain valid.
-- fueled_seconds: the portion of duration_seconds that was covered by fuel.
--   Backfilled to duration_seconds for historical rows (those were rewarded
--   under the old model where all tend time counted).

alter table public.flame_sessions
  add column target_seconds integer,
  add column fueled_seconds integer not null default 0
    check (fueled_seconds >= 0 and fueled_seconds <= duration_seconds);

-- Backfill historical fueled_seconds = duration_seconds.
update public.flame_sessions
  set fueled_seconds = duration_seconds
  where duration_seconds > 0;
