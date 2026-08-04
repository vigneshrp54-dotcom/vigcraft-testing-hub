# 23. Future Architecture Roadmap

## 23.1 Purpose
This document captures architectural evolution opportunities intentionally deferred from MVP, along
with the seams already built into the current design (Sections 1–22) that make each evolution
low-risk to adopt later.

## 23.2 MVP vs Future Scope
Everything described in Sections 1–22 (and Sections 24–31) of this document set is **MVP scope** —
already designed and intended for the initial release. Everything in this section (23) is, by
definition, **Future Scope**: deliberately deferred, not designed in detail yet, and only to be
picked up when its trigger condition below is actually met. Future Scope items are organized into
Phase 2, Phase 3, and a Long-Term Vision horizon, ordered roughly by expected proximity to MVP.

## 23.3 Phase 2 (Near-Term, Post-MVP Hardening)
Items likely to be picked up shortly after MVP launch, largely operational/hardening in nature.

| Roadmap Item | Trigger Condition | Enabled By (existing seam) |
|---|---|---|
| Refresh Token flow for JWT auth | Session-length feedback shows 60-min re-login is disruptive | Access-token-only design already isolated in Section 8 |
| Containerization (Docker/Docker Compose) | Need for reproducible, scalable deployment across environments | `docker-compose.yml` placeholder already in repo structure (Section 3.1, 16.8) |
| CI/CD pipeline (GitHub Actions/Jenkins) | Manual build/test/deploy steps become a delivery bottleneck | CI baseline already defined for lint/test/build (Section 20.7); explicitly out of MVP scope per Sprint Planning |
| Object storage for automation reports/evidence | Local `backend/uploads/` storage becomes a scaling/durability constraint | File path abstraction in `automation_results`/`test_executions` (Section 6.2, 11.4) |
| Centralized log aggregation (ELK/CloudWatch-equivalent) | Operational visibility needs exceed local/file logs | Structured JSON logging with request correlation already in place (Section 14.4–14.5) |
| Centralized secrets manager | Compliance/security maturity requirements increase | Config already fully externalized via env vars (Section 17.4) |

## 23.4 Phase 3 (Mid-Term, Scale-Driven)
Items triggered by real usage/scale data rather than a fixed timeline.

| Roadmap Item | Trigger Condition | Enabled By (existing seam) |
|---|---|---|
| Extract Automation module into a dedicated worker service | Playwright run volume/concurrency becomes a bottleneck | Isolated Automation module (Sections 5.4, 11, 18.6) |
| Introduce message queue (e.g., BullMQ/Redis or RabbitMQ) | Need for reliable async job processing beyond in-process EventEmitter | Internal event mechanism already abstracted (Section 10.6) |
| Read replicas / reporting database | Dashboard/report queries degrade core transactional performance | Repository layer isolation (Section 5), clean query boundaries |
| Materialized reporting tables | Aggregation queries become expensive at scale | Reporting module already isolated (Section 22.1) |
| Caching layer (Redis) for hot-read data | Repeated DB load on slowly-changing data (roles, project metadata) | Clean repository boundaries make cache insertion straightforward (Section 18.5) |
| Third-party integrations (Jira, Slack, TestRail import) | User demand for external tool interoperability | API-first design (Section 1.3, 7) allows integration without core rework |

## 23.5 Long-Term Vision
Larger, structural evolutions considered only once the product has proven MVP + Phase 2/3 fit.

| Roadmap Item | Trigger Condition | Enabled By (existing seam) |
|---|---|---|
| Multi-tenant SaaS support | Product expands beyond single-organization usage | Explicitly out of MVP scope (see Sprint Planning MVP Scope); would require tenant-scoping across schema and RBAC |
| Mobile app / additional clients | Demand for mobile test execution/review | API-first, versioned REST contract (Section 7) supports new clients without backend changes |
| Frontend framework migration (e.g. React/Vue) | UI complexity grows beyond what the HTML Multi-Page Architecture (Section 4) can comfortably maintain | Frontend/backend are already fully decoupled via REST API (Section 3.2), so a frontend rewrite would not require backend changes |

## 23.6 Guiding Philosophy
The MVP architecture is deliberately a **modular monolith with clean internal boundaries**, not a
premature microservices split. Every roadmap item above is an *additive* evolution — none require
a fundamental rewrite of the layered architecture, module boundaries, or API contract established in
this document set. This keeps MVP delivery timelines (Sprint 0–7) realistic while protecting the
long-term scalability path.

## 23.7 Review Cadence
This roadmap should be revisited at the end of each major release cycle (post-MVP), informed by
actual production usage data (Section 18 — Scalability Considerations) rather than speculative
scaling.
