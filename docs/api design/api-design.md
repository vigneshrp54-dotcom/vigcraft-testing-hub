# Hallmark AI — API Design Overview

## 1. API Overview

Hallmark AI exposes a set of RESTful HTTP APIs used to manage core platform resources (users, projects, cards, orders, and related entities). This document defines the conventions, authentication model, and formats that all APIs must follow. It is intended as a reference for QA Automation engineers building test suites, mocks, and contract validations.

## 2. Base URL

| Environment | Base URL |
|---|---|
| Local | `http://localhost:8080/api/v1` |
| QA / Test | `https://api-qa.hallmarkai.com/api/v1` |
| Staging | `https://api-staging.hallmarkai.com/api/v1` |
| Production | `https://api.hallmarkai.com/api/v1` |

All endpoints are versioned under `/api/v1`. Breaking changes require a new version (`/api/v2`), with the old version supported during a deprecation window.

## 3. Authentication (JWT)

All endpoints (except `/auth/login` and `/auth/refresh`) require a JWT bearer token.

**Header:**
```
Authorization: Bearer <access_token>
```

**Token lifecycle:**
| Token | Expiry | Purpose |
|---|---|---|
| Access Token | 15 minutes | Used on every API call |
| Refresh Token | 7 days | Used to obtain a new access token via `/auth/refresh` |

**Auth flow (for test setup):**
1. `POST /auth/login` with credentials → returns `accessToken`, `refreshToken`.
2. Attach `accessToken` to all subsequent requests.
3. On `401 Unauthorized` (expired token), call `POST /auth/refresh` with `refreshToken` → obtain a new `accessToken`.

Missing, malformed, or expired tokens return `401 Unauthorized`. Valid token with insufficient permissions returns `403 Forbidden`.

## 4. API Naming Convention

- Use **plural nouns** for resource collections: `/users`, `/orders`, `/cards`.
- Use **kebab-case** for multi-word paths: `/order-items`, `/user-preferences`.
- Nest sub-resources under their parent: `/orders/{orderId}/items`.
- No verbs in URLs — the HTTP method defines the action (`GET`, not `/getUsers`).
- Query parameters use **camelCase**: `?sortBy=createdAt&pageSize=20`.
- JSON body fields use **camelCase**: `firstName`, `orderTotal`.
- Path identifiers use the resource name + `Id`: `{userId}`, `{orderId}`.

## 5. REST Standards

- **Statelessness:** Each request contains all information needed; no server-side session state.
- **Resource-based URLs:** Nouns represent resources; HTTP verbs represent operations.
- **Standard verbs:**
  | Method | Action | Idempotent |
  |---|---|---|
  | `GET` | Retrieve resource(s) | Yes |
  | `POST` | Create a resource | No |
  | `PUT` | Replace a resource fully | Yes |
  | `PATCH` | Partially update a resource | No |
  | `DELETE` | Remove a resource | Yes |
- **Filtering, sorting, pagination** via query params: `?status=active&sortBy=createdAt&order=desc&page=1&pageSize=20`.
- **Idempotency:** `POST` requests that create financial/order records must accept an `Idempotency-Key` header to safely support retries.
- **Content type:** All requests/responses use `application/json; charset=utf-8`.
- **Versioning:** In the URL path only (`/api/v1/...`), not in headers.

## 6. Main Endpoints

| Resource | Method | Endpoint | Description |
|---|---|---|---|
| Auth | POST | `/auth/login` | Authenticate and receive tokens |
| Auth | POST | `/auth/refresh` | Refresh access token |
| Auth | POST | `/auth/logout` | Invalidate refresh token |
| Users | GET | `/users` | List users (paginated) |
| Users | GET | `/users/{userId}` | Get user by ID |
| Users | POST | `/users` | Create user |
| Users | PATCH | `/users/{userId}` | Update user |
| Users | DELETE | `/users/{userId}` | Delete user |
| Cards | GET | `/cards` | List cards (filterable) |
| Cards | GET | `/cards/{cardId}` | Get card by ID |
| Cards | POST | `/cards` | Create card |
| Cards | PATCH | `/cards/{cardId}` | Update card |
| Orders | GET | `/orders` | List orders |
| Orders | GET | `/orders/{orderId}` | Get order by ID |
| Orders | POST | `/orders` | Create order |
| Orders | PATCH | `/orders/{orderId}/status` | Update order status |

## 7. Request Format

**Headers (required on all authenticated calls):**
```
Content-Type: application/json
Authorization: Bearer <access_token>
```

**Example — Create Order:**
```http
POST /api/v1/orders
Content-Type: application/json
Authorization: Bearer eyJhbGciOi...
Idempotency-Key: 3f1e9b2a-6c3d-4a11-9e2f-1234567890ab

{
  "userId": "usr_1029",
  "items": [
    { "cardId": "crd_4521", "quantity": 2 }
  ],
  "shippingAddress": {
    "line1": "123 Main St",
    "city": "Kansas City",
    "state": "MO",
    "zip": "64105"
  }
}
```

**Rules:**
- All request bodies are JSON objects (no raw arrays at root).
- Dates use ISO 8601 UTC: `2026-08-04T10:15:00Z`.
- Required fields are validated server-side; missing/invalid fields return `400 Bad Request`.

## 8. Response Format

All responses follow a consistent envelope.

**Success — single resource:**
```json
{
  "success": true,
  "data": {
    "orderId": "ord_7788",
    "status": "created",
    "createdAt": "2026-08-04T10:15:03Z"
  },
  "meta": {}
}
```

**Success — collection (paginated):**
```json
{
  "success": true,
  "data": [
    { "userId": "usr_1029", "firstName": "Jane" }
  ],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "totalItems": 145,
    "totalPages": 8
  }
}
```

## 9. HTTP Status Codes

| Code | Meaning | Usage |
|---|---|---|
| `200 OK` | Success | Successful `GET`, `PATCH`, `PUT`, `DELETE` |
| `201 Created` | Resource created | Successful `POST` |
| `204 No Content` | Success, no body | Successful `DELETE` with no return payload |
| `400 Bad Request` | Invalid input | Validation errors, malformed JSON |
| `401 Unauthorized` | Missing/invalid/expired token | Auth failure |
| `403 Forbidden` | Authenticated but not permitted | Role/permission failure |
| `404 Not Found` | Resource does not exist | Invalid ID, deleted resource |
| `409 Conflict` | State conflict | Duplicate resource, idempotency conflict |
| `422 Unprocessable Entity` | Semantically invalid | Business rule violation |
| `429 Too Many Requests` | Rate limit exceeded | Throttling |
| `500 Internal Server Error` | Unhandled server error | Unexpected failure |
| `503 Service Unavailable` | Downstream dependency down | Maintenance, outage |

## 10. Error Response Format

All error responses follow a consistent structure to enable predictable assertions in automated tests.

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The request could not be processed due to invalid input.",
    "details": [
      {
        "field": "shippingAddress.zip",
        "issue": "must be a valid 5-digit ZIP code"
      }
    ]
  },
  "meta": {
    "requestId": "req_9f3c1a2b",
    "timestamp": "2026-08-04T10:15:03Z"
  }
}
```

**Standard error codes:**

| `error.code` | HTTP Status | Description |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Request body/params failed validation |
| `UNAUTHORIZED` | 401 | Token missing, invalid, or expired |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Duplicate or conflicting state |
| `BUSINESS_RULE_VIOLATION` | 422 | Valid input, disallowed by business logic |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Unhandled server exception |

`requestId` should always be logged and asserted in automated tests for traceability when reporting defects.
