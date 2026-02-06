create table public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  created_at timestamptz not null default now(),
  constraint waitlist_email_unique unique (email)
);

-- Enable RLS
alter table public.waitlist enable row level security;

-- Allow anyone (including anonymous) to insert
create policy "Anyone can join waitlist"
  on public.waitlist for insert
  with check (true);
