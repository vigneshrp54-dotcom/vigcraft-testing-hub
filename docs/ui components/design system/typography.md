# VigCraft Testing Hub — Typography

## Typefaces

| Role | Token | Stack | Rationale |
|---|---|---|---|
| Display / Headings | `--font-display` | `"IBM Plex Mono", "SFMono-Regular", "Consolas", "Liberation Mono", monospace` | Evokes test IDs, log output, and assertions — reinforces the technical nature of the product. Used with restraint: headings only, never body paragraphs. |
| Body | `--font-body` | `"Inter", -apple-system, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif` | Humanist sans, high legibility at small sizes for dense tables and forms. |
| Data / Mono values | `--font-mono-data` | Same stack as display | Applied inline to test-case IDs, run counts, timestamps, durations — anywhere a number or identifier benefits from tabular alignment. |

## Type Scale

| Token | Size | Typical Use |
|---|---|---|
| `--fs-xs` | 12px | Captions, meta text, table footnotes |
| `--fs-sm` | 13px | Secondary UI text, table body, form helper text |
| `--fs-base` | 15px | Default body copy |
| `--fs-md` | 17px | Card titles, emphasized body |
| `--fs-lg` | 22px | Section headings |
| `--fs-xl` | 28px | Page titles |
| `--fs-2xl` | 36px | Dashboard headline numbers (e.g., "Pass rate: 94%") |

## Weights

| Token | Value | Use |
|---|---|---|
| `--fw-regular` | 400 | Body copy |
| `--fw-medium` | 500 | UI labels, table headers |
| `--fw-semibold` | 600 | Card titles, section headings |
| `--fw-bold` | 700 | Page titles, key metrics |

## Line Height & Letter Spacing

| Token | Value | Use |
|---|---|---|
| `--lh-tight` | 1.25 | Headings |
| `--lh-normal` | 1.5 | Body copy, UI text |
| `--lh-relaxed` | 1.7 | Long-form documentation content |
| `--ls-tight` | -0.01em | Large display numbers |
| `--ls-wide` | 0.04em | Uppercase eyebrows/labels (e.g., section labels, table column headers) |

## Usage Guidelines

- **Headings always use `--font-display`.** This includes page titles, section headings, and card titles — but not body paragraphs or form labels.
- **Uppercase is reserved for labels**, not sentences: table column headers and small eyebrow labels may use `text-transform: uppercase` with `--ls-wide`; never apply uppercase to full sentences or buttons with more than two words.
- **Numbers that represent identity or measurement (IDs, counts, timestamps, durations) use `--font-mono-data`**, even inline within a sans-serif sentence, so figures align predictably in tables.
- **Never fake a heading with bold body text.** Use the type scale tokens so heading semantics stay consistent with visual weight.
- Minimum body text size across the product is `--fs-sm` (13px); nothing smaller is used for reading content (WCAG readability floor).
