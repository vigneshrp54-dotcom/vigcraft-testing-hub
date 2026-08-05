/**
 * @module models/test-case
 * @description
 * Data-access layer for the `test_cases` table. Contains ONLY MySQL
 * query execution — no authorization or other business logic. All
 * queries respect soft-delete (`deleted_at IS NULL`) unless stated
 * otherwise.
 */

const { v4: uuidv4 } = require('uuid');
const { pool } = require('../../config/db.config');

const TABLE = 'test_cases';

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
 * Creates a new test case row, assigned to a test suite.
 *
 * @param {Object} data
 * @param {string} data.testSuiteId
 * @param {string} data.title
 * @param {string} [data.description]
 * @param {string} [data.preconditions]
 * @param {string} [data.steps]
 * @param {string} [data.expectedResult]
 * @param {string} [data.priority='medium']
 * @param {string} [data.status='draft']
 * @param {string} data.createdBy - User ID of the creator.
 * @returns {Promise<Object>} The newly created test case row.
 */
async function create(data) {
  const id = uuidv4();

  await pool.execute(
    `INSERT INTO ${TABLE}
       (id, test_suite_id, title, description, preconditions, steps, expected_result, priority, status, created_by)
     VALUES
       (:id, :testSuiteId, :title, :description, :preconditions, :steps, :expectedResult, :priority, :status, :createdBy)`,
    {
      id,
      testSuiteId: data.testSuiteId,
      title: data.title,
      description: data.description ?? null,
      preconditions: data.preconditions ?? null,
      steps: data.steps ?? null,
      expectedResult: data.expectedResult ?? null,
      priority: data.priority || 'medium',
      status: data.status || 'draft',
      createdBy: data.createdBy,
    }
  );

  return findById(id);
}

/**
 * Finds a test case by ID (excludes soft-deleted rows).
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
 * Retrieves a paginated list of test cases, optionally filtered by
 * test suite, status, or priority.
 *
 * @param {Object} [filters={}]
 * @param {string} [filters.testSuiteId]
 * @param {string} [filters.status]
 * @param {string} [filters.priority]
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

  if (filters.testSuiteId) {
    conditions.push('test_suite_id = :testSuiteId');
    params.testSuiteId = filters.testSuiteId;
  }

  if (filters.status) {
    conditions.push('status = :status');
    params.status = filters.status;
  }

  if (filters.priority) {
    conditions.push('priority = :priority');
    params.priority = filters.priority;
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
 * Updates a test case by ID with the given partial fields.
 *
 * @param {string} id
 * @param {Object} fields - Partial column/value map.
 * @returns {Promise<Object|null>} The updated test case row, or null if not found.
 */
async function update(id, fields) {
  const columnMap = {
    testSuiteId: 'test_suite_id',
    title: 'title',
    description: 'description',
    preconditions: 'preconditions',
    steps: 'steps',
    expectedResult: 'expected_result',
    priority: 'priority',
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
 * Soft-deletes a test case by ID (sets `deleted_at`).
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
