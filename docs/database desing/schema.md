# Database Schema — VigCraft Testing Hub

## 1. Schema Overview
This document defines the organizational structure, module boundaries, and structural standards of
the VigCraft Testing Hub MySQL 8+ schema. It builds directly on the principles, naming conventions,
UUID strategy, audit fields strategy, and soft delete strategy established in `database-design.md`
(`database/design/database-design.md`) without repeating them; where those topics are referenced
below, they are referenced by name rather than redefined. This document describes how the schema is
organized and the standards that apply uniformly across it — it does not define individual tables,
columns, or entity relationships in detail.

## 2. Database Schema Organization
The schema is organized around the functional modules of the Layered Modular Monolith, mirroring the
backend's module boundaries so that each module's data ownership is unambiguous:

- Each module owns a cohesive group of related entities and is responsible for the integrity of data
  within that group.
- Cross-module relationships are expressed strictly through foreign keys at the database level,
  matching the services-only communication rule that governs cross-module interaction at the
  application level.
- No entity is shared or duplicated across modules; where one module needs another module's data, it
  references that module's entity by foreign key rather than maintaining a parallel copy.
- The schema as a whole is treated as a single, cohesive relational design — consistent with the
  Layered Modular Monolith architecture style — rather than as a set of independently evolving data
  stores.

## 3. Database Modules
| Module | Responsibility |
|---|---|
| Identity & Access | Users, Roles, Permissions, and their assignment — the foundation for authentication and authorization |
| Project Management | Projects and the users associated with them |
| Test Management | Test Suites, Test Cases, and Test Steps — the design-time definition of what is to be tested |
| Test Execution | Test Runs — the record of manual test execution against Test Cases |
| Automation | Playwright Runs and Playwright Results — the record of automated test execution and its outcomes |
| Defect Management | Defects raised from manual or automated testing |
| Notifications | Notifications delivered to users in response to platform events |
| Reporting | Reports derived from the underlying testing and automation data |
| Audit | Audit Logs — the durable record of sensitive and security-relevant actions across all modules |

## 4. Entity List (High-Level)
| Module | Entity | Purpose |
|---|---|---|
| Identity & Access | Users | Registered platform users |
| Identity & Access | Roles | Named roles assigned to users |
| Identity & Access | Permissions | Discrete permissions grouped into roles |
| Project Management | Projects | Top-level container for all testing work |
| Project Management | Project Members | Association of Users to Projects |
| Test Management | Test Suites | Logical grouping of Test Cases within a Project |
| Test Management | Test Cases | Individual test definitions within a Test Suite |
| Test Management | Test Steps | Ordered steps that make up a Test Case |
| Test Execution | Test Runs | Record of a manual execution of a Test Case |
| Automation | Playwright Runs | Record of a triggered Playwright automation run |
| Automation | Playwright Results | Individual test outcomes produced by a Playwright Run |
| Defect Management | Defects | Issues raised from manual or automated test results |
| Notifications | Notifications | Platform-generated notifications delivered to Users |
| Reporting | Reports | Derived reporting artifacts summarizing testing activity |
| Audit | Audit Logs | Durable record of sensitive and security-relevant actions |

This list identifies the entities that exist within the schema and the module each belongs to. It is
intentionally high-level; column definitions and inter-entity relationships are governed by the
standards in this document but are not enumerated here.

## 5. Primary Key Strategy
- Every entity listed in Section 4 uses a single-column UUID primary key, per the UUID Strategy
  defined in `database-design.md`.
- The primary key strategy is applied identically across every module in Section 3; no module or
  entity uses an alternate primary key approach (such as an auto-incrementing integer or a composite
  natural key).
- Association entities that exist to express a relationship between two other entities — such as
  Project Members — are themselves first-class entities with their own UUID primary key, rather than
  being keyed solely by the combination of the two entities they associate. This keeps the primary
  key strategy uniform across the entire schema and allows an association record to carry its own
  audit fields, per `database-design.md`.

## 6. Foreign Key Strategy
- Every relationship between entities, within a module or across modules, is enforced through a
  declared foreign key constraint at the database level — relationships are never enforced solely
  through application logic.
- Foreign key columns follow the naming convention defined in `database-design.md`
  (`<referenced_entity>_id`), making the target of any relationship identifiable from the column
  name alone.
- Each foreign key relationship has an explicit, deliberately chosen referential action:
  - **Restrict** is used where the referenced entity must not be removable while dependent records
    exist, protecting data that carries independent reporting or compliance value.
  - **Cascade** is used only where the dependent entity has no meaning or reporting value
    independent of its parent, such that removal of the parent should propagate.
  - No foreign key relationship is left to an implicit or unconsidered default action.
