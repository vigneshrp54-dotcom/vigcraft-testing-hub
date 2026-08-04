# Database Design — VigCraft Testing Hub

## 1. Database Overview
VigCraft Testing Hub is built on a **Layered Modular Monolith** architecture, with **MySQL 8+** as
its single system of record. The database persists all core testing-lifecycle data for the
platform — users, roles, permissions, projects, test suites, test cases, test steps, test runs,
Playwright automation runs and results, defects, notifications, reports, and audit history — and is
accessed exclusively by the Node.js and Express.js backend through its Repository layer. The
frontend (HTML5, CSS3, Vanilla JavaScript) never accesses the database directly; all data flows
through the backend's REST API.

This document defines the design principles, standards, and strategies that govern the database
layer of the approved architecture. It is a documentation artifact only: it does not introduce,
modify, or reinterpret any architectural decision already finalized for the project.

## 2. Database Goals
- **Data Integrity**: Enforce correctness through normalization, typed columns, and referential
  integrity, rather than relying on application-side checks alone.
- **Traceability**: Every record's creation and modification must be attributable to a user and a
  point in time, supporting the audit and reporting needs of a QA/testing platform.
- **Consistency Across Modules**: Users, Projects, Test Suites, Test Cases, Test Runs, Playwright
  Runs, and Defects must relate predictably, so that cross-module reporting remains reliable as the
  platform grows.
- **Alignment with the Layered Architecture**: The database is designed to be accessed exclusively
  through the backend's Repository layer, preserving the Route → Controller → Service → Repository
  flow that defines the Layered Modular Monolith.
- **Evolvability**: Support the addition of new modules and reporting needs over time without
  requiring structural rework of the core schema.
- **Operational Clarity**: Every table, column, and convention is self-explanatory to a developer
  unfamiliar with the specific module, eliminating reliance on undocumented tribal knowledge.

## 3. Database Design Principles
- **Normalization First**: The schema is designed to Third Normal Form (3NF) to eliminate redundancy
  and update anomalies. Denormalization, where ever introduced, is a deliberate and documented
  exception, not a default.
- **Single Source of Truth**: MySQL is authoritative for all persisted application state. No module
  or layer maintains a parallel, independently mutable copy of record data.
- **Explicit Relationships**: Every relationship between entities is expressed through a declared
  foreign key at the database level; relationships are never implied solely through application
  logic.
- **Layered Access Only**: The database is reachable only through the backend's Repository layer, in
  keeping with the Layered Modular Monolith's Route → Controller → Service → Repository flow. No
  controller, service, or frontend code queries the database directly.
- **Immutable History Where It Matters**: Execution results, automation run outputs, and audit
  entries are treated as historical records that are appended to, not overwritten, preserving an
  accurate record of what occurred.
- **Environment Parity**: Schema design, naming, and conventions are identical across local,
  staging, and production environments; only configuration values differ between environments.
- **Least Surprise**: Naming, typing, and structural conventions are applied uniformly across every
  table, so that any table in the schema can be understood without additional context.

## 4. Why MySQL 8+ Was Selected
- **Relational Fit**: VigCraft's domain — Projects, Test Suites, Test Cases, Test Steps, Test Runs,
  Playwright Runs and Results, Defects — is inherently relational, with well-defined one-to-many and
  many-to-many relationships that map directly onto a relational model.
- **Transactional Reliability**: MySQL 8's InnoDB storage engine provides full ACID compliance,
  ensuring that multi-step writes within a single business operation commit atomically and leave the
  database in a consistent state.
- **Native Referential Integrity**: Declarative foreign key constraints allow the database itself to
  enforce relationships between entities, complementing rather than replacing validation performed
  at the Service layer.
- **Architectural Alignment**: A single relational database is consistent with the approved Layered
  Modular Monolith style; it avoids the operational and consistency overhead of managing multiple
  data stores or a distributed data layer, which would be appropriate only for a microservices
  architecture — explicitly not the approved style for this project.
- **Ecosystem and Team Fit**: MySQL 8+ has mature, well-supported drivers in the Node.js ecosystem,
  aligning directly with the Express.js backend and reducing operational risk.
- **Maturity of Feature Set**: MySQL 8 provides modern SQL capabilities (window functions, common
  table expressions, JSON column support, improved default character set and collation handling)
  that support the platform's reporting and data-modeling needs without requiring a different
  database engine.
- **Cost and Licensing**: MySQL's open-source licensing model keeps the platform's total cost of
  ownership predictable, with no per-node or per-seat licensing constraints.

## 5. Database Standards
- Every table has exactly one primary key, and its purpose is unambiguous from its name and columns.
- Every relationship between tables is enforced through a declared foreign key constraint, with an
  explicit referential action defined per relationship rather than left to implicit default
  behavior.
- Every table includes the standard audit fields defined in Section 8, and, where applicable, the
  soft-delete field defined in Section 9.
- A single, consistent character set and collation is applied across the entire schema to ensure
  predictable text comparison, sorting, and storage behavior.
- All database access is performed through parameterized queries or prepared statements; dynamically
  concatenated SQL is not a permitted access pattern anywhere in the system.
- Each table and column serves a single, well-defined purpose. Overloaded, multi-purpose columns are
  not used; a new, explicitly named column is introduced instead.
- All schema changes are introduced through the version-controlled migration mechanism defined for
  the project; the schema is never modified directly against any environment.
- Documentation for the database layer is kept current with the schema it describes, consistent with
  the traceability goal defined in Section 2.

