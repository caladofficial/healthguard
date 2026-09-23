// HealthGuard — DOCUMENT INTELLIGENCE pages (upload → OCR → pipeline → models → report view → timeline).
import * as U from '../src/ui.mjs';

const PROV = 'Every extracted field carries confidence and provenance. Uncertain OCR never silently becomes trusted medical data.';

export default [
  {
    slug: 'report-upload',
    family: 'docs',
    title: 'Report Upload System — Secure Intake Pipeline',
    desc: 'HealthGuard report upload: virus scan, file validation, encrypted object storage, document fingerprinting, then OCR and AI extraction — supporting PDF, JPG, JPEG, PNG, HEIC and TIFF.',
    art: 'art-documents.jpg',
    body: (a) => [
      U.hero({
        eyebrow: 'Document AI · 1',
        title: 'Report Upload System',
        lead: 'A photograph of a crumpled lab report is untrusted input. It enters through a security layer before any model is allowed to read it.',
        art: a,
        chips: ['PDF · JPG · PNG · HEIC · TIFF', 'Encrypted at rest', 'Malware-scanned', 'Fingerprinted'],
      }),
      U.section({
        kicker: 'Pipeline', title: 'Upload → structured record',
        inner: U.pipeline(['Upload', 'Virus scan', 'File validation', 'Encrypted storage', 'Fingerprint', 'OCR', 'AI extraction', 'Validation', 'Human review if needed', 'FHIR representation', 'Patient record']),
      }),
      U.section({
        kicker: 'Security layer', title: 'Nothing enters raw',
        inner: U.checks([
          'MIME type validation (content sniffing, not extension trust)',
          'Malware / antivirus scanning',
          'Sandboxed decompression with decompression-bomb protection',
          'File-size and page-count limits',
          'Encrypted object storage — private buckets, temporary signed URLs',
          'Document fingerprint (hash) for dedupe and tamper evidence',
          'Uploaded reports are treated as untrusted input, never as instructions',
        ]),
      }),
      U.section({
        kicker: 'Formats', title: 'Supported today, extensible tomorrow',
        inner: U.split({
          title: 'Now and next',
          paragraphs: ['Mobile photos of paper reports are a first-class citizen — the format table is the reality of Indian healthcare paperwork, not a marketing claim.'],
          figure: U.table(['Format', 'Status', 'Notes'], [
            ['PDF', 'Supported', 'Multi-page, scanned or digital'],
            ['JPG / JPEG', 'Supported', 'Phone camera captures'],
            ['PNG', 'Supported', 'Screenshots and scans'],
            ['HEIC', 'Supported', 'iOS camera default'],
            ['TIFF', 'Supported', 'Multi-page scans'],
            ['DICOM', 'Planned', 'Imaging pipeline'],
            ['DOCX / HL7 / FHIR JSON', 'Planned', 'Structured sources'],
          ]),
        }),
      }),
      U.section({
        kicker: 'Events', title: 'Event-driven processing',
        inner: U.flow(['DOCUMENT_UPLOADED', 'DOCUMENT_SCANNED', 'OCR_COMPLETED', 'EXTRACTION_COMPLETED', 'VALIDATION_COMPLETED', 'REPORT_READY']),
      }),
      U.note('Uploads never execute. Extracted text is data — it cannot instruct the system, call tools or alter prompts (prompt-injection defense).', 'warn'),
      U.related(['ocr-engine', 'ai-pipeline', 'patient-deck'], ['Difficult Photo OCR', 'AI Pipeline', 'Patient Deck']),
    ],
  },

  {
    slug: 'ocr-engine',
    family: 'docs',
    title: 'Difficult Photo OCR — Blur, Glare, Handwriting',
    desc: 'HealthGuard OCR for real-world documents: blur detection, perspective correction, denoising, super-resolution and an OCR ensemble with consensus, confidence and mandatory human review when uncertain.',
    art: 'art-documents.jpg',
    body: (a) => [
      U.hero({
        eyebrow: 'Document AI · 2',
        title: 'Difficult Photo OCR',
        lead: 'Real reports arrive folded, faded, glared, skewed and scribbled on. The engine is designed for that reality — and it knows when it does not know.',
        art: a,
        chips: ['Blur & glare handling', 'Handwriting', 'OCR ensemble', 'Consensus + confidence'],
      }),
      U.section({
        kicker: 'Enhancement', title: 'Before a single character is read',
        inner: U.pipeline(['Blur detection', 'Orientation detection', 'Perspective correction', 'Illumination correction', 'Denoising', 'Red-mark / handwriting handling', 'Super-resolution', 'OCR ensemble']),
      }),
      U.section({
        kicker: 'Ensemble', title: 'OCR-A · OCR-B · OCR-C → consensus',
        inner: U.split({
          title: 'Three readers, one verdict',
          paragraphs: ['Independent OCR engines transcribe the same enhanced image; a consensus layer reconciles them; medical validation then checks plausibility of test names, units and ranges.'],
          figure: U.code('High-confidence extraction', `Extracted:
  Hb = 10.4

OCR confidence      = 0.97
semantic confidence = 0.96
unit confidence     = 0.99

FINAL = HIGH CONFIDENCE`),
        }) + U.split({
          flip: true,
          title: 'Low confidence stops the line',
          paragraphs: ['A value that cannot be trusted is flagged for the Clinical Review Queue instead of becoming structured data.'],
          figure: U.code('Low-confidence extraction', `Extracted:
  Hb = 18.4

OCR confidence  = 0.58
unit confidence = 0.41

FINAL = HUMAN REVIEW REQUIRED`),
        }),
      }),
      U.section({
        kicker: 'Difficult cases', title: 'The benchmark we design against',
        inner: U.checks([
          'Low resolution and heavy compression',
          'Mobile photos with glare and shadows',
          'Handwritten marks, stamps, signatures',
          'Overwritten and crossed-out text',
          'Folds, skew, torn pages',
          'Multi-page documents and tables',
          'Mixed languages — English, Hindi, Hinglish',
          'Regional laboratory formats and layouts',
        ]),
      }),
      U.note(PROV, 'warn'),
      U.related(['human-review', 'ai-pipeline', 'datasets'], ['Human Review Queue', 'AI Pipeline', 'Datasets']),
    ],
  },

  {
    slug: 'ai-pipeline',
    family: 'docs',
    title: 'AI Document Intelligence Pipeline',
    desc: 'HealthGuard AI architecture: a modular clinical-document pipeline — classifier, image enhancement, OCR, layout understanding, medical NER, normalization to LOINC/UCUM/ICD, clinical reasoning with retrieval and safety validation.',
    art: 'art-documents.jpg',
    body: (a) => [
      U.hero({
        eyebrow: 'Document AI · 3',
        title: 'AI Document Intelligence',
        lead: 'Not one giant model. A modular clinical-document pipeline where each stage has one job, one evaluation and one owner.',
        art: a,
        chips: ['Modular pipeline', 'LOINC · UCUM · ICD', 'Safety layer', 'Dual summaries'],
      }),
      U.section({
        kicker: 'Architecture', title: 'Patient upload → patient & doctor explanation',
        inner: U.pipeline(['File security layer', 'Document classifier', 'Image enhancement', 'OCR / Vision', 'Layout understanding', 'Medical NER', 'Normalization', 'Clinical reasoning + retrieval', 'Safety / confidence', 'Patient explanation + doctor view']),
      }),
      U.section({
        kicker: 'Branching', title: 'Classify first, then specialize',
        inner: U.split({
          title: 'Lab Report · Prescription · Imaging Report',
          paragraphs: ['The document classifier routes each file to document-type-specific extraction logic. A CBC table and a handwritten prescription should never be parsed by the same assumptions.'],
          list: ['Lab Report → observation tables', 'Prescription → medication/dosage/frequency', 'Imaging Report → findings/impressions', 'Discharge Summary → mixed', 'Unknown → conservative fallback + review'],
          figure: U.flow(['Upload', 'Classifier', 'Specialist extractor', 'Normalizer', 'Safety validator']),
        }),
      }),
      U.section({
        kicker: 'Structured output', title: 'The contract: structured clinical data',
        inner: U.code('Example extraction (FHIR-mappable)', `{
  "document_type": "laboratory_report",
  "document_date": "2026-09-20",
  "patient_match": { "confidence": 0.98 },
  "observations": [
    {
      "test": "Hemoglobin",
      "value": 10.4,
      "unit": "g/dL",
      "reference_range": { "low": 12, "high": 16 },
      "status": "below_reference",
      "confidence": 0.99
    }
  ],
  "medications": [],
  "diagnoses": [],
  "warnings": [],
  "extraction_confidence": 0.96,
  "requires_human_review": false
}`),
      }),
      U.section({
        kicker: 'Extraction schema', title: 'What gets extracted — and linked',
        inner: U.split({
          title: 'Entities and relations',
          paragraphs: ['Fields without relations are trivia. Relations without provenance are guesses. HealthGuard extracts both.'],
          list: ['TEST → RESULT', 'RESULT → UNIT', 'TEST → REFERENCE_RANGE', 'MEDICATION → DOSAGE', 'MEDICATION → FREQUENCY'],
          figure: U.checks(['Patient information', 'Report date · facility · doctor', 'Test · result · unit', 'Reference range · abnormal flag', 'Specimen', 'Medication · dosage · frequency', 'Diagnosis · symptom · body site', 'Relevant dates'], { cols: 1 }),
        }),
      }),
      U.note('Do not allow the AI to invent medical terminology codes — normalization only maps to established standards (LOINC, UCUM, ICD, RxNorm, SNOMED CT where licensed, DICOM).', 'warn'),
      U.related(['ai-models', 'rag-safety', 'report-intelligence'], ['Model Suite', 'RAG & AI Safety', 'Report Intelligence']),
    ],
  },

  {
    slug: 'ai-models',
    family: 'docs',
    title: 'The Model Suite — Eight Specialists',
    desc: 'HealthGuard model suite: document classifier, OCR, medical NER, normalization, patient summarizer, doctor summarizer, triage model and safety model — fine-tuned components over foundation models, not a monolith.',
    art: 'art-intelligence.jpg',
    body: (a) => [
      U.hero({
        eyebrow: 'Document AI · 4',
        title: 'Eight specialists, not one giant',
        lead: 'Foundation models do the heavy lifting; specialist models own each clinical job; every model has its own evaluation and version.',
        art: a,
        chips: ['Foundation + fine-tune', 'Per-model evals', 'Versioned registry'],
      }),
      U.section({
        kicker: 'Suite', title: 'Model inventory',
        inner: U.cards([
          { t: 'Model 1 — Classifier', d: 'CBC, LFT, KFT, Lipid Profile, Prescription, Discharge Summary, Radiology, Pathology, ECG, Unknown.', icon: '◇' },
          { t: 'Model 2 — OCR', d: 'Specialized document OCR with consensus ensemble support.', icon: '◎' },
          { t: 'Model 3 — Medical NER', d: 'TEST, VALUE, UNIT, REFERENCE_RANGE, MEDICATION, DOSAGE, DIAGNOSIS, SYMPTOM, BODY_PART, DATE, DOCTOR, HOSPITAL.', icon: '⬡' },
          { t: 'Model 4 — Normalization', d: 'Maps Hb / Hemoglobin / HGB to one concept — LOINC, UCUM, ICD, RxNorm.', icon: '∞' },
          { t: 'Model 5 — Patient summarizer', d: 'Cautious, understandable explanations. No diagnosis language.', icon: '▤' },
          { t: 'Model 6 — Doctor summarizer', d: 'Findings, abnormalities, historical changes, follow-up items, missing information.', icon: '▤' },
          { t: 'Model 7 — Triage model', d: 'Recommends workflow urgency only. Never a disease claim.', icon: '◉' },
          { t: 'Model 8 — Safety model', d: 'Unsupported conclusions, contradictions, hallucinations, dangerous advice, missing context, uncertainty.', icon: '▣' },
        ], { cols: 2 }),
      }),
      U.section({
        kicker: 'Strategy', title: 'Do not train a foundation model from scratch',
        inner: U.flow(['Vision model', 'Document understanding', 'Medical NLP', 'Structured data', 'Clinical RAG / reasoner', 'Safety validator', 'Doctor-facing result'])
          + U.principle('First use existing foundation models + specialized models. Then fine-tune specific components.'),
      }),
      U.related(['training-evaluation', 'ai-pipeline', 'rag-safety'], ['Training & Evaluation', 'AI Pipeline', 'RAG & AI Safety']),
    ],
  },

  {
    slug: 'report-intelligence',
    family: 'docs',
    title: 'Report Intelligence — Summaries & Uncertainty UI',
    desc: 'HealthGuard AI report screen: patient-friendly summaries, abnormal-value highlighting against supplied ranges, doctor views with confidence, and an uncertainty UI that shows verified, review-required and unable-to-determine states.',
    art: 'art-intelligence.jpg',
    body: (a) => [
      U.hero({
        eyebrow: 'Document AI · 5',
        title: 'Report Intelligence',
        lead: 'Two audiences, one extraction: a calm explanation for patients, a dense evidence view for doctors — and honest uncertainty for both.',
        art: a,
        chips: ['Patient summary', 'Doctor view', 'Uncertainty UI', 'Confidence shown'],
      }),
      U.section({
        kicker: 'Patient screen', title: 'What the patient reads',
        inner: U.split({
          title: 'CBC REPORT — AI extraction complete',
          paragraphs: ['3 findings require attention. Values outside the range printed on the report are highlighted — with the range beside them. The disclaimer is permanent, not fine print.'],
          list: ['Hemoglobin 10.4 g/dL — below supplied reference', 'MCV 78 fL — below supplied reference', 'Platelets 245 ×10⁹/L — within supplied reference', 'This is an informational summary and does not replace clinical evaluation.'],
          figure: U.confidence([
            { l: 'AI confidence', v: 94 },
            { l: 'Patient identity match', v: 98 },
          ]),
        }),
      }),
      U.section({
        kicker: 'Doctor screen', title: 'What the clinician reads',
        inner: U.code('AI NOTES (doctor view)', `OBSERVATION   Hemoglobin: 10.4 g/dL
REFERENCE     12.0–16.0 g/dL
STATUS        Below supplied reference range
CONFIDENCE    0.97

RELATED OBSERVATIONS
  MCV: 78 fL
  Ferritin: unavailable

POSSIBLE CLINICAL CONTEXT
  Requires clinician interpretation.

MISSING INFORMATION
  • symptoms
  • age/sex-specific context
  • ferritin
  • relevant history`),
      }),
      U.section({
        kicker: 'Uncertainty UI', title: 'Never hide what the model does not know',
        inner: U.split({
          flip: true,
          title: 'States instead of naked percentages',
          paragraphs: ['Confidence numbers alone create false precision. HealthGuard surfaces three human states first, numbers second: "The photograph is unclear around the reference range. Please verify the original document."'],
          figure: U.pills(['✓ Verified extraction', '⚠ Review required', '? Unable to determine']),
        }) + U.note('AI output is probabilistic. Extracted fact, supplied reference range, model interpretation, uncertainty, missing information and clinician conclusion are always visually distinguished.', 'warn'),
      }),
      U.related(['human-review', 'doctor-deck', 'health-timeline'], ['Human Review Queue', 'Doctor Deck', 'Health Timeline']),
    ],
  },

  {
    slug: 'health-timeline',
    family: 'docs',
    title: 'Health Timeline — Unified Longitudinal Record',
    desc: 'The HealthGuard health timeline: one chronological record of reports, prescriptions and consultations, with historical comparison, original documents and doctor interpretation — built on FHIR-aligned structures.',
    art: 'art-timeline.jpg',
    body: (a) => [
      U.hero({
        eyebrow: 'Document AI · 6',
        title: 'Health Timeline',
        lead: 'One patient, one chronology. Reports, prescriptions, consultations and follow-ups on a single spine — with each item traceable back to its original page.',
        art: a,
        chips: ['Longitudinal record', 'Historical comparison', 'FHIR-aligned'],
      }),
      U.section({
        kicker: 'MY HEALTH', title: 'A year at a glance',
        inner: U.split({
          title: '2026',
          paragraphs: ['Clicking any report opens four layers of truth: the original document, the AI-extracted data, the doctor interpretation and the timeline comparison.'],
          list: ['Sept 20 — CBC uploaded', 'Sept 18 — Doctor consultation', 'Sept 12 — Prescription', 'Aug 28 — Blood glucose report'],
          figure: U.code('Historical comparison', `Hemoglobin

  Previous    Current
  11.1        10.4
      ↓
  Change: -0.7 g/dL

Note: clinical significance is
NOT implied — interpretation
requires context and a clinician.`),
        }),
      }),
      U.section({
        kicker: 'Discipline', title: 'Comparison without diagnosis',
        inner: U.checks([
          'Deltas computed only between commensurable values (same LOINC concept + unit)',
          'Unit conversion via UCUM before any comparison',
          'Reference-range provenance travels with every value',
          'No "improving/worsening" language without validated context',
          'Doctor interpretation is a distinct, attributed layer',
          'Missing data is shown as missing — never silently dropped',
        ]) + U.principle('The system should avoid implying clinical significance unless appropriate reference and context exist.'),
      }),
      U.related(['fhir-standards', 'report-intelligence', 'patient-deck'], ['FHIR & Standards', 'Report Intelligence', 'Patient Deck']),
    ],
  },
];
