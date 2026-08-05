/**
 * @module controllers/test-suite
 * @description
 * HTTP layer for Test Suite Management. Controllers only translate HTTP
 * requests into service calls and shape the HTTP response — all
 * business logic and persistence lives in `test-suite.service.js`.
 */

const asyncHandler = require('../utils/async-handler.util');
const { successResponse, paginationResponse } = require('../utils/response.util');
const testSuiteService = require('../services/test-suite.service');

/**
 * Creates a new test suite (assigned to a project).
 *
 * @route POST /api/v1/test-suites
 * @access Private
 */
const createTestSuite = asyncHandler(async (req, res) => {
  const testSuite = await testSuiteService.create(req.body, req.user);

  return successResponse(res, {
    statusCode: 201,
    data: testSuite,
  });
});

/**
 * Retrieves a paginated list of test suites (optionally filtered by project).
 *
 * @route GET /api/v1/test-suites
 * @access Private
 */
const getTestSuites = asyncHandler(async (req, res) => {
  const { items, page, pageSize, totalItems } = await testSuiteService.getAll(req.query, req.user);

  return paginationResponse(res, {
    data: items,
    page,
    pageSize,
    totalItems,
  });
});

/**
 * Retrieves a single test suite by ID.
 *
 * @route GET /api/v1/test-suites/:id
 * @access Private
 */
const getTestSuiteById = asyncHandler(async (req, res) => {
  const testSuite = await testSuiteService.getById(req.params.id, req.user);

  return successResponse(res, {
    statusCode: 200,
    data: testSuite,
  });
});

/**
 * Updates an existing test suite (including reassigning to a project).
 *
 * @route PUT /api/v1/test-suites/:id
 * @access Private
 */
const updateTestSuite = asyncHandler(async (req, res) => {
  const testSuite = await testSuiteService.update(req.params.id, req.body, req.user);

  return successResponse(res, {
    statusCode: 200,
    data: testSuite,
  });
});

/**
 * Deletes (soft-deletes) a test suite.
 *
 * @route DELETE /api/v1/test-suites/:id
 * @access Private
 */
const deleteTestSuite = asyncHandler(async (req, res) => {
  await testSuiteService.remove(req.params.id, req.user);

  return successResponse(res, {
    statusCode: 200,
    data: { deleted: true },
  });
});

module.exports = {
  createTestSuite,
  getTestSuites,
  getTestSuiteById,
  updateTestSuite,
  deleteTestSuite,
};
