# Component — Button

## Purpose
The single interactive-action primitive used everywhere in the product (forms, tables, toolbars, modals). Standardizes visual weight and behavior so users always know which action is primary.

## Props (future-ready)
| Prop | Type | Description |
|---|---|---|
| `variant` | enum `primary \| secondary \| destructive \| ghost` | Visual style (see `design-system/components.md` → Buttons). |
| `size` | enum `sm \| md \| lg` | Height/padding scale. |
| `label` | string | Visible button text. |
| `iconLeft` / `iconRight` | string (icon id) | Optional icon slot. |
| `disabled` | boolean | Disables interaction and applies disabled styling. |
| `loading` | boolean | Shows inline spinner in place of/alongside label, disables interaction. |
| `type` | enum `button \| submit \| reset` | Native HTML button type. |
| `onClick` | function | Click handler. |
| `ariaLabel` | string | Required when the button is icon-only. |

## HTML Structure
- `<button type="...">`
  - Optional left icon (`aria-hidden="true"`)
  - Label text node (or visually-hidden text if icon-only, paired with `aria-label`)
  - Optional right icon (`aria-hidden="true"`)
  - Optional loading spinner element (visible only when `loading` is true)

## CSS Responsibility
- Variant-driven background/text/border color using the color tokens (never hardcoded hex in the component itself).
- Size-driven padding/height/font-size using the spacing and type scale tokens.
- States: default, hover, active/pressed, focus (`--shadow-focus`), disabled (reduced opacity), loading (spinner visible, label dimmed).
- `--radius-sm` corner radius, consistent across all variants.

## JavaScript Responsibility
- Forwards click events to `onClick` unless `disabled` or `loading` is true.
- Manages no internal state of its own beyond transient `:active` press feedback — `loading`/`disabled` are controlled externally by the parent form/action.
- Icon-only usage enforces (at minimum, via lint/dev-time warning) that `ariaLabel` is supplied.

## Reusability
The most reused component in the system — appears in Login/Register/Forgot Password (submit), Dashboard (quick links), Projects and Test Cases (create actions, table row actions), Modals (footer actions), Toasts (dismiss). One implementation, driven entirely by props/variants.

## Accessibility
- Native `<button>` element used (never a styled `<div>`), so keyboard activation (Enter/Space) and focus behavior come for free.
- Visible focus ring via `--shadow-focus` on all variants, including ghost/text buttons.
- `disabled` state removes the element from the tab order via the native `disabled` attribute (not just visual dimming).
- `loading` state sets `aria-busy="true"` and keeps the accessible name stable (doesn't replace label text with only a spinner with no text alternative).
