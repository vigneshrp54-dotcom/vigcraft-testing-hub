/**
 * @module models/execution
 * @description
 * Data-access layer for the `test_executions` table. Contains ONLY
 * MySQL query execution — no authorization or other business logic.
 * All queries respect soft-delete (`deleted_at IS NULL`) unless stated
 * otherwise.
 */

const { v4: uuidv4 } = require('uuid');
const { pool } = require('../../config/db.config');

const TABLE = 'test_executions';

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
 * Creates a new test execution row for a test case.
 *
 * @param {Object} data
 * @param {string} data.testCaseId
 * @param {string} [data.defectId]
 * @param {string} [data.status='in_progress']
 * @param {string} [data.actualResult]
 * @param {string} [data.executionNotes]
 * @param {string} [data.environment]
 * @param {number} [data.durationMs]
 * @param {string} data.executedBy - User ID who ran the execution.
 * @returns {Promise<Object>} The newly created test execution row.
 */
async function create(data) {
  const id = uuidv4();

  await pool.execute(
    `INSERT INTO ${TABLE}
       (id, test_case_id, defect_id, status, actual_result, execution_notes, environment, duration_ms, executed_by)
     VALUES
       (:id, :testCaseId, :defectId, :status, :actualResult, :executionNotes, :environment, :durationMs, :executedBy)`,
    {
      id,
      testCaseId: data.testCaseId,
      defectId: data.defectId ?? null,
      status: data.status || 'in_progress',
      actualResult: data.actualResult ?? null,
      executionNotes: data.executionNotes ?? null,
      environment: data.environment ?? null,
      durationMs: data.durationMs ?? null,
      executedBy: data.executedBy,
    }
  );

  return findById(id);
}

/**
 * Finds a test execution by ID (excludes soft-deleted rows).
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
 * Retrieves a paginated list of test executions, optionally filtered
 * by test case or status.
 *
 * @param {Object} [filters={}]
 * @param {string} [filters.testCaseId]
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

  if (filters.testCaseId) {
    conditions.push('test_case_id = :testCaseId');
    params.testCaseId = filters.testCaseId;
  }

  if (filters.status) {
    conditions.push('status = :status');
    params.status = filters.status;
  }

  const whereClause = conditions.join(' AND ');
  const offset = (safePage - 1) * safePageSize;

  const [rows] = await pool.execute(
    `SELECT * FROM ${TABLE} WHERE ${whereClause}
     ORDER BY executed_at DESC LIMIT :limit OFFSET :offset`,
    { ...params, limit: safePageSize, offset }
  );

  const [countRows] = await pool.execute(
    `SELECT COUNT(*) AS total FROM ${TABLE} WHERE ${whereClause}`,
    params
  );

  return { items: rows, totalItems: countRows[0].total };
}

/**
 * Updates a test execution by ID with the given partial fields
 * (e.g. status, actual result, linked defect).
 *
 * @param {string} id
 * @param {Object} fields - Partial column/value map.
 * @returns {Promise<Object|null>} The updated test execution row, or null if not found.
 */
async function update(id, fields) {
  const columnMap = {
    defectId: 'defect_id',
    status: 'status',
    actualResult: 'actual_result',
    executionNotes: 'execution_notes',
    environment: 'environment',
    durationMs: 'duration_ms',
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
 * Soft-deletes a test execution by ID (sets `deleted_at`).
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
