'use strict';

/**
 * @module services/test-suite.service
 * @description Business logic layer for test suite management.
 * Consumes the TestSuite and Project models only. Contains no SQL — all
 * persistence is delegated to `models/test-suite.model.js`.
 */

const TestSuiteModel = require('../models/test-suite.model');
const ProjectModel = require('../models/project.model');
const ApiError = require('../utils/api-error.util');
const logger = require('../utils/logger.util');

const CREATABLE_FIELDS = ['name', 'description'];
const UPDATABLE_FIELDS = ['name', 'description'];
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

/**
 * Return a shallow copy of `source` containing only whitelisted keys.
 * Prevents mass-assignment of fields the client should never control
 * (e.g. project_id, id, created_by).
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
 * Verify the requesting user has access to the parent project.
 * @param {number} projectId
 * @param {number} userId
 * @returns {Promise<object>} The parent project record.
 * @throws {ApiError} 404 if the project doesn't exist, 403 if access is denied.
 */
async function assertProjectAccess(projectId, userId) {
  const project = await ProjectModel.findById(projectId);
  if (!project) {
    throw ApiError.notFound('Project not found');
  }

  const hasAccess = await ProjectModel.userHasAccess(projectId, userId);
  if (!hasAccess) {
    throw ApiError.forbidden('You do not have access to this project');
  }

  return project;
}

/**
 * Create a new test suite under a project.
 * @param {number} projectId
 * @param {number} userId
 * @param {{name: string, description?: string}} payload
 * @returns {Promise<object>} The newly created test suite.
 * @throws {ApiError} 404/403 via project access checks.
 */
async function createTestSuite(projectId, userId, payload) {
  await assertProjectAccess(projectId, userId);

  const testSuite = await TestSuiteModel.create({
    ...pickAllowedFields(payload, CREATABLE_FIELDS),
    project_id: projectId,
    created_by: userId,
  });

  logger.info(`Test suite created: ${testSuite.id} in project ${projectId}`);
  return testSuite;
}

/**
 * Retrieve a single test suite by id.
 * @param {number} suiteId
 * @param {number} userId
 * @returns {Promise<object>} The test suite record.
 * @throws {ApiError} 404 if not found, 403 if access is denied.
 */
async function getTestSuiteById(suiteId, userId) {
  const testSuite = await TestSuiteModel.findById(suiteId);
  if (!testSuite) {
    throw ApiError.notFound('Test suite not found');
  }

  await assertProjectAccess(testSuite.project_id, userId);
  return testSuite;
}

/**
 * Retrieve all test suites belonging to a project.
 * @param {number} projectId
 * @param {number} userId
 * @param {{page?: number, limit?: number, search?: string}} [options]
 * @returns {Promise<{items: object[], total: number, page: number, limit: number}>}
 */
async function getTestSuitesByProject(projectId, userId, options = {}) {
  await assertProjectAccess(projectId, userId);

  const page = options.page && options.page > 0 ? options.page : 1;
  const limit =
    options.limit && options.limit > 0
      ? Math.min(options.limit, MAX_LIMIT)
      : DEFAULT_LIMIT;

  const { items, total } = await TestSuiteModel.findAllByProject(projectId, {
    page,
    limit,
    search: options.search,
  });

  return { items, total, page, limit };
}

/**
 * Update an existing test suite.
 * @param {number} suiteId
 * @param {number} userId
 * @param {object} updates - Partial test suite fields to update.
 * @returns {Promise<object>} The updated test suite.
 * @throws {ApiError} 404 if not found, 403 if access is denied.
 */
async function updateTestSuite(suiteId, userId, updates) {
  const testSuite = await TestSuiteModel.findById(suiteId);
  if (!testSuite) {
    throw ApiError.notFound('Test suite not found');
  }

  await assertProjectAccess(testSuite.project_id, userId);

  const updatedSuite = await TestSuiteModel.update(
    suiteId,
    pickAllowedFields(updates, UPDATABLE_FIELDS)
  );
  logger.info(`Test suite updated: ${suiteId} by user ${userId}`);
  return updatedSuite;
}

/**
 * Delete a test suite.
 * @param {number} suiteId
 * @param {number} userId
 * @returns {Promise<void>}
 * @throws {ApiError} 404 if not found, 403 if access is denied.
 */
async function deleteTestSuite(suiteId, userId) {
  const testSuite = await TestSuiteModel.findById(suiteId);
  if (!testSuite) {
    throw ApiError.notFound('Test suite not found');
  }

  await assertProjectAccess(testSuite.project_id, userId);

  await TestSuiteModel.remove(suiteId);
  logger.info(`Test suite deleted: ${suiteId} by user ${userId}`);
}

module.exports = {
  createTestSuite,
  getTestSuiteById,
  getTestSuitesByProject,
  updateTestSuite,
  deleteTestSuite,
};
