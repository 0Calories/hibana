-- Fix items SELECT policy: add is_active filter to match intent
drop policy "Authenticated users can view active items" on public.items;

create policy "Authenticated users can view active items"
  on public.items for select
  using (auth.uid() is not null and is_active = true);
