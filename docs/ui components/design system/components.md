# VigCraft Testing Hub — Components & System Mechanics

## 1. Spacing System

4px base unit, scaled geometrically for predictable rhythm.

| Token | Value | Typical Use |
|---|---|---|
| `--space-1` | 4px | Icon-to-label gap, tight inline spacing |
| `--space-2` | 8px | Badge padding, compact row gaps |
| `--space-3` | 12px | Form field internal padding |
| `--space-4` | 16px | Standard component padding, card internal spacing |
| `--space-5` | 20px | Section internal spacing |
| `--space-6` | 24px | Card-to-card gaps, form group spacing |
| `--space-8` | 32px | Section-to-section spacing |
| `--space-10` | 40px | Page-level top padding |
| `--space-12` | 48px | Major section breaks |
| `--space-16` | 64px | Empty-state / error-page vertical centering offsets |

**Rule:** all margin/padding values reference these tokens. No arbitrary pixel values in component CSS.

## 2. Grid System

- **Base unit:** 12-column fluid grid within `--layout-content-max-width` (1440px), centered.
- **Gutter:** `--space-6` (24px) between columns at desktop; `--space-4` (16px) at tablet/mobile.
- **App shell grid:** `sidebar` (fixed `--layout-sidebar-width`) + `content` (fluid, min 0) as CSS Grid columns; `header` spans the content column at `--layout-header-height`.
- **Dashboard cards:** auto-fill grid, `minmax(240px, 1fr)`, so cards reflow naturally without fixed column-count breakpoints.
- **Tables:** never grid-based — use native `<table>` semantics for accessibility (see `accessibility.md`).

## 3. Responsive Breakpoints

See `responsive-guidelines.md` for full detail. Summary:

| Range | Sidebar Behavior | Grid |
|---|---|---|
| ≥ 1025px (Desktop) | Expanded, persistent | Full 12-column |
| 641–1024px (Tablet) | Collapsible to icon rail (`--layout-sidebar-collapsed-width`) | Condensed columns |
| ≤ 640px (Mobile) | Hidden by default, opens as overlay drawer | Single column stack |

## 4. Border Radius

| Token | Value | Use |
|---|---|---|
| `--radius-sm` | 4px | Inputs, badges, small buttons |
| `--radius-md` | 6px | Cards, dropdowns, modals |
| `--radius-lg` | 10px | Large panels, dashboard summary cards |
| `--radius-full` | 999px | Pills, avatars, status dots |

## 5. Shadows / Elevation

| Token | Use |
|---|---|
| `--shadow-sm` | Resting cards, table row hover |
| `--shadow-md` | Dropdowns, popovers |
| `--shadow-lg` | Modals, toasts |
| `--shadow-focus` | Focus ring on interactive elements (teal, 3px, see Accessibility) |

Elevation increases with interactive/temporal priority: static content < transient overlays < modals/toasts.

## 6. Icons

- Single SVG icon set (stroke-based, 1.5px stroke, 20×20 default viewBox), stored in `frontend/assets/icons/`.
- Status icons always pair with status color: check-circle (pass), x-circle (fail), alert-triangle (warn), loader/spinner (running), minus-circle (neutral/not run).
- Icons are decorative by default (`aria-hidden="true"`) unless they are the only content of an interactive element, in which case the element carries an `aria-label`.
- Icon-only buttons always have a minimum 40×40px hit target regardless of visual icon size.

## 7. Buttons

| Variant | Background | Text | Use |
|---|---|---|---|
| Primary | `--color-brand-teal-600`, hover `--color-brand-teal-500`, active `--color-brand-teal-700` | `--color-text-inverse` | One per view — the main action (e.g., "Create test case") |
| Secondary | Transparent, `1px` border `--color-paper-200` | `--color-text-primary` | Supporting actions ("Cancel," "Export") |
| Destructive | `--color-status-fail` | `--color-text-inverse` | Irreversible actions ("Delete project") — always paired with a confirmation modal |
| Ghost/Text | Transparent, no border | `--color-text-link` | Low-emphasis inline actions |

- Padding: `--space-3` vertical, `--space-5` horizontal. Radius: `--radius-sm`.
- Disabled state: 40% opacity, `cursor: not-allowed`, no hover transform.
- All buttons show `--shadow-focus` on keyboard focus.

## 8. Inputs

- Height: 40px. Padding: `--space-3`. Border: `1px solid --color-paper-200`, radius `--radius-sm`.
- Focus: border becomes `--color-brand-teal-600` + `--shadow-focus` ring.
- Label always above the field (never placeholder-as-label). Helper/error text below, `--fs-xs`.
- Error state: border `--color-status-fail`, helper text switches to fail color with a short instruction ("Enter a valid email address").
- Required fields marked with a text `*` plus `aria-required="true"` — never color alone.

## 9. Cards

- Background `--color-paper-0`, radius `--radius-md`, shadow `--shadow-sm`, padding `--space-6`.
- **Status-bearing cards** (test case, execution, project health) add the signature left ledger bar: `border-left: var(--border-ledger-width) solid var(--color-status-*)`.
- Hover (when clickable): shadow steps up to `--shadow-md`, no color change.

