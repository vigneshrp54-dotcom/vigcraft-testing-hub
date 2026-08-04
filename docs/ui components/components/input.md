# Component — Input

## Purpose
Standardized text-entry field (and by extension textarea/select variants) used across every form in the product — Login, Register, Forgot Password, Create Project, Create Test Case. Owns its own label, helper text, and error state presentation.

## Props (future-ready)
| Prop | Type | Description |
|---|---|---|
| `type` | enum `text \| email \| password \| textarea \| select` | Field variant. |
| `label` | string | Visible label text (always rendered, never placeholder-only). |
| `name` / `id` | string | Form field identity, links `<label for>` to the control. |
| `value` / `onChange` | string / function | Controlled value and change handler. |
| `placeholder` | string | Optional, supplementary to (never a replacement for) `label`. |
| `helperText` | string | Guidance shown below the field in the default state (e.g., password rules). |
| `errorText` | string | Replaces `helperText` styling/content when validation fails. |
| `required` | boolean | Marks the field required visually and via `aria-required`. |
| `disabled` | boolean | Disables the control. |
| `options` | array `{ label, value }` | Used only when `type="select"`. |
| `maxLength` | number | Enforced limit, paired with an optional visible character counter near the limit. |

## HTML Structure
- `.field` wrapper
  - `<label for="[id]">` — label text (+ `*` marker when `required`)
  - `<input>` / `<textarea>` / `<select>` matching `type`, with `id`, `name`, `aria-describedby` pointing to helper/error text id
  - `.field__helper` — helper or error text (mutually exclusive), `id` matching `aria-describedby`

## CSS Responsibility
- Default state: `1px solid --color-paper-200` border, `--radius-sm`, `--space-3` padding, 40px height (single-line variants).
- Focus state: border `--color-brand-teal-600` + `--shadow-focus`.
- Error state: border `--color-status-fail`, helper text switches to `--color-status-fail`.
- Disabled state: reduced opacity, `--color-paper-100` background.
- Textarea variant allows vertical resize only; select variant uses a consistent custom chevron indicator without a full custom-dropdown rebuild (native `<select>` retained for accessibility).

## JavaScript Responsibility
- Controlled component: value and validation state are owned by the parent form, not internally — Input renders whatever `errorText`/`helperText` it's given.
- Character counter (when `maxLength` is set) updates live as the user types, visible once within ~20% of the limit.
- Password variant includes a show/hide toggle button that only changes the `type` attribute between `password`/`text`, never storing/logging the value differently.

## Reusability
The single form-field primitive for the entire product: Login/Register/Forgot Password fields, Create Project (name/description/visibility), Create Test Case (title/priority/preconditions/steps), and any future settings forms.

## Accessibility
- Real `<label for>` association — never a placeholder standing in for a label.
- `aria-required="true"` on required fields in addition to the visual `*`.
- `aria-invalid="true"` and `aria-describedby` pointing to `errorText` when in an error state, so screen readers announce the specific problem.
- Error text is written as an instruction ("Enter a valid email address"), not just a state label ("Invalid"), consistent with the product's error-writing principle.
- Sufficient touch target height (40px minimum, 44px on mobile per `responsive-guidelines.md`).
