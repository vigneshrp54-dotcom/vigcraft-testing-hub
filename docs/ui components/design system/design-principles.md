# VigCraft Testing Hub — Design Principles

## Positioning

VigCraft sits in the same category as Jira, Azure DevOps, GitHub, and TestRail — enterprise tools where QA engineers, developers, and stakeholders spend entire workdays. The design system optimizes for **long-session legibility, data density, and status clarity** over decorative polish.

## Direction: "Diagnostic Ledger"

A testing platform runs on pass / fail / running / warning states. The design system makes that vocabulary visible everywhere — not just inside test-result tables. A consistent colored left-border "ledger bar" appears on cards, list rows, nav states, and badges, so status is always readable at a glance, even before reading any text.

## Core Principles

1. **Status is the primary signal.**
   Every entity that can succeed or fail (a test case, an execution, a project's health) surfaces its status through color + icon + label together — never color alone (see Accessibility).

2. **Density with breathing room.**
   Enterprise users scan long lists and tables for hours. Layouts favor compact row heights and tight vertical rhythm, but preserve enough whitespace (via the spacing scale) that dense screens don't feel cramped or fatiguing.

3. **Predictable, not novel.**
   Navigation patterns, iconography, and interaction models follow conventions QA/dev users already know from Jira/GitHub/Azure DevOps. Familiarity reduces onboarding friction; the product's personality comes from typography and the ledger-bar system, not from reinventing interaction patterns.

4. **Monospace where precision matters.**
   Headings, test IDs, counts, timestamps, and code-like data use a monospace display face — reinforcing that this is a technical, log-driven tool. Body copy stays in a humanist sans for comfortable reading.

5. **One accent, used with restraint.**
   Signal Teal is the only non-status brand color. It marks primary actions and active navigation. It is never used decoratively, so when it appears, it means "this is interactive" or "this is where you are."

6. **Every state is designed, not default.**
   Loading, empty, and error states are treated as first-class screens with their own guidance (see `components.md`), not left to browser defaults or blank divs.

7. **Accessible by construction.**
   Contrast ratios, focus states, and semantic markup are part of the base system, not a pass applied at the end. See `accessibility.md`.

## Voice in the UI

- Plain, active verbs: "Create test case," not "Submit."
- Errors state what happened and how to fix it — never "Something went wrong."
- Empty states are an invitation to act: name the first action, not just the absence of data.
