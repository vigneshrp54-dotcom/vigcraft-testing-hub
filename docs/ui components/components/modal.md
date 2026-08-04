# Component — Modal

## Purpose
Focused overlay surface for create/edit forms and confirmations (Create Project, Create Test Case, destructive-action confirmations) without leaving the current page context.

## Props (future-ready)
| Prop | Type | Description |
|---|---|---|
| `isOpen` | boolean | Controls mount/visibility. |
| `size` | enum `sm \| md \| lg` | Maps to 400px / 560px / 720px max-width. |
| `title` | string | Modal header text. |
| `onClose` | function | Fired on close icon, backdrop click, or `Escape`. |
| `closeOnBackdropClick` | boolean | Default `true`; set `false` for critical confirmations requiring explicit action. |
| `footerActions` | array `{ label, variant, onClick }` | Rendered as Button components, right-aligned, secondary before primary. |
| `initialFocusRef` | ref | Element to focus when the modal opens (defaults to first focusable field). |

## HTML Structure
- Backdrop `<div>` (click target for dismiss, when enabled)
  - `<div role="dialog" aria-modal="true" aria-labelledby="[modal-title-id]">`
    - `.modal__header` — title (`<h2 id="[modal-title-id]">`) + close icon button
    - `.modal__body` — arbitrary form/content slot
    - `.modal__footer` — `footerActions` rendered as Buttons

## CSS Responsibility
- Centered positioning, `--radius-md`, `--shadow-lg`, backdrop `rgba(11,13,18,0.5)`, `--z-modal` / `--z-modal-backdrop`.
- Size-driven `max-width` per the `size` prop.
- Mobile breakpoint: expands to full-screen (no rounded corners, no backdrop gap) rather than a small centered box.
- Entrance/exit transition respects `prefers-reduced-motion`.

## JavaScript Responsibility
- Mounts/unmounts based on `isOpen`; traps focus within the dialog while open (cycles Tab within modal content).
- Binds `Escape` to `onClose`.
- Returns focus to the element that triggered the modal when it closes.
- Locks background scroll while open.
- Does not contain business/validation logic itself — form content inside `.modal__body` (e.g., Create Project form) owns its own validation, consistent with `input.md`.

## Reusability
Used for Create Project, Create Test Case (large size, step-builder content), and any destructive-action confirmation (Delete Project, Delete Test Case) with `closeOnBackdropClick: false` for the latter.

## Accessibility
- `role="dialog"` + `aria-modal="true"` + `aria-labelledby` pointing to the visible title — never an unlabeled dialog.
- Full focus trap: Tab/Shift+Tab cycle only within the modal while open; background content is inert (`aria-hidden="true"` or `inert` attribute applied to the rest of the app while modal is open).
- Initial focus lands on the first meaningful control (or `initialFocusRef` if specified), not the close icon by default, unless the modal is a pure confirmation.
- Close icon button always has `aria-label="Close"`.
