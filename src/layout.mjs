// HealthGuard — shared layout: <head>, animated SVG logos, header nav, footer.
// WHY: one source of truth so the logo/header/footer are pixel-identical on all pages
// (client requirement) and can never drift between pages.
// v5: market-ready product surface — Sign-in chip (Supabase Auth), Triage Check CTA,
// product nav family; triage model+engine scripts load ONLY on triage.html (882 KB).

export const COMPANY = 'EVOLVEX IT SOLUTIONS PVT. LTD.';
export const PRODUCT = 'HealthGuard';
export const YEAR = 2026;

/* ---------------------------------- NAV ---------------------------------- */
export const NAV = [
  {
    label: 'Your Care',
    items: [
      { href: 'triage.html', label: 'Triage Check', desc: 'Live urgency engine (T0–T4)' },
      { href: 'token.html', label: 'Token Making', desc: "Today's clinic queue number" },
      { href: 'book.html', label: 'Book Appointment', desc: 'Doctor, day and slot' },
      { href: 'prescription.html', label: 'Prescription Analysis', desc: 'Understand the slip' },
      { href: 'ask-doctor.html', label: 'Ask a Doctor', desc: 'Reports, opinions & chat' },
      { href: 'video.html', label: 'Video Consult', desc: 'Join your booked room' },
      { href: 'my-health.html', label: 'My Health', desc: 'Your complete record' },
      { href: 'login.html', label: 'Sign In', desc: 'Patient · Doctor · Admin' },
    ],
  },
  {
    label: 'Platform',
    items: [
      { href: 'platform.html', label: 'Platform Overview', desc: 'The full HealthGuard map' },
      { href: 'index.html', label: 'Home', desc: 'Vision & how it works' },
    ],
  },
  {
    label: 'Decks',
    items: [
      { href: 'patient-deck.html', label: 'Patient Deck', desc: 'Records, uploads, booking' },
      { href: 'doctor-deck.html', label: 'Doctor Deck', desc: 'Queue, chart, prescriptions' },
      { href: 'admin-deck.html', label: 'Admin Deck', desc: 'Verification, AI & security ops' },
    ],
  },
  {
    label: 'Doctor Desk',
    items: [
      { href: 'doctor-deck.html', label: 'Doctor Deck', desc: 'Your clinic desk' },
      { href: 'doctor-bookings.html', label: 'Bookings', desc: 'Accept, decline, complete' },
      { href: 'doctor-tokens.html', label: 'Token Board', desc: "Today's queue" },
      { href: 'doctor-chat.html', label: 'Patient Chat', desc: 'Talk to booked patients' },
      { href: 'doctor-reports.html', label: 'Reports & Opinions', desc: 'Review and answer' },
      { href: 'video.html', label: 'Video Consults', desc: 'Join booked rooms' },
    ],
  },
  {
    label: 'Document AI',
    items: [
      { href: 'report-upload.html', label: 'Report Upload', desc: 'Secure upload pipeline' },
      { href: 'ocr-engine.html', label: 'Difficult Photo OCR', desc: 'Blur, glare, handwriting' },
      { href: 'ai-pipeline.html', label: 'AI Pipeline', desc: 'Document intelligence flow' },
      { href: 'ai-models.html', label: 'Model Suite', desc: 'The eight specialist models' },
      { href: 'report-intelligence.html', label: 'Report Intelligence', desc: 'Summaries & uncertainty' },
      { href: 'health-timeline.html', label: 'Health Timeline', desc: 'Unified longitudinal record' },
    ],
  },
  {
    label: 'Triage & Consult',
    items: [
      { href: 'ai-triage.html', label: 'AI Triage', desc: 'Rules + model + override' },
      { href: 'token-queue.html', label: 'Token & Queue', desc: 'T0–T4 urgency tokens' },
      { href: 'video-consultation.html', label: 'Video Consultation', desc: 'WebRTC + SFU rooms' },
      { href: 'in-person-consultation.html', label: 'In-Person Consult', desc: 'Same appointment object' },
      { href: 'doctor-verification.html', label: 'Doctor Verification', desc: 'Credential state machine' },
    ],
  },
  {
    label: 'Trust & Safety',
    items: [
      { href: 'consent-sharing.html', label: 'Consent & Sharing', desc: 'Consent as first-class object' },
      { href: 'audit-security.html', label: 'Audit & Security', desc: 'Threat model & audit log' },
      { href: 'human-review.html', label: 'Human Review Queue', desc: 'Human-in-the-loop' },
      { href: 'rag-safety.html', label: 'RAG & AI Safety', desc: 'Grounded, provenance-checked' },
    ],
  },
  {
    label: 'Data & Company',
    items: [
      { href: 'fhir-standards.html', label: 'FHIR & Standards', desc: 'LOINC · ICD · SNOMED · DICOM' },
      { href: 'datasets.html', label: 'Datasets', desc: 'Governed data lake' },
      { href: 'training-evaluation.html', label: 'Training & Eval', desc: 'Golden sets & safety evals' },
      { href: 'notifications.html', label: 'Notifications', desc: 'Email · SMS · Push' },
      { href: 'analytics.html', label: 'Analytics', desc: 'Patient, doctor, platform' },
      { href: 'mvp-roadmap.html', label: 'MVP Roadmap', desc: 'Phased delivery plan' },
      { href: 'living-canvas.html', label: 'Living Health Canvas', desc: 'The animation system' },
      { href: 'about.html', label: 'About EVOLVEX', desc: 'The company behind it' },
      { href: 'contact.html', label: 'Contact', desc: 'Start a conversation' },
    ],
  },
];

