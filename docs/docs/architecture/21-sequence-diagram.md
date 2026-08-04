# 21. Sequence Diagrams

## 21.1 End-to-End: Manual Test Case Execution with Defect Logging

```mermaid
sequenceDiagram
    participant QA as QA Engineer
    participant UI as Browser UI
    participant API as Express API
    participant ES as Execution Service
    participant DS as Defect Service
    participant DB as MySQL

    QA->>UI: Open Test Case, click "Execute"
    UI->>API: POST /api/v1/test-cases/:id/executions {status: "fail", notes}
    API->>ES: recordExecution(testCaseId, result)
    ES->>DB: INSERT test_executions
    ES-->>API: execution created
    API-->>UI: 201 Created {executionId}
    UI->>QA: prompt "Log a defect for this failure?"
    QA->>UI: confirms, fills defect form
    UI->>API: POST /api/v1/defects {testExecutionId, title, severity, priority}
    API->>DS: createDefect(payload)
    DS->>DB: INSERT defects
    DS-->>API: defect created
    API-->>UI: 201 Created {defectId}
    UI->>QA: shows confirmation
```

## 21.2 End-to-End: Automated Run Trigger to Dashboard Update

```mermaid
sequenceDiagram
    participant QAA as QA Automation Engineer
    participant UI as Browser UI
    participant API as Express API
    participant AS as Automation Service
    participant PW as Playwright Runner
    participant DB as MySQL

    QAA->>UI: Click "Run Suite"
    UI->>API: POST /api/v1/automation/runs {suiteId}
    API->>AS: triggerRun(suiteId)
    AS->>DB: INSERT automation_runs (status=queued)
    AS-->>API: 202 Accepted {runId}
    API-->>UI: shows "Run Queued"
    AS->>PW: spawn Playwright process
    PW-->>AS: run completed (JSON report)
    AS->>DB: UPDATE automation_runs (status=completed)
    AS->>DB: INSERT automation_results (per test)
    UI->>API: GET /api/v1/automation/runs/:runId (polling)
    API-->>UI: 200 OK {status: completed, results}
    UI->>QAA: displays results + updates dashboard metrics
```

## 21.3 End-to-End: Login and Access to Protected Resource

```mermaid
sequenceDiagram
    participant U as User
    participant UI as Browser UI
    participant API as Express API
    participant AUTH as Auth Middleware
    participant RBAC as RBAC Middleware
    participant CTRL as Project Controller

    U->>UI: enters credentials, clicks Login
    UI->>API: POST /api/v1/auth/login
    API-->>UI: 200 OK {accessToken, refreshToken, role}
    UI->>UI: store tokens
    U->>UI: navigates to Projects
    UI->>API: GET /api/v1/projects (Authorization: Bearer token)
    API->>AUTH: verify JWT
    AUTH->>RBAC: check permission project:read
    RBAC->>CTRL: authorized, proceed
    CTRL-->>UI: 200 OK {projects list}
    UI->>U: renders Project List page
```
