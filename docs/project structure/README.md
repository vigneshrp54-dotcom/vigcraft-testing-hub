# Project Structure Documentation — VigCraft Testing Hub

## Purpose
This folder is the authoritative reference for how the VigCraft Testing Hub codebase is organized and how code within it must be written. It exists so that every contributor — human or AI — produces code that fits the same architecture, uses the same names, and follows the same standards, regardless of which module or sprint they're working in. It is generated under Hallmark artifact generation standards following completion and approval of the Architecture and Database artifacts.

## Documents Included

| Document | Covers |
|---|---|
| [`folder-structure.md`](./folder-structure.md) | Complete project directory tree, purpose of every major folder, responsibility of each architectural layer, and how separation of concerns is enforced across the Layered Modular Monolith. |
| [`naming-conventions.md`](./naming-conventions.md) | Naming rules for folders, files, HTML, CSS, JavaScript, API endpoints, database objects, Git branches, commits, environment variables, constants, functions, and variables. |
| [`coding-standards.md`](./coding-standards.md) | Standards for HTML, CSS, JavaScript, Node.js, Express.js, and SQL, plus documentation, error handling, logging, security, code formatting, and general best practices. |
| `README.md` | This file — purpose, contents, usage, and update policy for the `docs/project-structure/` folder. |

## Usage
- **Before creating any new file:** confirm its location against `folder-structure.md` and its name against `naming-conventions.md`.
- **While writing any code:** follow the relevant section of `coding-standards.md` for that layer (frontend, backend, database).
- **During code review:** these three documents are the checklist — a change that deviates from them needs either a fix or an explicit, documented exception in `docs/architecture/`.
- **For onboarding:** this folder is the fastest path to understanding how VigCraft Testing Hub is built, before reading any actual source code.

## Future Updates
- This documentation is versioned alongside the codebase. Any architectural change (new layer, new naming pattern, new standard) must update the relevant file here in the same change set that introduces it — not retroactively.
- Sprint-level structural additions (new page folders, new backend resources) extend the existing tree in `folder-structure.md` without altering its established layer responsibilities.
- Deviations discovered during development (e.g., a naming pattern that doesn't scale) are proposed as an update to `naming-conventions.md` or `coding-standards.md` and require the same Architecture approval process as the original artifacts, per Hallmark standards.
- `README.md` (this file) is reviewed for accuracy whenever a new document is added to this folder.

---

**Hallmark Internal Review**

Reviewed for consistency against the approved Architecture and Database artifacts:

- ✅ Folder tree in `folder-structure.md` reconciles and supersedes the two prior structure passes (the in-progress `frontend/css/` Hallmark build and the enterprise `frontend/assets/` proposal) into one canonical tree — no conflicting locations remain for CSS.
- ✅ Layer responsibilities (`routes → controllers → services → repositories → models`) match the Layered Modular Monolith architecture stated as "Approved and Frozen" in the project context.
- ✅ Naming conventions align with tokens and patterns already in use in approved artifacts: CSS custom property naming matches `base/variables.css` exactly (e.g., `--color-status-pass`, `--space-4`); component file/folder naming matches `docs/components/`.
- ✅ Coding standards reference and defer to existing approved documents rather than duplicating them: accessibility rules point to `docs/design-system/accessibility.md`; error-message voice points to `docs/design-system/design-principles.md`; component behavior standards align with `docs/components/*.md`.
- ✅ Database naming conventions (snake_case tables/columns, `<table>_id` foreign keys) are consistent with migration file naming already established in `folder-structure.md` (`001_create_users_table.sql`, etc.).
- ✅ No implementation code included in any of the four documents — structure, naming, and standards only, per Hallmark documentation-only rule.

No inconsistencies found. This artifact set is ready for use in continued Sprint 1 development.
