// HealthGuard — CORE pages: Home, Platform hub, three Decks, Roadmap, Living Canvas, About, Contact.
import * as U from '../src/ui.mjs';

const DISCLAIMER = 'This is an informational system. AI assists with document processing and workflow support; it does not provide diagnosis. Clinical interpretation remains with qualified clinicians.';

export default [
  /* ------------------------------- HOME ------------------------------- */
  {
    slug: 'index',
    family: 'home',
    title: 'HealthGuard — Clinician-Connected Health Record Intelligence',
    desc: 'HealthGuard turns messy medical documents into structured, traceable health records and connects patients with verified clinicians. Built by EVOLVEX IT SOLUTIONS PVT. LTD.',
    art: 'hero-canvas.jpg',
    body: (a) => [
      U.hero({
        eyebrow: 'HealthGuard · by EVOLVEX IT SOLUTIONS PVT. LTD.',
        title: 'Your Health. Clearly Organized.',
        lead: 'A clinician-connected health record intelligence platform that turns messy medical documents into structured, traceable information and connects patients with verified healthcare professionals.',
        art: a,
        chips: ['Patient Deck', 'Doctor Deck', 'Admin Deck', 'AI Document Intelligence', 'FHIR-ready'],
        actions: [{ href: 'login.html', label: 'Sign in' }, { href: 'patient-deck.html', label: 'Patient deck' }, { href: 'doctor-deck.html', label: 'Doctor deck' }, { href: 'platform.html', label: 'Explore the platform' }],
      }),
      U.marquee(['HL7 FHIR R4', 'LOINC', 'UCUM', 'ICD-10 / ICD-11', 'SNOMED CT', 'DICOM', 'WebRTC', 'OWASP ASVS']),
      U.section({
        kicker: 'Core principle',
        title: 'AI extracts and assists. Clinicians decide.',
        lead: 'The platform is structured as one honest workflow — never as an autonomous doctor.',
        inner: U.flow(['Patient', 'AI Health Document Intelligence', 'Triage', 'Verified Doctor', 'Consultation', 'Clinical Record', 'Follow-up'], { accent: true })
          + U.principle('AI extracts, organizes, summarizes, flags and assists. A verified clinician remains responsible for clinical interpretation and decisions.'),
      }),
      U.section({
        kicker: 'How it works',
        title: 'Upload → Understand → Consult',
        inner: U.cards([
          { icon: '⌁', t: 'Upload', d: 'Snap or drop any report — PDF, JPG, PNG, HEIC, TIFF. Every file passes a security layer before it touches a model.', href: 'report-upload.html' },
          { icon: '◇', t: 'Understand', d: 'OCR, layout analysis, medical NER and normalization produce structured observations with confidence and provenance.', href: 'ai-pipeline.html' },
          { icon: '✚', t: 'Consult', d: 'AI triage places you in the right queue; a verified doctor reviews the original document and the extraction together.', href: 'token-queue.html' },
        ], { tilt: true }),
      }),
      U.section({
        kicker: 'The platform',
        title: 'Three completely separated application surfaces',
        inner: U.cards([
          { icon: '◐', t: 'Patient Deck', d: 'Health profile, document vault, AI summaries, timeline, booking, consultations, consent controls.', href: 'patient-deck.html' },
          { icon: '◑', t: 'Doctor Deck', d: 'Verified onboarding, consultation queue, patient chart, original documents, prescriptions, follow-up.', href: 'doctor-deck.html' },
          { icon: '◒', t: 'Admin Deck', d: 'Credential verification, AI monitoring, security events, consent and audit oversight, feature flags.', href: 'admin-deck.html' },
        ], { cols: 3 }),
      }),
      U.section({
        kicker: 'Feature map',
        title: 'Every component, in its own place',
        lead: 'Each HealthGuard component has a dedicated page — nothing is crowded, nothing is cut.',
        inner: U.bento([
          { t: 'AI Document Intelligence', d: 'Classify → enhance → OCR → NER → normalize → reason → safety → explain.', href: 'ai-pipeline.html', big: true },
          { t: 'Triage Tokens', d: 'T0–T4 workflow urgency with human override.', href: 'token-queue.html' },
          { t: 'Difficult Photo OCR', d: 'Blur, glare, folds, handwriting — consensus ensembles.', href: 'ocr-engine.html' },
          { t: 'Video Consultation', d: 'WebRTC + SFU secure rooms.', href: 'video-consultation.html' },
          { t: 'Consent & Audit', d: 'Consent as a first-class object; immutable audit events.', href: 'consent-sharing.html', big: true },
          { t: 'Living Health Canvas', d: 'The signature 5-layer ambient animation system.', href: 'living-canvas.html' },
          { t: 'FHIR & Standards', d: 'LOINC, UCUM, ICD, SNOMED CT, DICOM — never invented codes.', href: 'fhir-standards.html' },
        ]),
      }),
      U.section({
        kicker: 'Trust',
        title: 'Uncertainty is shown, never hidden',
        inner: U.split({
          title: 'Verified extraction — or a honest flag',
          paragraphs: ['Instead of a bare confidence number, every extraction surface states what the system actually knows. Uncertain OCR never silently becomes structured medical data.'],
          list: ['✓ Verified extraction', '⚠ Review required', '? Unable to determine'],
          figure: U.confidence([
            { l: 'OCR confidence', v: 97 },
            { l: 'Semantic confidence', v: 96 },
            { l: 'Unit confidence', v: 99 },
          ]),
        }) + U.note(DISCLAIMER),
      }),
      U.related(['platform', 'patient-deck', 'living-canvas'], ['Platform Overview', 'Patient Deck', 'Living Health Canvas']),
    ],
  },

  /* ----------------------------- PLATFORM ----------------------------- */
  {
    slug: 'platform',
    family: 'platform',
    title: 'Platform Overview — All Components',
    desc: 'The complete HealthGuard component map: decks, document AI, triage, consultations, trust, standards and data — each with its own dedicated page.',
    art: 'art-decks.jpg',
    body: (a) => [
      U.hero({
        eyebrow: 'Platform',
        title: 'The full HealthGuard map',
        lead: 'Twenty-six components, one honest workflow: Patient → AI Health Document Intelligence → Triage → Verified Doctor → Consultation → Clinical Record → Follow-up.',
        art: a,
        chips: ['26 components', '3 decks', 'FHIR-compatible'],
        actions: [{ href: 'mvp-roadmap.html', label: 'See the roadmap' }, { href: 'contact.html', label: 'Talk to us' }],
      }),
      U.section({
        kicker: 'Decks', title: 'Application surfaces',
        inner: U.cards([
          { t: 'Patient Deck', d: 'Registration, vault, AI understanding, booking, consultations, follow-up.', href: 'patient-deck.html', icon: '◐' },
          { t: 'Doctor Deck', d: 'Onboarding, queue, chart, assessment, prescriptions, audit history.', href: 'doctor-deck.html', icon: '◑' },
          { t: 'Admin Deck', d: 'Verification, monitoring, AI ops, security, complaints, feature flags.', href: 'admin-deck.html', icon: '◒' },
        ]),
      }),
      U.section({
        kicker: 'Document AI', title: 'From messy paper to structured record',
        inner: U.cards([
          { t: 'Report Upload', d: 'Secure pipeline: scan, validate, encrypt, fingerprint.', href: 'report-upload.html', icon: '⌁' },
          { t: 'Difficult Photo OCR', d: 'Ensemble OCR with consensus and confidence.', href: 'ocr-engine.html', icon: '◎' },
          { t: 'AI Pipeline', d: 'The modular document intelligence flow.', href: 'ai-pipeline.html', icon: '◇' },
          { t: 'Model Suite', d: 'Eight specialist models — not one giant model.', href: 'ai-models.html', icon: '⬡' },
          { t: 'Report Intelligence', d: 'Patient & doctor summaries, uncertainty UI.', href: 'report-intelligence.html', icon: '▤' },
          { t: 'Health Timeline', d: 'Unified longitudinal health record.', href: 'health-timeline.html', icon: '◠' },
        ], { cols: 3 }),
      }),
      U.section({
        kicker: 'Care', title: 'Triage, queue and consultation',
        inner: U.cards([
          { t: 'AI Triage', d: 'Rules + model + human override. Urgency, not diagnosis.', href: 'ai-triage.html', icon: '⬡' },
          { t: 'Token & Queue', d: 'T0–T4 tokens, estimated wait, priority handling.', href: 'token-queue.html', icon: '◉' },
          { t: 'Video Consultation', d: 'WebRTC + SFU waiting rooms and secure sessions.', href: 'video-consultation.html', icon: '▷' },
          { t: 'In-Person Consult', d: 'Same appointment object, different modality.', href: 'in-person-consultation.html', icon: '⌂' },
          { t: 'Doctor Verification', d: 'Credential state machine — only VERIFIED consults.', href: 'doctor-verification.html', icon: '✓' },
        ], { cols: 3 }),
      }),
      U.section({
        kicker: 'Trust & data', title: 'Safety, standards, evidence',
        inner: U.cards([
          { t: 'Consent & Sharing', d: 'Purpose-bound consent with expiry and revocation.', href: 'consent-sharing.html', icon: '◍' },
          { t: 'Audit & Security', d: 'Immutable audit events, STRIDE threat model.', href: 'audit-security.html', icon: '▣' },
          { t: 'Human Review Queue', d: 'Clinical review of uncertain extractions.', href: 'human-review.html', icon: '☰' },
          { t: 'RAG & AI Safety', d: 'Grounded answers with provenance, safety validation.', href: 'rag-safety.html', icon: '◇' },
          { t: 'FHIR & Standards', d: 'HL7 FHIR R4 resources and terminology.', href: 'fhir-standards.html', icon: '∞' },
          { t: 'Datasets', d: 'Governed, provenance-aware data lake.', href: 'datasets.html', icon: '▦' },
          { t: 'Training & Evaluation', d: 'Golden sets, safety evals, staged deployment.', href: 'training-evaluation.html', icon: '△' },
          { t: 'Notifications', d: 'Email, SMS, push — event-driven.', href: 'notifications.html', icon: '✦' },
          { t: 'Analytics', d: 'Patient, doctor and platform insight.', href: 'analytics.html', icon: '◫' },
        ], { cols: 3 }),
      }),
      U.related(['index', 'mvp-roadmap', 'about'], ['Home', 'MVP Roadmap', 'About EVOLVEX']),
    ],
  },

  /* --------------------------- PATIENT DECK --------------------------- */
  {
    slug: 'patient-deck',
    family: 'decks',
    title: 'Patient Deck — Your Health, Clearly Organized',
    desc: 'The HealthGuard Patient Deck: registration, document vault, AI summaries, health timeline, doctor discovery, triage booking, video or in-person consultations and consent controls.',
    art: 'art-decks.jpg',
    body: (a) => [
      U.hero({
        eyebrow: 'Deck 1 of 3',
        title: 'Patient Deck',
        lead: 'Everything a patient needs to understand their reports, reach a verified doctor and keep their health history together — with full control over who sees what.',
        art: a,
        chips: ['Registration & OTP', 'Document vault', 'AI summaries', 'Timeline', 'Booking', 'Consent'],
      }),
      U.section({
        kicker: 'Journey',
        title: 'The patient path through HealthGuard',
        inner: U.flow(['Registration / login', 'Mobile/email verification', 'Health profile', 'Upload reports', 'AI extraction', 'Understand summary', 'Book triage token', 'Consult', 'Prescriptions', 'Follow-up']),
      }),
      U.section({
        kicker: 'Capabilities',
        title: 'Twenty-two features, one calm surface',
        inner: U.checks([
          'Registration & login with mobile/email verification',
          'Personal health profile',
          'Medical document upload (PDF, JPG, PNG, HEIC, TIFF)',
          'Camera / document scanning capture',
          'AI report extraction with status tracking',
          'AI-generated understandable summary',
          'Abnormal-value highlighting against supplied reference ranges only',
          'Original document viewer',
          'Historical health timeline',
          'Medical document vault',
          'Doctor discovery with specialty filtering',
          'Triage / token booking',
          'Video consultation rooms',
          'In-person consultation booking',
          'Doctor recommendations',
          'Prescriptions & documents',
          'Follow-up reminders',
          'Consent management',
          'Data sharing controls',
          'Access revocation at any time',
          'Account & session management',
          'Security notifications for suspicious activity',
        ]),
      }),
      U.section({
        kicker: 'Detail',
        title: 'What each surface actually does',
        inner: U.accordion([
          { t: 'Upload & camera scanning', d: 'Photograph a report or drop a PDF. The file passes MIME validation, malware scanning and sandboxing, is fingerprinted and encrypted, then enters the AI pipeline. Processing status is visible at every step.' },
          { t: 'AI report summary', d: 'A patient-friendly explanation of what the document contains — cautious language, no diagnosis. Example: "Your hemoglobin is below the reference range shown on this report. This can occur for several reasons. Your report alone cannot establish the cause. A doctor can interpret this together with your symptoms, history and other results."' },
          { t: 'Abnormal-value highlighting', d: 'Values outside the reference range supplied on the report are highlighted — with the range shown beside the value. The system avoids implying clinical significance unless appropriate reference and context exist.' },
          { t: 'Health timeline & vault', d: 'A single chronological record of reports, prescriptions and consultations. Every timeline item opens to Original Document + AI Extracted Data + Doctor Interpretation + Timeline Comparison.' },
          { t: 'Booking, video & follow-up', d: 'Reason for consultation → AI intake → urgency assessment → triage token → queue → verified doctor. Video or in-person, same flow. Follow-up reminders keep the loop closed.' },
        ]),
      }),
      U.note(DISCLAIMER),
      U.related(['report-upload', 'health-timeline', 'consent-sharing'], ['Report Upload', 'Health Timeline', 'Consent & Sharing']),
    ],
  },

  /* ---------------------------- DOCTOR DECK ---------------------------- */
  {
    slug: 'doctor-deck',
    family: 'decks',
    title: 'Doctor Deck — Review, Consult, Document',
    desc: 'The HealthGuard Doctor Deck: verified onboarding, consultation and triage queues, patient charts with original documents and AI extractions, prescriptions, follow-up and audit history.',
    art: 'art-decks.jpg',
    body: (a) => [
      U.hero({
        eyebrow: 'Deck 2 of 3',
        title: 'Doctor Deck',
        lead: 'A review-first clinical workspace: the AI prepares the evidence, the doctor sees the original document beside every extracted value, and every action is audited.',
        art: a,
        chips: ['Verified only', 'Triage queue', 'Patient chart', 'Prescriptions', 'Audit history'],
      }),
      U.section({
        kicker: 'Consultation workflow',
        title: 'From booking to closed encounter',
        inner: U.flow(['Patient books', 'Token generated', 'Doctor accepts', 'Waiting room', 'Patient chart', 'AI report summary', 'Original report review', 'Consultation', 'Assessment', 'Prescription', 'Follow-up', 'Encounter closed']),
      }),
      U.section({
        kicker: 'Capabilities',
        title: 'The full clinical surface',
        inner: U.checks([
          'Doctor registration & identity verification workflow',
          'Professional credential submission and registration number',
          'Qualification documents (degree/certificates)',
          'Specialty & subspecialty profile',
          'Availability management',
          'Appointment management (video + in-person)',
          'Token queue with urgency classes',
          'Waiting-room management',
          'Patient chart and longitudinal timeline',
          'Original medical-document viewer',
          'AI-extracted report view with confidence and uncertainty indicators',
          'AI-generated clinical summary with missing-information list',
          'Doctor notes and encounter management',
          'Diagnosis / assessment fields',
          'Prescription workflow',
          'Follow-up scheduling',
          'Secure video consultation',
          'In-person appointment management',
          'Patient document sharing (consent-bound)',
          'Earnings / transactions (if monetized)',
          'Complete audit history',
        ]),
      }),
      U.section({
        kicker: 'Report view',
        title: 'Original | Extracted | Timeline',
        inner: U.split({
          title: 'Every number keeps its evidence',
          paragraphs: ['A doctor never sees a naked extraction. Each observation shows result, supplied reference range, status and confidence — and the original document is one click away.'],
          list: ['3 extracted abnormalities flagged', 'No diagnosis generated', 'Historical comparison available', 'Missing data listed (e.g. ferritin unavailable)'],
          figure: U.table(['Test', 'Result', 'Range', 'Status'], [
            ['Hemoglobin', '10.4', '12–16', 'LOW'],
            ['MCV', '78', '80–100', 'LOW'],
            ['Platelets', '245', '150–450', 'NORMAL'],
          ]),
        }),
      }),
      U.note('A doctor cannot become publicly searchable or eligible for patient consultations until an administrator explicitly verifies them.', 'warn'),
      U.related(['doctor-verification', 'report-intelligence', 'human-review'], ['Doctor Verification', 'Report Intelligence', 'Human Review Queue']),
    ],
  },

  /* ----------------------------- ADMIN DECK ---------------------------- */
  {
    slug: 'admin-deck',
    family: 'decks',
    title: 'Admin Deck — Verification, AI Ops, Security',
    desc: 'The HealthGuard Admin Deck: doctor verification, patient and doctor management, triage configuration, AI monitoring, dataset governance, security events, analytics and emergency AI shutdown.',
    art: 'art-decks.jpg',
    body: (a) => [
      U.hero({
        eyebrow: 'Deck 3 of 3',
        title: 'Admin Deck',
        lead: 'Operational control over trust: who is verified, how the AI is behaving, which security events fired, and a kill-switch for AI features when needed.',
        art: a,
        chips: ['Doctor verification', 'AI monitoring', 'Security events', 'Feature flags', 'AI emergency-disable'],
      }),
      U.section({
        kicker: 'Overview metrics',
        title: 'What the admin sees first',
        inner: U.stats([
          { n: 23, l: 'Pending verifications', suffix: '' },
          { n: 98, l: 'OCR success rate', suffix: '%' },
          { n: 12, l: 'Failed AI extractions / day', suffix: '' },
          { n: 4, l: 'Security events / week', suffix: '' },
        ]) + U.checks([
          'Active patients', 'Verified doctors', 'Active consultations', 'Reports processed',
          'AI reviews', 'Human-review backlog', 'Model versions live', 'System latency',
        ]),
      }),
      U.section({
        kicker: 'Doctor verification',
        title: 'Identity ✓ Registration ✓ Degree ✓',
        inner: U.split({
          title: 'A review queue with receipts',
          paragraphs: ['Each pending doctor shows a checklist of identity, registration, degree, specialty and documents. Approve, reject, or request clarification — every decision writes an immutable audit event with verification_version, verified_by, verified_at, expiry_date and documents_hash.'],
          figure: U.pills(['UNVERIFIED', 'PENDING_REVIEW', 'VERIFIED', 'SUSPENDED', 'REJECTED'], { VERIFIED: 'pill-ok', REJECTED: 'pill-danger', SUSPENDED: 'pill-t2' }),
        }),
      }),
      U.section({
        kicker: 'AI monitoring',
        title: 'Model behaviour, measured',
        inner: U.confidence([
          { l: 'OCR success rate', v: 96 },
          { l: 'Extraction field accuracy', v: 94 },
          { l: 'Human-review agreement', v: 91 },
          { l: 'Triage override rate (lower is better)', v: 8 },
        ]) + U.checks([
          'Model disagreement tracking', 'Hallucination rate', 'Triage override rate',
          'Latency and token cost', 'Model version registry', 'Emergency shutdown of AI features',
          'Dataset governance controls', 'Abuse detection',
        ], { cols: 2 }),
      }),
      U.section({
        kicker: 'Also inside',
        title: 'The rest of the console',
        inner: U.accordion([
          { t: 'Patient & doctor management', d: 'Search, inspect, suspend and restore accounts. Tenant isolation and object-level authorization are enforced server-side — never trusted from the client.' },
          { t: 'Appointments & tokens', d: 'Monitor appointment flow, queue health, estimated waits, cancellations, expirations and escalations across specialties.' },
          { t: 'Security events & audit viewer', d: 'Immutable audit stream (WHO/WHAT/WHEN/WHERE/WHY/RESOURCE/RESULT) with anomaly flags for suspicious access patterns.' },
          { t: 'Complaints, content & feature flags', d: 'Dispute management, CMS for patient-facing content, and staged feature flags — including AI emergency-disable controls.' },
        ]),
      }),
      U.related(['doctor-verification', 'audit-security', 'analytics'], ['Doctor Verification', 'Audit & Security', 'Analytics']),
    ],
  },

  /* --------------------------- MVP ROADMAP ---------------------------- */
  {
    slug: 'mvp-roadmap',
    family: 'company',
    title: 'MVP Roadmap & Product Positioning',
    desc: 'HealthGuard phased delivery: MVP-1 to MVP-4, what not to build initially, and the product positioning — a clinician-connected health record intelligence platform.',
    art: 'art-evolvex.jpg',
    body: (a) => [
      U.hero({
        eyebrow: 'Roadmap',
        title: 'Earn capabilities through measured validation',
        lead: 'The system ships in four honest phases: document intelligence and clinician workflow first — autonomous clinical decisions never.',
        art: a,
        chips: ['MVP-1 → MVP-4', 'Safety first', 'India-ready'],
      }),
      U.section({
        kicker: 'Phases', title: 'Phased implementation roadmap',
        inner: U.cards([
          { t: 'MVP-1 — Foundation', d: 'Patient registration, doctor registration, admin verification, profiles, document upload, OCR, basic structured extraction, doctor & patient dashboards, appointments, basic token.', icon: '01' },
          { t: 'MVP-2 — Consult loop', d: 'AI report explanation, doctor report view, video consultation, prescription, consent, audit logging.', icon: '02' },
          { t: 'MVP-3 — Intelligence', d: 'Advanced OCR, multilingual support (English, Hindi, Hinglish), clinical timeline, RAG, AI triage, model monitoring, research pipeline.', icon: '03' },
          { t: 'MVP-4 — Interop & scale', d: 'FHIR, ABDM interoperability, advanced analytics, mobile application, enterprise hospital integrations.', icon: '04' },
        ], { cols: 2 }),
      }),
      U.section({
        kicker: 'Discipline', title: 'What NOT to build initially',
        inner: U.note('Avoid: AI diagnosis engine · AI prescribing · autonomous emergency decisions · fully autonomous triage · automatic medical treatment plans · medical imaging diagnosis across every modality. Build the document intelligence + clinician workflow platform first.', 'warn')
          + U.principle('A clinician-connected health record intelligence platform that turns messy medical documents into structured, traceable information and connects patients with verified healthcare professionals.'),
      }),
      U.section({
        kicker: 'Architecture', title: 'The value chain',
        inner: U.flow(['Messy health data', 'AI document intelligence', 'Structured health record', 'Patient understanding', 'Clinician review', 'Consultation', 'Continuous health timeline'], { accent: true }),
      }),
      U.related(['platform', 'ai-pipeline', 'about'], ['Platform Overview', 'AI Pipeline', 'About EVOLVEX']),
    ],
  },

  /* -------------------------- LIVING CANVAS --------------------------- */
  {
    slug: 'living-canvas',
    family: 'system',
    title: 'Living Health Canvas — The Animation System',
    desc: 'HealthGuard Motion Primitives: the Living Health Canvas 5-layer ambient background and the twelve-component animation system behind every page. Built by EVOLVEX IT SOLUTIONS PVT. LTD.',
    art: 'art-canvas.jpg',
    body: (a) => [
      U.hero({
        eyebrow: 'Design & motion system',
        title: 'Living Health Canvas',
        lead: 'Not a particle field. A five-layer, slow-breathing medical surface — paper grain, topographic contours, a faint pulse waveform, drifting motes and one quiet geometric transformation.',
        art: a,
        chips: ['5 canvas layers', '12 motion primitives', 'prefers-reduced-motion', 'GPU-friendly'],
        actions: [{ href: 'contact.html', label: 'Request the design system' }],
      }),
      U.section({
        kicker: 'The five layers', title: 'Anatomy of the canvas',
        inner: U.cards([
          { t: '1 · Paper grain', d: 'A procedural noise texture over the whole surface — tactile matte paper, not screen glow.', icon: '▒' },
          { t: '2 · Contour lines', d: 'Five slow topographic contours breathing at 0.055 opacity — sage and blue-gray.', icon: '◠' },
          { t: '3 · Waveform', d: 'An extremely faint pulse-like medical waveform drifting across the lower field.', icon: '∿' },
          { t: '4 · Soft motes', d: '14–30 sparse particles rising like dust in morning light. Never a starfield.', icon: '·' },
          { t: '5 · Geometry', d: 'One large hexagon slowly rotating and scaling — an occasional transformation.', icon: '⬡' },
        ]),
      }),
      U.section({
        kicker: 'Motion primitives', title: 'Twelve components, one language',
        lead: 'Derived from React Bits and Aceternity reference designs, rebuilt dependency-free and tuned to warm clinical minimalism — matte, low contrast, never neon.',
        inner: U.table(['Primitive', 'Origin', 'Used for'], [
          ['LivingHealthCanvas', 'Product signature', 'Ambient background on every page'],
          ['SplitText reveal', 'React Bits BlurText/SplitText', 'Hero headlines'],
          ['Spotlight breath', 'Aceternity Spotlight (matte)', 'Hero pointer light'],
          ['Sparkle motes', 'Aceternity Sparkles (restrained)', 'Canvas layer 4'],
          ['Stagger cards / Bento', 'Aceternity Bento Grid', 'Feature grids'],
          ['TiltCard', 'Aceternity 3D Card (±3° damped)', 'Hover depth on cards'],
          ['PathDraw pipeline', 'GSAP DrawSVG style', 'Pipeline diagrams'],
          ['PulseLine', 'Product own', 'Section rules, headers'],
          ['CountUp stats', 'AOS-style', 'Metrics'],
          ['InfiniteMarquee', 'Aceternity / Magic UI', 'Standards strip'],
          ['Accordion / Tabs', 'React Bits', 'Deck feature lists'],
          ['QueueTicker + ConfidenceBars', 'Product own', 'Token queue, AI confidence'],
        ]),
      }),
      U.section({
        kicker: 'Rules', title: 'The constraints that keep it clinical',
        inner: U.checks([
          'Opacity very low — animation disappears behind medical content',
          'Speed slow and heartbeat-like; contrast deliberately low',
          'GPU-friendly: one canvas, DPR-capped at 2, alpha/transform only',
          'prefers-reduced-motion → one static frame, no loops',
          'Tab hidden → the whole animation pauses',
          'No neon, no glow, no glassmorphism, no HUD — shadows instead',
          'Touch devices never depend on hover to reveal information',
          'Every effect has a readable static state at 200% zoom',
        ]),
      }),
      U.note('Research basis: React Bits (reactbits.dev), Aceternity UI (ui.aceternity.com/background), Motion/GSAP 2026 landscape, and healthcare design research showing restraint builds trust. Full citations in the Research & Build Log.', 'info'),
      U.related(['index', 'about', 'platform'], ['Home', 'About EVOLVEX', 'Platform Overview']),
    ],
  },

  /* ------------------------------ ABOUT ------------------------------- */
  {
    slug: 'about',
    family: 'company',
    title: 'About EVOLVEX IT SOLUTIONS PVT. LTD.',
    desc: 'EVOLVEX IT SOLUTIONS PVT. LTD. builds HealthGuard — a clinician-connected health record intelligence platform. Engineering-led, safety-first, India-based.',
    art: 'art-evolvex.jpg',
    body: (a) => [
      U.hero({
        eyebrow: 'The company',
        title: 'EVOLVEX IT SOLUTIONS PVT. LTD.',
        lead: 'An engineering company that builds serious healthcare infrastructure — of which HealthGuard is the flagship: messy medical documents in, structured traceable records out, verified clinicians in the loop at every step.',
        art: a,
        chips: ['Varanasi, Uttar Pradesh, India', 'Healthcare software', 'AI engineering', 'Security-first'],
        actions: [{ href: 'contact.html', label: 'Work with us' }, { href: 'platform.html', label: 'See HealthGuard' }],
      }),
      U.section({
        kicker: 'What we believe', title: 'Principles we ship by',
        inner: U.cards([
          { t: 'Assistive AI, always', d: 'AI extracts, organizes, summarizes and flags. Qualified clinicians interpret and decide. We never blur that line.', icon: '✚' },
          { t: 'Evidence over vibes', d: 'Every capability must earn its place through measured evaluation — golden sets, safety evals, red-team reviews.', icon: '△' },
          { t: 'Privacy is architecture', d: 'Consent, audit, encryption, tenancy isolation and data separation are designed in — not bolted on. Encryption alone is not compliance.', icon: '◍' },
          { t: 'Craft at every width', d: 'From 320px phones to ultrawide desktops — including mobile browsers in Desktop mode — nothing gets cut, clipped or uneven.', icon: '▭' },
        ], { cols: 2 }),
      }),
      U.section({
        kicker: 'Engineering stack', title: 'How HealthGuard is built',
        inner: U.checks([
          'Next.js + TypeScript + Tailwind design system',
          'Python / FastAPI services',
          'PyTorch, Transformers, OCR/Vision models, RAG',
          'PostgreSQL, Redis, pgvector, S3-compatible storage',
          'HL7 FHIR, LOINC, UCUM, ICD, SNOMED CT, DICOM',
          'WebRTC + SFU (LiveKit / mediasoup / Janus class)',
          'Docker, CI/CD, IaC, OpenTelemetry observability',
          'OWASP ASVS + OWASP API Security baselines',
        ]),
      }),
      U.principle('We build HealthGuard as a serious healthcare platform, not as a generic SaaS dashboard.'),
      U.related(['contact', 'audit-security', 'mvp-roadmap'], ['Contact', 'Audit & Security', 'MVP Roadmap']),
    ],
  },

  /* ----------------------------- CONTACT ------------------------------ */
  {
    slug: 'contact',
    family: 'company',
    title: 'Contact EVOLVEX IT SOLUTIONS PVT. LTD.',
    desc: 'Start a conversation with EVOLVEX IT SOLUTIONS PVT. LTD. about HealthGuard — deployments, integrations, clinical partnerships and security reviews.',
    art: 'art-evolvex.jpg',
    body: (a) => [
      U.hero({
        eyebrow: 'Contact',
        title: "Let's build careful healthcare software",
        lead: 'Whether you are a hospital, a clinic chain, a research group or an investor — we are happy to walk through the architecture, the security model and the roadmap in detail.',
        art: a,
        chips: ['Partnerships', 'Deployments', 'Integrations', 'Security reviews'],
      }),
      U.section({
        kicker: 'Engage', title: 'Ways to work with us',
        inner: U.cards([
          { t: 'Platform deployment', d: 'Stand up HealthGuard for your practice or hospital network — patient, doctor and admin decks included.', icon: '⌂' },
          { t: 'Systems integration', d: 'FHIR / ABDM integration, enterprise hospital systems, LIS/RIS bridges, custom terminology mapping.', icon: '∞' },
          { t: 'Clinical AI program', d: 'OCR and extraction pipelines, dataset governance, evaluation frameworks and human-review workflows.', icon: '◇' },
          { t: 'Security & compliance review', d: 'Threat modeling, OWASP ASVS/API assessments, consent and audit architecture review for digital health.', icon: '▣' },
        ], { cols: 2 }),
      }),
      U.section({
        kicker: 'Details', title: 'EVOLVEX IT SOLUTIONS PVT. LTD.',
        inner: U.table(['Field', 'Value'], [
          ['Company', 'EVOLVEX IT SOLUTIONS PVT. LTD.'],
          ['Flagship product', 'HealthGuard — health record intelligence platform'],
          ['Location', 'Varanasi, Uttar Pradesh, India'],
          ['Focus', 'Healthcare software · Applied AI · Security engineering'],
          ['Interoperability', 'HL7 FHIR R4 · LOINC · UCUM · ICD · DICOM'],
        ]),
      }),
      U.note('HealthGuard AI systems are assistive. They do not diagnose, prescribe or replace clinical judgment.', 'info'),
      U.related(['about', 'platform', 'doctor-verification'], ['About EVOLVEX', 'Platform Overview', 'Doctor Verification']),
    ],
  },
];
