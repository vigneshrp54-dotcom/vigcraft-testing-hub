/**
 * @module models/user
 * @description
 * Data-access layer for the `users` table. Contains ONLY MySQL query
 * execution — no password hashing, authorization checks, or other
 * business logic. All queries respect soft-delete (`deleted_at IS NULL`)
 * unless explicitly stated otherwise.
 */

const { v4: uuidv4 } = require('uuid');
const { pool } = require('../../config/db.config');

const TABLE = 'users';

/**
 * Builds a `SET col = :col, ...` clause and matching params from a
 * partial fields object, skipping undefined values.
 *
 * @param {Object} fields - Partial column/value map.
 * @returns {{ clause: string, params: Object }}
 */
function buildUpdateClause(fields) {
  const entries = Object.entries(fields).filter(([, value]) => value !== undefined);
  const clause = entries.map(([key]) => `${key} = :${key}`).join(', ');
  const params = Object.fromEntries(entries);
  return { clause, params };
}

/**
 * Creates a new user row.
 *
 * @param {Object} data - User fields.
 * @param {string} data.email
 * @param {string} data.passwordHash
 * @param {string} data.firstName
 * @param {string} data.lastName
 * @param {string} [data.role='qa_engineer']
 * @returns {Promise<Object>} The newly created user row.
 */
async function create(data) {
  const id = uuidv4();

  await pool.execute(
    `INSERT INTO ${TABLE} (id, email, password_hash, first_name, last_name, role)
     VALUES (:id, :email, :passwordHash, :firstName, :lastName, :role)`,
    {
      id,
      email: data.email,
      passwordHash: data.passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role || 'qa_engineer',
    }
  );

  return findById(id);
}

/**
 * Finds a user by ID (excludes soft-deleted rows).
 *
 * @param {string} id
 * @returns {Promise<Object|null>}
 */
async function findById(id) {
  const [rows] = await pool.execute(
    `SELECT * FROM ${TABLE} WHERE id = :id AND deleted_at IS NULL LIMIT 1`,
    { id }
  );
  return rows[0] || null;
}

/**
 * Finds a user by email (excludes soft-deleted rows). Used by the
 * authentication service to look up credentials during login.
 *
 * @param {string} email
 * @returns {Promise<Object|null>}
 */
async function findByEmail(email) {
  const [rows] = await pool.execute(
    `SELECT * FROM ${TABLE} WHERE email = :email AND deleted_at IS NULL LIMIT 1`,
    { email }
  );
  return rows[0] || null;
}

/**
 * Retrieves a paginated list of users, optionally filtered by role/status.
 *
 * @param {Object} [filters={}]
 * @param {string} [filters.role]
 * @param {string} [filters.status]
 * @param {number} [page=1]
 * @param {number} [pageSize=20]
 * @returns {Promise<{ items: Object[], totalItems: number }>}
 */
async function findAll(filters = {}, page = 1, pageSize = 20) {
  const MAX_PAGE_SIZE = 100;
  const safePage = Number.isInteger(Number(page)) && Number(page) > 0 ? Number(page) : 1;
  const safePageSize =
    Number.isInteger(Number(pageSize)) && Number(pageSize) > 0
      ? Math.min(Number(pageSize), MAX_PAGE_SIZE)
      : 20;

  const conditions = ['deleted_at IS NULL'];
  const params = {};

  if (filters.role) {
    conditions.push('role = :role');
    params.role = filters.role;
  }

  if (filters.status) {
    conditions.push('status = :status');
    params.status = filters.status;
  }

  const whereClause = conditions.join(' AND ');
  const offset = (safePage - 1) * safePageSize;

  const [rows] = await pool.execute(
    `SELECT * FROM ${TABLE} WHERE ${whereClause}
     ORDER BY created_at DESC LIMIT :limit OFFSET :offset`,
    { ...params, limit: safePageSize, offset }
  );

  const [countRows] = await pool.execute(
    `SELECT COUNT(*) AS total FROM ${TABLE} WHERE ${whereClause}`,
    params
  );

  return { items: rows, totalItems: countRows[0].total };
}

/**
 * Updates a user by ID with the given partial fields.
 *
 * @param {string} id
 * @param {Object} fields - Partial column/value map (e.g. { firstName, status, lastLoginAt }).
 * @returns {Promise<Object|null>} The updated user row, or null if not found.
 */
async function update(id, fields) {
  const columnMap = {
    email: 'email',
    passwordHash: 'password_hash',
    firstName: 'first_name',
    lastName: 'last_name',
    role: 'role',
    status: 'status',
    lastLoginAt: 'last_login_at',
  };

  const mappedFields = {};
  Object.entries(fields).forEach(([key, value]) => {
    if (columnMap[key] && value !== undefined) {
      mappedFields[columnMap[key]] = value;
    }
  });

  const { clause, params } = buildUpdateClause(mappedFields);

  if (!clause) {
    return findById(id);
  }

  await pool.execute(
    `UPDATE ${TABLE} SET ${clause} WHERE id = :id AND deleted_at IS NULL`,
    { ...params, id }
  );

  return findById(id);
}

/**
 * Soft-deletes a user by ID (sets `deleted_at`).
 *
 * @param {string} id
 * @returns {Promise<boolean>} True if a row was affected.
 */
async function softDelete(id) {
  const [result] = await pool.execute(
    `UPDATE ${TABLE} SET deleted_at = NOW() WHERE id = :id AND deleted_at IS NULL`,
    { id }
  );
  return result.affectedRows > 0;
}

module.exports = {
  create,
  findById,
  findByEmail,
  findAll,
  update,
  softDelete,
};
