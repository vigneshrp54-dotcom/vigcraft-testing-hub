-- =====================================================================
-- Migration: create-projects-table
-- Module: Database Layer — Project Management
-- Description: Projects, each owned/created by a user. Parent entity
--              for test_suites and defects.
-- Order: 002 — depends on users (001).
-- =====================================================================

CREATE TABLE IF NOT EXISTS projects (
  id               CHAR(36)      NOT NULL,
  project_name     VARCHAR(150)  NOT NULL,
  description      TEXT          NULL,
  status           ENUM('active', 'on_hold', 'completed', 'archived')
                                  NOT NULL DEFAULT 'active',
  created_by       CHAR(36)      NOT NULL,
  created_at       DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at       DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
                                  ON UPDATE CURRENT_TIMESTAMP(3),
  deleted_at       DATETIME(3)   NULL,

  PRIMARY KEY (id),

  CONSTRAINT fk_projects_created_by
    FOREIGN KEY (created_by) REFERENCES users (id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,

  CONSTRAINT chk_projects_project_name_not_blank
    CHECK (CHAR_LENGTH(TRIM(project_name)) > 0),

  -- Soft-delete-safe uniqueness: the third key part normalizes NULL
  -- deleted_at to a fixed sentinel so that MySQL's "NULL != NULL"
  -- unique-index semantics can no longer let two active (not-deleted)
  -- rows share the same (created_by, project_name). Soft-deleted rows
  -- remain distinguishable by their real deleted_at value.
  UNIQUE KEY uq_projects_name_owner
    (created_by, project_name, (COALESCE(deleted_at, '9999-12-31 23:59:59.999'))),

  KEY idx_projects_status (status),
  KEY idx_projects_deleted_at (deleted_at)

) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;
