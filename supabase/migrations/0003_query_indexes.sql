-- 0003 · indexes for every column used in a WHERE / JOIN / ORDER BY
-- WHY: the only indexes in the database were the primary keys (plus
-- bookings_slot_uniq). Every deck query filtered or sorted on unindexed
-- columns, so each one was a sequential scan that gets slower with every row.
-- Columns chosen from the actual query patterns in public/js/deck-app.js.
create index if not exists tokens_user_created_idx   on public.tokens (user_id, created_at desc);
create index if not exists tokens_day_status_idx     on public.tokens (day, status, urgency, token_no);
create index if not exists bookings_patient_idx      on public.bookings (patient_id, created_at desc);
create index if not exists bookings_doctor_idx       on public.bookings (doctor_id, slot_date desc);
create index if not exists bookings_status_idx       on public.bookings (status);
create index if not exists chat_booking_idx          on public.chat_messages (booking_id, created_at);
create index if not exists opinions_patient_idx      on public.opinion_requests (patient_id, created_at desc);
create index if not exists opinions_doctor_idx       on public.opinion_requests (doctor_id, created_at desc);
create index if not exists opinions_status_idx       on public.opinion_requests (status);
create index if not exists triage_user_idx           on public.triage_events (user_id, created_at desc);
create index if not exists profiles_role_idx         on public.profiles (role);
create index if not exists profiles_role_seen_idx    on public.profiles (role, last_seen_at desc);
