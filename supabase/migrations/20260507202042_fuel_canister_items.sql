-- Seed two fuel canister items into the catalog.
-- type='fuel_canister' is read by openCanister/refill_fuel; metadata.seconds
-- is the amount of fuel each canister grants.
-- cost_sparks values are intentionally low — canisters should feel ambient,
-- not gated. (Canister cost tuning is a separate tracked issue.)

insert into public.items (name, description, type, metadata, cost_sparks, is_active)
values
  ('Small Canister', '60 minutes of fuel', 'fuel_canister', '{"seconds": 3600}', 25, true),
  ('Large Canister', '240 minutes of fuel — small bulk discount', 'fuel_canister', '{"seconds": 14400}', 80, true)
on conflict do nothing;
