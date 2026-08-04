# Naming Conventions — VigCraft Testing Hub

**Status:** Approved and Frozen (per Sprint 1 Architecture sign-off)

All conventions below apply project-wide, across frontend, backend, database, and tooling.

## Folder Naming
- All lowercase, kebab-case for multi-word folders: `test-cases/`, `project-structure/`.
- Plural for folders holding collections of similar items: `controllers/`, `services/`, `pages/`, `migrations/`.
- Singular for folders representing a single concern/domain: `config/`, `database/`.

## File Naming

| File Type | Convention | Example |
|---|---|---|
| Frontend JS (components, pages, services, utils) | camelCase | `testCaseService.js`, `statusBadge.js` |
| Frontend CSS | kebab-case | `status-badge.css`, `dashboard.css` |
| Backend JS (controllers, services, repositories, middleware) | camelCase + role suffix | `authController.js`, `userRepository.js`, `errorHandler.js` |
| Backend models | PascalCase (entity name, singular) | `User.js`, `Project.js`, `TestCase.js` |
| SQL migration files | numbered snake_case | `001_create_users_table.sql` |
| Playwright specs | kebab-case + `.spec.js` | `test-case.spec.js` |
| Markdown documentation | kebab-case | `folder-structure.md`, `naming-conventions.md` |
| HTML pages | kebab-case | `forgot-password.html` |

## HTML Naming
- File names: kebab-case (see above).
- `id` attributes: camelCase, unique per page, reserved for JS hooks and accessibility references (`aria-labelledby`, `for`) — never used for styling.
- `data-*` attributes for JS behavior hooks: kebab-case (`data-modal-trigger`, `data-sort-key`).
- Semantic elements preferred over generic `<div>`/`<span>` wherever a matching element exists (`<nav>`, `<header>`, `<table>`, `<button>`).

## CSS Naming
- Methodology: BEM (Block\_\_Element--Modifier), kebab-case throughout.
  - Block: `.card`
  - Element: `.card__header`
  - Modifier: `.card--clickable`, `.badge--pass`
- Custom properties (design tokens): kebab-case with a category prefix, matching `base/variables.css`:
  `--color-status-pass`, `--space-4`, `--fs-lg`, `--radius-md`, `--shadow-focus`.
- Utility classes: single-purpose, kebab-case, prefixed to signal non-component origin: `.u-text-center`, `.u-hidden-mobile`.
- No ID selectors in stylesheets. No inline styles.

## JavaScript Naming

| Element | Convention | Example |
|---|---|---|
| Variables | camelCase | `testCaseCount`, `isLoading` |
| Functions | camelCase, verb-first | `getProjectList()`, `validateEmail()` |
| Classes | PascalCase | `class ApiClient`, `class TestCaseModel` |
| Constants (true immutable values) | UPPER_SNAKE_CASE | `MAX_RETRY_ATTEMPTS`, `DEFAULT_PAGE_SIZE` |
| Enum-like constant objects | PascalCase object, UPPER_SNAKE_CASE keys | `StatusTypes.PASS` |
| Private/internal helpers (module-scoped) | leading underscore | `_formatDuration()` |
| Boolean variables/functions | `is`/`has`/`should` prefix | `isDisabled`, `hasError`, `shouldRetry` |
| Event handlers | `handle` or `on` prefix | `handleSubmit`, `onRowClick` |

## API Naming
- Base path: `/api/v1/` — versioned from the start.
- Resource paths: plural, kebab-case nouns: `/api/v1/test-cases`, `/api/v1/projects`.
- Standard REST verbs mapped to HTTP methods — no verbs in the URL (`POST /api/v1/projects`, not `/api/v1/create-project`).
- Nested resources reflect ownership: `/api/v1/projects/:projectId/test-cases`.
- Query parameters: camelCase (`?sortBy=createdAt&pageSize=25`).
- Response JSON keys: camelCase, matching frontend model expectations.

## Database Naming
- Table names: plural, snake_case: `users`, `projects`, `test_cases`.
- Column names: snake_case: `created_at`, `project_id`, `is_active`.
- Primary keys: `id`.
- Foreign keys: `<singular_table>_id`: `project_id`, `user_id`.
- Junction/pivot tables: both table names, singular, alphabetical, joined by underscore: `project_user`.
- Indexes: `idx_<table>_<column(s)>`: `idx_test_cases_project_id`.
- Migration files: numbered, ordered, snake_case description: `002_create_projects_table.sql`.

## Git Branch Naming
- Format: `<type>/<short-description>`, kebab-case description.
- Types: `feature/`, `bugfix/`, `hotfix/`, `chore/`, `docs/`, `refactor/`.
- Examples: `feature/test-case-create-modal`, `bugfix/login-validation-error`, `docs/project-structure`.

## Commit Naming
- Conventional Commits format: `<type>(<scope>): <short description>`.
- Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`.
- Scope: the affected module/folder (`frontend`, `backend`, `auth`, `test-cases`).
- Examples:
  - `feat(frontend): add test case create modal`
  - `fix(backend): correct project ownership check`
  - `docs(project-structure): add naming conventions`
- Subject line: imperative mood, no trailing period, under 72 characters.

## Environment Variables
- UPPER_SNAKE_CASE, grouped by prefix per concern: `DB_HOST`, `DB_PORT`, `DB_NAME`, `JWT_SECRET`, `JWT_EXPIRY`, `APP_PORT`, `APP_ENV`.
- Never committed with real values — only `.env.example` (with placeholder values) is version-controlled; real `.env.*` files stay untracked.

## Constants
- Defined once per domain in `constants/` (frontend) or `backend/constants/`, never duplicated inline.
- UPPER_SNAKE_CASE for primitive constants; PascalCase object with UPPER_SNAKE_CASE keys for enum-style groups (see JavaScript Naming above).

## Functions
- Verb-first, camelCase, name describes exactly what it does: `calculatePassRate()`, `formatTimestamp()`, not `data()` or `process()`.
- Async functions do not need an `Async` suffix; clarity comes from usage context and `await`.
- One function, one responsibility — a function that both fetches and formats data is split into two.

## Variables
- camelCase, descriptive, no single-letter names outside of short-lived loop indices (`i`, `j`) in tightly scoped loops.
- Avoid abbreviations that aren't broadly understood (`cfg` acceptable for `config` in narrow scope; `usrRepo` is not — write `userRepository`).
- Booleans always read as a yes/no question (`isValid`, `hasPermission`).
