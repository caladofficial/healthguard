# Supabase — prepared for HealthGuard backend attachment
# EVOLVEX IT SOLUTIONS PVT. LTD.
#
# Planned schema follows the spec's normalized schema + FHIR alignment:
#   users, patients, doctors, doctor_credentials, organizations,
#   appointments, tokens, encounters, documents, document_versions,
#   observations, conditions, medications, prescriptions, consents,
#   notifications, audit_events, ai_jobs, ai_outputs, model_versions
#
# Row Level Security is mandatory on every table (object-level authorization).
# Production patient data ≠ model training data ≠ research data.

export const SUPABASE_URL = 'https://uopivvbgkfxlptgzfdrk.supabase.co';
export const SUPABASE_JWKS_URL = 'https://uopivvbgkfxlptgzfdrk.supabase.co/auth/v1/.well-known/jwks.json';
// Publishable (anon-safe) key — service-role/DB credentials stay in .env only.
export const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_BnnM3gFD-fI5k-tO4zmSIw_9yShmVRQ';
