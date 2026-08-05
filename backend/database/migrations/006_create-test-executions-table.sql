-- =====================================================================
-- Migration: create-test-executions-table
-- Module: Database Layer — Test Suite Management
-- Description: Records each execution run of a test case (pass/fail/etc),
--              who executed it, and an optional link to a raised defect.
-- Order: 006 — depends on test_cases (004), defects (005), users (001).
-- =====================================================================

CREATE TABLE IF NOT EXISTS test_executions (
  id               CHAR(36)      NOT NULL,
  test_case_id     CHAR(36)      NOT NULL,
  defect_id        CHAR(36)      NULL,
  status           ENUM('passed', 'failed', 'blocked', 'skipped', 'in_progress')
                                  NOT NULL DEFAULT 'in_progress',
  actual_result    TEXT          NULL,
  execution_notes  TEXT          NULL,
  environment      VARCHAR(100)  NULL,
  duration_ms      INT UNSIGNED  NULL,
  executed_by      CHAR(36)      NOT NULL,
  executed_at      DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  created_at       DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at       DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
                                  ON UPDATE CURRENT_TIMESTAMP(3),
  deleted_at       DATETIME(3)   NULL,

  PRIMARY KEY (id),

  CONSTRAINT fk_test_executions_test_case
    FOREIGN KEY (test_case_id) REFERENCES test_cases (id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,

  CONSTRAINT fk_test_executions_defect
    FOREIGN KEY (defect_id) REFERENCES defects (id)
    ON DELETE SET NULL
    ON UPDATE CASCADE,

  CONSTRAINT fk_test_executions_executed_by
    FOREIGN KEY (executed_by) REFERENCES users (id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,

  CONSTRAINT chk_test_executions_duration_non_negative
    CHECK (duration_ms IS NULL OR duration_ms >= 0),

  KEY idx_test_executions_test_case_id (test_case_id),
  KEY idx_test_executions_defect_id (defect_id),
  KEY idx_test_executions_executed_by (executed_by),
  KEY idx_test_executions_status (status),
  KEY idx_test_executions_executed_at (executed_at),
  KEY idx_test_executions_deleted_at (deleted_at),
  KEY idx_test_executions_case_status (test_case_id, status)

) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;
