-- Ensure item costs are always positive to prevent free/negative-cost exploits.
-- Also fix the original default of 0 which would violate this constraint.
alter table public.items
  alter column cost_sparks drop default;

alter table public.items
  add constraint items_cost_sparks_positive check (cost_sparks > 0);
