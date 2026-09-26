// HealthGuard — PRODUCT pages (Part J: role decks + working features).
// WHY: the working platform — one dedicated page per feature (client standing
// rule): login (roles), triage, token making, booking, prescription analysis,
// ask-a-doctor, video, my-health, patient/doctor/admin decks + doctor workspaces.
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

/* gated app shell: sign-in prompt + role notice + hidden app body */
function shell(role, inner) {
  return `
  <div class="wrap wrap-narrow">
    <div class="gate-shell" id="gate" hidden>
      <p class="eyebrow">Members only</p>
      <h2 class="h-sec">Sign in to open this workspace</h2>
      <p class="sec-lead">${role ? `This area is for ${role}s.` : 'Sign in as a patient, doctor or admin.'} Your deck unlocks after login.</p>
      <div class="btn-row"><a class="btn btn-primary" href="login.html${role ? `?role=${role}` : ''}">Sign in</a>
      <a class="btn btn-ghost" href="login.html">Create an account</a></div>
    </div>
    <div class="gate-shell" id="pcWrap" hidden>
      <p class="eyebrow">One quick step</p>
      <h2 class="h-card">Complete your profile</h2>
      <p class="card-d">Age and sex are required before any deck opens — safe triage depends on them.</p>
      <form id="pcForm" class="auth-form">
        ${field('pcAge', 'Age (years)', { type: 'number' })}
        ${select('pcSex', 'Sex', [['', 'Select…'], ['male', 'Male'], ['female', 'Female'], ['other', 'Other']])}
        <button class="btn btn-primary" type="submit">Save and continue</button>
        <p class="auth-msg" id="pcMsg"></p>
      </form>
    </div>
    <p class="note note-warn" id="roleWarn" hidden></p>
    <div id="app" hidden>${inner}</div>
  </div>`;
}
const deckHead = (t, s, extra = '') => `<div class="deck-head"><div><p class="eyebrow">Live workspace</p><h1 class="deck-title">${U.esc(t)}</h1><p class="deck-sub">${U.esc(s)}</p></div>${extra}</div>`;

