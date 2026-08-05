'use strict';

/**
 * @module services/test-case.service
 * @description Business logic layer for test case management.
 * Consumes the TestCase, TestSuite, and Project models only. Contains no
 * SQL — all persistence is delegated to `models/test-case.model.js`.
 */

const TestCaseModel = require('../models/test-case.model');
const TestSuiteModel = require('../models/test-suite.model');
const ProjectModel = require('../models/project.model');
const ApiError = require('../utils/api-error.util');
const logger = require('../utils/logger.util');

const VALID_TYPES = ['manual', 'api', 'database', 'automation'];
const VALID_PRIORITIES = ['low', 'medium', 'high', 'critical'];
const CREATABLE_FIELDS = ['title', 'description', 'steps', 'expected_result', 'type', 'priority'];
const UPDATABLE_FIELDS = ['title', 'description', 'steps', 'expected_result', 'type', 'priority'];
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

/**
 * Return a shallow copy of `source` containing only whitelisted keys.
 * Prevents mass-assignment of fields the client should never control
 * (e.g. suite_id, id, created_by).
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
 * Verify the requesting user has access to the parent suite's project,
 * and return the parent suite.
 * @param {number} suiteId
 * @param {number} userId
 * @returns {Promise<object>} The parent test suite record.
 * @throws {ApiError} 404 if the suite doesn't exist, 403 if access is denied.
 */
async function assertSuiteAccess(suiteId, userId) {
  const testSuite = await TestSuiteModel.findById(suiteId);
  if (!testSuite) {
    throw ApiError.notFound('Test suite not found');
  }

  const hasAccess = await ProjectModel.userHasAccess(testSuite.project_id, userId);
  if (!hasAccess) {
    throw ApiError.forbidden('You do not have access to this test suite');
  }

  return testSuite;
}

/**
 * Validate the test case type and priority enums.
 * @param {{type?: string, priority?: string}} payload
 * @throws {ApiError} 400 if an invalid type or priority is supplied.
 */
function validateEnums(payload) {
  if (payload.type && !VALID_TYPES.includes(payload.type)) {
    throw ApiError.badRequest(`Invalid test case type. Allowed values: ${VALID_TYPES.join(', ')}`);
  }
  if (payload.priority && !VALID_PRIORITIES.includes(payload.priority)) {
    throw ApiError.badRequest(`Invalid priority. Allowed values: ${VALID_PRIORITIES.join(', ')}`);
  }
}

/**
 * Create a new test case under a test suite.
 * @param {number} suiteId
 * @param {number} userId
 * @param {{title: string, description?: string, steps?: string, expected_result?: string, type?: string, priority?: string}} payload
 * @returns {Promise<object>} The newly created test case.
 * @throws {ApiError} 404/403 via suite access checks, 400 for invalid enums.
 */
async function createTestCase(suiteId, userId, payload) {
  await assertSuiteAccess(suiteId, userId);
  validateEnums(payload);

  const testCase = await TestCaseModel.create({
    ...pickAllowedFields(payload, CREATABLE_FIELDS),
    suite_id: suiteId,
    created_by: userId,
    type: payload.type || 'manual',
    priority: payload.priority || 'medium',
  });

  logger.info(`Test case created: ${testCase.id} in suite ${suiteId}`);
  return testCase;
}

/**
 * Retrieve a single test case by id.
 * @param {number} testCaseId
 * @param {number} userId
 * @returns {Promise<object>} The test case record.
 * @throws {ApiError} 404 if not found, 403 if access is denied.
 */
async function getTestCaseById(testCaseId, userId) {
  const testCase = await TestCaseModel.findById(testCaseId);
  if (!testCase) {
    throw ApiError.notFound('Test case not found');
  }

  await assertSuiteAccess(testCase.suite_id, userId);
  return testCase;
}

/**
 * Retrieve all test cases belonging to a test suite.
 * @param {number} suiteId
 * @param {number} userId
 * @param {{page?: number, limit?: number, type?: string, priority?: string, search?: string}} [options]
 * @returns {Promise<{items: object[], total: number, page: number, limit: number}>}
 */
async function getTestCasesBySuite(suiteId, userId, options = {}) {
  await assertSuiteAccess(suiteId, userId);

  const page = options.page && options.page > 0 ? options.page : 1;
  const limit =
    options.limit && options.limit > 0
      ? Math.min(options.limit, MAX_LIMIT)
      : DEFAULT_LIMIT;

  const { items, total } = await TestCaseModel.findAllBySuite(suiteId, {
    page,
    limit,
    type: options.type,
    priority: options.priority,
    search: options.search,
  });

  return { items, total, page, limit };
}

/**
 * Update an existing test case.
 * @param {number} testCaseId
 * @param {number} userId
 * @param {object} updates - Partial test case fields to update.
 * @returns {Promise<object>} The updated test case.
 * @throws {ApiError} 404 if not found, 403 if access is denied, 400 for invalid enums.
 */
async function updateTestCase(testCaseId, userId, updates) {
  const testCase = await TestCaseModel.findById(testCaseId);
  if (!testCase) {
    throw ApiError.notFound('Test case not found');
  }

  await assertSuiteAccess(testCase.suite_id, userId);
  validateEnums(updates);

  const updatedTestCase = await TestCaseModel.update(
    testCaseId,
    pickAllowedFields(updates, UPDATABLE_FIELDS)
  );
  logger.info(`Test case updated: ${testCaseId} by user ${userId}`);
  return updatedTestCase;
}

/**
 * Delete a test case.
 * @param {number} testCaseId
 * @param {number} userId
 * @returns {Promise<void>}
 * @throws {ApiError} 404 if not found, 403 if access is denied.
 */
async function deleteTestCase(testCaseId, userId) {
  const testCase = await TestCaseModel.findById(testCaseId);
  if (!testCase) {
    throw ApiError.notFound('Test case not found');
  }

  await assertSuiteAccess(testCase.suite_id, userId);

  await TestCaseModel.remove(testCaseId);
  logger.info(`Test case deleted: ${testCaseId} by user ${userId}`);
}

module.exports = {
  createTestCase,
  getTestCaseById,
  getTestCasesBySuite,
  updateTestCase,
  deleteTestCase,
};
