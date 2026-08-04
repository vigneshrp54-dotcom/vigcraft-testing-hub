# Component — Breadcrumb

## Purpose
Shows the user's location within a nested hierarchy (e.g., Projects → Project Name → Test Cases) so they can navigate upward without relying solely on the sidebar. Most valuable on detail/nested views introduced from Sprint 1's list pages.

## Props (future-ready)
| Prop | Type | Description |
|---|---|---|
| `items` | array `{ label, href }` | Ordered trail from root to current page; last item renders as plain text (current location, not a link). |
| `separatorIcon` | string (icon id) | Visual divider between items (defaults to a chevron). |

## HTML Structure
- `<nav aria-label="Breadcrumb">`
  - `<ol>`
    - `<li>` per `items` entry
      - `<a href="[href]">` for all but the last item
      - Plain text (with `aria-current="page"`) for the last item
      - Separator icon between `<li>` elements (`aria-hidden="true"`, not part of the list semantics)

## CSS Responsibility
- `--fs-sm`, `--color-text-secondary` for trail links, `--color-text-primary` + `--fw-medium` for the current (last) item.
- Horizontal layout with `--space-2` gaps around separators; truncates gracefully with ellipsis on narrow viewports rather than wrapping awkwardly.

## JavaScript Responsibility
- Purely presentational — `items` are supplied by the page based on current route/entity context (e.g., Project name resolved from loaded project data).
- No internal navigation logic beyond standard link behavior.

## Reusability
Reserved for nested/detail views reachable from Sprint 1 list pages (Project detail, Test Case detail) in upcoming sprints; not required on the six Sprint 1 list/auth pages themselves, which are only one level deep.

## Accessibility
- `<nav aria-label="Breadcrumb">` distinguishes this from primary/sidebar navigation for assistive tech users.
- Ordered list (`<ol>`) semantics convey hierarchy, not just visual order.
- Current page marked with `aria-current="page"` and is not a clickable link (avoids a no-op link to the current page).
- Truncated (ellipsized) labels retain the full text via a `title` attribute or accessible name, so meaning isn't lost to visual truncation alone.
