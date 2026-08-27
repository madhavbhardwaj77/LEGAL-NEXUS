# Nyaya Setu — MongoDB Data Model

Nyaya Setu uses MongoDB as its primary application system of record.

---

## Collections Overview

| Collection | Model File | Description |
|---|---|---|
| `users` | `User.js` | Core credentials, roles (`CITIZEN`, `LAW_STUDENT`, `LAWYER`, `LEGAL_ORGANIZATION`, `ADMIN`), active/verified flags. |
| `citizenProfiles` | `CitizenProfile.js` | Citizen demographics, preferred language, location, contact details. |
| `professionalProfiles` | `ProfessionalProfile.js` | Advocate / Law Student credentials, Bar Council registration, practice areas, courts, fees, ratings. |
| `cases` | `Case.js` | Master case record linking parties, category, issue, status, urgency, legal questions, and references. |
| `caseTimeline` | `CaseTimeline.js` | Chronological milestones (`EMPLOYMENT_STARTED`, `SALARY_DUE`, `HR_CONTACTED`, `LEGAL_NOTICE_SENT`, `COMPLAINT_FILED`). |
| `caseEvidence` | `CaseEvidence.js` | Evidence artifacts, payslips, email proofs, contracts, photos, bank statements. |
| `conversations` | `Conversation.js` | Case intake or lawyer-client messaging threads. |
| `messages` | `Message.js` | Individual messages within a conversation. |
| `documents` | `Document.js` | Uploaded document metadata and processing status. |
| `documentAnalyses` | `DocumentAnalysis.js` | AI-extracted summaries, clauses, and risk assessment scores. |
| `legalSources` | `LegalSource.js` | Statutory acts, central/state codes, Supreme Court / High Court citations. |
| `legalChunks` | `LegalChunk.js` | Chunked legal sections and vector search embeddings metadata for RAG. |
| `drafts` | `Draft.js` | Legal notices, written statements, consumer complaints, and RTI applications. |
| `lawyerMatches` | `LawyerMatch.js` | Case-to-lawyer compatibility scores and recommendations. |
| `caseStudies` | `CaseStudy.js` | Anonymized case summaries and legal outcomes published by lawyers. |
| `verificationRequests` | `VerificationRequest.js` | Professional verification queue for Bar Council validation. |
| `notifications` | `Notification.js` | In-app user alerts for case updates and verification status. |
| `auditLogs` | `AuditLog.js` | Immutable system audit trails for security and compliance. |

---

## Core Object: Case Schema

```
CASE
├── user                     (Ref: User, required)
├── caseNumber               (String, Auto-generated: NYA-YYYYMMDD-XXXX)
├── category                 (Enum: Employment, Property, Consumer, Family, etc.)
├── issue                    (String, e.g. "Unpaid Salary")
├── description              (String, Detailed narrative)
├── parties
│   ├── plaintiff            (name, relationship, contact)
│   ├── defendant            (name, organization, designation, contact)
│   └── otherParties         (Array of participants)
├── location
│   ├── city, state, jurisdictionCourt
├── urgency                  (Enum: LOW, MEDIUM, HIGH, CRITICAL)
├── status                   (Enum: OPEN, UNDER_REVIEW, LAWYER_ASSIGNED, IN_PROGRESS, RESOLVED, CLOSED)
├── legalQuestions           (Array of identified legal issues)
├── recommendedActions       (Array of actionable next steps)
├── relevantSources          (Array of cited statutes & case law)
├── timelineEvents           (Virtual populate: CaseTimeline)
├── evidenceList             (Virtual populate: CaseEvidence)
└── documentsList            (Virtual populate: Document)
```
