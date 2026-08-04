# 31. Monitoring & Maintenance

## 31.1 Overview
This document defines how VigCraft Testing Hub is observed and maintained in Staging and Production,
building on the logging foundation in Section 14 and the performance targets in Section 29.

## 31.2 What Is Monitored (MVP)
| Area | Signal | Source |
|---|---|---|
| Application health | Process uptime, restart count | Process supervisor (PM2/systemd — Section 16.5) |
| API health | Response time, error rate (4xx/5xx), request volume | Application Logs / Error Logs (Section 14.2) |
| Database health | Connection pool saturation, slow queries | MySQL instance metrics (provider-level) |
| Automation health | Playwright run success/failure rate, run duration | Automation Logs (Section 14.2) |
| Disk usage | `backend/logs/` and `backend/uploads/` growth | Host-level disk monitoring |

## 31.3 Health Check Endpoint
- The API exposes a lightweight `GET /api/v1/health` endpoint (no auth required) returning process
  status and a basic DB connectivity check, used by the reverse proxy / process supervisor and any
  external uptime monitor to detect the app is responsive.

## 31.4 Alerting (MVP Baseline)
- Error-level log entries (Section 14.3) above a basic volume threshold trigger a notification to
  the team (e.g., email/Slack webhook), per the "Alert if severity threshold met" step already
  defined in the error-handling middleware flow (Section 13.5).
- Health check failures (Section 31.3) trigger the same alerting path.
- No dedicated on-call rotation or paging system is part of MVP — alerts go to the whole
  development team.

## 31.5 Routine Maintenance Tasks
| Task | Frequency |
|---|---|
| Review Error Logs for recurring issues | Weekly |
| Review Audit Logs for anomalous admin activity | Weekly |
| Verify backups are current and restorable (Section 30.8) | Monthly |
| Dependency updates (`npm outdated` review — Section 24) | Monthly |
| Disk usage check on `backend/logs/` and `backend/uploads/` | Monthly |
| Rotate/verify `JWT_SECRET` and other credentials | Per security policy (Section 15) |

## 31.6 Incident Response (MVP)
1. Alert received (Section 31.4) or issue reported.
2. Triage using Error Logs (Section 14.2) and the health check endpoint (Section 31.3).
3. If data-related, consult the Disaster Recovery process (Section 30.5).
4. Apply fix via the standard `hotfix/*` branch workflow (Section 20.1.1) if a code change is
   needed; deploy per Section 16.
5. Document the incident and any follow-up action items (feeds into Section 31.5 review cadence).

## 31.7 Explicitly Out of MVP Scope
- Full APM (Application Performance Monitoring) tooling, distributed tracing, and dashboarded
  metrics platforms are deferred until the centralized log aggregation Future Scope item (Section
  23.3) is adopted — MVP monitoring relies on structured logs, the health check endpoint, and basic
  provider-level infrastructure metrics.