- Foreign key constraints reference entities within the same schema only; the schema does not depend
  on cross-database or cross-instance references, consistent with MySQL 8+ being the single system
  of record for the platform.
- Detailed, entity-by-entity relationship definitions are outside the scope of this document and are
  governed at the point each relationship is implemented, in accordance with the strategy defined
  here.

## 7. Data Type Standards
Data types are standardized by category so that a given kind of value is represented identically
wherever it appears in the schema:

| Category | Standard |
|---|---|
| Identifiers (primary keys, foreign keys) | UUID, per the Primary Key Strategy (Section 5) |
| Short text (names, titles, single-line labels) | Bounded variable-length character type, sized to the field's realistic maximum |
| Long text (descriptions, notes, step content) | Unbounded text type, used only where content length cannot be reasonably bounded |
| Timestamps | Timezone-aware date-time type, used for every `_at` column per `database-design.md` |
| Boolean flags | Boolean type, used for every `is_`/`has_` column per `database-design.md` |
| Status / enumerated values | Bounded character type constrained to a fixed, documented set of lowercase values, rather than a free-text field |
| Numeric counts and ordering values | Integer type, sized appropriately to the realistic range of the value |
| File/URL references | Bounded variable-length character type, storing a reference path or URL rather than binary content |

A given category is represented with the same underlying type across every module; a timestamp in
the Test Execution module and a timestamp in the Automation module use the same standard.

## 8. Constraint Standards
- **Not-Null**: Every column is explicitly declared `NOT NULL` unless the absence of a value is a
  meaningful, intentional state for that column (for example, `deleted_at` prior to a soft delete).
- **Uniqueness**: Columns that must be unique within their scope (for example, a user's email
  address) carry an explicit unique constraint, rather than relying on application-level checking
  alone.
- **Referential Constraints**: Every foreign key column is backed by a foreign key constraint, per
  the Foreign Key Strategy (Section 6); there are no "soft" or undeclared relationships in the
  schema.
- **Value Constraints**: Status and enumerated columns are constrained to their documented set of
  valid values at the database level, in addition to validation performed at the Service layer,
  ensuring the database itself cannot hold an undocumented status value.
- **Scoped Uniqueness**: Where uniqueness applies only within a parent entity's scope (for example, a
  Test Case's ordering value within its Test Suite), the constraint is scoped accordingly rather than
  applied globally.

## 9. Default Value Standards
- `created_at` and `updated_at` (per `database-design.md`) default to the current timestamp at the
  moment of insertion; `updated_at` is refreshed automatically on every subsequent update.
- `deleted_at` and `deleted_by` (per `database-design.md`) default to no value, reflecting that a
  newly created record is active by default.
- Boolean flag columns default to the value that represents the normal, expected state of a newly
  created record (for example, `is_active` defaults to true for a newly created entity that is
  usable immediately).
- Status columns default to the value representing the initial state in that entity's lifecycle (for
  example, a newly created Test Run defaults to a pending/not-yet-executed status).
- No column relies on an application-supplied default where a database-level default can express the
  same intent, ensuring records created through any access path share consistent default behavior.

## 10. Data Integrity Strategy
- **Layered Enforcement**: Data integrity is enforced at two complementary levels — declaratively at
  the database level (constraints, data types, foreign keys, as defined in Sections 6–8) and again at
  the Service layer of the backend, consistent with the Layered Modular Monolith's Route → Controller
  → Service → Repository flow. Database-level enforcement is the final safeguard; it is never the
  only safeguard.
- **Transactional Consistency**: Operations that must succeed or fail together — such as recording a
  Test Run result and updating the status of its related Test Case — are executed within a single
  database transaction, so the schema is never left in a partially updated state.
- **Referential Integrity**: Foreign key constraints (Section 6) guarantee that a record can never
  reference a non-existent parent entity, and that relationships to entities carrying independent
  reporting value cannot be silently broken.
- **Historical Integrity**: Consistent with the Soft Delete Strategy in `database-design.md`, the
  removal of a parent entity never destroys the historical validity of dependent records that carry
  independent reporting value; this is a data integrity guarantee as much as an audit consideration.
- **Consistency Across Environments**: Because schema structure, constraints, and standards are
  identical across environments (per `database-design.md`), the same integrity guarantees hold in
  local, staging, and production alike — no environment operates under relaxed integrity rules.
