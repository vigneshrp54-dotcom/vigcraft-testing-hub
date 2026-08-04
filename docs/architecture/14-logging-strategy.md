# 14. Logging Strategy

## 14.1 Objectives
- Provide traceability for every request, error, and critical business event.
- Support debugging in development and operational monitoring in production without leaking
  sensitive data (passwords, tokens, PII).

## 14.2 Logging Layers
VigCraft separates logs into three distinct categories, each with its own purpose, destination, and
retention policy. They are never merged into a single undifferentiated stream.

| Category | What is Logged | Destination |
|---|---|---|
| **Application Logs** | HTTP request logging (method, path, status, response time, user id) and business/domain events (run triggered, defect created, execution recorded) and automation lifecycle (queued, started, completed/failed, duration) | `backend/logs/app.log` (dev); centralized log store (production, Section 16) |
| **Error Logs** | All operational and unexpected errors, with stack traces (server-side only, never sent to the client) | `backend/logs/error.log` (dev); centralized log store, error-level alerting (production) |
| **Audit Logs** | Sensitive/security-relevant actions only: user role changes, permission changes, project/record deletion, login attempts | Persisted permanently to the `audit_logs` MySQL table (Section 8, Section 6) — not a file/rotating log |

Application Logs and Error Logs are transient operational diagnostics; Audit Logs are a permanent,
queryable business record and are never rotated or purged on the same schedule as operational logs
(see Section 14.6 for retention).

## 14.3 Log Levels
`error` > `warn` > `info` > `debug`
- **error**: Unhandled exceptions, failed DB connections, automation crashes
- **warn**: Validation failures, 4xx responses, retried operations
- **info**: Successful key operations (login, run triggered, execution recorded)
- **debug**: Verbose diagnostic detail (enabled only in development)

## 14.4 Log Format
Structured JSON logs (not plain text) to support future aggregation/search tooling:
```json
{
  "timestamp": "2026-08-03T10:15:00Z",
  "level": "info",
  "requestId": "abc-123",
  "userId": 42,
  "message": "Automation run triggered",
  "meta": { "suiteId": 7, "runId": 101 }
}
```

## 14.5 Correlation
- Every incoming request is assigned a `requestId` (via middleware) that is propagated through all
  logs generated during that request's lifecycle, enabling end-to-end tracing of a single request
  across layers.

## 14.6 Storage, Rotation & Retention
- Development: console + local file (`backend/logs/`) with daily rotation.
- Production (future): shipped to a centralized log store (e.g., ELK/CloudWatch equivalent) — see
  Section 16 (Deployment Architecture) and Section 23 (Roadmap).
- **Retention policy**:
  - Application Logs: retained **14 days** on disk before rotation deletes the oldest file.
  - Error Logs: retained **30 days**, given their higher diagnostic value for post-incident review.
  - Audit Logs: retained **indefinitely** in the `audit_logs` table — a compliance/business record,
    never subject to a rotation/deletion policy.

## 14.7 Sensitive Data Handling — Never Log Sensitive Information
- Passwords, JWT tokens, and full request bodies containing credentials are explicitly excluded/
  redacted from logs at the logger utility level — **never logged, even at `debug` level, even in
  development.**
- This rule applies uniformly across all three log categories in Section 14.2: a stack trace in the
  Error Log must not include a raw password field; an Audit Log entry for "password changed" records
  the fact and the actor, never the password value itself.

## 14.8 Audit Trail vs Operational Logs
- `audit_logs` (DB table) is distinct from operational logs: it is a permanent, queryable business
  record of sensitive user actions, while operational logs are transient diagnostic output.
