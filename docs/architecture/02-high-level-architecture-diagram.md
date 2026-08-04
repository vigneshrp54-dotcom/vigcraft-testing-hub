# 2. High-Level Architecture Diagram (Mermaid)

## 2.1 System Overview Diagram

```mermaid
flowchart TB
    subgraph Client["Client Layer"]
        UI["Browser UI<br/>HTML / CSS / JavaScript"]
    end

    subgraph API["API Layer (Node.js + Express.js)"]
        MW["Middleware<br/>(Auth, RBAC, Validation, Logging)"]
        CTRL["Controllers"]
        SVC["Services / Business Logic"]
    end

    subgraph DATA["Data Layer"]
        DAO["Data Access Layer"]
        DB[("MySQL Database")]
    end

    subgraph AUTOMATION["Automation Layer"]
        PW["Playwright Test Runner"]
        RESULTS["Result Parser (JSON/HTML)"]
    end

    UI -->|"REST API calls (HTTPS + JWT)"| MW
    MW --> CTRL
    CTRL --> SVC
    SVC --> DAO
    DAO --> DB

    UI -->|"Trigger Automation Run"| CTRL
    CTRL -->|"Spawn / Queue Job"| PW
    PW --> RESULTS
    RESULTS -->|"Ingest results via internal API"| SVC
    SVC --> DAO
```

## 2.2 Layered View

```mermaid
flowchart LR
    A["Presentation Layer<br/>HTML/CSS/JS"] --> B["API Layer<br/>Express.js Routes + Middleware"]
    B --> C["Business Logic Layer<br/>Services"]
    C --> D["Data Access Layer<br/>MySQL Queries"]
    D --> E[("MySQL Database")]
    C --> F["Automation Layer<br/>Playwright"]
```

## 2.3 Actor-Level Context Diagram

```mermaid
flowchart TB
    Admin(["Admin"]) --> UI
    TM(["Test Manager"]) --> UI
    QA(["QA Engineer"]) --> UI
    QAA(["QA Automation Engineer"]) --> UI
    Dev(["Developer"]) --> UI
    View(["Viewer/Stakeholder"]) --> UI

    UI["VigCraft Testing Hub<br/>Web Application"] --> API["Express REST API"]
    API --> DB[("MySQL")]
    API --> PW["Playwright Engine"]
```

## 2.4 Notes
- All arrows crossing the Client → API boundary represent HTTPS calls secured with JWT Bearer tokens.
- The Playwright Runner is invoked asynchronously; results are ingested back into MySQL through the
  same REST API surface used by the UI (no direct DB access from the automation layer).
