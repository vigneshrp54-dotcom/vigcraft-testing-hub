# 1. Overall System Architecture

## 1.1 Purpose
This document describes the overall system architecture of **VigCraft Testing Hub**, a web-based
test management and automation orchestration platform. It establishes the architectural principles,
layers, and technology mapping that all subsequent architecture documents build upon.

## 1.2 Architecture Style
VigCraft Testing Hub follows a **layered (n-tier) monolithic architecture** for the MVP phase, with
clear internal module boundaries that allow future extraction into services if scaling demands it.

| Layer | Responsibility | Technology |
|---|---|---|
| Presentation Layer | UI rendering, user interaction | HTML, CSS, JavaScript (vanilla, no framework for MVP) |
| API Layer | Request handling, validation, routing | Node.js, Express.js (REST API) |
| Business Logic Layer | Core domain rules, orchestration | Node.js services/controllers |
| Data Access Layer | Persistence, queries | MySQL (via query builder / ORM) |
| Automation Layer | Test execution & result ingestion | Playwright (Node.js runner) |

## 1.3 Guiding Principles
- **Separation of Concerns**: UI, API, business logic, and data access are isolated into distinct
  layers/modules.
- **Statelessness**: The API layer is stateless; authentication state is carried via JWT, not server
  session memory, to support future horizontal scaling.
- **Single Source of Truth**: MySQL is the sole system of record for all test management data.
- **Modularity over Microservices (MVP)**: A modular monolith is chosen for MVP to reduce operational
  complexity while preserving clean module boundaries for a future microservices split.
- **API-First**: All frontend-backend communication happens exclusively through documented REST APIs
  (Swagger/OpenAPI + Postman), enabling future clients (mobile, CLI) without backend changes.
- **Security by Design**: Authentication (JWT) and Authorization (RBAC) are enforced at the API
  gateway/middleware layer, not left to individual routes.

## 1.4 System Context
VigCraft Testing Hub sits between three primary actors:
- **Human Users** (Admin, Test Manager, QA Engineer, Developer, Viewer) interacting via the browser UI.
- **Playwright Automation Runner** which executes automated test suites and reports results back via API.
- **MySQL Database** which persists all application state.

```
        +-------------------+
        |   Browser (UI)    |
        | HTML / CSS / JS   |
        +---------+---------+
                  |
                  | REST API (HTTPS, JWT)
                  v
        +-------------------+
        |  Express.js API   |
        |  (Node.js runtime)|
        +---------+---------+
                  |
        +---------+---------+
        |                   |
        v                   v
+---------------+   +------------------+
|  MySQL DB     |   | Playwright Runner |
| (system of    |   | (automation exec) |
|  record)      |   +------------------+
+---------------+
```

## 1.5 Non-Functional Requirements Addressed
- **Reliability**: Centralized error handling, DB transaction boundaries for critical writes.
- **Maintainability**: Consistent folder structure, coding standards, and modular service design.
- **Security**: JWT-based auth, RBAC, input validation, parameterized queries.
- **Observability**: Structured logging strategy across all layers.
- **Testability**: Layered design allows unit testing of business logic independent of Express/HTTP.

## 1.6 Related Documents
See `index.md` for the full architecture document set.
