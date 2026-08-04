# Component — Card

## Purpose
General-purpose content container — used for dashboard statistics, list-item summaries, form wrappers, and any grouped content block. Carries the system's signature status "ledger bar" when representing a status-bearing entity.

## Props (future-ready)
| Prop | Type | Description |
|---|---|---|
| `status` | enum `pass \| fail \| warn \| running \| neutral \| none` | Controls the ledger-bar accent color; `none` renders no bar. |
| `clickable` | boolean | Whether the card is an interactive navigation target (adds hover elevation + role). |
| `href` / `onClick` | string / function | Navigation target or click handler when `clickable` is true. |
| `padding` | enum `sm \| md \| lg` | Internal padding scale, defaults to `md` (`--space-6`). |
| `title` | string | Optional card title slot. |
| `children` | slot | Arbitrary card body content. |

## HTML Structure
- `<div class="card">` or `<a class="card">` when `clickable` (so it's a real link, not a `<div>` with a click handler)
  - `.card__ledger-bar` (rendered via `border-left`, not a separate DOM element, when `status !== 'none'`)
  - `.card__header` — optional title/icon row
  - `.card__body` — main content slot

## CSS Responsibility
- Background `--color-paper-0`, `--radius-md`, `--shadow-sm` at rest.
- `status`-driven left border using `--border-ledger-width` and the matching `--color-status-*` token.
- `clickable` state: `--shadow-md` on hover, `--shadow-focus` on keyboard focus, cursor pointer.
- Padding scale driven entirely by spacing tokens.

## JavaScript Responsibility
- If `clickable`, wires navigation (route push) or `onClick`.
- No internal state — Card is a presentational container; any data-loading concerns belong to the parent (e.g., Dashboard statistics logic lives in the page/service layer, not in Card itself).

## Reusability
Used across Dashboard (statistics cards, Recent Activity items, Quick Links), Projects (if a card-based grid view is used, and mandatory in the Mobile stacked-table pattern), Test Cases (mobile stacked rows), and generic content grouping in forms/modals.

## Accessibility
- Clickable cards use a real `<a>`/`<button>` semantic wrapper, never a `<div onclick>`, so they're keyboard-reachable and screen-reader-announced as interactive.
- Status is never conveyed by the ledger bar color alone — status-bearing cards always include a text/icon Badge within the body (see `badge.md`) so the meaning survives without color perception.
- Card titles use appropriate heading levels contextually (e.g., `<h3>` within a Dashboard section already headed by an `<h2>`), not a fixed heading level baked into the component.
