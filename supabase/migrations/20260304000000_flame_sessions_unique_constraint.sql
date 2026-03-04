-- Prevent duplicate sessions for the same flame on the same date.
-- Makes toggleSession idempotent at the DB level: concurrent INSERT races
-- hit the constraint instead of creating ghost rows.

-- 1. Clean up any existing duplicates (keep the row with the most progress)
delete from public.flame_sessions a
using public.flame_sessions b
where a.flame_id = b.flame_id
  and a.date = b.date
  and a.id <> b.id
  and (
    a.duration_seconds < b.duration_seconds
    or (a.duration_seconds = b.duration_seconds and a.created_at > b.created_at)
  );

-- 2. Add unique constraint
alter table public.flame_sessions
  add constraint flame_sessions_flame_id_date_key unique (flame_id, date);
