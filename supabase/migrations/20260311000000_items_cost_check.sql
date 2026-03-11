-- Ensure item costs are always positive to prevent free/negative-cost exploits
alter table public.items
  add constraint items_cost_sparks_positive check (cost_sparks > 0);
