/**
 * @module models/defect
 * @description
 * Data-access layer for the `defects` table. Contains ONLY MySQL query
 * execution — no authorization or other business logic. All queries
 * respect soft-delete (`deleted_at IS NULL`) unless stated otherwise.
 */

const { v4: uuidv4 } = require('uuid');
const { pool } = require('../../config/db.config');

const TABLE = 'defects';

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
 * Creates a new defect row against a project, optionally linked to a
 * specific test case.
 *
 * @param {Object} data
 * @param {string} data.projectId
 * @param {string} [data.testCaseId]
 * @param {string} data.title
 * @param {string} [data.description]
 * @param {string} [data.severity='medium']
 * @param {string} [data.status='open']
 * @param {string} data.reportedBy - User ID who reported the defect.
 * @param {string} [data.assignedTo] - User ID the defect is assigned to.
 * @returns {Promise<Object>} The newly created defect row.
 */
async function create(data) {
  const id = uuidv4();

  await pool.execute(
    `INSERT INTO ${TABLE}
       (id, project_id, test_case_id, title, description, severity, status, reported_by, assigned_to)
     VALUES
       (:id, :projectId, :testCaseId, :title, :description, :severity, :status, :reportedBy, :assignedTo)`,
    {
      id,
      projectId: data.projectId,
      testCaseId: data.testCaseId ?? null,
      title: data.title,
      description: data.description ?? null,
      severity: data.severity || 'medium',
      status: data.status || 'open',
      reportedBy: data.reportedBy,
      assignedTo: data.assignedTo ?? null,
    }
  );

  return findById(id);
}

/**
 * Finds a defect by ID (excludes soft-deleted rows).
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
 * Retrieves a paginated list of defects, optionally filtered by
 * project, status, severity, or assignee.
 *
 * @param {Object} [filters={}]
 * @param {string} [filters.projectId]
 * @param {string} [filters.status]
 * @param {string} [filters.severity]
 * @param {string} [filters.assignedTo]
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

  if (filters.projectId) {
    conditions.push('project_id = :projectId');
    params.projectId = filters.projectId;
  }

  if (filters.status) {
    conditions.push('status = :status');
    params.status = filters.status;
  }

  if (filters.severity) {
    conditions.push('severity = :severity');
    params.severity = filters.severity;
  }

  if (filters.assignedTo) {
    conditions.push('assigned_to = :assignedTo');
    params.assignedTo = filters.assignedTo;
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
 * Updates a defect by ID with the given partial fields
 * (e.g. status, severity, assignment).
 *
 * @param {string} id
 * @param {Object} fields - Partial column/value map.
 * @returns {Promise<Object|null>} The updated defect row, or null if not found.
 */
async function update(id, fields) {
  const columnMap = {
    testCaseId: 'test_case_id',
    title: 'title',
    description: 'description',
    severity: 'severity',
    status: 'status',
    assignedTo: 'assigned_to',
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
 * Soft-deletes a defect by ID (sets `deleted_at`).
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
