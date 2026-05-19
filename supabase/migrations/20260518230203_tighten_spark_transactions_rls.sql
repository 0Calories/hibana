-- Tighten RLS policies on spark_transactions: SELECT-only for clients.
--
-- spark_transactions is mutated only by SECURITY DEFINER RPCs
-- (purchase_item, credit_completion_sparks). Those bypass RLS, so the
-- client-facing INSERT/UPDATE/DELETE policies are unnecessary attack
-- surface. Drop them and keep SELECT so users can read their own ledger.

drop policy if exists "Users can insert own spark_transactions"
  on public.spark_transactions;

drop policy if exists "Users can update own spark_transactions"
  on public.spark_transactions;

drop policy if exists "Users can delete own spark_transactions"
  on public.spark_transactions;
