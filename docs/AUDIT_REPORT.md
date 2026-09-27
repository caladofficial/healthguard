# HealthGuard — pipeline refactor, UI restructure & full-site QA audit

Date: 2026-09-27 · Site: https://healthguard-evolvex1.vercel.app · Branch: `main`

---

## 0. Stack — correction to the brief

The brief assumed **Next.js/React**. The deployed application is **not** Next.js:

| | brief assumed | actually shipped |
|---|---|---|
| Frontend | Next.js / React | Plain-Node static generator (`build.mjs`, 42 HTML pages) |
| Data access | API routes / server components | Browser → Supabase PostgREST directly (publishable key + RLS) |
| Caching | ISR / SWR / React Query | none (a 4s `setInterval` poll on chat) |
| Migrations | versioned files | manual dashboard edits (until this audit) |

I did **not** rewrite the site into Next.js. That would have been a ground-up rebuild of
a working, user-reviewed product to satisfy a naming assumption. Instead I delivered the
*intent* of each requirement on the architecture that exists — see §3.

---

## 1. Data flow — before

```
browser (every page)                     Supabase
 ┌──────────────────────┐                ┌────────────────────────┐
 │ deck-app.js          │  fetch()       │ PostgREST  /rest/v1/*  │
 │ 52 direct .select()  │───────────────►│ RLS policies           │
 │ .insert() .update()  │  anon key      │ 6 tables · 16 policies │
 │ .count()  ×12 admin  │                │ 7 indexes (PKs only)   │
 │ auth.js  (session)   │───────────────►│ GoTrue    /auth/v1/*   │
 └──────────────────────┘                └────────────────────────┘
        no cache · no dedupe · no server-side layer · no migration files
```

Every one of the 52 database reads went straight from the browser to the table.
Duplicates: the doctor directory was fetched **3× per page render**
(`profiles?role=eq.doctor` ×3), and the patient's tokens/bookings/opinions were
fetched once on the deck and **again** on My Health.

## 2. Data flow — after

```
browser                          server-side (in-database)        tables
 ┌────────────────────┐          ┌──────────────────────────┐
 │ auth.js            │          │ SECURITY DEFINER funcs   │
 │  ├ TTL cache 20s   │  rpc()   │  hg_doctor_directory()   │──► profiles
 │  ├ single-flight   │─────────►│  hg_admin_stats()        │──► 6 tables
 │  └ invalidate      │          │  (no service key in JS)  │
 │     on write       │          └──────────────────────────┘
 │                    │  RLS-guarded direct reads (own rows only)
 │  select/insert/upd │─────────────────────────────────────────────► tables
 └────────────────────┘
                                 migrations: supabase/migrations/0002–0004
```

* Sensitive + aggregate reads now go through **SECURITY DEFINER functions** — the
  server-side layer the brief asked for, without shipping a service-role key to
  the browser (which an Edge function with the service key would have required).
* Remaining direct reads are **own-row** reads that RLS already scopes.
* 12 admin counters → **1** call. Doctor directory → cached, fetched once.

---

## 3. Issue list — severity, location, status

