# VigCraft Testing Hub — Design System

Documentation-only reference for the visual and interaction language of the VigCraft Testing Hub frontend. No implementation code lives here — see `frontend/css/` and `frontend/components/` for the built system.

## Direction

**"Diagnostic Ledger"** — an enterprise QA/test-management UI (in the spirit of Jira, Azure DevOps, GitHub, and TestRail) built around one idea: test status (pass/fail/warn/running) is the product's core vocabulary, so it's made visible everywhere through a consistent colored "ledger bar" device, monospace headings for a technical feel, and a single restrained brand accent (Signal Teal).

## Contents

| File | Covers |
|---|---|
| [`design-principles.md`](./design-principles.md) | Positioning, core design principles, product voice |
| [`color-system.md`](./color-system.md) | Full color palette, status ("ledger") system, contrast rules, theme structure |
| [`typography.md`](./typography.md) | Typefaces, type scale, weights, line height, usage rules |
| [`components.md`](./components.md) | Spacing, grid, radius, shadows, icons, and every component: buttons, inputs, cards, tables, badges, alerts, modals, toasts, sidebar, header, dashboard cards, loading/empty/error states |
| [`responsive-guidelines.md`](./responsive-guidelines.md) | Breakpoints and layout behavior per breakpoint |
| [`accessibility.md`](./accessibility.md) | WCAG 2.1 AA standards: contrast, focus, semantics, motion, testing requirements |

## Source of Truth for Tokens

All design tokens documented here are implemented as CSS custom properties in `frontend/css/base/variables.css`. If a value in code and a value in these docs ever disagree, `variables.css` is authoritative and this documentation should be updated to match.

## Status

Design System documentation: **complete** for Sprint 1 scope.
Next: continue Sprint 1 Hallmark file-by-file build (Phase 1 — Layout & Common Components), starting from `base/typography.css`.
