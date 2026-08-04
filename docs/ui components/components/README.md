# VigCraft Testing Hub — Component Library

Documentation-only reference for every reusable component identified across the six Sprint 1 pages (Login, Register, Forgot Password, Dashboard, Projects, Test Cases). No implementation code — see `frontend/components/` for the built system once Phase 1/2 of the Hallmark build reaches these.

## How Components Were Identified

Each Sprint 1 wireframe (`wireframes/*.md`) was cross-referenced for repeated UI patterns. A pattern qualified as a component (rather than page-specific markup) if it appeared in **two or more** pages, or if it represents a distinct, single-responsibility unit that will clearly recur in later sprints (e.g., Breadcrumb, not used in Sprint 1's flat list pages but required the moment detail views ship).

| Component | Appears In |
|---|---|
| Header | All authenticated pages (Dashboard, Projects, Test Cases) |
| Sidebar | All authenticated pages |
| Footer | All authenticated pages |
| Button | Every page — primary/secondary/destructive actions throughout |
| Card | Dashboard (stats, activity, quick links), mobile stacked-table rows on Projects/Test Cases |
| Table | Projects list, Test Cases list |
| Modal | Create Project, Create Test Case, future destructive confirmations |
| Input | Login, Register, Forgot Password, Create Project, Create Test Case |
| Badge | Table status columns, status-bearing Cards |
| Breadcrumb | Reserved for upcoming detail views (Project detail, Test Case detail) |
| Loader | Any page with async data (Dashboard, Projects, Test Cases, form submissions) |
| Toast | Create Project, Create Test Case, future delete/update confirmations |

## Contents

| File | Component |
|---|---|
| [`header.md`](./header.md) | Header |
| [`sidebar.md`](./sidebar.md) | Sidebar |
| [`footer.md`](./footer.md) | Footer |
| [`button.md`](./button.md) | Button |
| [`card.md`](./card.md) | Card |
| [`table.md`](./table.md) | Table |
| [`modal.md`](./modal.md) | Modal |
| [`input.md`](./input.md) | Input |
| [`badge.md`](./badge.md) | Badge |
| [`breadcrumb.md`](./breadcrumb.md) | Breadcrumb |
| [`loader.md`](./loader.md) | Loader |
| [`toast.md`](./toast.md) | Toast |

## Conventions Used Across All Component Docs

- **Props** are documented "future-ready" — i.e., the full prop surface a production component would need, even though Sprint 1's vanilla-JS implementation may wire only a subset initially.
- **HTML Structure** is described as a semantic element outline (tag + purpose), not literal markup — actual markup is written during implementation, not in this documentation.
- **Status** props/styling always reference the shared ledger system defined in `design-system/color-system.md` — Badge, Card, Toast, and Table all consume the same five states (`pass`, `fail`, `warn`, `running`, `neutral`) for consistency.
- **Accessibility** sections apply the standards defined in `design-system/accessibility.md` to this specific component, rather than restating the global rules.

## Status

Component documentation complete for all 12 Sprint 1 components. Next: resume the Hallmark file-by-file build, starting from `base/typography.css`.