/* --------------------------------- LOGOS --------------------------------- */
// HealthGuard mark: guardian shield + living pulse + evolve leaf — gradient-lit
// and stroke-drawn on load. SVG so it stays razor-crisp at every size.
let LOGO_UID = 0; // unique gradient ids per inline instance (valid HTML)
export function logoGuardian({ animated = true } = {}) {
  const cls = animated ? 'logo-draw' : '';
  const g1 = `hg-${++LOGO_UID}`, g2 = `hp-${LOGO_UID}`;
  return `<svg class="logo-mark ${cls}" viewBox="0 0 48 48" role="img" aria-label="HealthGuard logo" fill="none">
    <defs>
      <linearGradient id="${g1}" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
        <stop stop-color="#087255"/><stop offset="0.55" stop-color="#0b8174"/><stop offset="1" stop-color="#56c99b"/>
      </linearGradient>
      <linearGradient id="${g2}" x1="8" y1="24" x2="40" y2="24" gradientUnits="userSpaceOnUse">
        <stop stop-color="#d8ef74"/><stop offset="1" stop-color="#087255"/>
      </linearGradient>
    </defs>
    <path class="ld ld-1" d="M24 4.6 8.5 10.8v11.4c0 10.2 6.6 17.9 15.5 21.2 8.9-3.3 15.5-11 15.5-21.2V10.8L24 4.6Z" stroke="url(#${g1})" stroke-width="2.2" stroke-linejoin="round"/>
    <path class="ld ld-2" d="M13.2 24.2h5.4l2.6-5.9 4 11.6 2.7-6.3h6.9" stroke="url(#${g2})" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
    <path class="ld ld-3" d="M30.2 12.6c2.9-.5 5.2.4 6.5 2.5-2.7 1.2-5 .8-6.5-2.5Z" fill="#f5b914" stroke="none" opacity=".95"/>
  </svg>`;
}

// EVOLVEX mark: two rising evolve-chevrons fused into an X — growth meeting engineering.
export function logoEvolvex({ animated = true } = {}) {
  const cls = animated ? 'logo-draw' : '';
  const g1 = `evx-${++LOGO_UID}`, g2 = `evy-${LOGO_UID}`;
  return `<svg class="logo-mark logo-mark--evx ${cls}" viewBox="0 0 48 48" role="img" aria-label="EVOLVEX logo" fill="none">
    <defs>
      <linearGradient id="${g1}" x1="8" y1="38" x2="28" y2="10" gradientUnits="userSpaceOnUse">
        <stop stop-color="#087255"/><stop offset="1" stop-color="#0b8174"/>
      </linearGradient>
      <linearGradient id="${g2}" x1="40" y1="38" x2="20" y2="10" gradientUnits="userSpaceOnUse">
        <stop stop-color="#56c99b"/><stop offset="1" stop-color="#56c99b"/>
      </linearGradient>
    </defs>
    <path class="ld ld-1" d="M8 38 20 10l8 18" stroke="url(#${g1})" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path class="ld ld-2" d="M40 38 28 10l-8 18" stroke="url(#${g2})" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path class="ld ld-3" d="M14 31h20" stroke="#d8ef74" stroke-width="2.2" stroke-linecap="round"/>
    <circle class="ld ld-4" cx="24" cy="7" r="2.4" fill="#f5b914"/>
  </svg>`;
}