export default [
  {
    slug: 'login',
    family: 'product',
    title: 'Sign In — HealthGuard Accounts',
    desc: 'Sign in to HealthGuard: patients self-register for triage, tokens, bookings and opinions; doctors are registered by the clinic admin; admins are predefined.',
    body: () => [
      `<section class="section"><div class="wrap wrap-narrow">
        <p class="eyebrow" data-reveal>Account · one door, your deck</p>
        <h1 class="h-sec" data-reveal>Sign in to HealthGuard</h1>
        <p class="sec-lead" data-reveal>Patients create their own account here. Doctors are registered by the clinic admin, and admins are predefined. Accounts keep your record private — row-level security on every table.</p>
        <div class="auth-card" data-reveal>
          <div class="auth-tabs" role="tablist">
            <button class="auth-tab is-on" type="button" data-lg-mode="in" role="tab" aria-selected="true">Sign in</button>
            <button class="auth-tab" type="button" data-lg-mode="up" role="tab" aria-selected="false">Create account</button>
          </div>
          <form id="lgForm" class="auth-form" novalidate>
            <div id="lgNameRow">${field('lgName', 'Full name', { type: 'text', hint: 'Shown on tokens, bookings and chat.' })}</div>
            <div id="lgAgeRow">${field('lgAge', 'Age (years)', { type: 'number', hint: 'Required — the triage engine depends on it.' })}</div>
            <div id="lgSexRow">${select('lgSex', 'Sex', [['', 'Select…'], ['male', 'Male'], ['female', 'Female'], ['other', 'Other']])}</div>
            ${field('lgEmail', 'Email', { type: 'email', hint: 'We never show your email to other users.' })}
            ${field('lgPass', 'Password', { type: 'password', hint: 'Minimum 8 characters.' })}
            <button class="btn btn-primary btn-block" id="lgSubmit" type="submit">Sign in</button>
            <p class="auth-msg" id="lgMsg" role="status" aria-live="polite"></p>
          </form>
          <p class="auth-note">${U.esc(DISCLAIMER)}</p>
        </div>
      </div></section>`,
    ],
  },

  {
    slug: 'patient-deck',
    family: 'product',
    title: 'Patient Deck — Your Care Workspace',
    desc: 'Your working deck: triage check, queue token, appointment booking, prescription analysis, ask a doctor, video consults and your record.',
    body: () => [
      `<section class="section">${shell('patient', `
        ${deckHead('Patient Deck', 'Everything for today: status at a glance, then get things done.')}
        <div class="dash-grid cols-4" id="pdStats"></div>
        <div class="dash-grid sect-gap">
          <a class="action-card" href="triage.html"><span class="ac-ico">🩺</span><span><b>Triage Check</b><span>How urgent is this, right now</span></span></a>
          <a class="action-card" href="token.html"><span class="ac-ico">🎫</span><span><b>Token Making</b><span>Today's queue number</span></span></a>
          <a class="action-card" href="book.html"><span class="ac-ico">📅</span><span><b>Book Appointment</b><span>Doctor, day and slot</span></span></a>
          <a class="action-card" href="prescription.html"><span class="ac-ico">💊</span><span><b>Prescription Analysis</b><span>Understand the slip</span></span></a>
          <a class="action-card" href="ask-doctor.html"><span class="ac-ico">📤</span><span><b>Ask a Doctor</b><span>Reports & second opinions · chat</span></span></a>
          <a class="action-card" href="video.html"><span class="ac-ico">🎥</span><span><b>Video Consult</b><span>Join your booked room</span></span></a>
          <a class="action-card" href="my-health.html"><span class="ac-ico">📁</span><span><b>My Health</b><span>Your full record</span></span></a>
        </div>
        <h2 class="h-3 sect-gap">Next up</h2>
        <div class="board sect-gap" id="pdNext"></div>
        <h2 class="h-3 sect-gap">Recent activity</h2>
        <div class="board" id="pdRecent"></div>
      `)}</section>`,
      U.note(DISCLAIMER, 'warn'),
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
        lead: 'Enter what you feel and measure. Get a workflow-urgency class in milliseconds — T0 emergency to T4 follow-up — with reason codes you can read. For signed-in patients only.',
        art: a,
        chips: ['Runs in your browser', 'Rules + model + review flag', 'T0–T4 urgency', 'Data stays on device'],
        actions: [
          { href: '#triageForm', label: 'Start the check' },
          { href: 'login.html', label: 'Sign in to save results' },
        ],
      }),
      U.principle('AI triage ≠ emergency diagnosis. This classifies workflow urgency — what to see first — never what the patient has.'),
      shell('patient', U.section({
        kicker: 'Intake', title: 'Symptoms & measurements', lead: 'Fields marked * are needed. If you are unsure about a measurement, use your best estimate — the review flag will say when the picture is unclear.',
        inner: `<form id="triageForm" class="triage-form" data-reveal>
          <fieldset class="fs"><legend>Vitals</legend><div class="fld-grid">
            ${field('f-age', 'Age (years)', { min: 1, max: 120 })}
            ${select('f-sex', 'Sex', [['0', 'Male'], ['1', 'Female']])}
            <label class="ck ck-fld" id="f-preg-row" for="f-pregnancy"><input type="checkbox" id="f-pregnancy"><span>Pregnant</span></label>
            ${field('f-hr', 'Heart rate (bpm)', { min: 20, max: 250 })}
            ${field('f-sbp', 'Systolic BP (mmHg)', { min: 50, max: 260 })}
            ${field('f-dbp', 'Diastolic BP (mmHg)', { min: 20, max: 160 })}
            ${field('f-rr', 'Breaths / min', { min: 4, max: 60 })}
            ${field('f-temp', 'Body temperature (°F)', { step: 0.1, hint: 'Fahrenheit — e.g. 98.6' })}
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
      }) + `<section class="section" id="triageResult" hidden><div class="wrap wrap-narrow">
        <p class="eyebrow">Result</p>
        <div class="result-card" id="resultCard"></div>
      </div></section>`),
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
      U.related(['token', 'book', 'my-health'], ['Token Making', 'Book Appointment', 'My Health']),
    ],
  },

  {
    slug: 'token',
    family: 'product',
    title: 'Token Making — Today\'s Queue',
    desc: 'Get today\'s clinic queue token with your urgency class. Doctors see the day board sorted by urgency; you see exactly where you are.',
    body: () => [
      `<section class="section">${shell('patient', `
        ${deckHead('Token Making', 'One tap for today\'s queue number. Urgency comes from your triage check.')}
        <div class="work has-side">
          <div>
            <div class="auth-card">
              <form id="tokForm" class="auth-form">
                ${field('tokName', 'Patient name', { type: 'text' })}
                ${select('tokUrgency', 'Urgency class', [['0', 'T0 — emergency'], ['1', 'T1 — very urgent'], ['2', 'T2 — priority'], ['3', 'T3 — routine'], ['4', 'T4 — follow-up']], { hint: 'Defaults from your last triage check. Run a Triage Check first for an evidence-based class.' })}
                ${field('tokNote', 'One-line reason', { type: 'text', required: false, hint: 'e.g. fever for 2 days' })}
                <button class="btn btn-primary btn-block" type="submit">Issue my token</button>
                <p class="auth-msg" id="tokMsg" role="status"></p>
              </form>
              <div id="tokTicket" hidden></div>
            </div>
            <h2 class="h-3 sect-gap">My tokens</h2>
            <div class="board" id="tokMine"></div>
          </div>
          <div class="auth-card">
            <p class="eyebrow">Live queue</p>
            <h3 class="h-3">Who is waiting now</h3>
            <div class="board sect-gap" id="tokBoard"></div>
          </div>
        </div>
      `)}</section>`,
      U.note('Emergency-level symptoms (T0) should go straight to the nearest emergency department — do not wait in a queue.', 'warn'),
    ],
  },

  {
    slug: 'book',
    family: 'product',
    title: 'Book Appointment — Doctor, Day, Slot',
    desc: 'Book an appointment with a doctor: pick a day and a 30-minute slot, video or in person. The doctor accepts, then chat and video open.',
    body: () => [
      `<section class="section">${shell('patient', `
        ${deckHead('Book Appointment', 'Pick a doctor, a day and a slot. The doctor confirms.')}
        <div class="work has-side">
          <div class="auth-card">
            <form id="bkForm" class="auth-form">
              ${field('bkName', 'Patient name', { type: 'text' })}
              ${select('bkDoctor', 'Doctor', [['', 'Loading doctors…']])}
              ${field('bkDate', 'Date', { type: 'date' })}
              <div class="fld"><span class="fld-l">Time slot *</span><div class="slot-grid" id="bkSlots"></div></div>
              ${select('bkMode', 'Consultation mode', [['video', 'Video call'], ['in_person', 'In person']])}
              ${field('bkReason', 'Reason for the visit', { type: 'text', required: false, hint: 'Short note for the doctor' })}
              <button class="btn btn-primary btn-block" type="submit">Request appointment</button>
              <p class="auth-msg" id="bkMsg" role="status"></p>
            </form>
          </div>
          <div>
            <h2 class="h-3">My bookings</h2>
            <div class="board sect-gap" id="bkMine"></div>
          </div>
        </div>
      `)}</section>`,
    ],
  },

  {
    slug: 'prescription',
    family: 'product',
    title: 'Prescription Analysis — Read It Clearly',
    desc: 'Paste your prescription: get a structure check, known pair-flags and questions to ask your doctor. Assistive reading aid — never dosing advice. Send it on for a real opinion.',
    body: () => [
      `<section class="section">${shell('patient', `
        ${deckHead('Prescription Analysis', 'Paste the slip. Get clarity and the right questions — then ask a doctor.')}
        <div class="auth-card">
          <label class="fld" for="rxText"><span class="fld-l">Your prescription *</span>
            <textarea class="fld-i" id="rxText" rows="7" placeholder="One medicine per line, e.g.&#10;Metformin 500 mg twice daily&#10;Atorvastatin 20 mg at night"></textarea></label>
          <div class="triage-actions">
            <button class="btn btn-primary" id="rxRun" type="button">Analyze</button>
            <p class="auth-msg" id="rxMsg" role="status"></p>
          </div>
        </div>
        <div id="rxOut" hidden></div>
        <div class="auth-card sect-gap" id="rxSendBox" hidden>
          <p class="eyebrow">Second opinion</p>
          <h3 class="h-3">Send to a doctor</h3>
          <form id="rxSendForm" class="auth-form">
            ${select('rxDoctor', 'Doctor', [['', 'Loading doctors…']])}
            ${field('rxTitle', 'Title', { type: 'text', required: false, hint: 'e.g. Review my diabetes medicines' })}
            <button class="btn btn-primary btn-block" type="submit">Send for opinion</button>
            <p class="auth-msg" id="rxSendMsg" role="status"></p>
          </form>
        </div>
      `)}</section>`,
      U.note('This analysis is a reading aid with a small demo interaction table. It cannot see your body or your labs. Never start, stop or change a dose because of a screen — that decision belongs to your clinician.', 'warn'),
    ],
  },

  {
    slug: 'ask-doctor',
    family: 'product',
    title: 'Ask a Doctor — Reports & Opinions',
    desc: 'Send a report or prescription photo to a doctor for an opinion, track replies, and chat with your booked doctor.',
    body: () => [
      `<section class="section">${shell('patient', `
        ${deckHead('Ask a Doctor', 'Send a report or prescription for an opinion. Chat with your booked doctor.')}
        <div class="work has-side">
          <div class="auth-card">
            <form id="adForm" class="auth-form">
              ${select('adKind', 'What are you sending?', [['report', 'Health report / lab result'], ['prescription', 'Prescription for review']])}
              ${field('adTitle', 'Title', { type: 'text', hint: 'e.g. Blood report 12 Sep — is the sugar controlled?' })}
              <label class="fld" for="adText"><span class="fld-l">Details *</span>
                <textarea class="fld-i" id="adText" rows="5" placeholder="Symptoms, what your doctor said, what you want checked…"></textarea></label>
              <label class="fld" for="adPhoto"><span class="fld-l">Photo of the report (optional)</span>
                <input class="fld-i" id="adPhoto" type="file" accept="image/*"></label>
              <img id="adPhotoPrev" class="photo-prev" alt="preview" hidden>
              ${select('adDoctor', 'Send to doctor', [['', 'Loading doctors…']])}
              <button class="btn btn-primary btn-block" type="submit">Send for opinion</button>
              <p class="auth-msg" id="adMsg" role="status"></p>
            </form>
          </div>
          <div>
            <h2 class="h-3">My requests</h2>
            <div class="board sect-gap" id="adList"></div>
          </div>
        </div>
        <h2 class="h-3 sect-gap">Chat with your doctor</h2>
        <p class="sec-lead">Available once a booking is accepted.</p>
        <select class="fld-i" id="adChatPick" style="max-width:24rem"></select>
        <div class="chat-wrap sect-gap">
          <div class="chat-log" id="adChat"></div>
          <form class="chat-form" id="adChatForm">
            <input class="fld-i" id="adChatInput" placeholder="Type a message…" autocomplete="off">
            <button class="btn btn-primary btn-sm" type="submit">Send</button>
          </form>
        </div>
      `)}</section>`,
    ],
  },

  {
    slug: 'video',
    family: 'product',
    title: 'Video Consultation — Your Room',
    desc: 'Join the video room for an accepted booking. Encrypted peer-to-peer via Jitsi Meet — no download needed.',
    body: () => [
      `<section class="section">${shell(null, `
        ${deckHead('Video Consultation', 'Rooms open when a booking is accepted.')}
        <p class="sec-lead" id="vdHint">Pick the consultation below. The other side joins the same room from their deck.</p>
        <select class="fld-i" id="vdPick" style="max-width:26rem"></select>
        <div class="triage-actions sect-gap">
          <button class="btn btn-ghost" id="vdCopy" type="button">Copy room link</button>
          <span class="auth-msg" id="vdLink"></span>
        </div>
        <div class="video-stage sect-gap" id="vdStage" hidden>
          <iframe id="vdFrame" allow="camera; microphone; fullscreen; display-capture" title="HealthGuard video room"></iframe>
        </div>
      `)}</section>`,
      U.note('The video room runs on meet.jit.si (end-to-end encrypted where supported). For clinical-grade recording/consent workflows, the platform roadmap swaps in a HIPAA-compliant SFU.', ''),
    ],
  },

  {
    slug: 'my-health',
    family: 'product',
    title: 'My Health — Your Complete Record',
    desc: 'Your private HealthGuard record: triage checks, queue tokens, bookings and doctor opinions. Row-level private — only you can see it.',
    body: () => [
      `<section class="section"><div class="wrap wrap-narrow">
        <p class="eyebrow" data-reveal>Account · My Health</p>
        <h1 class="h-sec" data-reveal>Your complete record</h1>
        <p class="sec-lead" data-reveal>Triage checks, tokens, bookings and opinions in one private timeline. Row-level security — nobody else can read it.</p>
        <div class="auth-card" data-reveal>
          <div id="mhGuest" data-auth-gateout>
            <p class="auth-msg">You are browsing as a guest. <a href="login.html">Sign in or create an account</a> to keep a private record across devices.</p>
          </div>
          <div id="mhUser" data-auth-gate hidden>
            <div class="mh-head">
              <p class="mh-email" id="mhEmail"></p>
              <button class="btn btn-ghost btn-sm" id="mhSignout" type="button">Sign out</button>
            </div>
            <h2 class="h-3">Triage checks</h2>
            <div id="mhList" class="mh-list"><p class="auth-msg">No saved checks yet — <a href="triage.html">run your first triage check</a>.</p></div>
          </div>
        </div>
        <h2 class="h-3 sect-gap" data-auth-gate hidden>Queue tokens</h2>
        <div class="board" id="mhTokens" data-auth-gate hidden></div>
        <h2 class="h-3 sect-gap" data-auth-gate hidden>Appointments</h2>
        <div class="board" id="mhBookings" data-auth-gate hidden></div>
        <h2 class="h-3 sect-gap" data-auth-gate hidden>Doctor opinions</h2>
        <div class="board" id="mhOpinions" data-auth-gate hidden></div>
      </div></section>`,
      U.related(['triage', 'ask-doctor', 'consent-sharing'], ['Triage Check', 'Ask a Doctor', 'Consent & Sharing']),
    ],
  },

  /* ------------------------------- DOCTOR -------------------------------- */
  {
    slug: 'doctor-deck',
    family: 'product',
    title: 'Doctor Deck — Your Clinic Desk',
    desc: 'The doctor workspace: accept bookings, today\'s queue, open opinions and patient chat — one desk for the day.',
    body: () => [
      `<section class="section">${shell('doctor', `
        ${deckHead('Doctor Deck', 'Your day at a glance — then work through it.')}
        <div class="dash-grid cols-4" id="ddStats"></div>
        <div class="dash-grid sect-gap">
          <a class="action-card" href="doctor-bookings.html"><span class="ac-ico">📅</span><span><b>Bookings</b><span>Accept, decline, complete</span></span></a>
          <a class="action-card" href="doctor-tokens.html"><span class="ac-ico">🎫</span><span><b>Token Board</b><span>Today's queue</span></span></a>
          <a class="action-card" href="doctor-chat.html"><span class="ac-ico">💬</span><span><b>Patient Chat</b><span>Talk to booked patients</span></span></a>
          <a class="action-card" href="doctor-reports.html"><span class="ac-ico">📤</span><span><b>Reports & Opinions</b><span>Review and answer</span></span></a>
          <a class="action-card" href="video.html"><span class="ac-ico">🎥</span><span><b>Video Consults</b><span>Join booked rooms</span></span></a>
        </div>
        <h2 class="h-3 sect-gap">Waiting for you</h2>
        <div class="board" id="ddPending"></div>
        <h2 class="h-3 sect-gap">Today's queue</h2>
        <div class="board" id="ddQueue"></div>
        <h2 class="h-3 sect-gap">Open opinions</h2>
        <div class="board" id="ddOpins"></div>
      `)}</section>`,
    ],
  },
  {
    slug: 'doctor-bookings',
    family: 'product',
    title: 'Doctor Bookings — Accept & Manage',
    desc: 'Patient appointment requests for you: accept, decline, complete. Accepted video bookings unlock chat and the video room.',
    body: () => [
      `<section class="section">${shell('doctor', `
        ${deckHead('Bookings', 'Requests from patients. Accept to open chat + video.')}
        <div class="board" id="dbList"></div>
      `)}</section>`,
    ],
  },
  {
    slug: 'doctor-tokens',
    family: 'product',
    title: 'Doctor Token Board — Today\'s Queue',
    desc: 'The day queue sorted by urgency then number. Call patients in, mark consultations done.',
    body: () => [
      `<section class="section">${shell('doctor', `
        ${deckHead('Token Board', 'Sorted by urgency first — sicker first, always.')}
        <div class="board" id="dtBoard"></div>
      `)}</section>`,
    ],
  },
  {
    slug: 'doctor-chat',
    family: 'product',
    title: 'Doctor Chat — Talk to Patients',
    desc: 'Chat with patients you have an accepted booking with — clarifications, prep instructions, follow-ups.',
    body: () => [
      `<section class="section">${shell('doctor', `
        ${deckHead('Patient Chat', 'Threads unlock per accepted booking.')}
        <select class="fld-i" id="dcChatPick" style="max-width:24rem"></select>
        <div class="chat-wrap sect-gap">
          <div class="chat-log" id="dcChat"></div>
          <form class="chat-form" id="dcChatForm">
            <input class="fld-i" id="dcChatInput" placeholder="Type a message…" autocomplete="off">
            <button class="btn btn-primary btn-sm" type="submit">Send</button>
          </form>
        </div>
      `)}</section>`,
    ],
  },
  {
    slug: 'doctor-reports',
    family: 'product',
    title: 'Doctor Reports & Opinions — Review and Answer',
    desc: 'Reports and prescriptions patients sent for your opinion: read the full picture, write the clinical opinion, send it back.',
    body: () => [
      `<section class="section">${shell('doctor', `
        ${deckHead('Reports & Opinions', 'Patients are waiting for your read.')}
        <div class="board" id="drList"></div>
        <div class="auth-card sect-gap" id="drDetail" hidden>
          <p class="eyebrow">Patient request</p>
          <div id="drDetailBody"></div>
          <form id="drAnswerForm" class="auth-form sect-gap">
            <label class="fld" for="drNote"><span class="fld-l">Your clinical opinion *</span>
              <textarea class="fld-i" id="drNote" rows="5" placeholder="What the report shows, what it means, what to do next…"></textarea></label>
            <button class="btn btn-primary" type="submit">Send opinion to patient</button>
            <p class="auth-msg" id="drAnswerMsg" role="status"></p>
          </form>
        </div>
      `)}</section>`,
      U.note('You are the clinician of record. The platform\'s AI summaries are assistive only and never replace your interpretation.', 'warn'),
    ],
  },

  /* -------------------------------- ADMIN -------------------------------- */
  {
    slug: 'admin-deck',
    family: 'product',
    title: 'Admin Deck — Live Operations',
    desc: 'Platform operations in real time: doctors and patients registered and active, bookings pending/ongoing/completed, queue load, open opinions.',
    body: () => [
      `<section class="section">${shell('admin', `
        ${deckHead('Admin Deck — Live Operations', 'Everything that is happening, refreshed every 5 seconds.')}
        <div class="dash-grid cols-4" id="adStats"></div>
        <div class="work has-side sect-gap">
          <div>
            <h2 class="h-3">Latest bookings</h2>
            <div class="board sect-gap" id="adBookings"></div>
            <h2 class="h-3 sect-gap">Today's queue</h2>
            <div class="board" id="adTokens"></div>
          </div>
          <div>
            <h2 class="h-3">Register a doctor</h2>
            <p class="card-d">Doctors cannot self-register. Create their account here and share the temporary password.</p>
            <form id="adDocForm" class="auth-form sect-gap">
              ${field('adDocName', 'Full name', { type: 'text' })}
              ${field('adDocEmail', 'Email', { type: 'email' })}
              ${field('adDocSpec', 'Specialty', { type: 'text', hint: 'e.g. General Medicine, Pediatrics…' })}
              ${field('adDocAge', 'Age (years)', { type: 'number', required: false })}
              ${select('adDocSex', 'Sex', [['', 'Select…'], ['male', 'Male'], ['female', 'Female'], ['other', 'Other']])}
              <button class="btn btn-primary" type="submit">Create doctor account</button>
              <p class="auth-msg" id="adDocMsg"></p>
            </form>
            <h2 class="h-3 sect-gap">Users & presence</h2>
            <div class="board sect-gap" id="adUsers"></div>
          </div>
        </div>
      `)}</section>`,
      U.note('Active now = seen in the last 15 minutes. Patients self-register; doctor accounts are created by an admin; admins are predefined. Credential verification ships with the doctor-verification workflow before real clinical deployment.', ''),
    ],
  },
];
