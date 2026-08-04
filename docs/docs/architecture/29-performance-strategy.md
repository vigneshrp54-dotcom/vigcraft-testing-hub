# 29. Performance Strategy

## 29.1 Overview
This document defines the MVP-appropriate performance practices for VigCraft Testing Hub, building
on the scalability seams already identified in Section 18 without introducing premature
optimization.

## 29.2 Backend Performance Practices (MVP)
- **Connection pooling**: `mysql2` connection pool (Section 5/6) reused across requests rather than
  opening a new connection per query.
- **Query discipline**: every list endpoint (Section 28.6) is paginated by default — no unbounded
  `SELECT *` responses.
- **Indexing**: foreign key columns and any column used in a `WHERE`/`ORDER BY` on a list endpoint
  (e.g., `project_id`, `status`, `created_at`) are indexed per the naming convention in
  `database-design.md` Section 6.
- **N+1 avoidance**: Repository methods that need related data use explicit joins or batched lookups
  rather than looping queries per row.

## 29.3 Frontend Performance Practices (MVP)
- Since the frontend has no build step (Section 4), performance focuses on keeping pages lean:
  minimal, page-scoped CSS/JS (Section 4.4) rather than one large bundle loaded on every page.
- Images/icons under `assets/` are served at appropriate sizes; no unnecessarily large media assets.
- `responsive.css` avoids expensive selectors/animations that could jank on lower-powered devices.

## 29.4 Automation Performance Practices (MVP)
- Playwright runs (Section 11) execute with a bounded concurrency/timeout configuration so a single
  slow or hanging run cannot block the automation queue indefinitely (ties into Automation Error
  handling, Section 13.7).

## 29.5 Performance Targets (MVP Baseline)
| Metric | MVP Target |
|---|---|
| API response time (simple CRUD, p95) | < 300ms |
| API response time (list/report endpoints, p95) | < 800ms |
| Page load (initial HTML + CSS + JS, on broadband) | < 2s |
| Playwright run trigger acknowledgment | < 1s (execution itself is async, Section 10.7) |

These are MVP sanity targets, not SLAs — they exist to catch regressions early, not to justify
premature infrastructure investment.

## 29.6 What Is Explicitly Deferred
Caching layers, read replicas, materialized reporting tables, and message-queue-based async
processing are **not** part of MVP performance strategy — they are Future Scope items (Section 23.4,
Phase 3), to be adopted only when the targets in Section 29.5 are measurably failing under real
usage, not preemptively.

## 29.7 Monitoring Tie-In
Ongoing performance visibility (response time tracking, slow query identification) is covered
operationally in Section 31 (Monitoring & Maintenance); this document defines the practices and
targets, Section 31 defines how they are observed in production.
