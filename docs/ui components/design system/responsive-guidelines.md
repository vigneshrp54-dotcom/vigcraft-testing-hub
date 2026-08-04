# VigCraft Testing Hub — Responsive Guidelines

## Breakpoints

| Name | Range | Notes |
|---|---|---|
| Mobile | ≤ 640px | Single-column stack, sidebar becomes an overlay drawer |
| Tablet | 641px – 1024px | Sidebar collapses to icon rail by default; content reflows to 2-column where applicable |
| Desktop | ≥ 1025px | Full expanded sidebar, full 12-column content grid |

CSS custom properties are not usable inside `@media` conditions, so these values are hardcoded directly in media queries at each stylesheet (documented here as the single source of truth so they stay consistent).

## Layout Behavior by Breakpoint

### Desktop (≥ 1025px)
- Sidebar: expanded (`--layout-sidebar-width`, 264px), persistent, non-overlay.
- Header: full search bar visible, all header actions visible inline.
- Dashboard: auto-fill card grid, typically 3–4 cards per row depending on viewport width.
- Tables: all columns visible; no horizontal scroll under normal use.

### Tablet (641px – 1024px)
- Sidebar: collapsed to icon rail (`--layout-sidebar-collapsed-width`, 72px) by default; expandable on demand, overlays content when expanded rather than pushing it.
- Header: search collapses to an icon that expands on tap; secondary header actions move into an overflow menu.
- Dashboard: cards reflow to 2 per row.
- Tables: lower-priority columns (e.g., "Last modified by") hide first; a horizontal scroll is acceptable as a fallback for data-dense tables rather than losing data silently.

### Mobile (≤ 640px)
- Sidebar: hidden by default, opens as a full-height overlay drawer triggered from the header hamburger icon; closes on route change or backdrop tap.
- Header: title + hamburger + single primary action only; search and secondary actions move to a dedicated view or overflow menu.
- Dashboard: single-column card stack.
- Tables: collapse to a stacked "card per row" pattern — each row's column/value pairs render as labeled lines within a card, using the same ledger-bar status accent as the desktop row.
- Modals: expand to full-screen on mobile rather than centered overlays, to preserve usable tap targets.
- Minimum tap target: 44×44px for all interactive elements, per mobile accessibility guidance.

## Grid Reflow Principles

- Never truncate or hide status information at smaller breakpoints — status badges/ledger bars persist at every size even when secondary text is hidden.
- Content reflow is column-count driven (auto-fill/auto-fit grids), not fixed breakpoint-specific column counts, so intermediate viewport widths still look intentional.
- Forms remain single-column at all breakpoints below desktop; multi-column forms only appear ≥ 1025px.

## Testing Requirements

- All Sprint 1 views must be verified at three representative widths: 375px (mobile), 768px (tablet), 1440px (desktop) — matching the max content width token.
- Playwright E2E specs include at least one mobile-viewport pass per critical flow (login, create project, create test case).
