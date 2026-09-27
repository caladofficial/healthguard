-- 0002 · tighten profiles SELECT
-- WHY: profiles_sel used `USING (true)`, so ANY authenticated user could read
-- every row in profiles - i.e. every patient's full name, age, sex and last_seen
-- (PII) - by calling /rest/v1/profiles from the browser. Severity: HIGH (data
-- leak across tenants, not just a policy smell).
-- AFTER: a caller sees (a) their own row, (b) doctor rows (the public booking
-- directory a patient needs to choose a clinician), or (c) everything, if they
-- are themselves a doctor (patient chart) or an admin (operations).
drop policy if exists profiles_sel on public.profiles;

create policy profiles_sel on public.profiles
  for select to authenticated
  using (
    user_id = auth.uid()
    or role = 'doctor'
    or public.hg_is_doctor()
    or public.hg_is_admin()
  );
