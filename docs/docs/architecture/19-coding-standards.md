# 19. Coding Standards

## 19.1 General Principles
- Consistency over personal preference — standards below are enforced via linting where possible.
- Readability first: code is read far more often than written.
- No business logic in controllers or routers (Section 5.3).

## 19.2 JavaScript/Node.js Standards
- ES modules (or consistent CommonJS — one style per project, not mixed).
- `async/await` preferred over raw Promise chains or callbacks.
- No unhandled promise rejections — every async operation wrapped in try/catch or handled centrally
  (Section 13.8).
- Linting via ESLint with an agreed shared config; formatting via Prettier, enforced pre-commit.

## 19.3 Naming Conventions (recap from Section 3.3)
- Files: `kebab-case.js`
- Classes: `PascalCase`
- Functions/variables: `camelCase`
- Constants: `UPPER_SNAKE_CASE`
- DB tables/columns: `snake_case`

## 19.4 API Route Conventions
- Plural resource nouns, versioned base path (`/api/v1/...`) per Section 7.
- Controllers thin: parse → call service → format response, nothing else.

## 19.5 SQL/Query Standards
- All queries parameterized (Section 15.3) — no string concatenation.
- Queries isolated to the Repository layer only.

## 19.6 Frontend JS Standards
- No inline `onclick` handlers in HTML; event binding done in JS modules.
- Component/page modules expose a clear `init()`/`render()` contract for consistency.

## 19.7 Testing Standards
- Every service-layer function has corresponding unit tests (business logic tested independent of
  Express).
- Controllers/routes covered by integration tests hitting real (test-DB) endpoints.
- Playwright specs follow the Page Object Model pattern for maintainability (see Section 20).

## 19.8 Documentation Standards
- Every module includes a short `README.md` describing its responsibility and public service
  contract.
- All REST endpoints documented in Swagger/OpenAPI and Postman (Section 7.7) as part of the
  Definition of Done.

## 19.9 Commit & PR Standards
- Commit messages follow a conventional format: `type(scope): summary` (e.g.,
  `feat(test-cases): add bulk import endpoint`).
- PRs must satisfy the Definition of Done checklist from Sprint Planning before merge (code review,
  build passing, tests passing, docs updated).
