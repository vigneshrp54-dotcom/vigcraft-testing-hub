# 24. Third-Party Libraries

## 24.1 Purpose
This document lists the third-party libraries actually used by VigCraft Testing Hub's MVP, and
separately, libraries anticipated for Future Scope work (Section 23) that are **not** installed or
depended on for MVP. No React-ecosystem or other frontend-framework packages are used anywhere in
this project — the frontend (Section 4) is HTML5/CSS3/Vanilla JavaScript with zero runtime
dependencies.

## 24.2 Backend Libraries (MVP)
| Library | Purpose |
|---|---|
| `express` | HTTP server / routing framework |
| `mysql2` | MySQL driver with Promise support and connection pooling |
| `bcrypt` | Password hashing (Section 8.6) |
| `jsonwebtoken` | JWT signing/verification (Section 8) |
| `dotenv` | Loads environment variables from `.env` files (Section 17) |
| `cors` | CORS configuration for the REST API (Section 15) |
| `helmet` | Sets secure HTTP headers |
| `express-validator` | Request validation (backs `validators/`, Section 3.1) |
| `uuid` | Generates UUIDs where non-sequential identifiers are required |
| `winston` | Structured JSON logging (Section 14.4) |
| `multer` | Handles file uploads to `backend/uploads/` (Section 3.4) |
| `nodemailer` | Sends transactional emails using `backend/templates/` (Section 3.3) |

## 24.3 Automation Libraries (MVP)
| Library | Purpose |
|---|---|
| `@playwright/test` | Playwright test runner and browser automation (Section 11) |

## 24.4 Development-Only Dependencies (MVP)
| Library | Purpose |
|---|---|
| `eslint` | Linting, enforced in CI (Section 20.7) |
| `jest` (or `mocha` + `chai`) | Backend unit/integration tests (`tests/`, Section 3.1) |
| `supertest` | HTTP-level integration testing of Express routes |
| `nodemon` | Local dev auto-restart on file change |

## 24.5 Frontend Libraries (MVP)
None. The frontend intentionally has **zero third-party runtime dependencies** — no React, Vue,
Angular, jQuery, or CSS framework — consistent with the HTML Multi-Page Architecture defined in
Section 4.

## 24.6 Future Scope Libraries
The following are **not installed and not used in MVP**. They are noted here only so the roadmap
(Section 23) has a concrete library reference if/when the corresponding Future Scope item is picked
up.

| Library | Anticipated Use | Related Roadmap Item (Section 23) |
|---|---|---|
| `bullmq` or `amqplib` | Message queue for async job processing | Phase 3 — message queue |
| `ioredis` | Redis client for caching / queue backing store | Phase 3 — caching layer |
| `winston-cloudwatch` / ELK shipper | Centralized log aggregation | Phase 2 — centralized log aggregation |
| Docker / Docker Compose tooling | Containerized deployment | Phase 2 — containerization |
| A frontend framework (React or Vue) | Only if UI complexity outgrows vanilla JS | Long-Term Vision — frontend framework migration |

## 24.7 Library Governance
- New libraries are only added when they solve a real, current MVP need — not speculatively.
- Any new dependency addition is called out explicitly in its introducing Pull Request (Section
  20.6) so reviewers can evaluate license, maintenance status, and necessity.
