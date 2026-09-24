// HealthGuard — PRODUCT pages (Login, Triage Check, My Health).
// WHY (Part H): market-ready product needs accounts and a working triage
// action — one dedicated page per feature (client standing rule).
import * as U from '../src/ui.mjs';

const DISCLAIMER = 'AI assistive triage — workflow urgency only, not diagnosis. Clinical decisions remain with qualified clinicians.';

const SYMPTOMS = [
  ['chest_pain', 'Chest pain'], ['dyspnea', 'Difficulty breathing'], ['abd_pain', 'Abdominal pain'],
  ['fever', 'Fever'], ['cough', 'Cough'], ['headache', 'Headache'], ['weakness', 'Weakness'],
  ['bleeding', 'Bleeding'], ['vomiting', 'Vomiting'], ['dizziness', 'Dizziness'],
  ['syncope', 'Fainting'], ['seizure', 'Seizure'], ['altered_mental', 'Confusion / altered mental state'],
  ['palpitations', 'Palpitations'], ['jaundice', 'Yellowing (jaundice)'], ['rash', 'Rash'],
];
const COMORB = [
  ['htn', 'High blood pressure'], ['dm', 'Diabetes'], ['cad_hf', 'Heart disease / heart failure'],
  ['copd', 'Lung disease (COPD/asthma)'], ['ckd', 'Kidney disease'], ['cancer', 'Cancer'],
  ['stroke_hx', 'Past stroke'], ['immuno', 'Weakened immunity'],
];

function field(id, label, opts = {}) {
  const { type = 'number', min, max, step, value, hint, required = true } = opts;
  return `<label class="fld" for="${id}">
    <span class="fld-l">${U.esc(label)}${required ? ' <b aria-hidden="true">*</b>' : ''}</span>
    <input class="fld-i" id="${id}" name="${id}" type="${type}" ${min !== undefined ? `min="${min}"` : ''} ${max !== undefined ? `max="${max}"` : ''} ${step !== undefined ? `step="${step}"` : ''} value="${value !== undefined ? value : ''}" ${required ? 'required' : ''} inputmode="${type === 'number' ? 'decimal' : 'text'}">
    ${hint ? `<span class="fld-h">${U.esc(hint)}</span>` : ''}
  </label>`;
}
function select(id, label, options, opts = {}) {
  return `<label class="fld" for="${id}">
    <span class="fld-l">${U.esc(label)} <b aria-hidden="true">*</b></span>
    <select class="fld-i" id="${id}" name="${id}" required>
      ${options.map(([v, t]) => `<option value="${v}">${U.esc(t)}</option>`).join('')}
    </select>
    ${opts.hint ? `<span class="fld-h">${U.esc(opts.hint)}</span>` : ''}
  </label>`;
}
function checks(name, items) {
  return `<div class="check-grid">${items.map(([v, t]) => `
    <label class="ck"><input type="checkbox" name="${name}" value="${v}"><span>${U.esc(t)}</span></label>`).join('')}
  </div>`;
}

