// HealthGuard — STANDARDS & DATA pages.
import * as U from '../src/ui.mjs';

export default [
  {
    slug: 'fhir-standards',
    family: 'data',
    title: 'FHIR & Interoperability — Standards, Not Inventions',
    desc: 'HealthGuard interoperability: HL7 FHIR R4 resources (Patient, Practitioner, Observation, DiagnosticReport and more), LOINC for labs, UCUM units, ICD, SNOMED CT where licensed, RxNorm and DICOM for imaging.',
    art: 'art-standards.jpg',
    body: (a) => [
      U.hero({
        eyebrow: 'Standards & Data · 1',
        title: 'FHIR & Standards',
        lead: 'Use standards instead of inventing terminology. FHIR is part of the architecture from day one — not an afterthought.',
        art: a,
        chips: ['HL7 FHIR R4', 'LOINC', 'UCUM', 'ICD-10/11', 'SNOMED CT', 'DICOM'],
        actions: [{ href: 'https://www.hl7.org/fhir/R4/', label: 'HL7 FHIR R4' }],
      }),
      U.principle('Do not allow the AI to invent medical terminology codes.'),
      U.section({
        kicker: 'FHIR resources', title: 'Modeled natively',
        inner: U.checks([
          'Patient', 'Practitioner', 'Organization', 'Observation', 'DiagnosticReport',
          'Condition', 'Medication', 'MedicationRequest', 'Encounter', 'Appointment',
          'CarePlan', 'DocumentReference', 'Consent', 'Provenance', 'AuditEvent',
        ], { cols: 3 }),
      }),
      U.section({
        kicker: 'Terminology', title: 'What maps to what',
        inner: U.table(['Standard', 'Purpose', 'Used for'], [
          ['LOINC', 'Laboratory observation identification', 'Test names and codes'],
          ['UCUM', 'Units of measure', 'Unit normalization (g/dL, fL, ×10⁹/L)'],
          ['ICD-10 / ICD-11', 'Diagnosis classification', 'Condition coding'],
          ['SNOMED CT', 'Clinical terminology', 'Where licensing/access permits'],
          ['RxNorm', 'Medication normalization', 'Drug names and ingredients'],
          ['DICOM', 'Imaging', 'X-ray / CT / MRI objects'],
        ]),
      }),
      U.section({
        kicker: 'Normalization', title: 'Hb = Hemoglobin = HGB',
        inner: U.split({
          title: 'Model 4 — Medical normalization',
          paragraphs: ['Local spellings, abbreviations and legacy labels map to a single clinical concept before any comparison or summary is computed. Without this, timeline deltas would compare apples to oranges.'],
          figure: U.code('Normalization map', `Hb  ─┐
Hemoglobin ─┼─→ LOINC 718-7
HGB  ─┘     (Hemoglobin [Mass/volume]
             in Blood)

value: 10.4  →  UCUM g/dL
range: 12–16 →  supplied by report`),
        }),
      }),
      U.note('India posture: design with Indian digital-health interoperability and privacy requirements (DPDP, ABDM) in mind from day one. Do not treat "we encrypted the database" as compliance.', 'warn'),
      U.related(['ai-pipeline', 'health-timeline', 'datasets'], ['AI Pipeline', 'Health Timeline', 'Datasets']),
    ],
  },

  {
    slug: 'datasets',
    family: 'data',
    title: 'Dataset Strategy & Data Lake',
    desc: 'HealthGuard dataset program: OCR/document, clinical NLP, structured EHR, imaging and synthetic datasets in a governed data lake with source, license, provenance and allowed-use tracking. The moat is difficult real-world documents with expert annotations.',
    art: 'art-standards.jpg',
    body: (a) => [
      U.hero({
        eyebrow: 'Standards & Data · 2',
        title: 'Datasets',
        lead: 'Not "scrape the medical internet". A legally governed, provenance-aware multimodal clinical-document dataset — difficult conditions included.',
        art: a,
        chips: ['Governed', 'Provenance-tracked', 'Synthetic-safe', 'Expert-annotated'],
      }),
      U.section({
        kicker: 'Categories', title: 'Five dataset families',
        inner: U.cards([
          { t: 'A · OCR / document', d: 'Layouts, handwriting, tables, noisy scans, photographs, printed text, forms.', icon: '▤' },
          { t: 'B · Clinical NLP', d: 'Entity extraction, diagnosis, medication, symptoms, temporal information.', icon: '◇' },
          { t: 'C · Structured EHR', d: 'Longitudinal records, observations, encounters, medications.', icon: '▦' },
          { t: 'D · Medical imaging', d: 'X-ray, CT, MRI, dermatology, pathology.', icon: '◎' },
          { t: 'E · Synthetic data', d: 'Development, load testing, privacy-safe training, edge cases.', icon: '⬡' },
        ]),
      }),
      U.section({
        kicker: 'Data lake', title: 'RAW → processed → annotations → evaluation',
        inner: U.split({
          title: 'Every sample carries its papers',
          paragraphs: ['If provenance cannot be proven, the sample cannot enter. This is the legal and ethical spine of the dataset program.'],
          list: ['/raw — public, licensed, credentialed, synthetic', '/processed — documents, OCR, entities, observations, imaging', '/annotations — extraction, entity, relation, classification, triage, QA', '/evaluation — golden, adversarial, difficult_ocr, edge cases, regression'],
          figure: U.code('Sample metadata', `{
  "source": "",
  "license": "",
  "collection_date": "",
  "patient_status": "synthetic/deidentified",
  "annotation_version": "",
  "provenance": "",
  "allowed_use": "",
  "quality_score": ""
}`),
        }),
      }),
      U.section({
        kicker: 'Reference datasets', title: 'Where data starts',
        inner: U.cards([
          { t: 'Synthea', d: 'Realistic synthetic patient histories — medications, allergies, encounters, SDOH; exports FHIR, C-CDA and CSV. Avoids real-patient privacy restrictions.', icon: '✦' },
          { t: 'MIMIC-IV', d: 'Clinical research gold — credentialed access, DUA and training required. Clinical NLP, longitudinal modeling, ICU data, outcomes research.', icon: '✦' },
          { t: 'CheXpert', d: 'Large chest-radiograph dataset with uncertainty labels and expert-labeled evaluation sets.', icon: '✦' },
        ]),
      }),
      U.principle('The most valuable dataset eventually is: real-world difficult documents + expert annotations + OCR corrections + structured observations + doctor validation + uncertainty labels + model errors + corrected outputs. That is a continuously improving system.'),
      U.note('Never scrape arbitrary medical websites and assume the content is legally usable for training.', 'warn'),
      U.related(['training-evaluation', 'fhir-standards', 'consent-sharing'], ['Training & Evaluation', 'FHIR & Standards', 'Consent & Sharing']),
    ],
  },

  {
    slug: 'training-evaluation',
    family: 'data',
    title: 'Training & Evaluation — Golden Sets & Safety Evals',
    desc: 'HealthGuard training pipeline: license verification, de-identification, annotation with inter-annotator agreement, clinical and safety evaluation, red-teaming, model registry and staged deployment. A permanent 5,000-case golden set is never trained on.',
    art: 'art-standards.jpg',
    body: (a) => [
      U.hero({
        eyebrow: 'Standards & Data · 3',
        title: 'Training & Evaluation',
        lead: 'A model ships when it survives clinical evaluation, safety evaluation and red-teaming — never because the demo looked good.',
        art: a,
        chips: ['Golden set', 'Safety evals', 'Red-team', 'Staged deployment'],
      }),
      U.section({
        kicker: 'Pipeline', title: 'Raw data to staged deployment',
        inner: U.pipeline(['Raw data', 'License verification', 'De-identification', 'Quality filtering', 'Annotation', 'Inter-annotator agreement', 'Golden dataset', 'Train', 'Validation', 'Clinical evaluation', 'Safety evaluation', 'Red-team evaluation', 'Model registry', 'Staged deployment']),
      }),
      U.section({
        kicker: 'Annotation', title: 'Labels and relations',
        inner: U.split({
          title: 'What annotators write down',
          paragraphs: ['Entity labels plus relation labels plus uncertainty labels — uncertainty is a first-class annotation, not an omission.'],
          list: ['TEST → RESULT', 'RESULT → UNIT', 'TEST → REFERENCE_RANGE', 'MEDICATION → DOSAGE', 'MEDICATION → FREQUENCY'],
          figure: U.checks(['PATIENT_NAME · DOB · REPORT_DATE', 'DOCTOR · FACILITY', 'TEST_NAME · RESULT · UNIT', 'REFERENCE_RANGE · ABNORMAL_FLAG', 'SPECIMEN', 'MEDICATION · DOSAGE · FREQUENCY', 'DIAGNOSIS · SYMPTOM · BODY_SITE', 'DATE'], { cols: 1 }),
        }),
      }),
      U.section({
        kicker: 'Evaluation', title: 'Six scoreboards',
        inner: U.table(['Domain', 'Metrics'], [
          ['OCR', 'CER, WER, field accuracy, value accuracy, unit accuracy'],
          ['Medical extraction', 'Precision, recall, F1, relation F1'],
          ['Clinical', 'Sensitivity, specificity, calibration, false-negative rate, subgroup performance'],
          ['Generative', 'Factuality, groundedness, citation correctness, hallucination rate, unsupported-claim rate'],
          ['Safety', 'Dangerous recommendation rate, critical omission rate, wrong-patient leakage rate, unsupported diagnosis rate, unsafe triage rate'],
          ['Scale targets', 'Phase 1: 20–50k docs · Phase 2: 50–150k pages · Phase 3: clinician-annotated proprietary set'],
        ]) + U.note('Difficult cases deliberately included: low resolution, mobile photos, glare, shadows, handwriting, stamps, folds, skew, multi-page, tables, mixed languages — Hindi, English, Hinglish, regional formats.', 'info'),
      }),
      U.section({
        kicker: 'MEDICAL AI GOLDEN SET', title: '5,000 cases, locked forever',
        inner: U.stats([
          { n: 1000, l: 'Easy', suffix: '' },
          { n: 1000, l: 'Moderate', suffix: '' },
          { n: 1000, l: 'Difficult', suffix: '' },
          { n: 500, l: 'Handwritten', suffix: '' },
          { n: 500, l: 'Low-quality photographs', suffix: '' },
          { n: 500, l: 'Multilingual', suffix: '' },
          { n: 500, l: 'Adversarial', suffix: '' },
          { n: 500, l: 'Clinical edge cases', suffix: '' },
        ]) + U.principle('Never train on this set. Use it only for evaluation.'),
      }),
      U.related(['datasets', 'human-review', 'analytics'], ['Datasets', 'Human Review Queue', 'Analytics']),
    ],
  },

  {
    slug: 'notifications',
    family: 'data',
    title: 'Notification System — Email, SMS, Push',
    desc: 'HealthGuard notifications: OTP, appointment confirmation, doctor approval, token approaching, video reminders, report processing, shared documents, prescriptions and follow-ups — over email, SMS, push and WhatsApp later.',
    art: 'art-timeline.jpg',
    body: (a) => [
      U.hero({
        eyebrow: 'Standards & Data · 4',
        title: 'Notifications',
        lead: 'The right nudge at the right moment — token approaching, report ready, follow-up due — without leaking health data into the message itself.',
        art: a,
        chips: ['Email', 'SMS', 'Push', 'WhatsApp later'],
      }),
      U.section({
        kicker: 'Channels', title: 'Where messages go',
        inner: U.cards([
          { t: 'Email', d: 'Verifications, summaries links (never PHI in body), receipts.', icon: '✉' },
          { t: 'SMS', d: 'OTP and time-critical token/appointment nudges.', icon: '▤' },
          { t: 'Push', d: 'Mobile app: queue position, reminders, room ready.', icon: '◉' },
          { t: 'WhatsApp (later)', d: 'Where appropriate and consented, in-region.', icon: '◍' },
        ], { cols: 2 }),
      }),
      U.section({
        kicker: 'Events', title: 'What triggers a message',
        inner: U.checks([
          'OTP verification codes',
          'Appointment confirmation',
          'Doctor approval / rejection',
          'Token approaching (queue countdown)',
          'Video consultation reminder & room ready',
          'Report processing completed',
          'Doctor shared a document',
          'Prescription generated',
          'Follow-up reminder',
        ]) + U.note('Notification content is minimized: "Your report is ready" with a secure link — never lab values in an SMS.', 'warn'),
      }),
      U.related(['token-queue', 'health-timeline', 'patient-deck'], ['Token & Queue', 'Health Timeline', 'Patient Deck']),
    ],
  },

  {
    slug: 'analytics',
    family: 'data',
    title: 'Analytics — Patient, Doctor, Platform',
    desc: 'HealthGuard analytics: report uploads, AI processing, consultation completion and follow-up adherence for patients; volume, duration, queue time and AI correction rate for doctors; OCR success, confidence and latency for the platform.',
    art: 'art-timeline.jpg',
    body: (a) => [
      U.hero({
        eyebrow: 'Standards & Data · 5',
        title: 'Analytics',
        lead: 'Three audiences, three scorecards — and the platform scorecard doubles as an early-warning system for model drift.',
        art: a,
        chips: ['Patient', 'Doctor', 'Platform', 'Drift detection'],
      }),
      U.section({
        kicker: 'Scorecards', title: 'What each audience sees',
        inner: U.table(['Audience', 'Measures'], [
          ['Patient', 'Report uploads, AI processing status, consultation completion, follow-up adherence'],
          ['Doctor', 'Consultation volume, average consultation duration, queue time, AI correction rate, patient follow-up'],
          ['Platform', 'OCR success, AI confidence distributions, human-review rate, model errors, system latency, queue latency'],
        ]),
      }),
      U.section({
        kicker: 'AI monitoring tie-in', title: 'The model-health dashboard',
        inner: U.confidence([
          { l: 'OCR success rate', v: 96 },
          { l: 'Extraction accuracy', v: 94 },
          { l: 'Human-review agreement', v: 91 },
          { l: 'Hallucination containment', v: 99 },
        ]) + U.checks([
          'Model disagreement tracking', 'Triage override rate', 'Latency & token cost',
          'Model version performance comparison', 'Regression alerts against the golden set',
        ], { cols: 2 }),
      }),
      U.note('Analytics run on aggregated, de-identified event data wherever possible. Researchers never get direct production database access.', 'info'),
      U.related(['admin-deck', 'training-evaluation', 'ai-models'], ['Admin Deck', 'Training & Evaluation', 'Model Suite']),
    ],
  },
];