## 6. Database Naming Conventions
- **Tables**: `snake_case`, plural nouns — for example, `projects`, `test_cases`, `automation_runs`.
- **Columns**: `snake_case`, singular — for example, `project_id`, `status`, `created_at`.
- **Primary Key Column**: `id`, present on every table.
- **Foreign Key Columns**: `<referenced_singular_entity>_id` — for example, `project_id` referencing
  `projects`, `test_case_id` referencing `test_cases`.
- **Association Tables**: named from the two related entities in singular form, joined by an
  underscore, ordered from parent to child — for example, `project_members`.
- **Boolean Columns**: prefixed `is_` or `has_` — for example, `is_active`, `has_attachments`.
- **Timestamp Columns**: suffixed `_at` — for example, `created_at`, `updated_at`, `deleted_at`,
  `completed_at`.
- **Status / Enumerated Columns**: named `status` or `<noun>_status`, with a fixed, documented set of
  lowercase values — for example, `pass`, `fail`, `blocked`, `pending`.
- **Index Names**: `idx_<table>_<column(s)>`.
- **Foreign Key Constraint Names**: `fk_<table>_<referenced_table>`.
- These conventions are applied uniformly across every module of the schema, ensuring that naming
  is predictable regardless of which functional area a table belongs to.

## 7. UUID Strategy
- Every table's primary `id` value is a **UUID (version 4)**, rather than an auto-incrementing
  integer.
- **Rationale**:
  - A UUID primary key does not expose sequential record counts, creation order, or relative volume
    through externally visible identifiers, such as those appearing in REST API resource paths.
  - UUIDs can be generated at the point of record creation within the Service layer, without
    requiring a round-trip to the database to obtain a generated key before the record can be
    referenced elsewhere in the same operation.
  - UUIDs remove reliance on a single auto-increment counter per table, which is a more resilient
    approach as data volume grows across modules such as Test Executions and Automation Results.
  - UUIDs remain stable and non-colliding, which is valuable if data ever needs to be consolidated
    or migrated between environments.
- Foreign key columns store the UUID of the referenced record directly, so that relationship
  resolution is consistent and direct across the schema.
- UUIDs are generated once, at record-creation time, and are never regenerated or reused for the
  lifetime of a record.
- Where a short, human-readable reference is useful for display purposes — such as a defect
  reference number shown in the user interface — it is implemented as a separate, purely cosmetic
  field layered on top of the UUID primary key, and does not replace the UUID as the primary
  identifier or as the value used in foreign key relationships.

## 8. Audit Fields Strategy
Every table in the schema includes a standard set of audit fields, ensuring consistent traceability
across all modules:

- `created_at` — the timestamp at which the record was created; set once and never modified.
- `updated_at` — the timestamp of the most recent modification to the record; refreshed on every
  update.
- `created_by` — a reference to the user responsible for creating the record.
- `updated_by` — a reference to the user responsible for the most recent modification to the record.
- Where a module's workflow requires additional lifecycle timestamps — for example, `completed_at`
  on a Test Run, or `resolved_at` on a Defect — these follow the same `_at` naming convention defined
  in Section 6, rather than overloading `updated_at` with workflow-specific meaning.
- Audit fields are populated consistently by the Service layer as part of every write operation,
  ensuring that traceability does not depend on inconsistent, ad hoc handling at the point of
  origin.
- Sensitive administrative actions — including role changes, permission changes, and record
  deletions — are additionally captured as discrete entries in a dedicated audit history record,
  providing a durable, queryable history of significant actions beyond the per-record audit fields
  described above.

## 9. Soft Delete Strategy
- Entities whose historical presence affects reporting integrity or traceability — including
  Projects, Test Suites, Test Cases, and Defects — are never physically removed from the database.
  Deletion for these entities is always a soft delete.
- Each such table includes a nullable `deleted_at` timestamp column:
  - A `NULL` value indicates the record is active.
  - A populated value indicates the record has been soft-deleted, and records when.
- A companion `deleted_by` column identifies the user who performed the deletion, consistent with
  the audit fields strategy defined in Section 8.
- Standard read operations exclude soft-deleted records by default. Any operation that must include
  soft-deleted records — for example, an administrative or audit view — does so through a distinct,
  deliberate access path, rather than as an incidental side effect of a standard query.
- Foreign key relationships originating from a soft-deleted record are preserved rather than removed
  or nulled out, so that historical data — such as test executions and reports tied to a since-deleted
  parent record — remains intact, consistent, and attributable.
- High-volume, purely transactional child records that carry no independent reporting value of their
  own may be governed by an explicit, separately documented retention and cleanup policy, rather than
  the soft-delete pattern applied to the entities listed above. This distinction is made deliberately,
  and is never an incidental consequence of a parent record's deletion.
- Because soft delete does not remove data at the row level, restoring a soft-deleted record is
  achieved by clearing its `deleted_at` and `deleted_by` values.

## 10. Database Folder Structure
```
database/
├── design/
│   ├── database-design.md
│   └── erd.md
├── migrations/
├── seeds/
└── schemas/
```
- `design/` contains the approved database design documentation — this document and its
  accompanying entity-relationship diagram — serving as the authoritative design reference for the
  database layer.
- `migrations/` contains the versioned, ordered migration files that represent every schema change
  over time, consistent with the migration mechanism referenced in Section 5.
- `seeds/` contains baseline and environment-specific seed data scripts.
- `schemas/` contains schema definition and reference material that supports the migrations,
  maintained separately from the backend's runtime data-access code.
- This structure keeps design documentation, schema evolution artifacts, and reference material
  clearly separated while remaining fully contained within the `database/` directory, consistent
  with the repository's top-level separation of `frontend/`, `backend/`, `database/`, `playwright/`,
  `tests/`, and `docs/`.
