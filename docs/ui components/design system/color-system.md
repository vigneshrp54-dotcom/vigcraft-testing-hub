# VigCraft Testing Hub — Color System

All values below are implemented as CSS custom properties in `frontend/css/base/variables.css`. This document is the reference for what each token means and when to use it.

## Core Surfaces

| Token | Hex | Usage |
|---|---|---|
| `--color-ink-900` | `#0B0D12` | Deepest chrome — active nav item background |
| `--color-ink-800` | `#12151C` | Sidebar / header surface |
| `--color-ink-700` | `#1B1F2A` | Raised chrome surface (hover states, dark panels) |
| `--color-ink-600` | `#2A2F3D` | Borders/dividers on dark chrome |
| `--color-paper-0` | `#FFFFFF` | Cards, modals, elevated content |
| `--color-paper-50` | `#F7F8FA` | App content canvas background |
| `--color-paper-100` | `#EEF0F3` | Subtle section backgrounds |
| `--color-paper-200` | `#E2E5EA` | Light borders / dividers |

## Text

| Token | Hex | Usage |
|---|---|---|
| `--color-text-primary` | `#1A1D26` | Body copy on light surfaces |
| `--color-text-secondary` | `#565C6D` | Secondary/muted copy |
| `--color-text-tertiary` | `#8A90A0` | Captions, placeholders, timestamps |
| `--color-text-inverse` | `#F4F5F7` | Text on dark chrome |
| `--color-text-inverse-muted` | `#9BA1B0` | Muted text on dark chrome |
| `--color-text-link` | `#0E7C86` | Inline links |

## Brand / Signal

| Token | Hex | Usage |
|---|---|---|
| `--color-brand-teal-700` | `#0A5D66` | Pressed/active state of primary actions |
| `--color-brand-teal-600` | `#0E7C86` | Primary brand color — primary buttons, active nav, links |
| `--color-brand-teal-500` | `#14939F` | Hover state of primary actions |
| `--color-brand-teal-100` | `#DCF1F2` | Tinted background for brand accents/badges |

**Rule:** Teal is reserved for interactive/primary meaning. It never appears as pure decoration.

## Status ("Ledger") System

The signature system of the product. Every status-bearing entity (test case result, execution run, project health, build status) uses this four-state palette consistently.

| Status | Token | Hex | Background Token | Hex |
|---|---|---|---|---|
| Pass | `--color-status-pass` | `#1E8E5A` | `--color-status-pass-bg` | `#E4F5EC` |
| Fail | `--color-status-fail` | `#D64545` | `--color-status-fail-bg` | `#FCEAEA` |
| Warn | `--color-status-warn` | `#C98A1F` | `--color-status-warn-bg` | `#FBF1DF` |
| Running | `--color-status-running` | `#2F6FE4` | `--color-status-running-bg` | `#E7EFFD` |
| Neutral (not run / N/A) | `--color-status-neutral` | `#8A90A0` | `--color-status-neutral-bg` | `#EEF0F3` |

**Ledger bar rule:** any card or row representing a status-bearing entity gets a `3px` left border (`--border-ledger-width`) in the matching status color. This is the system's signature visual device — see `components.md`.

## Contrast Requirements

- Body text on `--color-paper-50`/`--color-paper-0`: minimum 4.5:1 (WCAG AA), verified for `--color-text-primary` and `--color-text-secondary`.
- Status colors are never the sole differentiator — always paired with an icon and a text label (see `accessibility.md`).
- Text on `--color-ink-800` chrome uses `--color-text-inverse` / `--color-text-inverse-muted` only, never dark-surface text tokens.

## Theme Structure

The system currently ships one theme (light content canvas + dark chrome, as above). Theming is token-driven: a future dark-mode content canvas would remap `--color-paper-*` and `--color-text-*` tokens only — component CSS never hardcodes hex values, so a full theme swap requires no component-level changes. Theme selection is expected to live in `themes/theme.css`, scoped via a `data-theme` attribute on `<html>`.
