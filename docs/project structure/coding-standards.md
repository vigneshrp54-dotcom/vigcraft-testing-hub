# Coding Standards — VigCraft Testing Hub

**Status:** Approved and Frozen (per Sprint 1 Architecture sign-off)

## HTML Standards
- HTML5 semantic elements required: `<header>`, `<nav>`, `<main>`, `<footer>`, `<section>`, `<table>` — never a `<div>` standing in for an element that already exists.
- One `<h1>` per page; heading levels never skip.
- Every form control has an associated `<label for>` — placeholder text never substitutes for a label.
- No inline `style` attributes and no inline event handlers (`onclick="..."`) — behavior is wired in JS files, styling lives in CSS files.
- Attribute order: `id`, `class`, `data-*`, `aria-*`, then remaining attributes, for consistent diffs.
- Validate markup against the WCAG 2.1 AA requirements defined in `docs/design-system/accessibility.md` before a page is considered complete.

## CSS Standards
- Follow the import layer order defined in `main.css`: base → layout → components → pages → themes → utilities.
- BEM naming throughout (see `naming-conventions.md`); no ID selectors, no `!important` outside of the documented `[hidden]` and `prefers-reduced-motion` reset rules.
- All colors, spacing, typography, radii, and shadows reference design tokens from `base/variables.css` — no hardcoded hex values or magic pixel numbers in component/page stylesheets.
- Mobile-first or desktop-first is fixed per the approved breakpoints in `docs/design-system/responsive-guidelines.md`; media queries hardcode the documented breakpoint values (640px / 1024px) since custom properties aren't usable inside `@media` conditions.
- Avoid selector specificity conflicts — do not mix type selectors (`.section`) and element selectors that could cancel each other out; prefer single-class BEM selectors.

## JavaScript Standards
- ES6+ syntax: `const`/`let` (never `var`), arrow functions for callbacks, template literals over string concatenation, destructuring where it improves clarity.
- Strict mode implied by ES module usage; no global scope pollution.
- One module, one responsibility — a service file only makes API calls, a utils file only contains pure functions.
- No direct DOM manipulation inside `services/` or `utils/` — presentation logic stays in `components/`/`pages/`.
- Every async operation wrapped in `try/catch` with a meaningful error path (see Error Handling below) — no unhandled promise rejections.
- JSDoc comments on every exported function: purpose, `@param`, `@returns`.

## Node.js Standards
- CommonJS or ES modules — one module system chosen project-wide and used consistently (no mixing `require` and `import` in the same layer).
- Environment configuration read only through `backend/config/`, never `process.env` accessed directly inside controllers/services.
- No blocking synchronous I/O (`fs.readFileSync` etc.) in request-handling code paths.
- Dependencies pinned in `package.json` with exact or tightly-scoped semver ranges; no unpinned `latest` dependencies in production code.

## Express.js Standards
- Route files (`backend/routes/`) only declare paths and attach middleware/controller references — no inline handler logic.
- Controllers never access `req`/`res` beyond parsing input and sending the response — all business logic delegated to `backend/services`.
- All routes requiring authentication pass through `middleware/authMiddleware.js`; no ad-hoc auth checks inside individual controllers.
- A single centralized `middleware/errorHandler.js` catches all errors passed via `next(err)` — controllers never format error responses themselves.
- Input validation runs via `backend/validators/` before a controller's core logic executes, using a consistent validation-error response shape.

## SQL Standards
- All queries live in `backend/repositories/` — no raw SQL in controllers, services, or route files.
- Parameterized queries only — string-concatenated SQL is prohibited without exception (SQL injection prevention).
- Explicit column lists in `SELECT` statements — `SELECT *` prohibited in application code (migrations/ad-hoc scripts excluded).
- Every table includes `id`, `created_at`, `updated_at` columns at minimum, following `naming-conventions.md`.
- Migrations are additive and reversible where possible — each migration file has a corresponding rollback path documented in `database/migrations/`.

## Documentation Standards
- Every module-level file (service, controller, repository, component) starts with a header comment: purpose, and if non-obvious, its dependencies.
- Every exported function documented with JSDoc (see JavaScript Standards).
- `README.md` updated at the completion of every sprint milestone (see project Hallmark rules), reflecting current structure and status — never left stale.
- Architecture-affecting decisions recorded in `docs/architecture/` as they're made, not reconstructed retroactively.

## Error Handling
- Errors are caught at the layer they occur in and re-thrown with context, not swallowed silently.
- User-facing error messages state what happened and how to fix it (per `docs/design-system/design-principles.md` voice guidance) — never a raw stack trace or generic "Something went wrong."
- Backend: all errors flow through `middleware/errorHandler.js` and are returned in the standard response envelope (`helpers/responseFormatter.js`), with an appropriate HTTP status code — never a 200 response carrying an error payload.
- Frontend: `services/` layer catches request failures and returns a normalized error shape to the calling page/component, which is responsible for surfacing it (inline field error, Alert, or Toast per `docs/components/`).
- No empty `catch` blocks anywhere in the codebase.

## Logging
- Backend logs written through a single shared logger utility (`backend/utils/logger.js`), never raw `console.log` in application code.
- Log levels used consistently: `error`, `warn`, `info`, `debug` — production defaults to `info` and above.
- Logs never include sensitive data: passwords, tokens, full credit card/payment details, or other fields excluded per Security standards below.
- Request logging middleware records method, path, status code, and duration for every request, written to `backend/logs/`.

## Security
- Passwords hashed (never stored or logged in plain text) before persistence; hashing handled in `backend/services/authService.js`.
- JWT/session secrets loaded from environment variables only, never hardcoded.
- All user input validated and sanitized server-side, regardless of client-side validation already performed.
- Parameterized SQL queries only (see SQL Standards) — no exceptions.
- CORS configured explicitly for known frontend origins — no wildcard `*` in production.
- Rate limiting applied to authentication endpoints (login, register, forgot-password) via `backend/middleware/`.
- No secrets, credentials, or `.env` files committed to version control — enforced via `.gitignore` and pre-commit checks.

## Code Formatting
- Consistent formatter (Prettier or equivalent) enforced project-wide with a single shared config — no per-file formatting deviations.
- Consistent linter (ESLint or equivalent) enforced for both `frontend/` and `backend/`, run in CI before merge.
- 2-space indentation, semicolons required, single quotes for JS strings, double quotes for HTML attributes.
- Maximum line length guideline: ~100 characters, wrapped for readability beyond that.

## Best Practices
- Single Responsibility Principle applied at every level: file, function, component, and folder (per Hallmark project rules).
- DRY: shared logic extracted to `utils/`/`helpers/` rather than duplicated across modules.
- No dead code or commented-out code blocks committed — remove or document via `docs/` instead.
- Every new component/service accompanied by a corresponding entry in `docs/components/` or `docs/architecture/` before being considered complete.
- Code reviewed against this document and `naming-conventions.md` before merge; deviations require an explicit documented exception, not silent drift.
