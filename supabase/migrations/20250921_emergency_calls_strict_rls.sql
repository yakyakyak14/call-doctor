-- Stricter RLS for emergency_calls: remove public insert policy so only service-role can insert
-- Service role bypasses RLS, so Edge Functions using SERVICE_ROLE can still insert.

drop policy if exists emergency_calls_insert_public on public.emergency_calls;

-- (Optional) keep select for authenticated users; comment out to restrict further
-- create policy emergency_calls_select_self on public.emergency_calls for select to authenticated using (true);