export default [
  {
    slug: 'login',
    family: 'product',
    title: 'Sign In — Your HealthGuard Account',
    desc: 'Create your HealthGuard account or sign in to save triage checks to your private health record. Secure Supabase authentication, row-level private data.',
    body: () => [
      `<section class="section"><div class="wrap wrap-narrow">
        <p class="eyebrow" data-reveal>Account</p>
        <h1 class="h-sec" data-reveal>Sign in to HealthGuard</h1>
        <p class="sec-lead" data-reveal>Save triage checks to your private record. You can still run a triage check without an account — accounts add history, not gates.</p>
        <div class="auth-card" data-reveal>
          <div class="auth-tabs" role="tablist">
            <button class="auth-tab is-on" id="tabIn" role="tab" aria-selected="true">Sign in</button>
            <button class="auth-tab" id="tabUp" role="tab" aria-selected="false">Create account</button>
          </div>
          <form id="authForm" class="auth-form" novalidate>
            ${field('authEmail', 'Email', { type: 'email', hint: 'We never show your email to other users.' })}
            ${field('authPass', 'Password', { type: 'password', hint: 'Minimum 8 characters.' })}
            <button class="btn btn-primary btn-block" id="authSubmit" type="submit">Sign in</button>
            <p class="auth-msg" id="authMsg" role="status" aria-live="polite"></p>
          </form>
          <p class="auth-note">${U.esc(DISCLAIMER)}</p>
        </div>
      </div></section>`,
      U.related(['triage', 'my-health', 'audit-security'], ['Triage Check', 'My Health', 'Audit & Security']),
    ],
  },

  {
    slug: 'triage',
    family: 'product',
    title: 'Triage Check — Know How Urgent, Right Now',
    desc: 'Run a HealthGuard triage check: enter symptoms and vitals, get a T0–T4 workflow-urgency class with reason codes, confidence and risk ratio — powered by the distilled clinical model and deterministic red-flag rules. Urgency, not diagnosis.',
    art: 'art-triage.jpg',
    body: (a) => [
      U.hero({
        eyebrow: 'Live product · Triage Engine',
        title: 'Triage Check',
        lead: 'Enter what you (or the patient) feel and measure. Get a workflow-urgency class in milliseconds — T0 emergency to T4 follow-up — with reason codes you can read.',
        art: a,
        chips: ['Runs in your browser', 'Rules + model + review flag', 'T0–T4 urgency', 'Data stays on device'],
        actions: [
          { href: '#triageForm', label: 'Start the check' },
          { href: 'login.html', label: 'Sign in to save results' },
        ],
      }),
      U.principle('AI triage ≠ emergency diagnosis. This classifies workflow urgency — what to see first — never what the patient has.'),
      U.section({
        kicker: 'Intake', title: 'Symptoms & measurements', lead: 'Fields marked * are needed. If you are unsure about a measurement, use your best estimate — the review flag will say when the picture is unclear.',
        inner: `<form id="triageForm" class="triage-form" data-reveal>
          <fieldset class="fs"><legend>Vitals</legend><div class="fld-grid">
            ${field('f-age', 'Age (years)', { min: 1, max: 120 })}
            ${select('f-sex', 'Sex', [['0', 'Male'], ['1', 'Female']])}
            <label class="ck ck-fld" for="f-pregnancy"><input type="checkbox" id="f-pregnancy"><span>Pregnant</span></label>
            ${field('f-hr', 'Heart rate (bpm)', { min: 20, max: 250 })}
            ${field('f-sbp', 'Systolic BP (mmHg)', { min: 50, max: 260 })}
            ${field('f-dbp', 'Diastolic BP (mmHg)', { min: 20, max: 160 })}
            ${field('f-rr', 'Breaths / min', { min: 4, max: 60 })}
            ${field('f-temp', 'Temperature (°C)', { step: 0.1 })}
            ${field('f-spo2', 'SpO₂ (%)', { min: 50, max: 100 })}
            ${select('f-gcs', 'Consciousness (GCS)', [['15', '15 — fully alert'], ['14', '14'], ['13', '13'], ['12', '12'], ['11', '11'], ['10', '10'], ['9', '9'], ['8', '8 or less — barely responsive']])}
            ${select('f-pain', 'Pain (0–10)', Array.from({ length: 11 }, (_, i) => [String(i), i + (i === 0 ? ' — none' : i >= 8 ? ' — severe' : '')]))}
            ${field('f-onset', 'Hours since onset', { min: 0.1, step: 0.1 })}
            <label class="ck ck-fld" for="f-followup"><input type="checkbox" id="f-followup"><span>This is a follow-up visit</span></label>
          </div></fieldset>
          <fieldset class="fs"><legend>Symptoms right now</legend>${checks('sym', SYMPTOMS)}</fieldset>
          <fieldset class="fs"><legend>Background conditions</legend>${checks('com', COMORB)}</fieldset>
          <div class="triage-actions">
            <button class="btn btn-primary" type="submit">Run triage check</button>
            <p class="note note-warn">${U.esc('If someone is unconscious, struggling to breathe, has chest pain or heavy bleeding — call your local emergency number NOW. Do not wait for this form.')}</p>
          </div>
        </form>`,
      }),
      `<section class="section" id="triageResult" hidden><div class="wrap wrap-narrow">
        <p class="eyebrow">Result</p>
        <div class="result-card" id="resultCard"></div>
      </div></section>`,
      U.section({
        kicker: 'Under the hood', title: 'Rules first, model second, human always',
        inner: U.checks([
          'Deterministic red-flag rules can only escalate — never be talked down',
          'Distilled clinical model (gradient-boosted, trained on 100k protocol-labelled ED cases)',
          'Safety probability floors cap under-triage before output',
          'Model/rules disagreement → requires_human-review flag',
          'Reason codes for every decision · versioned rules + model',
          'Runs entirely in your browser — measurements never leave the device',
        ]) + U.note('Triage class is workflow urgency. It is not a diagnosis and not a substitute for a clinician.', 'warn'),
      }),
      U.related(['ai-triage', 'login', 'my-health'], ['AI Triage architecture', 'Sign in', 'My Health']),
    ],
  },

  {
    slug: 'my-health',
    family: 'product',
    title: 'My Health — Your Saved Triage Record',
    desc: 'Your private HealthGuard record: saved triage checks with urgency classes, reason codes and timestamps. Row-level private — only you can see it.',
    body: () => [
      `<section class="section"><div class="wrap wrap-narrow">
        <p class="eyebrow" data-reveal>Account · My Health</p>
        <h1 class="h-sec" data-reveal>Your triage record</h1>
        <p class="sec-lead" data-reveal>Every saved triage check with its urgency class, reason codes and time. Row-level private — nobody else can read it.</p>
        <div class="auth-card" data-reveal>
          <div id="mhGuest" data-auth-gateout>
            <p class="auth-msg">You are browsing as a guest. <a href="login.html">Sign in or create an account</a> to keep a private triage record across devices.</p>
          </div>
          <div id="mhUser" data-auth-gate hidden>
            <div class="mh-head">
              <p class="mh-email" id="mhEmail"></p>
              <button class="btn btn-ghost btn-sm" id="mhSignout" type="button">Sign out</button>
            </div>
            <div id="mhList" class="mh-list"><p class="auth-msg">No saved checks yet — <a href="triage.html">run your first triage check</a>.</p></div>
          </div>
        </div>
      </div></section>`,
      U.related(['triage', 'login', 'consent-sharing'], ['Triage Check', 'Sign in', 'Consent & Sharing']),
    ],
  },
];
