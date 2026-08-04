# Component — Table

## Purpose
Standardized data-table for all list views (Projects, Test Cases, and future Executions/Analytics grids). Handles column rendering, status display, and responsive collapse to the mobile stacked-card pattern.

## Props (future-ready)
| Prop | Type | Description |
|---|---|---|
| `columns` | array `{ key, label, priority, align }` | Column definitions; `priority` controls which columns hide first under width pressure. |
| `rows` | array of objects | Row data, keyed to match `columns[].key`. |
| `statusKey` | string | Which row field maps to the ledger status column (renders a Badge). |
| `loading` | boolean | Shows skeleton rows in place of `rows`. |
| `emptyState` | object `{ title, message, actionLabel, onAction }` | Content shown when `rows` is empty and not loading. |
| `onRowClick` | function | Optional row-level navigation handler. |
| `sortKey` / `sortDirection` / `onSortChange` | string / enum / function | Column sorting state, controlled externally. |

## HTML Structure
- `<table>`
  - `<thead>` — `<tr>` of `<th scope="col">` per `columns` entry
  - `<tbody>` — one `<tr>` per row
    - Status column renders a `Badge` component (see `badge.md`), not raw text
    - Row wrapped as clickable (`role="link"`-equivalent via a real anchor where the design allows, or a clearly indicated interactive row) when `onRowClick` is provided
  - Mobile breakpoint: component internally swaps to a stacked-card rendering (list of `Card` components) rather than forcing a scrollable table on small screens

## CSS Responsibility
- Header row: `--fs-xs`, uppercase, `--ls-wide`, `--color-text-secondary`, bottom border.
- Row height minimum 44px, bottom-border-only dividers (no zebra striping), hover state background shift for clickable rows.
- Sticky header on vertical scroll for long tables.
- Column hide/show rules driven by `columns[].priority` at tablet breakpoint; full stacked-card swap at mobile breakpoint (see `responsive-guidelines.md`).

## JavaScript Responsibility
- Renders skeleton placeholder rows while `loading` is true (`aria-busy="true"` on the table container).
- Renders the `emptyState` block in place of `<tbody>` content when `rows.length === 0` and not loading.
- Delegates row click to `onRowClick`; delegates header click to `onSortChange`, toggling `sortDirection`.
- Does not fetch data itself — table is presentational; the page/service layer supplies `rows`.

## Reusability
Used by Projects List and Test Cases List directly; designed to extend to Executions and Analytics grids in later sprints without structural changes — only `columns`/`statusKey` configuration differs per use.

## Accessibility
- Real `<table>` markup with `<th scope="col">` — never a `<div>` grid styled as a table.
- Sortable column headers use a `<button>` inside the `<th>` with `aria-sort` reflecting current state (`ascending`/`descending`/`none`).
- Status Badge in each row always carries icon + text label, not color-only.
- Loading state announces via `aria-busy`; empty state is a real, readable message block (not just a blank table body) so screen reader users aren't left in ambiguous silence.
- Row-level navigation uses real anchor semantics where the row leads to a single destination, preserving native "open in new tab" behavior for keyboard/mouse users.
