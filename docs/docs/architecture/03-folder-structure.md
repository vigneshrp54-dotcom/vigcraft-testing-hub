# 3. Folder Structure

## 3.1 Repository Root Structure

```
vigcraft-testing-hub/
├── frontend/                        # Frontend application (HTML5 / CSS3 / Vanilla JS)
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   ├── forgot-password.html
│   │
│   ├── pages/                       # All page-level views, including Dashboard
│   │   ├── dashboard.html
│   │   ├── projects.html
│   │   ├── test-suites.html
│   │   ├── test-cases.html
│   │   ├── test-runs.html
│   │   ├── defects.html
│   │   ├── reports.html
│   │   └── profile.html
│   │
│   ├── components/
│   │   ├── header.html
│   │   ├── sidebar.html
│   │   ├── navbar.html
│   │   ├── footer.html
│   │   └── modal.html
│   │
│   ├── css/
│   │   ├── style.css
│   │   ├── login.css
│   │   ├── dashboard.css
│   │   ├── pages.css
│   │   └── responsive.css
│   │
│   ├── js/
│   │   ├── app.js
│   │   ├── auth.js
│   │   ├── api.js
│   │   ├── dashboard.js
│   │   ├── projects.js
│   │   ├── testcases.js
│   │   ├── reports.js
│   │   └── utils.js
│   │
│   └── assets/
│       ├── images/
│       ├── icons/
│       ├── fonts/
│       └── logos/
│
├── backend/                         # Backend application (Node.js + Express.js)
│   ├── config/                      # DB config, env config, constants
│   ├── routes/                      # Express route definitions
│   ├── controllers/                 # Request handlers
│   ├── services/                    # Business logic
│   ├── repositories/                # Data access layer (MySQL queries)
│   ├── middleware/                  # Auth, RBAC, validation, error handler, logger
│   ├── models/                      # Data models / schema definitions
│   ├── validators/                  # Request validation schemas
│   ├── utils/                       # Shared helpers (JWT utils, response formatter)
│   ├── templates/                   # Server-rendered templates (see 3.4)
│   ├── uploads/                     # Runtime file storage (see 3.5)
│   ├── logs/                        # Log output (gitignored)
│   ├── server.js                    # Entry point
│   └── package.json
│
├── database/                        # Database design & lifecycle assets
│   ├── database-design.md           # Approved database design reference
│   ├── erd.md                       # Entity relationship diagram
│   ├── migrations/                  # Versioned MySQL schema migrations
│   ├── seeds/                       # Baseline seed data scripts
│   └── schemas/                     # Schema definition/reference material
│
├── playwright/                      # Playwright automation (isolated from backend runtime code)
│   ├── playwright.config.js
│   ├── runners/                     # Run trigger/orchestration logic
│   └── results-parser/              # Parses Playwright JSON/HTML reports
│
├── tests/                           # Automated tests (backend unit/integration)
│   ├── unit/
│   └── integration/
│
├── docs/
│   ├── architecture/                # This architecture documentation set
│   ├── api/                         # Swagger/OpenAPI spec, Postman collection
│   └── sprint-planning/             # Sprint planning documents
│
├── .env.example
├── .gitignore
├── docker-compose.yml                # (Future Scope) local orchestration — see Section 16.8
└── README.md
```

## 3.2 Structural Principles
- **frontend/** and **backend/** are fully decoupled; the frontend communicates with the backend only
  through REST API calls — never through shared code or direct DB access.
- **backend/** follows a strict **Route → Controller → Service → Repository** flow (see Section 5).
- **playwright/** is a top-level sibling of `backend/`, not nested inside it, so Playwright execution
  can later be extracted into a separate worker/service without touching core business logic.
- **database/** is the single owner of schema lifecycle assets (`migrations/`, `seeds/`,
  `schemas/`) and the approved design reference (`database-design.md`, `erd.md`); the backend
  consumes the database but does not separately own migration/seed scripts.
- **tests/** is top-level and framework-agnostic, covering backend unit and integration tests
  independently of the `playwright/` end-to-end automation suite.
- **docs/** keeps architecture, API, and planning documentation alongside code for single-source
  traceability.

## 3.3 About `backend/templates/`
`backend/templates/` holds server-rendered, non-page markup fragments used by the backend itself —
primarily **transactional email templates** (e.g., password reset, welcome, notification digest
emails) rendered by the backend before being sent. This is distinct from `frontend/pages/` and
`frontend/components/`, which are user-facing pages served to the browser; `templates/` content is
never served directly to the browser as an application page.

## 3.4 About `backend/uploads/`
`backend/uploads/` is the runtime file storage location for content generated or received during
normal operation — for example, defect attachments/screenshots, execution evidence files, and
Playwright automation report artifacts referenced from the database (e.g., `automation_results`,
`test_executions`). It is gitignored and treated as disposable/runtime storage for the MVP local
deployment model; migrating this to object storage is captured as a Future Scope item (Section 23).

## 3.5 Naming Conventions
- Files: `kebab-case.js` (e.g., `test-case.controller.js`)
- Classes: `PascalCase` (e.g., `TestCaseService`)
- Functions/variables: `camelCase`
- Constants: `UPPER_SNAKE_CASE`
- Database tables: `snake_case`, plural (e.g., `test_cases`)
