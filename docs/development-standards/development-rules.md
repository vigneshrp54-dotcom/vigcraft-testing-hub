# Development Rules — Hallmark AI QA Automation Project

Practical coding standards for anyone contributing to the QA Automation codebase (test framework, fixtures, and any supporting backend/frontend used for testing).

## 1. HTML, CSS, JavaScript Standards

- Use semantic HTML elements (`<button>`, `<nav>`, `<form>`) over generic `<div>`/`<span>` where possible — this improves Playwright locator stability.
- Every interactive element used in test flows must have a stable `data-testid` attribute; do not rely on CSS classes or text content alone for automation hooks.
- CSS class names follow **kebab-case** (`card-summary`, `order-list-item`).
- JavaScript follows **camelCase** for variables/functions, **PascalCase** for classes.
- Use `const`/`let` only — no `var`.
- Prefer async/await over raw Promise chains for readability and consistent stack traces in test failures.
- Run linting (ESLint + Prettier) before every commit; no console warnings/errors in committed code.
- No inline styles or inline `onclick` handlers in test fixture pages.

## 2. Node.js & Express Best Practices

- Organize by feature/module, not by file type (e.g. `orders/orders.routes.js`, `orders/orders.controller.js`).
- Keep route handlers thin — business logic belongs in service/controller layers, not inline in route definitions.
- All environment-specific config (URLs, credentials, timeouts) comes from environment variables, never hardcoded.
- Use middleware for cross-cutting concerns (auth, logging, error handling) rather than repeating logic per route.
- Every Express app must have a centralized error-handling middleware as the last-registered middleware.
- Validate all incoming request bodies/params before processing (schema validation layer).
- Log meaningful request context (route, method, requestId) on both success and failure paths.

## 3. MySQL Best Practices

- Table names: **plural, snake_case** (`orders`, `order_items`).
- Column names: **snake_case** (`created_at`, `user_id`).
- Every table has a primary key and, where relevant, `created_at` / `updated_at` timestamps.
- Foreign keys are explicitly defined with proper constraints — no implicit relationships.
- Use parameterized queries / an ORM query builder exclusively — no string-concatenated SQL.
- Add indexes on columns used in `WHERE`, `JOIN`, and `ORDER BY` clauses for tables used in test data setup/teardown.
- Test databases must be seeded and torn down through scripts, never manually edited.
- Avoid `SELECT *` in application or test setup code — select only needed columns.

## 4. Playwright Best Practices

- One test file per feature/flow; group related scenarios using `test.describe`.
- Use the Page Object Model (POM) — locators and page interactions live in page classes, not inline in test specs.
- Prefer role-based and `data-testid` locators over CSS/XPath selectors.
- Never use hard waits (`waitForTimeout`); use Playwright's built-in auto-waiting and explicit condition waits.
- Each test must be independent and able to run in isolation and in parallel — no shared mutable state between tests.
- Use fixtures for test data setup/teardown; clean up created data after each test run.
- Tag tests appropriately (`@smoke`, `@regression`, `@api`) to support selective CI execution.
- Failures must capture trace, screenshot, and video artifacts for debugging.

## 5. File Naming Conventions

| Type | Convention | Example |
|---|---|---|
| Test spec files | `<feature>.spec.js` | `order-checkout.spec.js` |
| Page objects | `<feature>.page.js` | `order-checkout.page.js` |
| Fixtures | `<feature>.fixture.js` | `user-auth.fixture.js` |
| Utility/helpers | `<purpose>.util.js` | `date-format.util.js` |
| Config files | `<env>.config.js` | `qa.config.js` |
| Markdown docs | `kebab-case.md` | `git-workflow.md` |

## 6. Error Handling

- Never swallow errors silently — always log or rethrow with context.
- Use custom error classes for known failure categories (validation, auth, not-found) rather than generic `Error`.
- API/backend errors must follow the standardized error response format defined in `docs/api-design/api-design.md`.
- Test framework failures must produce clear, actionable messages (what was expected vs. actual, which step failed).
- Do not use empty `catch` blocks — every catch must either handle, log, or rethrow.
- Fail fast in setup/teardown hooks; a failed setup should not allow the test to proceed silently.