## 10. Tables

- Native `<table>` markup with `<thead>`/`<tbody>`/`<th scope="col">`.
- Header row: `--fs-xs`, `--fw-medium`, uppercase, `--ls-wide`, `--color-text-secondary`, bottom border `1px solid --color-paper-200`.
- Row height: 44px minimum (touch-friendly, dense but not cramped). Zebra striping avoided in favor of a bottom-border-only row divider for a cleaner ledger feel.
- Status column renders a `Badge` component, never raw text or color-only cells.
- Sticky header on scroll for long result/execution tables.

## 11. Badges

- Pill shape (`--radius-full`), `--space-1` vertical / `--space-3` horizontal padding, `--fs-xs`, `--fw-medium`.
- Status badges: background = status `-bg` token, text/icon = status base token (e.g., pass badge = `--color-status-pass-bg` background, `--color-status-pass` text + icon).
- Always icon + label together (e.g., ✓ "Passed"), never a bare color dot as the only signal.

## 12. Alerts

- Inline, non-blocking banners at the top of a page/section. Left ledger bar in the matching status color, `--color-status-*-bg` background, `--radius-md`.
- Structure: icon, short bold headline, optional supporting sentence, optional dismiss control.
- Used for page-level/system messages (e.g., "Your session will expire in 5 minutes") — not for form field errors, which live inline on the input.

## 13. Modals

- Centered, max-width 560px (small) / 720px (large), `--radius-md`, `--shadow-lg`, backdrop `rgba(11,13,18,0.5)`.
- Structure: header (title + close), body, footer (right-aligned actions, secondary then primary button order).
- Focus is trapped inside the modal while open; `Escape` closes it; focus returns to the triggering element on close.
- Destructive confirmation modals always restate the action and the item name in the body copy (e.g., "Delete test case TC-104?").

## 14. Toast Notifications

- Bottom-right stack, `--radius-md`, `--shadow-lg`, max-width 360px, auto-dismiss after 5s (paused on hover/focus).
- Status-colored left ledger bar matches the message type (success/pass, error/fail, warning/warn, info/running-blue reused as informational).
- Always includes a manual dismiss control; never the only place a critical error is communicated (destructive failures also surface inline).

## 15. Sidebar Design

- Fixed width `--layout-sidebar-width` (264px expanded) / `--layout-sidebar-collapsed-width` (72px collapsed, icon-only).
- Background `--color-ink-800`, active item background `--color-ink-900` with a `--border-ledger-width` teal left bar, inactive item text `--color-text-inverse-muted`.
- Sections: primary nav (Dashboard, Projects, Test Cases, Executions, Analytics), divider, secondary nav (Settings, Help).
- Collapse toggle persists user preference across sessions (frontend `localStorage`/service layer, not CSS-only).

## 16. Header Design

- Fixed height `--layout-header-height` (64px), background `--color-paper-0`, bottom border `1px solid --color-paper-200`, sticky (`--z-header`).
- Left: page title (`--font-display`, `--fs-lg`). Right: global search, notifications icon, user menu.
- On mobile, collapses to a hamburger trigger for the sidebar drawer + condensed title.

## 17. Dashboard Cards

- Auto-fill grid (see Grid System). Each card: label (`--fs-xs`, uppercase, `--color-text-secondary`), headline metric (`--fs-2xl`, `--font-display`, `--fw-bold`), optional trend indicator (small status-colored delta, e.g., "+4% this week" in pass-green).
- Status-summary cards (e.g., "Failing Tests: 12") always carry the matching ledger bar and are clickable through to the filtered list view.

## 18. Loading States

- **Skeleton screens** (not spinners) for content areas — gray placeholder blocks matching the final layout's shape (card outlines, table row bars), using `--color-paper-100` with a subtle shimmer animation.
- **Inline spinners** only for button-level actions (e.g., "Saving…" inside a submit button), using the `running` status blue.
- Skeletons respect `prefers-reduced-motion` (shimmer becomes a static pulse-free placeholder).

## 19. Empty States

- Centered within the content area: icon or small illustration, one-line headline naming what's missing, one supporting sentence, one primary action button.
- Voice is an invitation to act, e.g., headline "No test cases yet," action button "Create test case" — never just "No data."

## 20. Error Pages

- **404:** headline "Page not found," short explanation, link back to Dashboard.
- **403:** headline "You don't have access to this," explanation of what's needed (e.g., project role), contact/request-access action.
- **500 / system error:** headline "Something on our end broke," reassurance that the team/service has been notified where true, retry action.
- All error pages follow the same layout as empty states (icon, headline, sentence, action) for visual consistency, using `--color-status-fail` only for the icon accent, not the full background.

## Related Documents

- Full token values: `color-system.md`, `typography.md`
- Breakpoint behavior in depth: `responsive-guidelines.md`
- Contrast, focus, and semantic requirements: `accessibility.md`
