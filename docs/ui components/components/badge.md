# Component — Badge

## Purpose
Compact status indicator — the visible expression of the ledger status system (Pass/Fail/Warn/Running/Neutral) wherever a single entity's state needs to be scannable at a glance: table rows, cards, detail headers.

## Props (future-ready)
| Prop | Type | Description |
|---|---|---|
| `status` | enum `pass \| fail \| warn \| running \| neutral` | Drives color, icon, and default label text. |
| `label` | string | Override text (defaults to a standard label per status, e.g., "Passed," "Failed," "Not Run"). |
| `size` | enum `sm \| md` | Compact (table cells) vs. standard (card headers) sizing. |

## HTML Structure
- `<span class="badge">`
  - Status icon (`aria-hidden="true"`) — check-circle / x-circle / alert-triangle / spinner / minus-circle per `status`
  - Label text node

## CSS Responsibility
- Pill shape (`--radius-full`), `--space-1`/`--space-3` padding, `--fs-xs`, `--fw-medium`.
- Background = `--color-status-*-bg`, text/icon color = `--color-status-*` for the matching `status`.
- `running` status icon uses a subtle spin animation, respecting `prefers-reduced-motion` (falls back to a static icon).

## JavaScript Responsibility
- Purely presentational — maps `status` to the correct icon/color/default label. No internal state, no data fetching.
- If `label` is not provided, resolves the default text from a shared status-label map (kept in `frontend/constants/statusTypes.js`) so wording stays consistent everywhere the badge appears.

## Reusability
Used inside Table rows (status column), Cards (status-bearing dashboard/list cards), Alerts and Toasts (reused visually as the leading icon treatment), and any future Test Case/Execution detail view.

## Accessibility
- Icon + text always paired — status is never conveyed by color or icon shape alone, satisfying the system-wide "no color-only meaning" rule.
- Icon is `aria-hidden="true"` since the adjacent text already carries the meaning (avoids redundant announcement).
- Sufficient contrast between text/icon color and background verified per status (all five status/background pairs meet the 4.5:1 text contrast minimum).
