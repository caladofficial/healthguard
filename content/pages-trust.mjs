// HealthGuard — TRUST & SAFETY pages.
import * as U from '../src/ui.mjs';

export default [
  {
    slug: 'consent-sharing',
    family: 'trust',
    title: 'Consent & Data Sharing — Consent as a First-Class Object',
    desc: 'HealthGuard consent architecture: patient, purpose, recipient, data scope, start, expiry, revocation and audit history. Sharing a report with a doctor is distinct from research permission.',
    art: 'art-trust.jpg',
    body: (a) => [
      U.hero({
        eyebrow: 'Trust & Safety · 1',
        title: 'Consent & Sharing',
        lead: 'Consent is data, not a checkbox. Every share is purpose-bound, time-bound, revocable and audited.',
        art: a,
        chips: ['Purpose-bound', 'Expiry', 'Revocation', 'Audited'],
      }),
      U.principle('"Share CBC report with Dr. X for consultation" is a different permission from "Allow research use of anonymized data". These are separate permissions.'),
      U.section({
        kicker: 'Schema', title: 'The consent object',
        inner: U.code('Consent', `Consent
├── patient
├── purpose
├── recipient
├── data_scope
├── start
├── expiry
├── revocation
└── audit_events[]`),
      }),
      U.section({
        kicker: 'Patient flow', title: 'Share in five taps, revoke in one',
        inner: U.flow(['Select report', 'Select doctor', 'Select purpose', 'Select duration', 'Confirm', 'Consent record', 'Doctor access', 'Access expires']),
      }),
      U.section({
        kicker: 'Rules', title: 'What consent guarantees',
        inner: U.checks([
          'Access is scoped to the exact documents and purpose consented',
          'Access automatically expires at the consent end time',
          'The patient can revoke at any time — access stops immediately',
          'Every access attempt references the consent record',
          'Research use is opt-in, separate and anonymized',
          'Production patient data never silently becomes training data',
        ]) + U.note('PRODUCTION PATIENT DATA ≠ MODEL TRAINING DATA ≠ RESEARCH DATA. A patient\'s uploaded report should NOT automatically become training data.', 'warn'),
      }),
      U.related(['audit-security', 'patient-deck', 'datasets'], ['Audit & Security', 'Patient Deck', 'Datasets']),
    ],
  },

  {
    slug: 'audit-security',
    family: 'trust',
    title: 'Audit & Security — Threat Model & Immutable Logs',
    desc: 'HealthGuard security: immutable audit events (WHO/WHAT/WHEN/WHERE/WHY/RESOURCE/RESULT), STRIDE + OWASP ASVS + OWASP API Security threat modeling, BOLA/IDOR testing, encryption, RBAC/ABAC and prompt-injection defense.',
    art: 'art-trust.jpg',
    body: (a) => [
      U.hero({
        eyebrow: 'Trust & Safety · 2',
        title: 'Audit & Security',
        lead: 'Healthcare-grade security with an immutable record of every sensitive action — and a threat model that treats uploaded documents as attacks waiting to happen.',
        art: a,
        chips: ['Immutable audit', 'STRIDE', 'OWASP ASVS', 'RBAC + ABAC'],
      }),
      U.section({
        kicker: 'Audit log', title: 'WHO · WHAT · WHEN · WHERE · WHY',
        inner: U.code('Audit event example', `Doctor 8291
Viewed Patient 1832
Document D382
Purpose: consultation
09:42:13
Success`),
      }),
      U.section({
        kicker: 'Threat model', title: 'How we assume we are attacked',
        inner: U.split({
          title: 'STRIDE + OWASP ASVS + OWASP API Security + LLM security',
          paragraphs: ['Plus healthcare-specific threat modeling. Security tests are explicit deliverables, not afterthoughts.'],
          list: ['BOLA/IDOR', 'Authorization bypass', 'Tenant isolation failures', 'Malicious file uploads', 'Prompt injection', 'RAG poisoning', 'Tool abuse', 'Data exfiltration', 'Secrets leakage', 'Supply-chain attacks', 'Session attacks', 'Audit tampering', 'Backup exposure', 'Insider access'],
          figure: U.note('Uploaded reports are untrusted input, not instructions.', 'danger'),
        }),
      }),
      U.section({
        kicker: 'Controls', title: 'Defense in depth',
        inner: U.checks([
          'RBAC + ABAC where appropriate',
          'MFA, secure sessions, refresh-token rotation',
          'Rate limiting and brute-force protection',
          'Object-level authorization on every sensitive route',
          'Encryption at rest and in transit; private object storage',
          'Temporary signed URLs for documents',
          'Malware scanning, sandboxing, MIME validation',
          'File-size limits and decompression-bomb protection',
          'Secrets management and key rotation',
          'Immutable audit logging',
          'Backup encryption and disaster recovery',
          'Incident response and security monitoring',
        ]),
      }),
      U.note('Explicitly tested: BOLA/IDOR, broken authorization, privilege escalation, session attacks, file-upload vulnerabilities, prompt injection, RAG poisoning, cross-user data leakage, API abuse, rate-limit bypass, secret leakage, supply-chain vulnerabilities.', 'warn'),
      U.related(['consent-sharing', 'rag-safety', 'human-review'], ['Consent & Sharing', 'RAG & AI Safety', 'Human Review Queue']),
    ],
  },

  {
    slug: 'human-review',
    family: 'trust',
    title: 'Human Review Queue — Human-in-the-Loop',
    desc: 'HealthGuard Clinical Review Queue: uncertain OCR, low-confidence medications and identity mismatches escalated to authorized reviewers who accept, correct, reject or escalate — feeding high-quality training data.',
    art: 'art-trust.jpg',
    body: (a) => [
      U.hero({
        eyebrow: 'Trust & Safety · 3',
        title: 'Human Review Queue',
        lead: 'When the machine is unsure, a human decides. Corrections become gold — subject to governance and consent.',
        art: a,
        chips: ['Accept · Correct · Reject · Escalate', 'Confidence gates', 'Golden-data feedback'],
      }),
      U.section({
        kicker: 'AI REVIEW REQUIRED', title: 'What lands in the queue',
        inner: U.cards([
          { t: '#001 — CBC', d: 'OCR confidence: 61% — reference range region unclear.', icon: '⚠' },
          { t: '#002 — Prescription', d: 'Medication confidence: 73% — handwriting ambiguous.', icon: '⚠' },
          { t: '#003 — Radiology report', d: 'Patient identity mismatch — wrong-patient risk.', icon: '⚠' },
        ]) + U.pills(['✓ Verified extraction', '⚠ Review required', '? Unable to determine']),
      }),
      U.section({
        kicker: 'Reviewer powers', title: 'Four actions, fully audited',
        inner: U.checks([
          'Accept — extraction promoted to structured data',
          'Correct — human value replaces machine value, both retained',
          'Reject — extraction discarded, document flagged',
          'Escalate — senior clinician or protocol review',
        ]) + U.note('These corrections become high-quality future training/evaluation data, subject to appropriate governance and consent.', 'info'),
      }),
      U.section({
        kicker: 'Gates', title: 'What forces review',
        inner: U.table(['Trigger', 'Threshold (configurable)'], [
          ['OCR confidence', 'Below ~0.75 on critical fields'],
          ['Unit confidence', 'Below ~0.6 on any observation'],
          ['Model disagreement', 'Ensemble consensus fails'],
          ['Identity mismatch', 'Patient match confidence low'],
          ['Red-flag contradiction', 'Safety model flags unsupported conclusion'],
        ]),
      }),
      U.related(['ocr-engine', 'report-intelligence', 'training-evaluation'], ['Difficult Photo OCR', 'Report Intelligence', 'Training & Evaluation']),
    ],
  },

  {
    slug: 'rag-safety',
    family: 'trust',
    title: 'RAG & AI Safety — Grounded, Provenance-Checked',
    desc: 'HealthGuard controlled RAG: patient data plus approved medical knowledge and clinical guidelines, with provenance on every claim and a safety model catching hallucinations, contradictions and dangerous recommendations.',
    art: 'art-trust.jpg',
    body: (a) => [
      U.hero({
        eyebrow: 'Trust & Safety · 4',
        title: 'RAG & AI Safety',
        lead: 'No free-form medical hallucination. Retrieval over approved knowledge, provenance on every claim, and a safety validator in front of every output.',
        art: a,
        chips: ['Controlled retrieval', 'Provenance chain', 'Safety validator', 'Prompt-injection defense'],
      }),
      U.section({
        kicker: 'RAG', title: 'Grounded generation only',
        inner: U.flow(['Patient data', 'Approved medical knowledge', 'Clinical guidelines', 'Doctor-approved knowledge base', 'RAG', 'Response'])
          + U.split({
            title: 'Provenance on every clinical explanation',
            paragraphs: ['Each clinically meaningful claim keeps its chain: where it came from and who reviewed it.'],
            list: ['Finding', 'Source document', 'Extracted observation', 'Knowledge source', 'AI reasoning', 'Human review'],
          }),
      }),
      U.section({
        kicker: 'Safety model', title: 'What it catches',
        inner: U.checks([
          'Unsupported conclusions',
          'Contradictions with the source document',
          'Hallucinations',
          'Dangerous recommendations',
          'Missing context',
          'Uncertainty that must be surfaced',
          'Cross-patient context leakage attempts',
          'Malicious OCR content / adversarial documents',
        ]),
      }),
      U.section({
        kicker: 'AI security', title: 'Documents are untrusted input',
        inner: U.note('Defend against: prompt injection · hidden instructions in PDFs · malicious files · document-based prompt attacks · RAG poisoning · data exfiltration · cross-patient context leakage · unauthorized tool execution · malicious OCR content · adversarial documents · model manipulation. Uploaded medical documents may never directly control system tools.', 'danger'),
      }),
      U.related(['ai-pipeline', 'audit-security', 'ai-models'], ['AI Pipeline', 'Audit & Security', 'Model Suite']),
    ],
  },
];
