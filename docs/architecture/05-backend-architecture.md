# 5. Backend Architecture

## 5.1 Overview
The backend is a Node.js application built on Express.js, structured as a **modular monolith**
following a strict layered request flow.

## 5.2 Request Flow

```
Client Request
     |
     v
[Middleware Stack]
  - Request Logger
  - CORS
  - Body Parser
  - JWT Auth Middleware
  - RBAC Middleware
  - Request Validator
     |
     v
[Router] -> [Controller] -> [Service] -> [Repository] -> [MySQL]
     |
     v
[Response Formatter] -> [Error Handler (on failure)] -> Client Response
```

## 5.3 Layer Responsibilities

| Layer | Responsibility | Rules |
|---|---|---|
| **Router** | Maps HTTP method + path to controller function | No business logic |
| **Controller** | Parses request, calls service, shapes response | No direct DB access |
| **Service** | Core business logic, orchestration, transaction boundaries | Framework-agnostic (no `req`/`res`) |
| **Repository** | Executes MySQL queries, maps rows to domain objects | No business rules |
| **Middleware** | Cross-cutting concerns: auth, RBAC, validation, logging, error handling | Reusable across routes |

## 5.4 Module Boundaries
Each functional module (Auth, Projects, Test Suites, Test Cases, Execution, Automation, Defects,
Reports) owns its own router, controller, service, and repository files, following the pattern:

```
routes/project.routes.js
controllers/project.controller.js
services/project.service.js
repositories/project.repository.js
```

This keeps modules independently understandable and testable, and is a deliberate precursor to a
future microservices split (each module could become its own service with minimal refactor).

## 5.5 Dependency Injection Approach
- Services receive their repository dependencies via constructor/factory functions rather than
  importing singletons directly, easing unit testing (repositories can be mocked).

## 5.6 Configuration Management
- Environment-specific configuration (DB credentials, JWT secret, ports) is loaded via `.env` files
  and centralized in `config/` — see Section 17 (Environment Configuration).

## 5.7 Cross-Cutting Concerns
- **Validation**: Request payloads validated via schema validators (per-route) before reaching
  controllers.
- **Error Handling**: Centralized error-handling middleware (see Section 13).
- **Logging**: Structured request/response and error logging (see Section 14).
- **Security**: Helmet-style HTTP header hardening, rate limiting on auth endpoints, input
  sanitization.

## 5.8 Automation Layer Integration
- The Automation module's service layer is responsible for triggering Playwright runs and invoking
  the result-parser; it communicates with core Test/Execution services through the same internal
  service-layer contracts as any other module (no bypassing of layers).
