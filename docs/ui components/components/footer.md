# Component — Footer

## Purpose
Lightweight application footer for authenticated screens — legal/version info and secondary links. Deliberately minimal so it never competes with the primary content or navigation.

## Props (future-ready)
| Prop | Type | Description |
|---|---|---|
| `appVersion` | string | Build/version string displayed (e.g., "v1.0.0"). |
| `links` | array `{ label, href }` | Secondary links (Privacy, Terms, Support). |
| `showFooter` | boolean | Some dense data screens (e.g., full-height tables) may suppress the footer; default `true`. |

## HTML Structure
- `<footer>` (landmark role: contentinfo)
  - `.footer__left` — copyright text + `appVersion`
  - `.footer__right` — `<ul>` of secondary links

## CSS Responsibility
- Fixed height (`--layout-footer-height`), background `--color-paper-0` or transparent depending on context, top border `1px solid --color-paper-200`.
- `--fs-xs` text size, `--color-text-tertiary` color — intentionally low visual weight.
- Does not scroll independently; sits at the natural end of page content (not fixed/sticky).

## JavaScript Responsibility
- Minimal: renders static `links`/`appVersion` data passed in from app config.
- No interactive state beyond standard link navigation.

## Reusability
Single instance per authenticated layout. Content (`links`, `appVersion`) is data-driven, so the same component works unchanged across all pages.

## Accessibility
- `<footer>` uses the `contentinfo` landmark implicitly.
- Links have clear, descriptive text (not "Click here").
- Sufficient contrast maintained for `--color-text-tertiary` against its background despite the intentionally low visual weight (verified against the 4.5:1 minimum, not merely "quiet-looking").
