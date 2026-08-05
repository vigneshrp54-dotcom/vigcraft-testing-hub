/**
 * @module models/project
 * @description
 * Data-access layer for the `projects` table. Contains ONLY MySQL query
 * execution — no authorization or other business logic. All queries
 * respect soft-delete (`deleted_at IS NULL`) unless stated otherwise.
 */

const { v4: uuidv4 } = require('uuid');
const { pool } = require('../../config/db.config');

const TABLE = 'projects';

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
 * Creates a new project row.
 *
 * @param {Object} data
 * @param {string} data.projectName
 * @param {string} [data.description]
 * @param {string} [data.status='active']
 * @param {string} data.createdBy - User ID of the owner.
 * @returns {Promise<Object>} The newly created project row.
 */
async function create(data) {
  const id = uuidv4();

  await pool.execute(
    `INSERT INTO ${TABLE} (id, project_name, description, status, created_by)
     VALUES (:id, :projectName, :description, :status, :createdBy)`,
    {
      id,
      projectName: data.projectName,
      description: data.description ?? null,
      status: data.status || 'active',
      createdBy: data.createdBy,
    }
  );

  return findById(id);
}

/**
 * Finds a project by ID (excludes soft-deleted rows).
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
 * Retrieves a paginated list of projects, optionally filtered by
 * status or owner.
 *
 * @param {Object} [filters={}]
 * @param {string} [filters.status]
 * @param {string} [filters.createdBy]
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

  if (filters.status) {
    conditions.push('status = :status');
    params.status = filters.status;
  }

  if (filters.createdBy) {
    conditions.push('created_by = :createdBy');
    params.createdBy = filters.createdBy;
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
 * Updates a project by ID with the given partial fields.
 *
 * @param {string} id
 * @param {Object} fields - Partial column/value map (e.g. { projectName, status }).
 * @returns {Promise<Object|null>} The updated project row, or null if not found.
 */
async function update(id, fields) {
  const columnMap = {
    projectName: 'project_name',
    description: 'description',
    status: 'status',
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
 * Soft-deletes a project by ID (sets `deleted_at`).
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
  findAll,
  update,
  softDelete,
};
