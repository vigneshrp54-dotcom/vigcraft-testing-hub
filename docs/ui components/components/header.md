# Component — Header

## Purpose
Global top bar present on every authenticated screen. Shows the current page's title/context, provides global search, and surfaces account-level actions (notifications, user menu). Never contains page-specific business logic.

## Props (future-ready)
| Prop | Type | Description |
|---|---|---|
| `pageTitle` | string | Text shown in the title slot; set per-page on route change. |
| `showSearch` | boolean | Whether the global search field renders (default `true`). |
| `notificationCount` | number | Badge count shown on the notifications icon; `0` hides the badge. |
| `user` | object `{ name, avatarUrl, role }` | Populates the user menu trigger. |
| `onMobileMenuToggle` | function | Callback fired when the mobile hamburger is tapped (opens the Sidebar drawer). |

## HTML Structure
- `<header>` (landmark role: banner)
  - `.header__left`
    - Mobile menu button (hidden ≥1025px)
    - Page title (`<h1>`)
  - `.header__center`
    - Global search field
  - `.header__right`
    - Notifications icon button (with badge)
    - User menu trigger (avatar + name, expands a menu)

## CSS Responsibility
- Fixed height (`--layout-header-height`), sticky positioning (`--z-header`), bottom border, background `--color-paper-0`.
- Responsive collapse: search field shrinks to icon-only below tablet width; mobile menu button visibility toggled by breakpoint, not JS.
- Does not own sidebar or content-canvas styling — strictly the header's own box.

## JavaScript Responsibility
- Reads current route/page title from the frontend router/state and updates `pageTitle`.
- Wires search input to the relevant service layer (debounced query dispatch).
- Toggles notification dropdown and user menu open/closed state; closes on outside click or `Escape`.
- Emits the mobile menu toggle event consumed by the Sidebar component — Header does not control Sidebar's DOM directly.

## Reusability
Rendered once per authenticated layout (via `layouts/`); not reused multiple times per page. Configuration (title, search visibility) varies per page through props, not through separate header variants.

## Accessibility
- `<header>` uses the `banner` landmark implicitly.
- Search input has an associated (visually hidden if needed) `<label>`.
- Notification and user-menu triggers are `<button>` elements with `aria-haspopup="true"` and `aria-expanded` reflecting open state.
- Notification badge count is exposed via `aria-label` (e.g., "Notifications, 3 unread"), not conveyed by color/number alone.
- Full keyboard operability: Tab reaches all controls in visual order; `Escape` closes any open menu.
