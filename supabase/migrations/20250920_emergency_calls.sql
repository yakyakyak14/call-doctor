-- Create emergency_calls table for server-side logging
create table if not exists public.emergency_calls (
  id uuid primary key default gen_random_uuid(),
  to_number text not null,
  call_id text,
  source text,
  coords jsonb,
  ip text,
  user_id uuid references auth.users(id) on delete set null,
  user_agent text,
  created_at timestamptz not null default now()
);

-- Enable Row Level Security
alter table public.emergency_calls enable row level security;

-- Allow inserts from anyone (including anon) with minimal risk; data is non-sensitive
create policy if not exists emergency_calls_insert_public
  on public.emergency_calls
  for insert
  to public
  with check (true);

-- Optional: restrict selects to authenticated users (or disable entirely)
create policy if not exists emergency_calls_select_self
  on public.emergency_calls
  for select
  to authenticated
  using (true);

-- Optional: index to speed up rate limiting queries by ip and time
create index if not exists emergency_calls_ip_created_at_idx on public.emergency_calls (ip, created_at);
