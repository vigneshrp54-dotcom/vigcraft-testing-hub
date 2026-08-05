-- =====================================================================
-- Migration: create-defects-table
-- Module: Database Layer — Test Suite Management
-- Description: Defects raised against a test case within a project.
--              test_case_id is nullable to support defects logged
--              directly against a project without a specific test case.
-- Order: 005 — depends on projects (002), test_cases (004), users (001).
-- =====================================================================

CREATE TABLE IF NOT EXISTS defects (
  id               CHAR(36)      NOT NULL,
  project_id       CHAR(36)      NOT NULL,
  test_case_id     CHAR(36)      NULL,
  title            VARCHAR(200)  NOT NULL,
  description      TEXT          NULL,
  severity         ENUM('low', 'medium', 'high', 'critical') NOT NULL DEFAULT 'medium',
  status           ENUM('open', 'in_progress', 'resolved', 'closed', 'reopened')
                                  NOT NULL DEFAULT 'open',
  reported_by      CHAR(36)      NOT NULL,
  assigned_to      CHAR(36)      NULL,
  created_at       DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at       DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
                                  ON UPDATE CURRENT_TIMESTAMP(3),
  deleted_at       DATETIME(3)   NULL,

  PRIMARY KEY (id),

  CONSTRAINT fk_defects_project
    FOREIGN KEY (project_id) REFERENCES projects (id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,

  CONSTRAINT fk_defects_test_case
    FOREIGN KEY (test_case_id) REFERENCES test_cases (id)
    ON DELETE SET NULL
    ON UPDATE CASCADE,

  CONSTRAINT fk_defects_reported_by
    FOREIGN KEY (reported_by) REFERENCES users (id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,

  CONSTRAINT fk_defects_assigned_to
    FOREIGN KEY (assigned_to) REFERENCES users (id)
    ON DELETE SET NULL
    ON UPDATE CASCADE,

  CONSTRAINT chk_defects_title_not_blank
    CHECK (CHAR_LENGTH(TRIM(title)) > 0),

  KEY idx_defects_project_id (project_id),
  KEY idx_defects_test_case_id (test_case_id),
  KEY idx_defects_reported_by (reported_by),
  KEY idx_defects_assigned_to (assigned_to),
  KEY idx_defects_status (status),
  KEY idx_defects_severity (severity),
  KEY idx_defects_deleted_at (deleted_at),
  KEY idx_defects_project_status (project_id, status)

) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;
