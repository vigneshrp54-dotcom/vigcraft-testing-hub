# VigCraft Testing Hub — Accessibility Standards (WCAG)

**Target conformance level:** WCAG 2.1 AA across all Sprint 1 views.

## Color & Contrast

- Body text minimum contrast ratio: **4.5:1** against its background (`--color-text-primary`/`--color-text-secondary` on `--color-paper-0`/`--color-paper-50` both verified to meet this).
- Large text (≥ 18px/`--fs-md` and above at `--fw-semibold`+) minimum: **3:1**.
- UI component boundaries (input borders, button outlines): minimum **3:1** against adjacent surfaces.
- **Status is never communicated by color alone.** Every pass/fail/warn/running/neutral state pairs color with an icon shape and a text label (see `components.md` → Badges). This also covers colorblind users who cannot distinguish pass-green from fail-red.

## Focus Management

- Every interactive element (links, buttons, inputs, custom components) has a visible focus indicator using `--shadow-focus` (3px teal ring) — never `outline: none` without a replacement.
- Focus order follows visual/DOM reading order; no positive `tabindex` values.
- Modals trap focus while open and return focus to the triggering element on close (see `components.md` → Modals).
- Skip-to-content link provided at the top of every page for keyboard users to bypass the sidebar/header.

## Semantic Structure

- One `<h1>` per page; heading levels never skip (e.g., no `<h2>` directly to `<h4>`).
- Landmark regions used correctly: `<header>`, `<nav>` (sidebar), `<main>` (content canvas), `<footer>`.
- Tables use real `<table>` markup with `<th scope="col">`/`<th scope="row">` where applicable — never `<div>` grids styled to look like tables.
- Forms: every input has a programmatically associated `<label>` (never placeholder-only labeling). Required fields use `aria-required="true"` in addition to visual marking.

## Interactive Components

- Icon-only buttons include an `aria-label` describing the action (e.g., `aria-label="Delete test case"`), not just a visual icon.
- Toasts use `role="status"` (non-critical) or `role="alert"` (errors) so screen readers announce them without requiring focus.
- Loading skeletons use `aria-busy="true"` on their container while content loads.
- Custom dropdowns/menus follow WAI-ARIA authoring practices for `listbox`/`menu` patterns, including arrow-key navigation and `Escape` to close.

## Motion

- All animated transitions (skeleton shimmer, modal/toast entrance, sidebar collapse) respect `prefers-reduced-motion: reduce`, falling back to instant state changes (implemented globally in `base/reset.css`).

## Text & Readability

- Minimum body text size: 13px (`--fs-sm`); no functional text smaller than this.
- Line length for long-form content (docs, help text) capped around 75 characters for readability.
- `--lh-normal` (1.5) minimum line height for body copy, `--lh-relaxed` (1.7) for long-form documentation.

## Testing & Verification

- Automated: axe-core (or equivalent) integrated into the Playwright suite, run against every Sprint 1 page.
- Manual: full keyboard-only pass (no mouse) required for each critical flow (login, create project, create test case) before sprint sign-off.
- Manual: screen reader spot-check (NVDA or VoiceOver) on the dashboard, one list view, and one form view per sprint.
