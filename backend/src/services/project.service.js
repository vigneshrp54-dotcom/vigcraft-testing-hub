'use strict';

/**
 * @module services/project.service
 * @description Business logic layer for project management.
 * Consumes the Project model only. Contains no SQL — all persistence is
 * delegated to `models/project.model.js`.
 */

const ProjectModel = require('../models/project.model');
const ApiError = require('../utils/api-error.util');
const logger = require('../utils/logger.util');

const CREATABLE_FIELDS = ['name', 'description', 'status'];
const UPDATABLE_FIELDS = ['name', 'description', 'status'];
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

/**
 * Return a shallow copy of `source` containing only whitelisted keys.
 * Prevents mass-assignment of fields the client should never control
 * (e.g. owner_id, id, created_at).
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
 * Create a new project owned by the requesting user.
 * @param {number} userId - Id of the user creating the project.
 * @param {{name: string, description?: string, status?: string}} payload
 * @returns {Promise<object>} The newly created project.
 * @throws {ApiError} 409 if a project with the same name already exists for this user.
 */
async function createProject(userId, payload) {
  const existingProject = await ProjectModel.findByNameAndOwner(payload.name, userId);
  if (existingProject) {
    throw ApiError.conflict('A project with this name already exists');
  }

  const project = await ProjectModel.create({
    ...pickAllowedFields(payload, CREATABLE_FIELDS),
    owner_id: userId,
    status: payload.status || 'active',
  });

  logger.info(`Project created: ${project.id} by user ${userId}`);
  return project;
}

/**
 * Retrieve a single project by id, ensuring the requester has access.
 * @param {number} projectId
 * @param {number} userId - Id of the requesting user, used for access validation.
 * @returns {Promise<object>} The project record.
 * @throws {ApiError} 404 if not found, 403 if the user does not have access.
 */
async function getProjectById(projectId, userId) {
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
 * Retrieve all projects accessible to a user, with optional filters/pagination.
 * @param {number} userId
 * @param {{page?: number, limit?: number, status?: string, search?: string}} [options]
 * @returns {Promise<{items: object[], total: number, page: number, limit: number}>}
 */
async function getAllProjects(userId, options = {}) {
  const page = options.page && options.page > 0 ? options.page : 1;
  const limit =
    options.limit && options.limit > 0
      ? Math.min(options.limit, MAX_LIMIT)
      : DEFAULT_LIMIT;

  const { items, total } = await ProjectModel.findAllByUser(userId, {
    page,
    limit,
    status: options.status,
    search: options.search,
  });

  return { items, total, page, limit };
}

/**
 * Update an existing project.
 * @param {number} projectId
 * @param {number} userId - Id of the requesting user, used for access validation.
 * @param {object} updates - Partial project fields to update.
 * @returns {Promise<object>} The updated project.
 * @throws {ApiError} 404 if not found, 403 if the user is not the owner.
 */
async function updateProject(projectId, userId, updates) {
  const project = await ProjectModel.findById(projectId);
  if (!project) {
    throw ApiError.notFound('Project not found');
  }

  if (project.owner_id !== userId) {
    throw ApiError.forbidden('Only the project owner can update this project');
  }

  const updatedProject = await ProjectModel.update(
    projectId,
    pickAllowedFields(updates, UPDATABLE_FIELDS)
  );
  logger.info(`Project updated: ${projectId} by user ${userId}`);
  return updatedProject;
}

/**
 * Delete a project.
 * @param {number} projectId
 * @param {number} userId - Id of the requesting user, used for access validation.
 * @returns {Promise<void>}
 * @throws {ApiError} 404 if not found, 403 if the user is not the owner.
 */
async function deleteProject(projectId, userId) {
  const project = await ProjectModel.findById(projectId);
  if (!project) {
    throw ApiError.notFound('Project not found');
  }

  if (project.owner_id !== userId) {
    throw ApiError.forbidden('Only the project owner can delete this project');
  }

  await ProjectModel.remove(projectId);
  logger.info(`Project deleted: ${projectId} by user ${userId}`);
}

module.exports = {
  createProject,
  getProjectById,
  getAllProjects,
  updateProject,
  deleteProject,
};
