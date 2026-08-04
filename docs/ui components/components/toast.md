# Component — Toast

## Purpose
Transient, non-blocking confirmation of an action's outcome (e.g., "Project created," "Test case deleted") that doesn't interrupt the user's flow the way a Modal would.

## Props (future-ready)
| Prop | Type | Description |
|---|---|---|
| `status` | enum `pass \| fail \| warn \| running` | Reused from the ledger system — maps success/error/warning/info toast styling. |
| `message` | string | Toast body text. |
| `duration` | number | Auto-dismiss time in ms (default 5000; paused on hover/focus). |
| `dismissible` | boolean | Whether a manual close control renders (default `true`). |
| `actionLabel` / `onAction` | string / function | Optional inline action (e.g., "Undo"). |

## HTML Structure
- Toast stack container: `<div aria-live="polite">` (or `assertive` for `fail` status), fixed bottom-right position
  - `<div class="toast toast--[status]">`
    - Status icon (`aria-hidden="true"`)
    - `.toast__message` — `message` text
    - Optional `.toast__action` — Button (ghost variant) for `actionLabel`
    - Close icon button (when `dismissible`)

## CSS Responsibility
- `--radius-md`, `--shadow-lg`, max-width 360px, `status`-driven left ledger bar matching the color system.
- Stack layout: newest toast appears at the bottom (or top, per stacking convention) of the stack with `--space-2` gaps; enter/exit transitions respect `prefers-reduced-motion`.

## JavaScript Responsibility
- Managed by a shared toast service (queue) that any page/service-layer call can push into (e.g., `services/projectService.js` triggers a toast after a successful create) — Toast itself only renders what it's given.
- Handles its own auto-dismiss timer, pausing while hovered/focused, and clears the timer on manual dismiss.
- Multiple toasts stack without overlapping; the queue caps a reasonable max visible count (older ones dismiss early if the queue is flooded).

## Reusability
Triggered from Projects (create success), Test Cases (create success), and any future destructive-action confirmations (delete success) or error notifications not tied to a specific form field.

## Accessibility
- Toast container uses `aria-live="polite"` for standard confirmations and `aria-live="assertive"` for `fail`-status toasts, so screen readers announce them without requiring focus.
- Never the sole channel for a critical error that blocks a user's task — form-level failures also surface inline on the relevant field/modal (see `input.md`, `modal.md`); Toast is a supplement, not the only signal.
- Close button always has `aria-label="Dismiss notification"`.
- Auto-dismiss duration is generous enough (5s default, pauses on hover/focus) to be read by users who need more time.
