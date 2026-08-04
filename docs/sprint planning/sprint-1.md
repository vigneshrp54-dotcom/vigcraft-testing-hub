# Sprint 1 — VigCraft Testing Hub

**Sprint Name:** Sprint 1 — Frontend Foundation
**Sprint Type:** Feature Sprint (Frontend MVP)
**Architecture:** Layered Modular Monolith (Approved and Frozen)
**Phase:** Frontend Development

## Sprint Overview

Sprint 1 delivers the complete Frontend MVP for VigCraft Testing Hub: the authenticated application shell, authentication screens, dashboard, and the first two functional modules (Project Management and Test Case Management), built entirely in HTML5, CSS3, and vanilla JavaScript against the approved design system and component library. Backend integration is stubbed/service-layer-ready but full Express/MySQL wiring is out of scope — this sprint proves the frontend architecture, component reuse, and UX flows before backend endpoints land in Sprint 2.

## Sprint Scope

**In scope:**
- Global layout shell (Header, Sidebar, Footer) shared across all authenticated pages
- Authentication pages: Login, Register, Forgot Password
- Dashboard: statistics cards, recent activity, quick links
- Project Management: Project List, Create Project
- Test Case Management: Test Case List, Create Test Case
- Full component library implementation (Header, Sidebar, Footer, Button, Card, Table, Modal, Input, Badge, Breadcrumb, Loader, Toast) per `docs/components/`
- Responsive behavior at Mobile / Tablet / Desktop breakpoints per `docs/design-system/responsive-guidelines.md`
- WCAG 2.1 AA accessibility conformance per `docs/design-system/accessibility.md`

**Out of scope (deferred to later sprints):**
- Live backend/API integration (Express routes, MySQL persistence)
- Project detail and Test Case detail views (Breadcrumb component is built but not yet consumed)
- Analytics module, Executions module
- Playwright E2E automation execution against a live backend (specs may be scaffolded, not run against real data)
- Dark theme / theme switching (token structure supports it; not activated this sprint)

## Features

| Feature | Module | Pages/Components |
|---|---|---|
| Global App Shell | Layout | Header, Sidebar, Footer |
| User Authentication | Authentication | Login, Register, Forgot Password |
| Testing Overview | Dashboard | Dashboard Home, Statistics Cards, Recent Activity |
| Project Management | Project Management | Project List, Create Project |
| Test Case Authoring | Test Case Management | Test Case List, Create Test Case |

## Deliverables

1. Complete CSS architecture (`frontend/css/`) — base, layout, components, pages, themes, utilities layers.
2. Twelve reusable frontend components implemented per `docs/components/` specs.
3. Six fully built, responsive pages per `docs/wireframes/` specs: Login, Register, Forgot Password, Dashboard, Projects, Test Cases.
4. Updated `README.md` at project root reflecting Sprint 1 milestone completion (per Hallmark Rule 10).
5. Sprint Planning Review and Sprint Readiness Report (this folder).

## Acceptance Criteria

- [ ] Every Sprint 1 page renders correctly at Mobile (375px), Tablet (768px), and Desktop (1440px) reference widths.
- [ ] Every component matches its documented spec in `docs/components/` (props surface, structure, accessibility behavior).
- [ ] All forms (Login, Register, Forgot Password, Create Project, Create Test Case) enforce the validation rules defined in `docs/wireframes/*.md`.
- [ ] No functional status (pass/fail/warn/running) is conveyed by color alone anywhere in the UI — verified against `docs/design-system/accessibility.md`.
- [ ] Keyboard-only navigation completes each critical flow (login, create project, create test case) without a mouse.
- [ ] All CSS values trace back to design tokens in `base/variables.css` — no hardcoded hex/pixel values in component or page stylesheets.
- [ ] Folder structure, file naming, and coding standards match `docs/project-structure/` exactly.
- [ ] Root `README.md` updated to reflect Sprint 1 completion.

## Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Frontend built ahead of backend may require rework once real API response shapes are confirmed | Medium | Medium | Frontend `services/` layer isolates all API calls behind a stable interface, so only that layer changes when backend contracts finalize. |
| Vanilla JS component system (no framework) may accumulate inconsistent state-management patterns as more pages are added | Medium | Medium | Component docs (`docs/components/`) fix each component's prop surface and responsibility boundary up front; coding standards enforce single-responsibility modules. |
| Accessibility requirements (WCAG 2.1 AA) add scope to every component and may be under-estimated | Low | Medium | Accessibility is written into each component's spec and into Sprint 1 acceptance criteria directly, not treated as a separate pass. |
| Hallmark one-file-at-a-time workflow increases coordination overhead across a large file count | Low | Low | Sequenced by the approved Development Order (Phase 1-5); each file requires explicit approval before the next begins, keeping scope controlled. |

## Dependencies

- Design System (`docs/design-system/`) — approved, complete. Sprint 1 code must not diverge from its tokens/components.
- Wireframes (`docs/wireframes/`) — approved, complete. Defines layout, flow, and validation rules per page.
- Component Documentation (`docs/components/`) — approved, complete. Defines the prop surface and structure for all 12 components.
- Project Structure Documentation (`docs/project-structure/`) — approved, complete. Defines folder structure, naming, and coding standards.
- Database and Architecture artifacts — approved, complete (referenced for forward compatibility of `frontend/services/` even though live integration is out of Sprint 1 scope).
