# 7. REST API Architecture

## 7.1 Design Principles
- Resource-oriented URLs, plural nouns (`/api/v1/projects`, `/api/v1/test-cases`)
- Standard HTTP verbs: `GET`, `POST`, `PUT`/`PATCH`, `DELETE`
- Versioned API base path: `/api/v1/`
- JSON request/response bodies exclusively
- Consistent response envelope (see 7.4)
- Stateless — every request authenticated independently via JWT

## 7.2 Resource Map (High Level)

| Resource | Base Path | Notes |
|---|---|---|
| Auth | `/api/v1/auth` | login, refresh, logout |
| Users | `/api/v1/users` | admin-managed |
| Roles | `/api/v1/roles` | RBAC configuration |
| Projects | `/api/v1/projects` | CRUD |
| Test Suites | `/api/v1/projects/:projectId/suites` | nested under project |
| Test Cases | `/api/v1/suites/:suiteId/test-cases` | nested under suite |
| Executions | `/api/v1/test-cases/:testCaseId/executions` | manual execution records |
| Automation Runs | `/api/v1/automation/runs` | trigger + list Playwright runs |
| Automation Results | `/api/v1/automation/runs/:runId/results` | ingested results |
| Defects | `/api/v1/defects` | linked to test cases/executions |
| Reports | `/api/v1/reports/*` | dashboard/aggregation endpoints |

## 7.3 HTTP Status Code Conventions

| Code | Meaning |
|---|---|
| 200 | Successful GET/PUT/PATCH |
| 201 | Successful POST (resource created) |
| 204 | Successful DELETE (no content) |
| 400 | Validation error |
| 401 | Missing/invalid/expired JWT |
| 403 | Authenticated but not authorized (RBAC failure) |
| 404 | Resource not found |
| 409 | Conflict (e.g., duplicate entity) |
| 422 | Semantically invalid request |
| 500 | Unhandled server error |

## 7.4 Standard Response Envelope

Success:
```json
{
  "success": true,
  "data": { },
  "meta": { }
}
```

Error:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human readable message",
    "details": []
  }
}
```

## 7.5 Pagination, Filtering, Sorting
- List endpoints support `?page=&limit=` (pagination), `?sort=field:asc|desc`, and resource-specific
  filters (e.g., `?status=failed&priority=high`).
- Pagination metadata returned under `meta`: `{ page, limit, totalItems, totalPages }`.

## 7.6 Idempotency & Safety
- `GET`/`PUT`/`DELETE` are treated as idempotent per REST semantics.
- `POST` endpoints that trigger side effects (e.g., triggering a Playwright run) return a run
  identifier immediately and process asynchronously.

## 7.7 API Documentation
- All endpoints documented via **Swagger/OpenAPI** (machine-readable spec, hosted at
  `/api-docs` in non-production environments) and mirrored in a maintained **Postman Collection**
  for QA manual API testing, per the Sprint Planning documentation standards.
