# 15. Security Architecture

## 15.1 Security Layers
| Layer | Controls |
|---|---|
| Transport | HTTPS/TLS enforced in all non-local environments |
| Authentication | JWT (access + refresh tokens), bcrypt password hashing |
| Authorization | RBAC middleware, service-layer scope checks |
| Input Handling | Schema-based request validation, parameterized SQL queries |
| HTTP Hardening | Security headers (CSP, X-Frame-Options, HSTS equivalent), CORS allow-list |
| Rate Limiting | Applied to authentication endpoints to mitigate brute-force attempts |
| Secrets Management | Environment variables via `.env`, never committed to source control |
| Automation Sandbox | Playwright runs restricted to predefined, version-controlled suites only |

## 15.2 Authentication & Authorization Security
- JWTs signed with a strong server-side secret; short access-token expiry limits exposure window.
- RBAC enforced at both middleware (coarse) and service (fine-grained/ownership) levels — see
  Section 9.

## 15.3 Input Validation & Injection Prevention
- All request bodies validated against schemas before reaching business logic.
- All MySQL queries executed via parameterized statements (no string concatenation of user input
  into SQL) — eliminates SQL injection vectors.
- Output encoding on the frontend prevents stored/reflected XSS from user-entered test case
  content (steps, notes, defect descriptions).

## 15.4 CORS Policy
- API configured with an explicit CORS allow-list (per-environment allowed origins), rejecting
  unrecognized origins by default.

## 15.5 Data Protection
- Passwords: bcrypt-hashed, never stored/transmitted in plaintext.
- PII (user emails, names): access restricted via RBAC; not exposed in logs (Section 14.7).
- Evidence/report file paths: access-controlled via authenticated download endpoints, not public
  static file exposure.

## 15.6 Dependency & Supply Chain Security
- Backend dependencies (npm packages) subject to periodic vulnerability scanning
  (`npm audit` as a baseline for MVP).

## 15.7 Basic Security Testing (per Sprint Planning)
- Sprint 1: baseline auth/RBAC security checks (auth bypass attempts, permission boundary tests).
- Sprint 7: pre-release security pass — input validation fuzzing, SQL injection sanity checks,
  auth/session edge cases.

## 15.8 Threat Model Summary (MVP Scope)
| Threat | Mitigation |
|---|---|
| Credential stuffing / brute force | Rate limiting + bcrypt + account lockout (future) |
| SQL Injection | Parameterized queries exclusively |
| XSS via test case/defect content | Output encoding, CSP headers |
| Broken access control | RBAC middleware + service-level ownership checks |
| Token theft/replay | Short-lived access tokens, HTTPS-only transport |
| Arbitrary code execution via automation | Only predefined, version-controlled Playwright suites executable |
