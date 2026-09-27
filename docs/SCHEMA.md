# HealthGuard — database schema & RLS reference

Generated from the live Supabase catalogue by `tools/gen_schema_doc.py`.

| table | rows |
|---|---|
| `bookings` | 3 |
| `chat_messages` | 1 |
| `opinion_requests` | 1 |
| `profiles` | 6 |
| `tokens` | 3 |
| `triage_events` | 6 |

## `bookings`

| column | type | null | default |
|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() |
| `patient_id` | uuid | NO |  |
| `doctor_id` | uuid | NO |  |
| `patient_name` | text | YES | ''::text |
| `doctor_name` | text | YES | ''::text |
| `slot_date` | date | NO |  |
| `slot_time` | text | NO |  |
| `reason` | text | YES | ''::text |
| `mode` | text | NO | 'video'::text |
| `status` | text | NO | 'pending'::text |
| `created_at` | timestamp with time zone | YES | now() |
| `updated_at` | timestamp with time zone | YES | now() |

Constraints:
- `bookings_mode_check` — `CHECK ((mode = ANY (ARRAY['video'::text, 'in_person'::text])))`
- `bookings_pkey` — `PRIMARY KEY (id)`
- `bookings_status_check` — `CHECK ((status = ANY (ARRAY['pending'::text, 'accepted'::text, 'declined'::text, 'completed'::text, 'cancelled'::text])))`

## `chat_messages`

| column | type | null | default |
|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() |
| `booking_id` | uuid | NO |  |
| `sender_id` | uuid | NO |  |
| `sender_name` | text | YES | ''::text |
| `body` | text | NO |  |
| `created_at` | timestamp with time zone | YES | now() |

Constraints:
- `chat_messages_booking_id_fkey` — `FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE`
- `chat_messages_pkey` — `PRIMARY KEY (id)`

## `opinion_requests`

| column | type | null | default |
|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() |
| `patient_id` | uuid | NO |  |
| `patient_name` | text | YES | ''::text |
| `doctor_id` | uuid | NO |  |
| `doctor_name` | text | YES | ''::text |
| `kind` | text | NO | 'report'::text |
| `title` | text | YES | ''::text |
| `content` | jsonb | NO | '{}'::jsonb |
| `doctor_note` | text | YES | ''::text |
| `status` | text | NO | 'open'::text |
| `created_at` | timestamp with time zone | YES | now() |
| `answered_at` | timestamp with time zone | YES |  |

Constraints:
- `opinion_requests_kind_check` — `CHECK ((kind = ANY (ARRAY['report'::text, 'prescription'::text])))`
- `opinion_requests_pkey` — `PRIMARY KEY (id)`
- `opinion_requests_status_check` — `CHECK ((status = ANY (ARRAY['open'::text, 'answered'::text])))`

## `profiles`

| column | type | null | default |
|---|---|---|---|
| `user_id` | uuid | NO |  |
| `role` | text | NO |  |
| `full_name` | text | NO | ''::text |
| `specialty` | text | YES | ''::text |
| `verified` | boolean | YES | false |
| `last_seen_at` | timestamp with time zone | YES | now() |
| `created_at` | timestamp with time zone | YES | now() |
| `age` | smallint | YES |  |
| `sex` | text | YES |  |

Constraints:
- `profiles_pkey` — `PRIMARY KEY (user_id)`
- `profiles_role_check` — `CHECK ((role = ANY (ARRAY['patient'::text, 'doctor'::text, 'admin'::text])))`

## `tokens`

| column | type | null | default |
|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() |
| `user_id` | uuid | NO |  |
| `patient_name` | text | NO | ''::text |
| `day` | date | NO | CURRENT_DATE |
| `token_no` | integer | NO | 1 |
| `urgency` | integer | NO | 3 |
| `note` | text | YES | ''::text |
| `status` | text | NO | 'waiting'::text |
| `created_at` | timestamp with time zone | YES | now() |

Constraints:
- `tokens_pkey` — `PRIMARY KEY (id)`
- `tokens_status_check` — `CHECK ((status = ANY (ARRAY['waiting'::text, 'in_consult'::text, 'done'::text, 'cancelled'::text])))`
- `tokens_urgency_check` — `CHECK (((urgency >= 0) AND (urgency <= 4)))`

## `triage_events`

| column | type | null | default |
|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() |
| `user_id` | uuid | YES |  |
| `payload` | jsonb | YES |  |
| `created_at` | timestamp with time zone | YES | now() |

Constraints:
- `triage_events_pkey` — `PRIMARY KEY (id)`

## Indexes

