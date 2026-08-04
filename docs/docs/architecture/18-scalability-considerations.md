# 18. Scalability Considerations

## 18.1 Current MVP Posture
The MVP modular monolith is designed to comfortably support initial team-scale usage (single
organization, moderate concurrent users) while establishing clean seams for scaling as usage grows.

## 18.2 Scaling Dimensions

| Dimension | MVP Approach | Scaling Path |
|---|---|---|
| API Layer | Single Node.js process | Stateless design (JWT, no server session) enables horizontal scaling behind a load balancer |
| Database | Single MySQL instance | Read replicas for reporting queries; connection pool tuning; eventual sharding by project/org if needed |
| Automation Execution | In-process queue, limited concurrency | Extract to a dedicated automation worker pool / job queue (e.g., BullMQ + Redis) for higher-volume test runs |
| Reporting/Dashboards | Direct aggregation queries | Introduce materialized summary tables or a reporting read-replica as data volume grows |
| File Storage (reports/evidence) | Local/dedicated file storage | Migrate to object storage (S3-compatible) for durability and scale |
| Static Frontend Assets | Served by app/reverse proxy | Move to CDN for global distribution |

## 18.3 Statelessness as a Scaling Enabler
- Because authentication is JWT-based and no session state is held in-process, additional API
  instances can be added behind a load balancer without sticky-session requirements.

## 18.4 Bottleneck Anticipation
- **Automation execution** is the most likely early bottleneck (CPU/IO-bound Playwright runs); the
  architecture isolates this into its own module specifically so it can be extracted into a
  horizontally scalable worker tier without touching core API/domain logic.
- **Reporting queries** on large execution history are the second likely bottleneck; indexing
  strategy (Section 6) and future materialized views are the mitigation path.

## 18.5 Caching Strategy (Future)
- Read-heavy, slowly-changing data (role/permission lists, project metadata) are candidates for a
  future in-memory cache layer (e.g., Redis) to reduce repeated DB load as traffic grows.

## 18.6 Modular Monolith → Microservices Path
- Because modules already own their own router/controller/service/repository (Section 5.4), the
  highest-value candidates for future service extraction, in priority order, are:
  1. Automation execution (Playwright orchestration)
  2. Reporting/Analytics
  3. Notifications
