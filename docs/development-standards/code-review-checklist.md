# Code Review Checklist — Hallmark AI QA Automation Project

Reviewers should confirm every applicable item before approving a Pull Request.

## 1. Frontend Checklist

- [ ] Semantic HTML used where appropriate.
- [ ] Interactive elements have stable `data-testid` attributes for automation.
- [ ] No inline styles or inline event handlers.
- [ ] CSS/JS naming conventions followed (kebab-case CSS, camelCase JS).
- [ ] No hardcoded environment URLs or credentials.
- [ ] No console errors/warnings introduced.
- [ ] Linting and formatting checks pass.

## 2. Backend Checklist

- [ ] Route handlers are thin; logic lives in controller/service layers.
- [ ] Input validation exists for all request bodies/params.
- [ ] Centralized error-handling middleware is used; no unhandled exceptions.
- [ ] Config/secrets sourced from environment variables, not hardcoded.
- [ ] API responses follow the standard success/error envelope (per `api-design.md`).
- [ ] Appropriate HTTP status codes used.
- [ ] Logging added for key request/error paths without leaking sensitive data.

## 3. Database Checklist

- [ ] Table/column naming follows snake_case convention.
- [ ] Primary keys and relevant timestamps (`created_at`/`updated_at`) present.
- [ ] Foreign key constraints defined correctly.
- [ ] Queries are parameterized — no string-concatenated SQL.
- [ ] Indexes added for columns used in frequent lookups/joins.
- [ ] Test data seed/teardown scripts updated if schema changed.
- [ ] No destructive migrations without rollback plan.

## 4. Manual Testing Checklist

- [ ] Feature/fix verified manually against acceptance criteria.
- [ ] Positive and negative (edge-case) scenarios checked.
- [ ] Cross-browser check performed if UI-facing (per Hallmark supported browser list).
- [ ] No regressions observed in related existing functionality.
- [ ] Screenshots/notes attached to PR or ticket if UI change.

## 5. API Testing Checklist

- [ ] Endpoint tested for all documented status codes (200/201/400/401/403/404/etc.).
- [ ] Request/response payloads validated against expected schema.
- [ ] Auth scenarios covered (missing token, expired token, insufficient permissions).
- [ ] Error response format matches standard (`success`, `error.code`, `error.message`).
- [ ] Pagination, filtering, and sorting verified where applicable.
- [ ] Idempotency behavior verified for relevant `POST` endpoints.

## 6. Playwright Checklist

- [ ] Tests follow Page Object Model structure.
- [ ] Locators use `data-testid` or role-based selectors, not brittle CSS/XPath.
- [ ] No hard-coded waits (`waitForTimeout`); proper condition-based waits used.
- [ ] Tests are independent and safe to run in parallel.
- [ ] Test data is created and cleaned up within the test/fixture lifecycle.
- [ ] Appropriate tags applied (`@smoke`, `@regression`, `@api`).
- [ ] New/modified tests pass consistently (no flakiness) across multiple runs.
- [ ] Trace/screenshot/video capture enabled for failure debugging.
