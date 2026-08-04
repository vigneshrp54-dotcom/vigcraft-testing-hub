# VigCraft Testing Hub — Architecture Documentation Index

**Project:** VigCraft Testing Hub
**Phase:** Architecture (post Sprint Planning approval)
**Technology Stack:** HTML, CSS, JavaScript (Frontend) · Node.js + Express.js (Backend) · MySQL (Database) · Playwright (Automation) · REST API

This directory contains the complete architecture documentation set for VigCraft Testing Hub.
Each section is maintained as an independent markdown file for clarity and ease of review. All
diagrams are authored in Mermaid syntax for renderability in standard markdown viewers (GitHub,
GitLab, VS Code, etc.).

---

## Document Set

| # | Document | Description |
|---|---|---|
| 1 | [Overall System Architecture](./01-overall-system-architecture.md) | Architecture style, layers, guiding principles, system context |
| 2 | [High-Level Architecture Diagram (Mermaid)](./02-high-level-architecture-diagram.md) | System overview, layered view, and actor-level context diagrams |
| 3 | [Folder Structure](./03-folder-structure.md) | Repository layout for frontend, backend, database, docs, and conventions |
| 4 | [Frontend Architecture](./04-frontend-architecture.md) | Component-Service-State pattern, routing, UI structure |
| 5 | [Backend Architecture](./05-backend-architecture.md) | Layered request flow, module boundaries, dependency approach |
| 6 | [Database Architecture](./06-database-architecture.md) | Core entities, design principles, connections, migrations |
| 7 | [REST API Architecture](./07-rest-api-architecture.md) | Resource map, status codes, response envelope, pagination |
| 8 | [Authentication Flow (JWT)](./08-authentication-flow-jwt.md) | Token strategy, login/refresh sequences, password security |
| 9 | [RBAC Architecture](./09-rbac-architecture.md) | Roles, permission model, enforcement points, data model |
| 10 | [Module Communication Flow](./10-module-communication-flow.md) | Inter-module rules, internal events, sync vs async boundaries |
| 11 | [Playwright Integration Architecture](./11-playwright-integration-architecture.md) | Trigger flow, result ingestion, mapping, isolation & safety |
| 12 | [Database Relationships (ERD)](./12-database-relationships.md) | Entity relationship diagram and referential integrity rules |
| 13 | [Error Handling Strategy](./13-error-handling-strategy.md) | Error categories, custom error classes, centralized middleware |
| 14 | [Logging Strategy](./14-logging-strategy.md) | Log layers, levels, format, correlation, sensitive data handling |
| 15 | [Security Architecture](./15-security-architecture.md) | Security layers, injection/XSS prevention, CORS, threat model |
| 16 | [Deployment Architecture](./16-deployment-architecture.md) | Deployment diagram, environments, process management, rollback |
| 17 | [Environment Configuration](./17-environment-configuration.md) | Required env variables, per-environment overrides, secrets |
| 18 | [Scalability Considerations](./18-scalability-considerations.md) | Scaling dimensions, bottleneck anticipation, monolith→services path |
| 19 | [Coding Standards](./19-coding-standards.md) | JS/Node standards, naming conventions, testing & docs standards |
| 20 | [Development Workflow](./20-development-workflow.md) | Local setup, feature workflow, code review checklist, CI baseline |
| 21 | [Sequence Diagrams](./21-sequence-diagram.md) | End-to-end flows: execution+defect, automation run, login |
| 22 | [Component Diagram](./22-component-diagram.md) | Backend and frontend component-level structure diagrams |
| 23 | [Future Architecture Roadmap](./23-future-architecture-roadmap.md) | Deferred evolution items and the seams that enable them |
| 24 | [Third-Party Libraries](./24-third-party-libraries.md) | MVP libraries in use, and libraries reserved for Future Scope |
| 25 | [System Requirements](./25-system-requirements.md) | Minimum Node.js/MySQL versions, supported browsers, dev environment |
| 26 | [Documentation Index](./index.md) | This document — the full architecture set index |
| 27 | [Environment Management](./27-environment-management.md) | Environment definitions, config promotion flow, secrets handling |
| 28 | [API Standards](./28-api-standards.md) | URL/versioning conventions, response envelopes, pagination, validation |
| 29 | [Performance Strategy](./29-performance-strategy.md) | MVP performance practices, targets, and explicitly deferred optimizations |
| 30 | [Backup & Disaster Recovery](./30-backup-disaster-recovery.md) | Backup scope/retention, recovery objectives, restore process |
| 31 | [Monitoring & Maintenance](./31-monitoring-maintenance.md) | Health checks, alerting, routine maintenance, incident response |

---

## How to Read This Document Set

1. Start with **Section 1 (Overall System Architecture)** and **Section 2 (High-Level Diagram)** for
   the big picture.
2. Sections **3–7** cover structural/layer-specific architecture (folders, frontend, backend,
   database, API).
3. Sections **8–11** cover cross-cutting functional flows (auth, RBAC, module communication,
   Playwright integration).
4. Sections **12–15** cover data integrity, reliability, and security concerns.
5. Sections **16–18** cover operational architecture (deployment, config, scalability).
6. Sections **19–20** cover team/process standards.
7. Sections **21–22** provide visual sequence and component diagrams tying the above together.
8. Section **23** captures what is intentionally deferred and why (MVP vs Phase 2 / Phase 3 /
   Long-Term Vision).
9. Sections **24–25** cover MVP dependencies and system requirements.
10. Section **26** is this index.
11. Sections **27–31** cover operational architecture added after review: environment management,
    API standards, performance strategy, backup/disaster recovery, and monitoring/maintenance.

## Traceability to Sprint Planning

This architecture directly builds on the approved **Sprint Planning** document:
- Technology stack matches exactly (HTML/CSS/JS, Node.js, Express.js, MySQL, Playwright, REST API).
- Module boundaries (Section 5) map 1:1 to the **Functional Modules** defined in Sprint Planning.
- User Roles (Sprint Planning Section 3) map directly to the RBAC roles in Section 9 of this set.
- Branching strategy, Definition of Done, and Testing Strategy referenced in Sections 16 and 20 are
  consistent with the Sprint Planning document and are not redefined here.

## Scope Note

This document set is **architecture documentation only**. No application code, configuration files,
or executable artifacts are included — only design decisions, diagrams, folder/naming conventions,
and standards intended to guide implementation in subsequent sprints.

---

**Status:** Architecture documentation complete — 31 sections (including this index), post-review.
**Next Phase (per delivery workflow):** UI Design.
