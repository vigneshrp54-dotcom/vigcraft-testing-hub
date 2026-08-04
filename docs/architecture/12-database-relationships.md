# 12. Database Relationships (ERD)

## 12.1 Entity Relationship Diagram

```mermaid
erDiagram
    ROLES ||--o{ USERS : has
    USERS ||--o{ PROJECT_MEMBERS : "is member via"
    PROJECTS ||--o{ PROJECT_MEMBERS : includes
    PROJECTS ||--o{ TEST_SUITES : contains
    TEST_SUITES ||--o{ TEST_CASES : contains
    TEST_CASES ||--o{ TEST_EXECUTIONS : "executed as"
    TEST_CASES ||--o{ AUTOMATION_RESULTS : "mapped to"
    AUTOMATION_RUNS ||--o{ AUTOMATION_RESULTS : produces
    TEST_EXECUTIONS ||--o{ DEFECTS : "may raise"
    USERS ||--o{ DEFECTS : "reported by"
    USERS ||--o{ DEFECTS : "assigned to"
    USERS ||--o{ AUTOMATION_RUNS : triggers
    USERS ||--o{ AUDIT_LOGS : performs

    ROLES {
        int id PK
        string name
        string description
    }
    USERS {
        int id PK
        string name
        string email
        string password_hash
        int role_id FK
        datetime created_at
    }
    PROJECTS {
        int id PK
        string name
        string description
        datetime created_at
        datetime deleted_at
    }
    PROJECT_MEMBERS {
        int id PK
        int project_id FK
        int user_id FK
        string project_role
    }
    TEST_SUITES {
        int id PK
        int project_id FK
        string name
        datetime created_at
    }
    TEST_CASES {
        int id PK
        int suite_id FK
        string title
        text steps
        text expected_result
        string priority
        string tags
        datetime deleted_at
    }
    TEST_EXECUTIONS {
        int id PK
        int test_case_id FK
        int executed_by FK
        string status
        text notes
        string evidence_path
        datetime executed_at
    }
    AUTOMATION_RUNS {
        int id PK
        int suite_id FK
        int triggered_by FK
        string status
        datetime started_at
        datetime completed_at
    }
    AUTOMATION_RESULTS {
        int id PK
        int run_id FK
        int test_case_id FK
        string status
        int duration_ms
        text error_message
        string report_path
    }
    DEFECTS {
        int id PK
        int test_execution_id FK
        int reported_by FK
        int assigned_to FK
        string title
        string priority
        string severity
        string status
        datetime created_at
    }
    AUDIT_LOGS {
        int id PK
        int user_id FK
        string action
        string entity_type
        int entity_id
        datetime created_at
    }
```

## 12.2 Relationship Notes
- `PROJECTS 1—N TEST_SUITES 1—N TEST_CASES`: strict hierarchical ownership; deleting a project
  cascades soft-deletes down (never hard-delete cascades, to preserve execution history).
- `TEST_CASES 1—N TEST_EXECUTIONS`: full execution history retained per test case (no overwrite).
- `AUTOMATION_RUNS 1—N AUTOMATION_RESULTS`: one run may cover many test cases (a suite run).
- `TEST_EXECUTIONS 1—N DEFECTS`: a failed execution may result in zero or more linked defects.
- `USERS 1—N PROJECT_MEMBERS N—1 PROJECTS`: many-to-many between Users and Projects via the join
  table, carrying a project-scoped role/assignment.

## 12.3 Referential Integrity Rules
| Relationship | On Parent Delete |
|---|---|
| Project → Test Suite | RESTRICT (must archive/soft-delete suites first) |
| Test Suite → Test Case | RESTRICT |
| Test Case → Test Execution | RESTRICT (history preserved) |
| Test Execution → Defect | SET NULL (defect retained even if execution record is archived) |
| Automation Run → Automation Result | CASCADE (results meaningless without run) |
