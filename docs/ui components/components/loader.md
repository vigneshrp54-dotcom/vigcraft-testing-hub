# Component — Loader

## Purpose
Communicates in-progress states across the app. Two forms: skeleton placeholders for content areas (tables, cards, dashboard stats) and inline spinners for button-level actions — per `design-system/components.md` → Loading States.

## Props (future-ready)
| Prop | Type | Description |
|---|---|---|
| `variant` | enum `skeleton \| spinner` | Which loading treatment to render. |
| `shape` | enum `text \| card \| table-row \| stat` | For `skeleton` variant — which content shape to mimic. |
| `count` | number | Number of skeleton placeholders to repeat (e.g., 5 skeleton table rows). |
| `size` | enum `sm \| md \| lg` | For `spinner` variant — matches the Button size it's embedded in. |
| `label` | string | Accessible description of what's loading (e.g., "Loading test cases"). |

## HTML Structure
- Skeleton variant: `<div class="skeleton skeleton--[shape]" aria-hidden="true">` repeated `count` times, wrapped in a container carrying `aria-busy="true"` and a visually-hidden live region announcing `label`.
- Spinner variant: inline `<span class="spinner" role="status">` with a visually-hidden text node containing `label` (e.g., "Saving…").

## CSS Responsibility
- Skeleton: `--color-paper-100` base with a shimmer gradient animation sweeping left-to-right; shape-specific dimensions matching the real content it stands in for (card outline, table row bar, stat block).
- Spinner: small rotating ring using `--color-status-running` (blue), sized to sit inline within a Button without shifting layout.
- Both respect `prefers-reduced-motion`: shimmer becomes a static muted block, spinner rotation becomes a simplified pulse or static icon.

## JavaScript Responsibility
- Purely presentational — rendered by the parent component/page while its data-fetch is in flight, removed once data resolves.
- No internal timers or fetch logic — Loader never decides when loading starts/stops.

## Reusability
Skeleton used in Table (loading rows), Card/Dashboard statistics (loading stat blocks), Dashboard Recent Activity (loading list items). Spinner used inside Button (`loading` prop, see `button.md`) for form submissions (Login, Register, Create Project, Create Test Case).

## Accessibility
- Loading containers carry `aria-busy="true"` so assistive tech knows content is in flux.
- A visually-hidden live-region text (`label`) announces what's loading once, avoiding repeated/noisy announcements from decorative shimmer elements (which are `aria-hidden="true"`).
- Spinner's `role="status"` ensures screen readers announce the loading state without requiring focus to move.
