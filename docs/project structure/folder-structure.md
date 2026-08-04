# Folder Structure — VigCraft Testing Hub

**Status:** Approved and Frozen (per Sprint 1 Architecture sign-off)
**Architecture:** Layered Modular Monolith

This document is the authoritative directory tree for the project. It reconciles the two structure passes already approved for this project — the initial `frontend/css/` build order used in the Hallmark file-by-file Sprint 1 work, and the enterprise `frontend/assets/` tree proposed during the Project Architect pass — by treating `frontend/css/` (and its `base/`, `layout/`, `components/`, `pages/`, `themes/`, `utilities/` subfolders) as the canonical, already-in-progress styling location. `frontend/assets/` continues to hold non-CSS static assets only. This is the tree all future Sprint 1 files must follow.

## Complete Directory Tree

```
vigcraft-testing-hub/
│
├── frontend/
│   ├── index.html
│   ├── css/
│   │   ├── main.css
│   │   ├── base/
│   │   │   ├── reset.css
│   │   │   ├── variables.css
│   │   │   └── typography.css
│   │   ├── layout/
│   │   │   ├── layout.css
│   │   │   ├── header.css
│   │   │   ├── sidebar.css
│   │   │   └── footer.css
│   │   ├── components/
│   │   │   ├── buttons.css
│   │   │   ├── cards.css
│   │   │   ├── forms.css
│   │   │   └── modal.css
│   │   ├── pages/
│   │   │   ├── login.css
│   │   │   ├── dashboard.css
│   │   │   └── analytics.css
│   │   ├── themes/
│   │   │   └── theme.css
│   │   └── utilities/
│   │       ├── utilities.css
│   │       └── responsive.css
│   ├── assets/
│   │   ├── images/
│   │   ├── icons/
│   │   └── fonts/
│   ├── components/
│   │   ├── header/
│   │   ├── sidebar/
│   │   ├── footer/
│   │   ├── button/
│   │   ├── card/
│   │   ├── table/
│   │   ├── modal/
│   │   ├── input/
│   │   ├── badge/
│   │   ├── breadcrumb/
│   │   ├── loader/
│   │   └── toast/
│   ├── layouts/
│   ├── pages/
│   │   ├── login/
│   │   ├── register/
│   │   ├── forgot-password/
│   │   ├── dashboard/
│   │   ├── projects/
│   │   └── test-cases/
│   ├── services/
│   ├── utils/
│   ├── constants/
│   └── config/
│
├── backend/
│   ├── server.js
│   ├── controllers/
│   ├── routes/
│   ├── services/
│   ├── middleware/
│   ├── repositories/
│   ├── validators/
│   ├── models/
│   ├── config/
│   ├── utils/
│   ├── constants/
│   ├── helpers/
│   └── logs/
│
├── database/
│   ├── migrations/
│   ├── seeds/
│   ├── schema/
│   └── config/
│
├── playwright/
│   ├── playwright.config.js
│   ├── tests/
│   ├── fixtures/
│   ├── pages/
│   └── utils/
│
├── tests/
│   ├── unit/
│   │   ├── services/
│   │   └── utils/
│   ├── integration/
│   │   ├── controllers/
│   │   └── repositories/
│   └── setup/
│
├── docs/
│   ├── project-structure/
│   │   ├── folder-structure.md
│   │   ├── naming-conventions.md
│   │   ├── coding-standards.md
│   │   └── README.md
│   ├── design-system/
│   ├── wireframes/
│   ├── components/
│   ├── architecture/
│   ├── api/
│   ├── sprints/
│   └── README.md
│
├── config/
│   ├── env/
│   │   ├── .env.development
│   │   ├── .env.staging
│   │   └── .env.production
│   └── app.config.js
│
└── scripts/
    ├── setup/
    ├── db/
    └── build/
```

## Purpose of Every Major Folder

