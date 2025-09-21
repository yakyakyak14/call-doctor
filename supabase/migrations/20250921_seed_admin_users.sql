-- Seed initial admin email(s). Update this list as needed.
insert into public.admin_users (email)
values
  ('admin@call-doctor.com')
on conflict (email) do nothing;
