-- Add fuel_balance_seconds to user_states.
-- Stored in seconds for unit consistency with flame_sessions.duration_seconds.
-- Default 14400 = 240 minutes = the new-player baseline.
-- CHECK constraint enforces non-negative; balance is decremented during tending
-- via record_fuel_burn (which also caps at zero).

alter table public.user_states
  add column fuel_balance_seconds integer not null default 14400
    check (fuel_balance_seconds >= 0);
