'use strict';

/**
 * @module services/execution.service
 * @description Business logic layer for test execution tracking.
 * Consumes the Execution, TestCase, and Project models only. Contains no
 * SQL — all persistence is delegated to `models/execution.model.js`.
 */

const ExecutionModel = require('../models/execution.model');
const TestCaseModel = require('../models/test-case.model');
const ProjectModel = require('../models/project.model');
const ApiError = require('../utils/api-error.util');
const logger = require('../utils/logger.util');

const VALID_STATUSES = ['pass', 'fail', 'blocked', 'skipped', 'in_progress'];
const CREATABLE_FIELDS = ['status', 'actual_result', 'notes', 'duration_ms'];
const UPDATABLE_FIELDS = ['status', 'actual_result', 'notes', 'duration_ms'];
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

/**
 * Return a shallow copy of `source` containing only whitelisted keys.
 * Prevents mass-assignment of fields the client should never control
 * (e.g. test_case_id, executed_by, executed_at, id).
 * @param {object} source
 * @param {string[]} allowedFields
 * @returns {object}
 */
function pickAllowedFields(source, allowedFields) {
  const result = {};
  for (const field of allowedFields) {
    if (Object.prototype.hasOwnProperty.call(source, field)) {
      result[field] = source[field];
    }
  }
  return result;
}

/**
 * Verify the requesting user has access to the parent test case's project,
 * and return the parent test case.
 * @param {number} testCaseId
 * @param {number} userId
 * @returns {Promise<object>} The parent test case record.
 * @throws {ApiError} 404 if the test case doesn't exist, 403 if access is denied.
 */
async function assertTestCaseAccess(testCaseId, userId) {
  const testCase = await TestCaseModel.findById(testCaseId);
  if (!testCase) {
    throw ApiError.notFound('Test case not found');
  }

  const hasAccess = await ProjectModel.userHasAccessViaTestCase(testCaseId, userId);
  if (!hasAccess) {
    throw ApiError.forbidden('You do not have access to this test case');
  }

  return testCase;
}

/**
 * Record a new execution result for a test case.
 * @param {number} testCaseId
 * @param {number} userId
 * @param {{status: string, actual_result?: string, notes?: string, duration_ms?: number}} payload
 * @returns {Promise<object>} The newly created execution record.
 * @throws {ApiError} 404/403 via test case access checks, 400 for an invalid status.
 */
async function recordExecution(testCaseId, userId, payload) {
  await assertTestCaseAccess(testCaseId, userId);

  if (!VALID_STATUSES.includes(payload.status)) {
    throw ApiError.badRequest(`Invalid execution status. Allowed values: ${VALID_STATUSES.join(', ')}`);
  }

  const execution = await ExecutionModel.create({
    ...pickAllowedFields(payload, CREATABLE_FIELDS),
    test_case_id: testCaseId,
    executed_by: userId,
    executed_at: new Date(),
  });

  logger.info(`Execution recorded: ${execution.id} for test case ${testCaseId} [${payload.status}]`);
  return execution;
}

/**
 * Retrieve a single execution record by id.
 * @param {number} executionId
 * @param {number} userId
 * @returns {Promise<object>} The execution record.
 * @throws {ApiError} 404 if not found, 403 if access is denied.
 */
async function getExecutionById(executionId, userId) {
  const execution = await ExecutionModel.findById(executionId);
  if (!execution) {
    throw ApiError.notFound('Execution record not found');
  }

  await assertTestCaseAccess(execution.test_case_id, userId);
  return execution;
}

/**
 * Retrieve the execution history for a given test case.
 * @param {number} testCaseId
 * @param {number} userId
 * @param {{page?: number, limit?: number, status?: string}} [options]
 * @returns {Promise<{items: object[], total: number, page: number, limit: number}>}
 */
async function getExecutionsByTestCase(testCaseId, userId, options = {}) {
  await assertTestCaseAccess(testCaseId, userId);

  const page = options.page && options.page > 0 ? options.page : 1;
  const limit =
    options.limit && options.limit > 0
      ? Math.min(options.limit, MAX_LIMIT)
      : DEFAULT_LIMIT;

  const { items, total } = await ExecutionModel.findAllByTestCase(testCaseId, {
    page,
    limit,
    status: options.status,
  });

  return { items, total, page, limit };
}

/**
 * Retrieve aggregate execution statistics for a project (pass/fail/blocked counts).
 * @param {number} projectId
 * @param {number} userId
 * @returns {Promise<object>} Aggregated execution statistics.
 * @throws {ApiError} 404 if the project doesn't exist, 403 if access is denied.
 */
async function getExecutionSummaryByProject(projectId, userId) {
  const project = await ProjectModel.findById(projectId);
  if (!project) {
    throw ApiError.notFound('Project not found');
  }

  const hasAccess = await ProjectModel.userHasAccess(projectId, userId);
  if (!hasAccess) {
    throw ApiError.forbidden('You do not have access to this project');
  }

  return ExecutionModel.getSummaryByProject(projectId);
}

/**
 * Update an existing execution record (e.g. correcting notes or actual result).
 * @param {number} executionId
 * @param {number} userId
 * @param {object} updates - Partial execution fields to update.
 * @returns {Promise<object>} The updated execution record.
 * @throws {ApiError} 404 if not found, 403 if access is denied, 400 for an invalid status.
 */
async function updateExecution(executionId, userId, updates) {
  const execution = await ExecutionModel.findById(executionId);
  if (!execution) {
    throw ApiError.notFound('Execution record not found');
  }

  await assertTestCaseAccess(execution.test_case_id, userId);

  if (updates.status && !VALID_STATUSES.includes(updates.status)) {
    throw ApiError.badRequest(`Invalid execution status. Allowed values: ${VALID_STATUSES.join(', ')}`);
  }

  const updatedExecution = await ExecutionModel.update(
    executionId,
    pickAllowedFields(updates, UPDATABLE_FIELDS)
  );
  logger.info(`Execution updated: ${executionId} by user ${userId}`);
  return updatedExecution;
}

/**
 * Delete an execution record.
 * @param {number} executionId
 * @param {number} userId
 * @returns {Promise<void>}
 * @throws {ApiError} 404 if not found, 403 if access is denied.
 */
async function deleteExecution(executionId, userId) {
  const execution = await ExecutionModel.findById(executionId);
  if (!execution) {
    throw ApiError.notFound('Execution record not found');
  }

  await assertTestCaseAccess(execution.test_case_id, userId);

  await ExecutionModel.remove(executionId);
  logger.info(`Execution deleted: ${executionId} by user ${userId}`);
}

module.exports = {
  recordExecution,
  getExecutionById,
  getExecutionsByTestCase,
  getExecutionSummaryByProject,
  updateExecution,
  deleteExecution,
};
