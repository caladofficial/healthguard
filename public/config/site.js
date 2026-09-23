/* HealthGuard — runtime configuration (public values only).
 * EVOLVEX IT SOLUTIONS PVT. LTD.
 *
 * WHY: the front-end is prepared for Supabase (auth + Postgres + storage) but
 * must NEVER contain service-role secrets. Only publishable values belong here;
 * everything privileged stays server-side in .env. This module is the single
 * place to wire the client SDK once auth screens are attached.
 */
window.HealthGuardConfig = {
  supabase: {
    url: 'https://uopivvbgkfxlptgzfdrk.supabase.co',
    publishableKey: 'sb_publishable_BnnM3gFD-fI5k-tO4zmSIw_9yShmVRQ',
    jwksUrl: 'https://uopivvbgkfxlptgzfdrk.supabase.co/auth/v1/.well-known/jwks.json'
  },
  product: 'HealthGuard',
  company: 'EVOLVEX IT SOLUTIONS PVT. LTD.'
};
