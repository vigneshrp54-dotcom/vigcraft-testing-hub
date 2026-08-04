# 30. Backup & Disaster Recovery

## 30.1 Overview
This document defines the MVP backup approach and disaster recovery posture for VigCraft Testing
Hub's MySQL database and uploaded files.

## 30.2 What Is Backed Up
| Asset | Backup Approach | Frequency |
|---|---|---|
| MySQL database (all schema/data) | Full logical backup (`mysqldump` or managed-provider snapshot) | Daily |
| `backend/uploads/` (defect attachments, automation report artifacts) | File-level backup/snapshot | Daily |
| `.env.production` (secrets) | Stored securely by the hosting provider, not part of routine backup rotation | N/A — provisioned, not backed up as data |
| Application code | Already durable via Git (`main` branch) — not a backup concern | Continuous (via Git history) |

## 30.3 Backup Retention
- Daily backups retained for **14 days**.
- One backup per week promoted to a **weekly retention** bucket, kept for **90 days**, giving a
  recovery point further back than the rolling daily window without keeping every daily backup
  indefinitely.

## 30.4 Recovery Objectives (MVP Baseline)
| Metric | Target |
|---|---|
| Recovery Point Objective (RPO) | ≤ 24 hours (matches daily backup cadence) |
| Recovery Time Objective (RTO) | ≤ 4 hours for database restore on Production |

These are MVP-appropriate targets; tighter RPO/RTO (e.g., via continuous binlog-based replication)
is a Future Scope item once uptime requirements justify the added operational complexity.

## 30.5 Restore Process (High-Level)
1. Identify the most recent valid backup meeting the incident's recovery point requirement.
2. Provision or reuse a MySQL instance and restore the logical backup.
3. Restore the corresponding `backend/uploads/` snapshot from the same backup window, to keep
   file references in the database consistent with actual files on disk.
4. Point the application's environment configuration (Section 27) at the restored database.
5. Validate core flows (login, project list, test execution, automation run) before declaring the
   restore complete.
6. Record the incident, root cause, and any process gaps for review (ties into Section 31).

## 30.6 Disaster Scenarios Covered (MVP)
- Accidental data deletion (mitigated primarily by the soft-delete strategy in
  `database-design.md` Section 9, with backups as the fallback for anything soft-delete doesn't
  cover, e.g., an erroneous bulk update).
- Database corruption or instance failure.
- Loss of the application server process/instance (recovered by redeploying from `main`, per
  Section 16.7 rollback strategy — no data loss, since the database is separate).

## 30.7 Explicitly Out of MVP Scope
- Multi-region failover and hot standby database replicas are Future Scope, dependent on the read
  replica roadmap item (Section 23.4).
- Automated, tested failover drills are not part of MVP; manual restore testing is performed
  periodically instead (Section 30.8).

## 30.8 Backup Verification
- Restore process (Section 30.5) is manually exercised against a non-production environment on a
  periodic basis to confirm backups are actually restorable, not just present.
