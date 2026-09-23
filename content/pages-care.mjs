// HealthGuard — TRIAGE & CONSULTATION pages.
import * as U from '../src/ui.mjs';

export default [
  {
    slug: 'ai-triage',
    family: 'care',
    title: 'AI Triage — Urgency, Not Diagnosis',
    desc: 'HealthGuard AI triage architecture: deterministic safety rules, a clinical classifier, structured medical context and uncertainty estimation — with safety validation and clinician override. AI triage ≠ emergency diagnosis.',
    art: 'art-triage.jpg',
    body: (a) => [
      U.hero({
        eyebrow: 'Triage & Consult · 1',
        title: 'AI Triage',
        lead: 'The system classifies workflow urgency — never "you have disease X". Rules first, model second, human always able to override.',
        art: a,
        chips: ['Rules + model + override', 'T0–T4 classes', 'Reason codes', 'Model + rule versioned'],
      }),
      U.principle('AI triage ≠ emergency diagnosis. The system classifies workflow urgency, not disease.'),
      U.section({
        kicker: 'Architecture', title: 'Rules + model + human override',
        inner: U.pipeline(['Symptoms', 'Deterministic safety rules', 'Clinical classifier', 'Structured medical context', 'Uncertainty estimator', 'Triage recommendation', 'Safety validation', 'Doctor / protocol'])
          + U.note('Critical red-flag rules must not depend exclusively on an LLM. Deterministic rules can escalate; they can never be talked out of it by a model.', 'warn'),
      }),
      U.section({
        kicker: 'Classes', title: 'Workflow urgency classes',
        inner: U.table(['Class', 'Meaning', 'Handling'], [
          ['T0', 'Emergency escalation', 'Immediate escalation pathway; clinician/protocol notified'],
          ['T1', 'Very urgent', 'Next-available queue with priority'],
          ['T2', 'Priority consultation', 'Front of standard queue'],
          ['T3', 'Routine consultation', 'Standard queue'],
          ['T4', 'Follow-up', 'Scheduled/short-path queue'],
        ]) + U.note('The actual criteria are designed and approved by clinicians.', 'info'),
      }),
      U.section({
        kicker: 'Output contract', title: 'Every triage result is accountable',
        inner: U.checks([
          'Triage class (T0–T4)',
          'Confidence score',
          'Reason codes',
          'Timestamp',
          'Model version',
          'Rule version',
          'Override state',
          'Audit event reference',
        ]),
      }),
      U.related(['token-queue', 'human-review', 'doctor-deck'], ['Token & Queue', 'Human Review Queue', 'Doctor Deck']),
    ],
  },

  {
    slug: 'token-queue',
    family: 'care',
    title: 'Triage Token & Queue System',
    desc: 'HealthGuard token service: token creation, queue positions, specialty queues, priority handling, estimated waits, check-in, escalation and completion — with patient privacy never breached in the queue.',
    art: 'art-triage.jpg',
    body: (a) => [
      U.hero({
        eyebrow: 'Triage & Consult · 2',
        title: 'Token & Queue',
        lead: 'Not just "Appointment → Doctor". A triage-aware token queue where urgency shapes order, waits are estimated honestly, and no patient ever sees another patient.',
        art: a,
        chips: ['Token service', 'Estimated wait', 'Priority handling', 'Privacy in queue'],
      }),
      U.section({
        kicker: 'Flow', title: 'Patient to doctor, with intent',
        inner: U.flow(['Patient', 'Reason for consultation', 'AI intake', 'Symptoms + uploaded reports', 'Urgency assessment', 'Triage category', 'Queue', 'Doctor']),
      }),
      U.section({
        kicker: 'Live view', title: 'Doctor dashboard & patient view',
        inner: U.split({
          title: 'CURRENT QUEUE',
          paragraphs: ['Doctors see token, class and wait. Patients see their own token, position and estimate. Never another identity.'],
          figure: U.queueTicker(),
        }),
      }),
      U.section({
        kicker: 'Token object', title: 'The triage-service token',
        inner: U.code('Token schema', `Token
├── token_id
├── patient_id
├── encounter_id
├── specialty
├── urgency_class
├── created_at
├── estimated_wait
├── queue_position
├── assigned_doctor
├── status
└── audit_events[]`),
      }),
      U.section({
        kicker: 'Lifecycle', title: 'From creation to closure',
        inner: U.checks([
          'Token creation from triage result',
          'Queue position with live updates',
          'Specialty queue routing',
          'Doctor assignment (manual or auto)',
          'Priority handling for T0–T2',
          'Estimated wait computation',
          'Check-in (video waiting room / front desk)',
          'Consultation start and completion',
          'Cancellation and expiration',
          'Escalation paths (T3→T1 etc.) with audit',
        ]) + U.note('Never expose another patient\'s identity or sensitive information — queue views are computed server-side per viewer.', 'warn'),
      }),
      U.related(['ai-triage', 'video-consultation', 'in-person-consultation'], ['AI Triage', 'Video Consultation', 'In-Person Consultation']),
    ],
  },

  {
    slug: 'video-consultation',
    family: 'care',
    title: 'Video Consultation — WebRTC + SFU',
    desc: 'HealthGuard video consultation: WebRTC with signaling and an SFU media layer (LiveKit / mediasoup / Janus class), secure consultation rooms, waiting rooms, presence, reconnection and controlled access.',
    art: 'art-consult.jpg',
    body: (a) => [
      U.hero({
        eyebrow: 'Triage & Consult · 3',
        title: 'Video Consultation',
        lead: 'Browser-native WebRTC, production-grade SFU architecture, healthcare-grade access control around the room.',
        art: a,
        chips: ['WebRTC', 'SFU architecture', 'Waiting rooms', 'Controlled access'],
      }),
      U.section({
        kicker: 'Architecture', title: 'Patient ↔ signaling ↔ SFU ↔ doctor',
        inner: U.pipeline(['Patient browser', 'Signaling', 'WebRTC / SFU', 'Doctor browser'])
          + U.note('For production, use an SFU architecture rather than naïve browser-to-browser scaling.', 'info'),
      }),
      U.section({
        kicker: 'Stack options', title: 'Media infrastructure',
        inner: U.cards([
          { t: 'LiveKit', d: 'Modern SFU with rich client SDKs — webrtc.org-style standard transports.', icon: '▷' },
          { t: 'mediasoup', d: 'Node.js SFU with fine-grained control over transports and consumers.', icon: '⬡' },
          { t: 'Janus', d: 'Battle-tested general-purpose WebRTC server.', icon: '◎' },
        ]) + U.note('For a serious healthcare product, consider self-hosting the media layer or selecting a provider only after evaluating healthcare/privacy contractual requirements.', 'warn'),
      }),
      U.section({
        kicker: 'Room control', title: 'A consultation room is a permissioned space',
        inner: U.checks([
          'Authorization checked server-side before any media token is issued',
          'Waiting room until the doctor admits the patient',
          'Presence (who is in the room) visible to participants only',
          'Automatic reconnection with session resumption',
          'Consultation start/end events for the encounter record',
          'No room exists without an appointment and a token',
          'Media streams are never recorded by default',
        ]),
      }),
      U.related(['token-queue', 'in-person-consultation', 'audit-security'], ['Token & Queue', 'In-Person Consultation', 'Audit & Security']),
    ],
  },

  {
    slug: 'in-person-consultation',
    family: 'care',
    title: 'In-Person Consultation — One Appointment Object',
    desc: 'HealthGuard in-person consultations share the appointment object with video: same token, same encounter record, same lifecycle — only the modality and location differ.',
    art: 'art-consult.jpg',
    body: (a) => [
      U.hero({
        eyebrow: 'Triage & Consult · 4',
        title: 'In-Person Consultation',
        lead: 'One appointment model, two modalities. Video and clinic visits run through the same token, encounter and record — so nothing forks downstream.',
        art: a,
        chips: ['Same appointment object', 'location_id', 'Unified encounters'],
      }),
      U.principle('Do not create two unrelated systems. The same appointment object supports VIDEO and IN_PERSON.'),
      U.section({
        kicker: 'Schema', title: 'Only the modality changes',
        inner: U.code('Appointment example', `{
  "appointment_type": "IN_PERSON",
  "location_id": "...",
  "doctor_id": "...",
  "patient_id": "...",
  "token_id": "...",
  "status": "SCHEDULED"
}`),
      }),
      U.section({
        kicker: 'Lifecycle', title: 'Shared with video — start to close',
        inner: U.flow(['Patient books', 'Token generated', 'Doctor accepts', 'Check-in', 'Consultation', 'Assessment', 'Prescription / recommendation', 'Follow-up', 'Encounter closed'])
          + U.checks([
            'Location and facility management for clinic visits',
            'Front-desk check-in aligned with the token queue',
            'The same timeline, audit and consent model as video',
          ]),
      }),
      U.related(['video-consultation', 'token-queue', 'health-timeline'], ['Video Consultation', 'Token & Queue', 'Health Timeline']),
    ],
  },

  {
    slug: 'doctor-verification',
    family: 'care',
    title: 'Doctor Verification — Credential State Machine',
    desc: 'HealthGuard doctor verification: registration numbers, degrees, identity documents, document verification and admin review — with UNVERIFIED to VERIFIED states. Only VERIFIED doctors receive consultations.',
    art: 'art-trust.jpg',
    body: (a) => [
      U.hero({
        eyebrow: 'Triage & Consult · 5',
        title: 'Doctor Verification',
        lead: 'Trust is earned in the product: no doctor is searchable or consultable until an administrator explicitly verifies them.',
        art: a,
        chips: ['State machine', 'Document review', 'Admin approval', 'Expiry tracking'],
      }),
      U.section({
        kicker: 'Workflow', title: 'Account to APPROVED',
        inner: U.flow(['Doctor creates account', 'Email/mobile verification', 'Professional details', 'Registration number', 'Degree/certificates', 'Identity documents', 'Document verification', 'Admin review', 'APPROVED', 'Searchable profile']),
      }),
      U.section({
        kicker: 'States', title: 'The five states of trust',
        inner: U.pills(['UNVERIFIED', 'PENDING_REVIEW', 'VERIFIED', 'SUSPENDED', 'REJECTED'], { VERIFIED: 'pill-ok', REJECTED: 'pill-danger', SUSPENDED: 'pill-t2' })
          + U.note('Only VERIFIED can receive patient consultations. SUSPENDED freezes consultability immediately while keeping the record intact.', 'warn'),
      }),
      U.section({
        kicker: 'Ledger', title: 'What every verification carries',
        inner: U.checks([
          'verification_version',
          'verified_by (admin identity)',
          'verified_at (timestamp)',
          'expiry_date (re-check schedule)',
          'documents_hash (tamper evidence)',
          'audit_event_id (immutable link)',
        ]) + U.split({
          title: 'Identity documents are checked, not just uploaded',
          paragraphs: ['Degree certificates, registration numbers and identity documents are validated by document verification tooling before a human admin makes the final call.'],
          figure: U.table(['Check', 'Purpose'], [
            ['Identity', 'Name/face/photo consistency'],
            ['Registration', 'Medical council registration number validity'],
            ['Degree', 'Qualification certificate authenticity'],
            ['Specialty', 'Declared specialty/subspecialty plausibility'],
            ['Documents', 'Hash-locked storage of everything reviewed'],
          ]),
        }),
      }),
      U.related(['admin-deck', 'audit-security', 'consent-sharing'], ['Admin Deck', 'Audit & Security', 'Consent & Sharing']),
    ],
  },
];
