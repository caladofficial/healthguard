-- 0004 · server-side read functions
-- WHY: the brief asks for data access behind server-side functions instead of
-- direct client calls to sensitive tables. Postgres SECURITY DEFINER functions
-- give exactly that (they run with definer rights inside the database, so no
-- service-role key ever reaches the browser) and they let one round trip do
-- what used to be twelve.
-- 1) doctor directory: the project the patient picks from when booking.
create or replace function public.hg_doctor_directory()
returns table (user_id uuid, full_name text, specialty text, verified boolean)
language sql stable security definer set search_path = public, auth
as $$
  select p.user_id, p.full_name, p.specialty, coalesce(p.verified, false)
  from public.profiles p
  where p.role = 'doctor'
  order by p.full_name;
$$;

-- 2) admin dashboard: 12 separate count(*) round trips collapse into one call,
--    and the function refuses to run for anybody but an admin.
create or replace function public.hg_admin_stats()
returns jsonb
language plpgsql stable security definer set search_path = public, auth
as $$
declare since timestamptz := now() - interval '7 days';
begin
  if not public.hg_is_admin() then
    raise exception 'hg_admin_stats: admins only';
  end if;
  return jsonb_build_object(
    'patients',      (select count(*) from public.profiles where role = 'patient'),
    'doctors',       (select count(*) from public.profiles where role = 'doctor'),
    'activePatients',(select count(*) from public.profiles where role = 'patient' and last_seen_at >= since),
    'activeDoctors', (select count(*) from public.profiles where role = 'doctor'  and last_seen_at >= since),
    'pending',       (select count(*) from public.bookings where status = 'pending'),
    'accepted',      (select count(*) from public.bookings where status = 'accepted'),
    'completed',     (select count(*) from public.bookings where status = 'completed'),
    'declined',      (select count(*) from public.bookings where status in ('declined','cancelled')),
    'tokensToday',   (select count(*) from public.tokens where day = (now() at time zone 'utc')::date and status <> 'cancelled'),
    'inConsult',     (select count(*) from public.tokens where day = (now() at time zone 'utc')::date and status = 'in_consult'),
    'urgent',        (select count(*) from public.tokens where day = (now() at time zone 'utc')::date and urgency <= 1 and status <> 'cancelled'),
    'openOpinions',  (select count(*) from public.opinion_requests where status = 'open')
  );
end;
$$;

revoke all on function public.hg_doctor_directory() from public, anon;
grant execute on function public.hg_doctor_directory() to authenticated;
revoke all on function public.hg_admin_stats() from public, anon;
grant execute on function public.hg_admin_stats() to authenticated;
