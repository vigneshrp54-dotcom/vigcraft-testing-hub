/**
 * @module controllers/project
 * @description
 * HTTP layer for Project Management. Controllers only translate HTTP
 * requests into service calls and shape the HTTP response — all
 * business logic and persistence lives in `project.service.js`.
 */

const asyncHandler = require('../utils/async-handler.util');
const { successResponse, paginationResponse } = require('../utils/response.util');
const projectService = require('../services/project.service');

/**
 * Creates a new project.
 *
 * @route POST /api/v1/projects
 * @access Private
 */
const createProject = asyncHandler(async (req, res) => {
  const project = await projectService.create(req.body, req.user);

  return successResponse(res, {
    statusCode: 201,
    data: project,
  });
});

/**
 * Retrieves a paginated list of projects.
 *
 * @route GET /api/v1/projects
 * @access Private
 */
const getProjects = asyncHandler(async (req, res) => {
  const { items, page, pageSize, totalItems } = await projectService.getAll(req.query, req.user);

  return paginationResponse(res, {
    data: items,
    page,
    pageSize,
    totalItems,
  });
});

/**
 * Retrieves a single project by ID.
 *
 * @route GET /api/v1/projects/:id
 * @access Private
 */
const getProjectById = asyncHandler(async (req, res) => {
  const project = await projectService.getById(req.params.id, req.user);

  return successResponse(res, {
    statusCode: 200,
    data: project,
  });
});

/**
 * Updates an existing project.
 *
 * @route PUT /api/v1/projects/:id
 * @access Private
 */
const updateProject = asyncHandler(async (req, res) => {
  const project = await projectService.update(req.params.id, req.body, req.user);

  return successResponse(res, {
    statusCode: 200,
    data: project,
  });
});

/**
 * Deletes (soft-deletes) a project.
 *
 * @route DELETE /api/v1/projects/:id
 * @access Private
 */
const deleteProject = asyncHandler(async (req, res) => {
  await projectService.remove(req.params.id, req.user);

  return successResponse(res, {
    statusCode: 200,
    data: { deleted: true },
  });
});

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
};