export function brandLockup() {
  return `<a class="brand" href="index.html" aria-label="${PRODUCT} — by ${COMPANY}">
    ${logoGuardian()}
    <span class="brand-text">
      <strong class="brand-name">${PRODUCT}</strong>
      <span class="brand-sub">by EVOLVEX <span class="nowrap">IT SOLUTIONS PVT. LTD.</span></span>
    </span>
  </a>`;
}

/* --------------------------------- HEADER -------------------------------- */
function navMarkup() {
  return NAV.map((f, i) => {
    const panel = `<div class="nav-panel" role="group" aria-label="${f.label}">
      <div class="nav-panel-grid">
        ${f.items.map((it) => `<a class="nav-card" href="${it.href}">
            <span class="nav-card-t">${it.label}</span>
            <span class="nav-card-d">${it.desc}</span>
          </a>`).join('\n')}
      </div>
    </div>`;
    return `<div class="nav-family" data-nav-family>
      <button class="nav-trigger" type="button" aria-expanded="false" aria-controls="navp-${i}">
        ${f.label}<span class="nav-caret" aria-hidden="true"></span>
      </button>
      <div id="navp-${i}" class="nav-panel-wrap">${panel}</div>
    </div>`;
  }).join('\n');
}

function drawerMarkup() {
  return NAV.map((f, i) => `<details class="drawer-group" id="dg-${i}">
      <summary>${f.label}<span class="drawer-caret" aria-hidden="true"></span></summary>
      <div class="drawer-links">
        ${f.items.map((it) => `<a href="${it.href}">${it.label}</a>`).join('\n')}
      </div>
    </details>`).join('\n');
}

export function header() {
  return `<a class="skip-link" href="#main">Skip to content</a>
<header class="site-header" id="siteHeader">
  <div class="wrap header-row">
    ${brandLockup()}
    <nav class="site-nav" aria-label="Primary">
      ${navMarkup()}
    </nav>
    <div class="header-actions">
      <button class="theme-toggle" type="button" aria-label="Toggle color theme (dark / light)">
        <svg class="tt-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
          <circle cx="12" cy="12" r="4.2"/>
          <path d="M12 2.5v2.4M12 19.1v2.4M2.5 12h2.4M19.1 12h2.4M5 5l1.7 1.7M17.3 17.3 19 19M19 5l-1.7 1.7M6.7 17.3 5 19"/>
        </svg>
        <svg class="tt-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M20.5 14.5A8.5 8.5 0 1 1 9.5 3.5a7 7 0 0 0 11 11Z"/>
        </svg>
      </button>
      <a class="btn btn-primary btn-sm" href="triage.html">Triage Check</a>
      <a class="auth-chip" href="login.html" data-auth-chip hidden></a>
      <button class="burger" id="burger" type="button" aria-expanded="false" aria-controls="drawer" aria-label="Open menu">
        <span></span><span></span><span></span>
      </button>
    </div>
  </div>
</header>
<div class="drawer" id="drawer" hidden>
  <div class="drawer-scrim" id="drawerScrim"></div>
  <div class="drawer-sheet" role="dialog" aria-modal="true" aria-label="Site menu">
    <div class="drawer-top">
      ${brandLockup()}
      <button class="drawer-close" id="drawerClose" type="button" aria-label="Close menu">✕</button>
    </div>
    <nav class="drawer-nav" aria-label="Mobile">
      ${drawerMarkup()}
    </nav>
    <a class="btn btn-primary btn-block" href="triage.html">Triage Check</a>
    <a class="auth-chip auth-chip--block" href="login.html" data-auth-chip hidden></a>
    <p class="drawer-legal">© ${YEAR} ${COMPANY}</p>
  </div>
</div>`;
}

/* --------------------------------- FOOTER -------------------------------- */
function footCol(title, links) {
  return `<div class="foot-col">
    <h3 class="foot-h">${title}</h3>
    <ul class="foot-list">
      ${links.map(([href, label]) => `<li><a href="${href}">${label}</a></li>`).join('\n')}
    </ul>
  </div>`;
}

