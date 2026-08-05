-- =====================================================================
-- Migration: create-users-table
-- Module: Database Layer — Core / Authentication
-- Description: Base user identity table. All other tables (projects,
--              test_suites, test_cases, defects) reference this table.
-- Order: 001 — must run first (no dependencies).
-- =====================================================================

CREATE TABLE IF NOT EXISTS users (
  id               CHAR(36)      NOT NULL,
  email            VARCHAR(255)  NOT NULL,
  password_hash    VARCHAR(255)  NOT NULL,
  first_name       VARCHAR(100)  NOT NULL,
  last_name        VARCHAR(100)  NOT NULL,
  role             ENUM('admin', 'manager', 'qa_engineer', 'viewer')
                                  NOT NULL DEFAULT 'qa_engineer',
  status           ENUM('active', 'inactive', 'suspended') NOT NULL DEFAULT 'active',
  last_login_at    DATETIME(3)   NULL,
  created_at       DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at       DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
                                  ON UPDATE CURRENT_TIMESTAMP(3),
  deleted_at       DATETIME(3)   NULL,

  PRIMARY KEY (id),

  CONSTRAINT chk_users_first_name_not_blank
    CHECK (CHAR_LENGTH(TRIM(first_name)) > 0),

  CONSTRAINT chk_users_last_name_not_blank
    CHECK (CHAR_LENGTH(TRIM(last_name)) > 0),

  CONSTRAINT chk_users_email_format
    CHECK (email LIKE '%_@_%._%'),

  UNIQUE KEY uq_users_email (email),

  KEY idx_users_status (status),
  KEY idx_users_role (role),
  KEY idx_users_deleted_at (deleted_at)

) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;
