# VigCraft Testing Hub — Sprint 1 Wireframes

UI documentation only (no HTML). Each page below follows the same structure: Purpose, Layout (Mermaid), Components Used, User Flow (Mermaid), Navigation, Validation Rules, and Mobile/Tablet/Desktop layout behavior — built on the tokens and components defined in `design-system/`.

## Pages

| Page | File | Notes |
|---|---|---|
| Login | [`login.md`](./login.md) | Pre-auth, no app chrome |
| Register | [`register.md`](./register.md) | Pre-auth, no app chrome |
| Forgot Password | [`forgot-password.md`](./forgot-password.md) | Pre-auth, no app chrome |
| Dashboard | [`dashboard.md`](./dashboard.md) | First authenticated screen; statistics + recent activity |
| Projects | [`projects.md`](./projects.md) | List + Create Project (modal) |
| Test Cases | [`test-cases.md`](./test-cases.md) | List + Create Test Case (modal, step builder) |

## Conventions Used Across All Wireframes

- **Layout diagrams** use Mermaid `graph TD` with subgraphs to represent screen regions (sidebar, header, content) — not literal pixel wireframes.
- **User flow diagrams** use Mermaid `flowchart TD` to show decision points, especially validation branches and empty/error paths.
- **Status vocabulary** (Pass/Fail/Warn/Running/Not Run) referenced in tables always maps to the ledger system in `design-system/color-system.md`.
- **Breakpoints** referenced (Mobile ≤640px / Tablet 641–1024px / Desktop ≥1025px) match `design-system/responsive-guidelines.md` exactly.

## Status

Wireframes complete for all 6 Sprint 1 pages. Next: resume the Hallmark file-by-file build, starting from `base/typography.css`.
