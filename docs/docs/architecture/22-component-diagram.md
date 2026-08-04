# 22. Component Diagram

## 22.1 Backend Component Diagram

```mermaid
flowchart TB
    subgraph "Express Application"
        direction TB
        MWStack["Middleware Stack<br/>(Logger, CORS, Auth, RBAC, Validator, Error Handler)"]

        subgraph "Auth Module"
            AuthRoute["auth.routes.js"]
            AuthCtrl["auth.controller.js"]
            AuthSvc["auth.service.js"]
        end

        subgraph "Project Module"
            ProjRoute["project.routes.js"]
            ProjCtrl["project.controller.js"]
            ProjSvc["project.service.js"]
            ProjRepo["project.repository.js"]
        end

        subgraph "Test Case Module"
            TCRoute["testcase.routes.js"]
            TCCtrl["testcase.controller.js"]
            TCSvc["testcase.service.js"]
            TCRepo["testcase.repository.js"]
        end

        subgraph "Execution Module"
            ExRoute["execution.routes.js"]
            ExCtrl["execution.controller.js"]
            ExSvc["execution.service.js"]
            ExRepo["execution.repository.js"]
        end

        subgraph "Automation Module"
            AutoRoute["automation.routes.js"]
            AutoCtrl["automation.controller.js"]
            AutoSvc["automation.service.js"]
            AutoRepo["automation.repository.js"]
            PWRunner["Playwright Runner"]
            ResultParser["Results Parser"]
        end

        subgraph "Defect Module"
            DefRoute["defect.routes.js"]
            DefCtrl["defect.controller.js"]
            DefSvc["defect.service.js"]
            DefRepo["defect.repository.js"]
        end

        subgraph "Report Module"
            RepRoute["report.routes.js"]
            RepCtrl["report.controller.js"]
            RepSvc["report.service.js"]
        end
    end

    MWStack --> AuthRoute
    MWStack --> ProjRoute
    MWStack --> TCRoute
    MWStack --> ExRoute
    MWStack --> AutoRoute
    MWStack --> DefRoute
    MWStack --> RepRoute

    AuthRoute --> AuthCtrl --> AuthSvc
    ProjRoute --> ProjCtrl --> ProjSvc --> ProjRepo
    TCRoute --> TCCtrl --> TCSvc --> TCRepo
    ExRoute --> ExCtrl --> ExSvc --> ExRepo
    AutoRoute --> AutoCtrl --> AutoSvc --> AutoRepo
    AutoSvc --> PWRunner --> ResultParser --> AutoSvc
    DefRoute --> DefCtrl --> DefSvc --> DefRepo
    RepRoute --> RepCtrl --> RepSvc

    ExSvc -.->|internal event| DefSvc
    AutoSvc -.->|internal call| ExSvc
    RepSvc --> ProjRepo
    RepSvc --> TCRepo
    RepSvc --> ExRepo
    RepSvc --> AutoRepo

    ProjRepo --> DB[("MySQL")]
    TCRepo --> DB
    ExRepo --> DB
    AutoRepo --> DB
    DefRepo --> DB
```

## 22.2 Frontend Component Diagram

```mermaid
flowchart TB
    subgraph "Browser Application"
        Router["Client Router"]

        subgraph Pages
            Dash["Dashboard Page"]
            Proj["Projects Page"]
            TC["Test Cases Page"]
            Exec["Execution Page"]
            Auto["Automation Page"]
            Def["Defects Page"]
            Admin["Admin Page"]
        end

        subgraph "Shared Components"
            Nav["Navigation Bar"]
            Table["Data Table"]
            Modal["Modal/Dialog"]
            FormC["Form Controls"]
            Badge["Status Badge"]
        end

        subgraph Services
            ApiClient["apiClient.js"]
            AuthSvcFE["auth.service.js"]
            ProjSvcFE["project.service.js"]
            TCSvcFE["testcase.service.js"]
            AutoSvcFE["automation.service.js"]
        end

        State["AppState (auth, active project)"]
    end

    Router --> Dash & Proj & TC & Exec & Auto & Def & Admin
    Dash --> Table
    Proj --> Table & Modal & FormC
    TC --> Table & Modal & FormC
    Exec --> Table & Badge
    Auto --> Table & Badge
    Def --> Table & Modal & FormC
    Admin --> Table & FormC

    Proj --> ProjSvcFE --> ApiClient
    TC --> TCSvcFE --> ApiClient
    Auto --> AutoSvcFE --> ApiClient
    Dash --> AuthSvcFE --> ApiClient

    ApiClient --> State
    Nav --> State

    ApiClient -->|"REST calls"| BackendAPI["Express REST API"]
```

## 22.3 Notes
- Every module in the backend component diagram follows the identical internal shape
  (Route → Controller → Service → Repository), reinforcing the layered architecture defined in
  Section 5.
- Dotted lines represent internal, in-process service-to-service calls/events (Section 10), distinct
  from solid lines representing direct layer-to-layer calls.
