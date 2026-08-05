-- =====================================================================
-- Migration: create-test-cases-table
-- Module: Database Layer — Test Suite Management
-- Description: Individual test cases, grouped under a test suite.
-- Order: 004 — depends on test_suites (003) and users (001).
-- =====================================================================

CREATE TABLE IF NOT EXISTS test_cases (
  id                 CHAR(36)      NOT NULL,
  test_suite_id      CHAR(36)      NOT NULL,
  title              VARCHAR(200)  NOT NULL,
  description        TEXT          NULL,
  preconditions      TEXT          NULL,
  steps              TEXT          NULL,
  expected_result    TEXT          NULL,
  priority           ENUM('low', 'medium', 'high', 'critical') NOT NULL DEFAULT 'medium',
  status             ENUM('draft', 'active', 'deprecated') NOT NULL DEFAULT 'draft',
  created_by         CHAR(36)      NOT NULL,
  created_at         DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at         DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
                                    ON UPDATE CURRENT_TIMESTAMP(3),
  deleted_at         DATETIME(3)   NULL,

  PRIMARY KEY (id),

  CONSTRAINT fk_test_cases_test_suite
    FOREIGN KEY (test_suite_id) REFERENCES test_suites (id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,

  CONSTRAINT fk_test_cases_created_by
    FOREIGN KEY (created_by) REFERENCES users (id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,

  CONSTRAINT chk_test_cases_title_not_blank
    CHECK (CHAR_LENGTH(TRIM(title)) > 0),

  -- Soft-delete-safe uniqueness (see projects table for rationale).
  UNIQUE KEY uq_test_cases_suite_title
    (test_suite_id, title, (COALESCE(deleted_at, '9999-12-31 23:59:59.999'))),

  KEY idx_test_cases_created_by (created_by),
  KEY idx_test_cases_status (status),
  KEY idx_test_cases_priority (priority),
  KEY idx_test_cases_deleted_at (deleted_at),
  KEY idx_test_cases_suite_status (test_suite_id, status)

) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;