export function footer() {
  return `<footer class="site-footer" id="footer">
  <div class="wrap footer-grid">
    <div class="foot-brand">
      <div class="foot-brand-row">${logoEvolvex()}
        <div>
          <p class="foot-company">${COMPANY}</p>
          <p class="foot-tag">Builders of ${PRODUCT} — clinician-connected health record intelligence.</p>
        </div>
      </div>
      <p class="foot-addr">Varanasi, Uttar Pradesh, India</p>
      <p class="foot-disclaimer">HealthGuard AI assists with document processing, extraction, summarization and workflow triage. It does not provide diagnosis. Clinical interpretation and medical decisions remain with qualified clinicians.</p>
    </div>
    ${footCol('Your Care', [
      ['triage.html', 'Triage Check (Live)'], ['my-health.html', 'My Health'],
      ['login.html', 'Sign In / Account'], ['ai-triage.html', 'How Triage Works'],
    ])}
    ${footCol('Document AI', [
      ['report-upload.html', 'Report Upload'], ['ocr-engine.html', 'Difficult Photo OCR'],
      ['ai-pipeline.html', 'AI Pipeline'], ['ai-models.html', 'Model Suite'],
      ['report-intelligence.html', 'Report Intelligence'], ['health-timeline.html', 'Health Timeline'],
    ])}
    ${footCol('Care & Trust', [
      ['ai-triage.html', 'AI Triage'], ['token-queue.html', 'Token & Queue'],
      ['video-consultation.html', 'Video Consultation'], ['doctor-verification.html', 'Doctor Verification'],
      ['consent-sharing.html', 'Consent & Sharing'], ['audit-security.html', 'Audit & Security'],
      ['human-review.html', 'Human Review'], ['rag-safety.html', 'RAG & AI Safety'],
    ])}
    ${footCol('Data & Company', [
      ['fhir-standards.html', 'FHIR & Standards'], ['datasets.html', 'Datasets'],
      ['training-evaluation.html', 'Training & Evaluation'], ['notifications.html', 'Notifications'],
      ['analytics.html', 'Analytics'], ['mvp-roadmap.html', 'MVP Roadmap'],
      ['living-canvas.html', 'Living Health Canvas'], ['about.html', 'About EVOLVEX'],
      ['contact.html', 'Contact'], ['platform.html', 'Platform Overview'],
    ])}
  </div>
  <div class="wrap foot-strip">
    <p>© ${YEAR} ${COMPANY} · ${PRODUCT} · All rights reserved.</p>
    <p class="foot-strip-links"><a href="platform.html">Platform</a> · <a href="triage.html">Triage</a> · <a href="audit-security.html">Security</a> · <a href="fhir-standards.html">FHIR</a> · <a href="contact.html">Contact</a></p>
  </div>
</footer>`;
}

/* ---------------------------------- PAGE --------------------------------- */
export function page({ slug, title, desc, family, body }) {
  const fullTitle = `${title} · ${PRODUCT}`;
  // The distilled triage booster is 882 KB — load it ONLY on the live triage page.
  const triageScripts = slug === 'triage'
    ? '<script src="js/triage-model-data.js" defer></script>\n<script src="js/triage-engine.js" defer></script>\n'
    : '';
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="color-scheme" content="light">
<meta name="theme-color" content="#fffdf7">
<meta name="description" content="${desc.replace(/"/g, '&quot;')}">
<meta property="og:title" content="${fullTitle.replace(/"/g, '&quot;')}">
<meta property="og:description" content="${desc.replace(/"/g, '&quot;')}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${PRODUCT} — ${COMPANY}">
<title>${fullTitle.replace(/"/g, '&quot;')}</title>
<script>try{var _t=localStorage.getItem('hg-theme');if(!_t)_t='light';document.documentElement.setAttribute('data-theme',_t);}catch(e){document.documentElement.setAttribute('data-theme','dark');}</script>
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'%3E%3Cpath d='M24 4.6 8.5 10.8v11.4c0 10.2 6.6 17.9 15.5 21.2 8.9-3.3 15.5-11 15.5-21.2V10.8L24 4.6Z' fill='%23087255'/%3E%3Cpath d='M13.2 24.2h5.4l2.6-5.9 4 11.6 2.7-6.3h6.9' stroke='%23F7F4EE' stroke-width='2.4' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E">
<link rel="stylesheet" href="css/main.css">
<link rel="stylesheet" href="css/app.css">
</head>
<body data-family="${family || ''}" data-slug="${slug}">
<canvas id="livingCanvas" aria-hidden="true"></canvas>
<div class="grain" aria-hidden="true"></div>
<div class="aurora" aria-hidden="true"><span class="orb orb-1"></span><span class="orb orb-2"></span><span class="orb orb-3"></span></div>
<div class="cursor-glow" aria-hidden="true"></div>
${header()}
<main id="main">
${body}
</main>
${footer()}
<script src="js/canvas.js" defer></script>
<script src="js/heart.js" defer></script>
<script src="js/main.js" defer></script>
${triageScripts}<script src="js/auth.js" defer></script>
<script src="js/deck-app.js" defer></script>
<script src="js/app-pages.js" defer></script>
</body>
</html>`;
}
