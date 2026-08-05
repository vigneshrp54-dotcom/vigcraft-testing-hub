/**
 * @module controllers/test-case
 * @description
 * HTTP layer for Test Case management. Controllers only translate HTTP
 * requests into service calls and shape the HTTP response — all
 * business logic and persistence lives in `test-case.service.js`.
 */

const asyncHandler = require('../utils/async-handler.util');
const { successResponse, paginationResponse } = require('../utils/response.util');
const testCaseService = require('../services/test-case.service');

/**
 * Creates a new test case (assigned to a test suite).
 *
 * @route POST /api/v1/test-cases
 * @access Private
 */
const createTestCase = asyncHandler(async (req, res) => {
  const testCase = await testCaseService.create(req.body, req.user);

  return successResponse(res, {
    statusCode: 201,
    data: testCase,
  });
});

/**
 * Retrieves a paginated list of test cases (optionally filtered by test suite).
 *
 * @route GET /api/v1/test-cases
 * @access Private
 */
const getTestCases = asyncHandler(async (req, res) => {
  const { items, page, pageSize, totalItems } = await testCaseService.getAll(req.query, req.user);

  return paginationResponse(res, {
    data: items,
    page,
    pageSize,
    totalItems,
  });
});

/**
 * Retrieves a single test case by ID.
 *
 * @route GET /api/v1/test-cases/:id
 * @access Private
 */
const getTestCaseById = asyncHandler(async (req, res) => {
  const testCase = await testCaseService.getById(req.params.id, req.user);

  return successResponse(res, {
    statusCode: 200,
    data: testCase,
  });
});

/**
 * Updates an existing test case.
 *
 * @route PUT /api/v1/test-cases/:id
 * @access Private
 */
const updateTestCase = asyncHandler(async (req, res) => {
  const testCase = await testCaseService.update(req.params.id, req.body, req.user);

  return successResponse(res, {
    statusCode: 200,
    data: testCase,
  });
});

/**
 * Deletes (soft-deletes) a test case.
 *
 * @route DELETE /api/v1/test-cases/:id
 * @access Private
 */
const deleteTestCase = asyncHandler(async (req, res) => {
  await testCaseService.remove(req.params.id, req.user);

  return successResponse(res, {
    statusCode: 200,
    data: { deleted: true },
  });
});

module.exports = {
  createTestCase,
  getTestCases,
  getTestCaseById,
  updateTestCase,
  deleteTestCase,
};
