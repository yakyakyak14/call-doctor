-- Admin-only SELECT policy for emergency_calls using admin_users table

create table if not exists public.admin_users (
  email text primary key
);

create or replace function public.is_current_user_admin() returns boolean
language sql stable
as $$
  select exists(
    select 1
    from public.admin_users a
    where lower(a.email) = lower((auth.jwt() ->> 'email')::text)
  );
$$;

-- Replace prior select policy with admin-only select
drop policy if exists emergency_calls_select_self on public.emergency_calls;
create policy if not exists emergency_calls_select_admin
  on public.emergency_calls
  for select
  to authenticated
  using (public.is_current_user_admin());