| Folder | Purpose |
|---|---|
| `frontend/` | All client-side code: markup, styles, reusable components, pages, and frontend-only logic. No framework — vanilla HTML/CSS/JS organized strictly by responsibility. |
| `frontend/css/` | The full styling system, structured as import layers (`base` → `layout` → `components` → `pages` → `themes` → `utilities`) assembled by `main.css`. This is the canonical CSS location for the project. |
| `frontend/assets/` | Non-CSS static assets only: images, icon SVGs, self-hosted fonts. |
| `frontend/components/` | Behavioral logic (JS) and structural partials for each reusable UI component documented in `docs/components/`. |
| `frontend/layouts/` | Page-shell templates composing Header + Sidebar + Footer + a content slot. |
| `frontend/pages/` | One folder per route/view, assembling layouts + components into a complete screen. |
| `frontend/services/` | API-communication layer, one file per backend resource. Wraps `fetch` calls only — no UI logic. |
| `frontend/utils/` | Pure helper functions with no DOM/API dependency. |
| `frontend/constants/` | Shared static values (routes, status enums). |
| `frontend/config/` | Frontend runtime configuration (API base URL, feature flags). |
| `backend/` | Express.js API server, organized in strict layers so each layer has exactly one job. |
| `backend/routes/` | Maps HTTP verb + path to a controller method. No logic beyond routing. |
| `backend/controllers/` | Parses request input, calls a service, shapes the response. No business logic, no direct DB access. |
| `backend/services/` | Business logic layer — orchestrates repositories, applies rules. No HTTP concerns. |
| `backend/repositories/` | All MySQL queries, isolated behind a resource-specific interface. The only layer that talks to the database. |
| `backend/middleware/` | Cross-cutting request pipeline logic (auth guard, error handler, logger, rate limiter). |
| `backend/validators/` | Input validation rules per resource, run before controller logic proceeds. |
| `backend/models/` | Entity definitions mapped to MySQL tables. |
| `backend/config/` | Environment config and DB connection settings loaded at startup. |
| `backend/utils/` / `backend/helpers/` | Pure utility functions and small cross-layer support functions (response formatting, query building). |
| `backend/logs/` | Runtime log output — application and error logs. |
| `database/` | MySQL schema definition, migrations, and seed data — versioned independently of application code. |
| `playwright/` | End-to-end automation suite covering the frontend MVP, isolated from unit/integration tests. |
| `tests/` | Backend unit and integration tests, separate from Playwright's E2E suite. |
| `docs/` | All living project documentation: structure, design system, wireframes, component specs, architecture, API contracts, and sprint records. |
| `config/` | Project-wide, environment-level configuration shared across backend, database tooling, and build scripts. |
| `scripts/` | Operational scripts for setup, migrations, and build tasks — kept out of application runtime code. |

## Responsibility of Each Layer

The Layered Modular Monolith enforces a strict one-directional data flow. Each layer may only call the layer directly below it:

```
Frontend (pages/components) → services (API calls) → Backend routes
        ↓
Backend routes → controllers → services → repositories → models → MySQL
```

- **Presentation layer** (`frontend/pages`, `frontend/components`, `frontend/layouts`): renders UI, captures user input, delegates all data operations to `frontend/services`.
- **Frontend service layer** (`frontend/services`): the only frontend code allowed to call the backend API.
- **Routing layer** (`backend/routes`): the only backend code allowed to define HTTP endpoints.
- **Controller layer** (`backend/controllers`): translates HTTP requests into service calls and service results into HTTP responses. Never queries the database directly.
- **Business logic layer** (`backend/services`): owns all business rules. Never imports Express request/response objects.
- **Data access layer** (`backend/repositories`): the only backend code allowed to write SQL. Never contains business rules.
- **Data definition layer** (`backend/models`, `database/`): defines the shape of persisted data and its migration history.

## Enterprise Modular Organization & Separation of Concerns

- Every folder has exactly one responsibility (see tables above); no folder mixes presentation, business logic, and data access.
- Frontend and backend are fully decoupled — the frontend never imports backend code, and communicates exclusively through the `frontend/services` → HTTP → `backend/routes` boundary.
- Documentation (`docs/`), automation (`playwright/`, `tests/`), and operational scripts (`scripts/`) are siblings of the application code, never nested inside `frontend/` or `backend/`, so they can evolve and be tooled independently.
- Environment-specific values live only in `config/env/` and `backend/config/` — never hardcoded inside any layer above.
