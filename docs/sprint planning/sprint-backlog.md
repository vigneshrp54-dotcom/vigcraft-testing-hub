# Sprint 1 Backlog — VigCraft Testing Hub

**Sprint Duration:** 2 weeks
**Estimation Method:** Story Points (Fibonacci: 1, 2, 3, 5, 8)
**Status Legend:** `Not Started` · `In Progress` · `Done` · `Blocked`

## User Stories

| ID | User Story | Priority | Story Points | Status |
|---|---|---|---|---|
| US-01 | As a user, I can sign in with my email and password so I can access my testing workspace. | P0 | 5 | Not Started |
| US-02 | As a new user, I can create an account so I can start using VigCraft. | P0 | 5 | Not Started |
| US-03 | As a user who forgot my password, I can request a reset link so I can regain access. | P1 | 3 | Not Started |
| US-04 | As a logged-in user, I can see a dashboard summarizing my testing activity so I understand my team's status at a glance. | P0 | 8 | Not Started |
| US-05 | As a user, I can view a list of all my projects so I can navigate to the one I need. | P0 | 5 | Not Started |
| US-06 | As a user, I can create a new project so I can start organizing test cases under it. | P0 | 5 | Not Started |
| US-07 | As a user, I can view a list of test cases within a project so I can review existing coverage. | P0 | 5 | Not Started |
| US-08 | As a user, I can create a new test case with steps and expected results so I can document how a feature should be verified. | P0 | 8 | Not Started |
| US-09 | As a user, I can navigate the app through a consistent sidebar and header so I always know where I am. | P0 | 5 | Not Started |
| US-10 | As a user, I experience a consistent, responsive UI on mobile, tablet, and desktop so I can use VigCraft from any device. | P1 | 5 | Not Started |

**Total Story Points:** 54

## Tasks

Tasks are grouped by the approved Development Order (Phase 1–5). Each task corresponds to one or more Hallmark file-generation units.

### Phase 1 — Layout & Common Components
| Task | Linked Story | Priority | Points | Assignee | Status |
|---|---|---|---|---|---|
| Build CSS foundation (`base/`: reset, variables, typography) | US-09, US-10 | P0 | 3 | Hallmark AI — Frontend Engineer | In Progress |
| Build layout stylesheets (`layout.css`, header, sidebar, footer) | US-09 | P0 | 3 | Hallmark AI — Frontend Engineer | Not Started |
| Implement Header, Sidebar, Footer components | US-09 | P0 | 5 | Hallmark AI — Frontend Engineer | Not Started |
| Implement Button, Card, Input, Badge, Modal, Table, Loader, Toast, Breadcrumb components | US-04–US-08 | P0 | 8 | Hallmark AI — Frontend Engineer | Not Started |

### Phase 2 — Authentication Pages
| Task | Linked Story | Priority | Points | Assignee | Status |
|---|---|---|---|---|---|
| Build Login page + validation | US-01 | P0 | 5 | Hallmark AI — Frontend Engineer | Not Started |
| Build Register page + validation | US-02 | P0 | 5 | Hallmark AI — Frontend Engineer | Not Started |
| Build Forgot Password page + validation | US-03 | P1 | 3 | Hallmark AI — Frontend Engineer | Not Started |

### Phase 3 — Dashboard
| Task | Linked Story | Priority | Points | Assignee | Status |
|---|---|---|---|---|---|
| Build Dashboard layout + Statistics Cards | US-04 | P0 | 5 | Hallmark AI — Frontend Engineer | Not Started |
| Build Recent Activity panel + Quick Links | US-04 | P0 | 3 | Hallmark AI — Frontend Engineer | Not Started |

### Phase 4 — Project Module
| Task | Linked Story | Priority | Points | Assignee | Status |
|---|---|---|---|---|---|
| Build Project List page (table, filters, empty state) | US-05 | P0 | 5 | Hallmark AI — Frontend Engineer | Not Started |
| Build Create Project modal + validation | US-06 | P0 | 3 | Hallmark AI — Frontend Engineer | Not Started |

### Phase 5 — Test Case Module
| Task | Linked Story | Priority | Points | Assignee | Status |
|---|---|---|---|---|---|
| Build Test Case List page (table, filters, empty state) | US-07 | P0 | 5 | Hallmark AI — Frontend Engineer | Not Started |
| Build Create Test Case modal + step builder + validation | US-08 | P0 | 5 | Hallmark AI — Frontend Engineer | Not Started |

### Cross-Cutting
| Task | Linked Story | Priority | Points | Assignee | Status |
|---|---|---|---|---|---|
| Responsive QA pass (Mobile/Tablet/Desktop) across all pages | US-10 | P1 | 3 | Hallmark AI — QA/Frontend Engineer | Not Started |
| Accessibility QA pass (keyboard + WCAG 2.1 AA) across all pages | US-01–US-10 | P0 | 3 | Hallmark AI — QA/Frontend Engineer | Not Started |
| Update root `README.md` at each sprint milestone | — | P2 | 1 | Hallmark AI — Delivery Manager | Not Started |

## Priority Key
- **P0** — Must-have; sprint cannot be considered complete without it.
- **P1** — Should-have; strongly expected but sprint can close with a documented gap if needed.
- **P2** — Nice-to-have within this sprint.
- **P3** — Deferrable to a later sprint without discussion.

## Sprint Timeline

| Week | Phase | Focus |
|---|---|---|
| Week 1, Days 1–2 | Phase 1 | CSS foundation + all 12 shared components |
| Week 1, Days 3–4 | Phase 2 | Authentication pages (Login, Register, Forgot Password) |
| Week 1, Day 5 | Phase 3 | Dashboard |
| Week 2, Days 1–2 | Phase 4 | Project Management module |
| Week 2, Days 3–4 | Phase 5 | Test Case Management module |
| Week 2, Day 5 | Cross-Cutting | Responsive + accessibility QA pass, README update, Sprint Review, Sprint Retrospective |

Each file within a phase follows the Hallmark one-file-at-a-time workflow: generated, reviewed, and explicitly approved before the next file begins — the calendar above represents target phase completion, not a fixed per-file schedule.
