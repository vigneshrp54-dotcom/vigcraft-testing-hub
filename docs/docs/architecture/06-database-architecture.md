# 6. Database Architecture

## 6.1 Overview
MySQL is the system of record for VigCraft Testing Hub. The schema is normalized (3NF) for
transactional integrity, with targeted denormalization considered only for reporting views in
later phases.

## 6.2 Core Entities (Logical)
- `users`
- `roles`
- `projects`
- `project_members`
- `test_suites`
- `test_cases`
- `test_executions`
- `automation_runs`
- `automation_results`
- `defects`
- `notifications` (basic)
- `audit_logs`

## 6.3 Design Principles
- **Primary Keys**: Surrogate integer/UUID primary keys (`id`) on every table.
- **Foreign Keys**: Enforced referential integrity via FK constraints (`ON DELETE RESTRICT` /
  `CASCADE` chosen per relationship — see Section 12).
- **Timestamps**: Every table includes `created_at` and `updated_at` for auditability.
- **Soft Deletes**: Key entities (Projects, Test Cases) use a `deleted_at` nullable column instead of
  hard deletes, to preserve historical execution/reporting integrity.
- **Indexing**: Foreign key columns and frequently filtered columns (`status`, `priority`,
  `project_id`) are indexed.
- **Naming**: `snake_case`, plural table names, singular column names.

## 6.4 Connection Management
- Connection pooling via `mysql2` connection pool, sized per environment (see Section 17).
- All queries executed through the Repository layer only — no raw SQL in controllers/services.
- Parameterized queries / prepared statements used exclusively to prevent SQL injection.

## 6.5 Migrations & Seeding
- Schema changes tracked via versioned migration files in `database/migrations/`.
- `database/seeds/` provides baseline seed data (default Admin user, default roles) for new
  environments.

## 6.6 Transaction Boundaries
- Multi-step writes that must be atomic (e.g., creating a Test Execution + updating Test Case
  status + writing an Audit Log entry) are wrapped in explicit MySQL transactions at the Service
  layer.

## 6.7 Reporting Considerations
- Dashboard/report queries are read-heavy aggregations (pass/fail counts, trend data). For MVP these
  run as optimized indexed queries against core tables; a future phase may introduce materialized
  summary tables if performance requires it (see Section 18 — Scalability Considerations).
