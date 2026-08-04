# Component — Sidebar

## Purpose
Primary navigation for the authenticated application. Persists across all pages, indicates the current active section via the ledger-bar accent, and collapses responsively.

## Props (future-ready)
| Prop | Type | Description |
|---|---|---|
| `navItems` | array `{ id, label, icon, route }` | Primary nav entries (Dashboard, Projects, Test Cases, Executions, Analytics). |
| `secondaryItems` | array | Secondary nav entries (Settings, Help). |
| `activeRoute` | string | Current route id, used to apply the active ledger-bar state. |
| `collapsed` | boolean | Whether the sidebar renders in icon-only rail mode. |
| `isMobileOpen` | boolean | Whether the mobile overlay drawer is visible. |
| `onNavigate` | function | Callback fired when a nav item is selected. |

## HTML Structure
- `<nav>` (landmark role: navigation, `aria-label="Primary"`)
  - `.sidebar__brand` — logo/wordmark (links to Dashboard)
  - `.sidebar__nav-primary` — `<ul>` of primary nav items, each an `<a>`/`<button>` with icon + label
  - `.sidebar__divider`
  - `.sidebar__nav-secondary` — `<ul>` of secondary nav items
  - `.sidebar__collapse-toggle` — collapse/expand control (desktop/tablet only)

## CSS Responsibility
- Fixed width per state (`--layout-sidebar-width` expanded / `--layout-sidebar-collapsed-width` collapsed), background `--color-ink-800`.
- Active item styling: `--color-ink-900` background + `--border-ledger-width` teal left bar.
- Mobile: transforms into a fixed-position overlay drawer (`--z-sidebar`), off-canvas by default, slides in when `isMobileOpen`.
- Handles its own internal scroll if nav item count exceeds viewport height; does not affect header/content scroll.

## JavaScript Responsibility
- Determines `activeRoute` highlighting by comparing `navItems[].route` to the current router path.
- Persists `collapsed` preference (frontend service/localStorage) across sessions.
- Handles open/close of the mobile drawer, including backdrop click and route-change auto-close.
- Does not perform navigation itself beyond dispatching route changes to the router — no business logic.

## Reusability
Single instance per authenticated layout, shared across all pages. Nav item data is externally supplied (not hardcoded), so the same component serves every role/permission level by filtering `navItems` upstream.

## Accessibility
- `<nav aria-label="Primary">` distinguishes it from any secondary/footer navigation.
- Active item marked with `aria-current="page"` in addition to visual styling.
- Collapsed (icon-only) state still exposes each item's label via `aria-label` or a tooltip-on-focus, never icon-only with no accessible name.
- Mobile drawer traps focus while open and returns focus to the triggering hamburger button on close.
- Fully keyboard-navigable via Tab/Arrow keys consistent with a standard nav list.
