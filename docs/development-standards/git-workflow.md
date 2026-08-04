# Git Workflow — Hallmark AI QA Automation Project

## 1. Branch Naming

Format: `<type>/<ticket-id>-<short-description>`

| Type | Purpose | Example |
|---|---|---|
| `feature/` | New test suite, tooling, or feature work | `feature/QA-142-order-checkout-tests` |
| `bugfix/` | Fixing a bug in test framework or app under test coverage | `bugfix/QA-158-flaky-login-test` |
| `hotfix/` | Urgent fix needed outside normal cycle | `hotfix/QA-160-ci-pipeline-broken` |
| `chore/` | Non-functional work (deps, config, cleanup) | `chore/QA-165-update-playwright-version` |
| `docs/` | Documentation-only changes | `docs/QA-170-update-readme` |

Rules:
- All lowercase, hyphen-separated description.
- Always include the ticket ID (Jira/tracker reference).
- Branch off the latest `develop` (or designated integration branch), never off `main` directly.

## 2. Commit Message Format

Follow **Conventional Commits**:

```
<type>(<scope>): <short summary>

[optional body]

[optional footer, e.g. ticket reference]
```

| Type | When to use |
|---|---|
| `feat` | New test, page object, or capability added |
| `fix` | Bug fix in tests, framework, or fixtures |
| `refactor` | Code restructuring, no behavior change |
| `test` | Adding/updating test-only code |
| `docs` | Documentation changes |
| `chore` | Tooling, dependency, config updates |

**Examples:**
```
feat(orders): add checkout flow regression suite

fix(auth): resolve flaky login due to missing wait condition

docs(readme): update setup instructions for QA environment

Ref: QA-142
```

Rules:
- Summary line ≤ 72 characters, present tense ("add", not "added").
- Body explains *why*, not just *what*, when the change isn't self-evident.
- Reference the ticket ID in the footer.

## 3. Feature Workflow

1. **Pick up ticket** from the sprint board; confirm status moves to "In Progress."
2. **Branch** from `develop` using the naming convention above.
3. **Develop** following `development-rules.md` standards; commit incrementally with proper messages.
4. **Self-test locally** — run the relevant test suite and linting before pushing.
5. **Push branch** and open a **Pull Request** into `develop`:
   - PR title mirrors the ticket summary.
   - PR description includes: what changed, why, how it was tested, linked ticket.
6. **Code review** — at least one approval required, using `code-review-checklist.md`.
7. **CI pipeline must pass** (lint, unit/API/E2E tests) before merge is allowed.
8. **Merge** via squash merge to keep `develop` history clean.
9. **Delete branch** after merge.
10. **Release** — `develop` is periodically merged into `main` per the Hallmark release cadence; tag releases accordingly.

Notes:
- No direct commits to `main` or `develop`.
- Hotfixes follow the same PR/review process but may be fast-tracked with expedited review.
