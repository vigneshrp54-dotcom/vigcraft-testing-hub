/**
 * @module controllers/defect
 * @description
 * HTTP layer for Defect management. Controllers only translate HTTP
 * requests into service calls and shape the HTTP response — all
 * business logic and persistence lives in `defect.service.js`.
 */

const asyncHandler = require('../utils/async-handler.util');
const { successResponse, paginationResponse } = require('../utils/response.util');
const defectService = require('../services/defect.service');

/**
 * Creates a new defect (against a project, optionally linked to a test case).
 *
 * @route POST /api/v1/defects
 * @access Private
 */
const createDefect = asyncHandler(async (req, res) => {
  const defect = await defectService.create(req.body, req.user);

  return successResponse(res, {
    statusCode: 201,
    data: defect,
  });
});

/**
 * Retrieves a paginated list of defects (optionally filtered by project/status/severity).
 *
 * @route GET /api/v1/defects
 * @access Private
 */
const getDefects = asyncHandler(async (req, res) => {
  const { items, page, pageSize, totalItems } = await defectService.getAll(req.query, req.user);

  return paginationResponse(res, {
    data: items,
    page,
    pageSize,
    totalItems,
  });
});

/**
 * Retrieves a single defect by ID.
 *
 * @route GET /api/v1/defects/:id
 * @access Private
 */
const getDefectById = asyncHandler(async (req, res) => {
  const defect = await defectService.getById(req.params.id, req.user);

  return successResponse(res, {
    statusCode: 200,
    data: defect,
  });
});

/**
 * Updates an existing defect (e.g. status, severity, assignment).
 *
 * @route PUT /api/v1/defects/:id
 * @access Private
 */
const updateDefect = asyncHandler(async (req, res) => {
  const defect = await defectService.update(req.params.id, req.body, req.user);

  return successResponse(res, {
    statusCode: 200,
    data: defect,
  });
});

/**
 * Deletes (soft-deletes) a defect.
 *
 * @route DELETE /api/v1/defects/:id
 * @access Private
 */
const deleteDefect = asyncHandler(async (req, res) => {
  await defectService.remove(req.params.id, req.user);

  return successResponse(res, {
    statusCode: 200,
    data: { deleted: true },
  });
});

module.exports = {
  createDefect,
  getDefects,
  getDefectById,
  updateDefect,
  deleteDefect,
};
