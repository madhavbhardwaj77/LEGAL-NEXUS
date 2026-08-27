# Nyaya Setu (न्याय सेतु) — System Architecture

Nyaya Setu is an AI-native legal intelligence, citizen case intake, and legal professional ecosystem platform for India.

---

## 1. High-Level Architecture

```
                                  ┌─────────────────────────────────────────┐
                                  │      Client Layer (React + Tailwind)    │
                                  │   - Citizen Intake & Timeline Portal    │
                                  │   - Legal Professional Directory & Workspace
                                  │   - Admin Governance & Verification     │
                                  └────────────────────┬────────────────────┘
                                                       │ HTTPS / REST
                                                       ▼
                                  ┌─────────────────────────────────────────┐
                                  │       Core Application Gateway (Node.js)│
                                  │   - Express 4.x REST Server             │
                                  │   - JWT Auth & Role-Based Access (RBAC) │
                                  │   - Rate Limiter & Helmet Security      │
                                  │   - Centralized Audit Logging           │
                                  └───────────────┬─────────────────┬───────┘
                                                  │                 │
                                    Mongoose / ODM│                 │ Redis Cache & Queues
                                                  ▼                 ▼
             ┌────────────────────────────────────────┐  ┌───────────────────────────────────┐
             │       MongoDB (System of Record)       │  │        Redis (In-Memory Engine)   │
             │ - users, profiles                      │  │ - Session & Case Detail Caching   │
             │ - cases, caseTimeline, caseEvidence    │  │ - Task Queues:                    │
             │ - documents, documentAnalyses          │  │   * queue:document_processing     │
             │ - legalSources, legalChunks            │  │   * queue:ai_tasks                │
             │ - drafts, lawyerMatches, auditLogs     │  │   * queue:notifications           │
             └────────────────────────────────────────┘  └─────────────────┬─────────────────┘
                                                                           │
                                                            Worker Consumer│
                                                                           ▼
                                                         ┌───────────────────────────────────┐
                                                         │       AI Engine (FastAPI / Py)    │
                                                         │ - RAG Pipeline (Statutes & Cases) │
                                                         │ - Document OCR & Extraction       │
                                                         │ - LangGraph Legal Drafting        │
                                                         └───────────────────────────────────┘
```

---

## 2. Monorepo Organization

| Directory | Role | Technologies |
|---|---|---|
| `frontend/` | Web Dashboard & Interactive Portal | React 19, Tailwind CSS, Lucide Icons, Vite |
| `backend/` | Application Business Logic, Auth & API | Node.js, Express, Mongoose, ioredis, JWT |
| `ai-engine/` | AI Microservice & Background Workers | Python 3.11, FastAPI, Pydantic, Redis |
| `ingestion/` | Statutory & Judgment Scraping / Chunking | Python, BeautifulSoup, PyMongo |
| `docker/` | Container definitions & Compose orchestration | Docker, Docker Compose, Nginx |
| `docs/` | System, Data Model, and API Documentation | Markdown |

---

## 3. Core Design Principles

1. **Case-Centric Paradigm**:
   Conversations, evidence uploads, timeline occurrences, and legal drafts all attach directly to a primary structured **Case** entity rather than treating raw chat transcripts as the source of truth.

2. **Role-Based Access Control (RBAC)**:
   Supports 5 distinct personas:
   - `CITIZEN`: Files cases, manages personal timeline, uploads private evidence, views assigned lawyer.
   - `LAW_STUDENT`: Clinical legal education, case intake assistance, preliminary drafting.
   - `LAWYER`: Verified advocate; handles assigned cases, drafts formal notices, submits case studies.
   - `LEGAL_ORGANIZATION`: Legal aid clinics, NGOs, law firms.
   - `ADMIN`: System governance, Bar Council verification review, platform audit logs.

3. **Asynchronous Background Processing with Redis**:
   Document uploads and heavy AI inferences are offloaded to Redis job queues (`queue:document_processing`, `queue:ai_tasks`) to maintain low API response latency (<50ms).

4. **Multi-layer Security & Auditing**:
   Every mutating HTTP request (POST, PUT, PATCH, DELETE) automatically writes to the immutable `AuditLog` collection, recording the acting user, IP address, timestamp, affected resource, and payload digest.
