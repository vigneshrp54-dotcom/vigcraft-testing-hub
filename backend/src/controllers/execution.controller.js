/**
 * @module controllers/execution
 * @description
 * HTTP layer for Test Execution records. Controllers only translate HTTP
 * requests into service calls and shape the HTTP response — all
 * business logic and persistence lives in `execution.service.js`.
 */

const asyncHandler = require('../utils/async-handler.util');
const { successResponse, paginationResponse } = require('../utils/response.util');
const executionService = require('../services/execution.service');

/**
 * Records a new test execution result for a test case.
 *
 * @route POST /api/v1/executions
 * @access Private
 */
const createExecution = asyncHandler(async (req, res) => {
  const execution = await executionService.create(req.body, req.user);

  return successResponse(res, {
    statusCode: 201,
    data: execution,
  });
});

/**
 * Retrieves a paginated list of test executions (optionally filtered by test case).
 *
 * @route GET /api/v1/executions
 * @access Private
 */
const getExecutions = asyncHandler(async (req, res) => {
  const { items, page, pageSize, totalItems } = await executionService.getAll(req.query, req.user);

  return paginationResponse(res, {
    data: items,
    page,
    pageSize,
    totalItems,
  });
});

/**
 * Retrieves a single test execution by ID.
 *
 * @route GET /api/v1/executions/:id
 * @access Private
 */
const getExecutionById = asyncHandler(async (req, res) => {
  const execution = await executionService.getById(req.params.id, req.user);

  return successResponse(res, {
    statusCode: 200,
    data: execution,
  });
});

/**
 * Updates an existing test execution record (e.g. status, actual result, notes).
 *
 * @route PUT /api/v1/executions/:id
 * @access Private
 */
const updateExecution = asyncHandler(async (req, res) => {
  const execution = await executionService.update(req.params.id, req.body, req.user);

  return successResponse(res, {
    statusCode: 200,
    data: execution,
  });
});

/**
 * Deletes (soft-deletes) a test execution record.
 *
 * @route DELETE /api/v1/executions/:id
 * @access Private
 */
const deleteExecution = asyncHandler(async (req, res) => {
  await executionService.remove(req.params.id, req.user);

  return successResponse(res, {
    statusCode: 200,
    data: { deleted: true },
  });
});

module.exports = {
  createExecution,
  getExecutions,
  getExecutionById,
  updateExecution,
  deleteExecution,
};