| table | index | definition |
|---|---|---|
| `bookings` | `bookings_doctor_idx` | `USING btree (doctor_id, slot_date DESC)` |
| `bookings` | `bookings_patient_idx` | `USING btree (patient_id, created_at DESC)` |
| `bookings` | `bookings_pkey` | `USING btree (id)` |
| `bookings` | `bookings_slot_uniq` | `USING btree (doctor_id, slot_date, slot_time) WHERE (status = ANY (ARRAY['pending'::text, 'accep` |
| `bookings` | `bookings_status_idx` | `USING btree (status)` |
| `chat_messages` | `chat_booking_idx` | `USING btree (booking_id, created_at)` |
| `chat_messages` | `chat_messages_pkey` | `USING btree (id)` |
| `opinion_requests` | `opinion_requests_pkey` | `USING btree (id)` |
| `opinion_requests` | `opinions_doctor_idx` | `USING btree (doctor_id, created_at DESC)` |
| `opinion_requests` | `opinions_patient_idx` | `USING btree (patient_id, created_at DESC)` |
| `opinion_requests` | `opinions_status_idx` | `USING btree (status)` |
| `profiles` | `profiles_pkey` | `USING btree (user_id)` |
| `profiles` | `profiles_role_idx` | `USING btree (role)` |
| `profiles` | `profiles_role_seen_idx` | `USING btree (role, last_seen_at DESC)` |
| `tokens` | `tokens_day_status_idx` | `USING btree (day, status, urgency, token_no)` |
| `tokens` | `tokens_pkey` | `USING btree (id)` |
| `tokens` | `tokens_user_created_idx` | `USING btree (user_id, created_at DESC)` |
| `triage_events` | `triage_events_pkey` | `USING btree (id)` |
| `triage_events` | `triage_user_idx` | `USING btree (user_id, created_at DESC)` |

## Row-level security

| table | policy | command | visible / writable rows |
|---|---|---|---|
| `bookings` | `bookings_ins` | INSERT | `(patient_id = auth.uid())` |
| `bookings` | `bookings_sel` | SELECT | `((patient_id = auth.uid()) OR (doctor_id = auth.uid()) OR hg_is_admin())` |
| `bookings` | `bookings_upd` | UPDATE | `((patient_id = auth.uid()) OR (doctor_id = auth.uid()) OR hg_is_admin())` |
| `chat_messages` | `chat_ins` | INSERT | `(sender_id = auth.uid())` |
| `chat_messages` | `chat_sel` | SELECT | `((EXISTS ( SELECT 1 FROM bookings b WHERE ((b.id = chat_messages.booking_id) AND ((b.patient_id = auth.uid()) OR (b.doct` |
| `opinion_requests` | `opins_ins` | INSERT | `(patient_id = auth.uid())` |
| `opinion_requests` | `opins_sel` | SELECT | `((patient_id = auth.uid()) OR (doctor_id = auth.uid()) OR hg_is_admin())` |
| `opinion_requests` | `opins_upd` | UPDATE | `((doctor_id = auth.uid()) OR (patient_id = auth.uid()) OR hg_is_admin())` |
| `profiles` | `profiles_ins` | INSERT | `(user_id = auth.uid())` |
| `profiles` | `profiles_sel` | SELECT | `((user_id = auth.uid()) OR (role = 'doctor'::text) OR hg_is_doctor() OR hg_is_admin())` |
| `profiles` | `profiles_upd` | UPDATE | `((user_id = auth.uid()) OR hg_is_admin())` |
| `tokens` | `tokens_ins` | INSERT | `(user_id = auth.uid())` |
| `tokens` | `tokens_sel` | SELECT | `((user_id = auth.uid()) OR hg_is_admin() OR hg_is_doctor())` |
| `tokens` | `tokens_upd` | UPDATE | `((user_id = auth.uid()) OR hg_is_admin() OR hg_is_doctor())` |
| `triage_events` | `hg_insert_own` | INSERT | `(auth.uid() = user_id)` |
| `triage_events` | `hg_select_own` | SELECT | `(auth.uid() = user_id)` |

## Functions

| function | returns | SECURITY DEFINER |
|---|---|---|
| `hg_admin_stats()` | jsonb | yes |
| `hg_auto_confirm()` | trigger | yes |
| `hg_doctor_directory()` | TABLE(user_id uuid, full_name text, spec | yes |
| `hg_is_admin()` | boolean | yes |
| `hg_is_doctor()` | boolean | yes |
| `hg_profiles_role_guard()` | trigger | no |
| `hg_register_doctor(p_email text, p_password text, p_full_name text, p_specialty text, p_age smallint, p_sex text)` | text | yes |
