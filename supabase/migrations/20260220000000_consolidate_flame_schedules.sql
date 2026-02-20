-- Consolidate flame scheduling tables
-- Merges fuel_budgets, flame_schedules, and weekly_schedule_overrides
-- into a single flame_schedules table (rolling weekly template, max 7 rows per user).
-- Also removes is_daily from flames.

-- 1. Rename old flame_schedules to avoid name conflict
ALTER TABLE public.flame_schedules RENAME TO _flame_schedules_old;

-- 2. Create new flame_schedules (rolling weekly template)
CREATE TABLE public.flame_schedules (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day_of_week smallint NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  fuel_budget integer NOT NULL DEFAULT 0,
  flame_ids uuid[] NOT NULL DEFAULT '{}',
  flame_minutes integer[] NOT NULL DEFAULT '{}',
  PRIMARY KEY (user_id, day_of_week)
);
CREATE INDEX flame_schedules_user_id_idx ON public.flame_schedules(user_id);

-- 3. Migrate data: latest week from weekly_schedule_overrides per user/day
INSERT INTO public.flame_schedules (user_id, day_of_week, fuel_budget, flame_ids, flame_minutes)
SELECT DISTINCT ON (user_id, day_of_week)
  user_id, day_of_week, minutes, flame_ids, flame_minutes
FROM public.weekly_schedule_overrides
ORDER BY user_id, day_of_week, week_start DESC;

-- 4. Backfill from fuel_budgets for users/days with no override data
DO $$
DECLARE
  r RECORD;
  daily_ids uuid[];
  sched_ids uuid[];
  combined uuid[];
BEGIN
  FOR r IN
    SELECT fb.user_id, fb.day_of_week, fb.minutes
    FROM public.fuel_budgets fb
    WHERE NOT EXISTS (
      SELECT 1 FROM public.flame_schedules fs
      WHERE fs.user_id = fb.user_id AND fs.day_of_week = fb.day_of_week
    )
  LOOP
    SELECT COALESCE(array_agg(DISTINCT f.id), '{}') INTO daily_ids
    FROM public.flames f
    WHERE f.user_id = r.user_id AND f.is_daily = true AND f.is_archived = false;

    SELECT COALESCE(array_agg(DISTINCT fso.flame_id), '{}') INTO sched_ids
    FROM public._flame_schedules_old fso
    JOIN public.flames f ON f.id = fso.flame_id
    WHERE f.user_id = r.user_id AND fso.day_of_week = r.day_of_week AND f.is_archived = false;

    combined := daily_ids || sched_ids;

    INSERT INTO public.flame_schedules (user_id, day_of_week, fuel_budget, flame_ids, flame_minutes)
    VALUES (r.user_id, r.day_of_week, r.minutes, combined, '{}');
  END LOOP;
END $$;

-- 5. RLS
ALTER TABLE public.flame_schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own flame_schedules" ON public.flame_schedules FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own flame_schedules" ON public.flame_schedules FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own flame_schedules" ON public.flame_schedules FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own flame_schedules" ON public.flame_schedules FOR DELETE USING (auth.uid() = user_id);

-- 6. Drop old tables
DROP TABLE public.weekly_schedule_overrides;
DROP TABLE public._flame_schedules_old;
DROP TABLE public.fuel_budgets;

-- 7. Remove is_daily from flames
ALTER TABLE public.flames DROP COLUMN is_daily;