| # | Sev | Area | Finding | Fix | Status |
|---|-----|------|---------|-----|--------|
| 1 | **Critical** | Security / RLS | `profiles` SELECT policy was `USING (true)` — any signed-in user could read **every** profile row (all patients' name, age, sex, last-seen) from the browser | `0002_profiles_rls_tighten.sql`: own row **or** doctor rows **or** caller is doctor/admin | ✅ Fixed + tested |
| 2 | **High** | A11y / camouflage | Light theme repainted `.flow-step` / `.queue-list li` / `.checks li` to cream but kept the dark-theme text colour → cream text on cream, **1.0:1 (invisible)** | Light override sets `color: var(--ink-0)` too | ✅ Fixed |
| 3 | **High** | A11y / contrast | Accent text used `--acc-1` (#087255), which reads **2.27:1** on the dark surface — 22 selectors incl. every link, `.eyebrow`, stat numbers, step markers | New per-theme `--acc-ink` token (dark `#56c99b`, light `#087255`) | ✅ Fixed |
| 4 | **High** | Performance | Only PKs were indexed (7). Every deck query filtered/sorted on unindexed columns → sequential scans | `0003_query_indexes.sql`: **12** indexes on the real WHERE/JOIN/ORDER BY columns | ✅ Fixed |
| 5 | **Medium** | Pipeline | Admin dashboard issued **12 `count(*)` round trips** on every 5s tick | `hg_admin_stats()` — one call, admin-only | ✅ Fixed |
| 6 | **Medium** | Pipeline | Doctor directory fetched 3× per render; patient rows re-fetched between deck and My Health | TTL cache (20s) + single-flight dedupe + invalidate-on-write in `auth.js` | ✅ Fixed |
| 7 | **Medium** | A11y | v8-era hard-coded colours never adapted to theme: `#9db3a8` muted text (2.19:1 on cream), `.res-badge` `#082f27` (1.08:1 on dark), gold `#f5b914` labels/errors (1.74–3.85:1) | Retokened to `--ink-2`, `--text`, `--acc-ink`, `--ok-ink`, `--err-ink` | ✅ Fixed |
| 8 | **Medium** | UI structure | Admin deck stacked **5 sections** on one page (stats, bookings, queue, registration, users) | Split: `admin-deck` = live ops, new `admin-verification` route = accounts & users | ✅ Fixed |
| 9 | **Low** | Dead code | 13 CSS rules for components that no longer exist (old role-chooser, `.res-meta`, never-emitted code-highlight spans, unused pill aliases) | Removed | ✅ Fixed |
| 10 | **Low** | Process | The old contrast auditor could not see the cascade and reported **24 false failures** while missing the real ones in #2/#3 | Rewrote as cascade-aware v3 (see §5) | ✅ Fixed |
| 11 | Info | Links/assets | 5,369 internal links crawled across 42 pages | **0** broken links, **0** missing assets | ✅ Verified |
| 12 | Info | Content | Placeholder / TODO / lorem scan | **0** matches | ✅ Verified |
| 13 | Info | A11y | Colour-alone check — `sPill()` and `tPill()` render text labels ("waiting", "T0 emergency") inside every coloured pill | no change needed | ✅ Verified |
| 14 | Info | Not done | AI-monitoring / security-events admin pages were **not** created: the admin deck has no such sections today, so they would be new content, which the brief forbids | see §7 | ⚠️ Recommendation |

---

## 4. Accessibility result

| metric | before | after |
|---|---|---|
| WCAG AA contrast failures | **38** (real, after filtering the old tool's 24 false positives) | **0** |
| Unresolvable colour tokens | 2 | 0 |
| Theme-aware ink tokens | 0 | 4 (`--acc-ink`, `--ok-ink`, `--err-ink`, `--pill-ok-ink`) |

**No new hues were introduced.** The three new dark-mode values are tints of colours
already in the palette (`#56c99b` mint-green, `#dff6e8` mint, `#ff9c94` = tint of
`--emerg #d7574c`, matching the pre-existing `--pill-danger-ink: #ff9c94`).

Audit tool: `python3 tools/contrast_audit.py` → `reports/contrast_audit.md`.

---

## 5. Why the auditor had to be rebuilt first

The v2 auditor read each rule in isolation, so it could not know that
`html[data-theme="light"] .chip { background:#fffdf7 }` overrides
`.chip { background:#0b352c }`. It reported 24 failures that do not exist on screen —
and, worse, missed the cream-on-cream bugs in #2 completely. v3 models the browser:

* rules applied in file order, `main.css` then `app.css`, last declaration wins;
* base rules land in both themes, `html[data-theme=…]` rules only in theirs;
* multi-selector rules (`.a, .b`) are split — previously the whole string became
  one bogus selector, so theme overrides silently failed to apply;
* element-scoped custom properties (`.site-footer` re-declares `--ink-0` for its
  dark band in *both* themes) and inheritance into container children (`.foot-*`,
  `.mq-item`, `.code-block`);
* elements the theme hides (`opacity: 0`, e.g. the inactive theme-toggle icon) are
  skipped instead of flagged.

Each of those five behaviours removed a class of false positive, and the remaining
38 findings were then all real.

---

## 6. RLS verification (executed, not assumed)

Policies were exercised by impersonating real sessions inside the database
(`set local role 'authenticated'; set local "request.jwt.claims"`):

| test | expected | result |
|---|---|---|
| Patient reads `profiles` | own row + doctors only | **3 rows, 0 other patients** (was: all 6) |
| Doctor reads `profiles` | all (patient chart) | 6 rows ✅ |
| Patient calls `hg_admin_stats()` | denied | `P0001: hg_admin_stats: admins only` ✅ |
| Admin calls `hg_admin_stats()` | full counters | 12 keys returned ✅ |
| Patient calls `hg_doctor_directory()` | doctor list | 2 doctors ✅ |

Full policy expressions: `docs/SCHEMA.md`.

---

## 7. Recommendations (not done — they need your call)

1. **AI-monitoring / security-events admin pages.** The brief named them, but the
   admin deck has no such sections today; building them means inventing content,
   which conflicts with "add no new content". Say the word and I'll design them
   from the `triage_events` and `audit-security` material that already exists.
2. **Move the remaining direct reads behind functions.** Own-row reads through RLS
   are safe, but routing them through functions would let us drop table grants
   entirely. Larger change; worth doing before a clinical pilot.
3. **Rewrite into Next.js/React** if you want ISR/SWR and server components for
   real. That is a rebuild, not a refactor — I'd scope it as its own project.
4. **`hg_auto_confirm`** auto-confirms new signups. Fine for a demo; needs email
   confirmation before real patient data.

---

## 8. How to re-verify

```bash
python3 tools/contrast_audit.py     # contrast — must print FAIL: 0
python3 tools/gen_schema_doc.py     # regenerate docs/SCHEMA.md from the live DB
node build.mjs                      # rebuild all 42 pages
```

Shipped: migrations `supabase/migrations/0002…0004`, `tools/contrast_audit.py` (v3),
`tools/gen_schema_doc.py`, `docs/SCHEMA.md`, this report, and `reports/contrast_audit.md`.
