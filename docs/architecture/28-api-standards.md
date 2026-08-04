# 28. API Standards

## 28.1 Overview
This document consolidates the API-level conventions that apply consistently across every endpoint
in VigCraft Testing Hub's REST API (Section 7), so new endpoints are added predictably.

## 28.2 URL & Versioning Conventions
- Base path: `/api/v1/...` — the version segment is mandatory on every route from day one.
- Resource paths are plural nouns: `/api/v1/projects`, `/api/v1/test-cases`, `/api/v1/defects`.
- Nested resources reflect real ownership only: `/api/v1/projects/:projectId/test-suites`.
- No verbs in URLs (`/api/v1/projects/:id/archive` is acceptable as an action sub-resource; `/api/v1/archiveProject` is not).

## 28.3 HTTP Method Usage
| Method | Usage |
|---|---|
| `GET` | Retrieve a resource or collection; never mutates state |
| `POST` | Create a resource, or trigger a non-idempotent action (e.g., trigger a Playwright run) |
| `PUT` | Full replace of a resource |
| `PATCH` | Partial update of a resource |
| `DELETE` | Soft-delete a resource (Section 9 of `database-design.md`) |

## 28.4 Success Response Envelope
```json
{
  "success": true,
  "data": { },
  "meta": { }
}
```
- `data` holds the resource(s) requested.
- `meta` is optional and used for pagination (Section 28.6) or supplementary info; omitted when not
  needed.

## 28.5 Error Response Envelope
Every error uses the exact structure defined in Section 13.2 — this document does not redefine it,
only confirms all endpoints without exception follow it.

## 28.6 Pagination
- List endpoints accept `?page=` and `?limit=` query parameters (default `page=1`, `limit=20`, max
  `limit=100`).
- Paginated responses include:
```json
{
  "success": true,
  "data": [ ],
  "meta": { "page": 1, "limit": 20, "total": 137, "totalPages": 7 }
}
```

## 28.7 Filtering & Sorting
- Filtering: plain query parameters matching a known field (e.g., `?status=open&projectId=...`).
- Sorting: `?sort=<field>` for ascending, `?sort=-<field>` for descending; unsupported fields are
  rejected with a `400 VALIDATION_ERROR` (Section 13.3), not silently ignored.

## 28.8 Request Validation
- Every write endpoint (`POST`/`PUT`/`PATCH`) validates its body against a schema defined in
  `validators/` (Section 3.1) before the request reaches the Controller's business logic.
- Validation failures return `400` with `details` populated per-field, per the envelope in Section
  13.2.

## 28.9 Idempotency
- `GET`, `PUT`, `PATCH`, and `DELETE` are idempotent by design — repeating an identical request
  produces the same end state.
- `POST` actions that must not be accidentally duplicated (e.g., triggering a Playwright run) are
  documented per-endpoint in the API reference (Section 7) rather than assumed idempotent.

## 28.10 API Documentation
- Every endpoint is documented in the Swagger/OpenAPI spec and Postman collection under `docs/api/`
  (Section 3.1) and kept in sync as part of the Pull Request checklist (Section 20.6.1).
