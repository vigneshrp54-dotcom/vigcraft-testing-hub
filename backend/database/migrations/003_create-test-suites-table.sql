-- =====================================================================
-- Migration: create-test-suites-table
-- Module: Test Suite Management
-- Description: Creates the test_suites table, linked to projects (FK)
--              and created_by (FK to users), with soft-delete support.
-- Order: 003 — depends on projects (002) and users (001).
-- =====================================================================

CREATE TABLE IF NOT EXISTS test_suites (
  id               CHAR(36)      NOT NULL,
  project_id       CHAR(36)      NOT NULL,
  suite_name       VARCHAR(150)  NOT NULL,
  description      TEXT          NULL,
  status           ENUM('active', 'inactive', 'archived') NOT NULL DEFAULT 'active',
  created_by       CHAR(36)      NOT NULL,
  created_at       DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at       DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
                                  ON UPDATE CURRENT_TIMESTAMP(3),
  deleted_at       DATETIME(3)   NULL,

  PRIMARY KEY (id),

  CONSTRAINT fk_test_suites_project
    FOREIGN KEY (project_id) REFERENCES projects (id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,

  CONSTRAINT fk_test_suites_created_by
    FOREIGN KEY (created_by) REFERENCES users (id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,

  CONSTRAINT chk_test_suites_suite_name_not_blank
    CHECK (CHAR_LENGTH(TRIM(suite_name)) > 0),

  -- Soft-delete-safe uniqueness (see projects table for rationale).
  UNIQUE KEY uq_test_suites_project_suite_name
    (project_id, suite_name, (COALESCE(deleted_at, '9999-12-31 23:59:59.999'))),

  KEY idx_test_suites_created_by (created_by),
  KEY idx_test_suites_status (status),
  KEY idx_test_suites_deleted_at (deleted_at),
  KEY idx_test_suites_project_status (project_id, status)

) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;
