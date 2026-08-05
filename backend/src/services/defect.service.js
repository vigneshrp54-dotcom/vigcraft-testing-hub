'use strict';

/**
 * @module services/defect.service
 * @description Business logic layer for defect (bug) tracking.
 * Consumes the Defect, Execution, and Project models only. Contains no
 * SQL — all persistence is delegated to `models/defect.model.js`.
 */

const DefectModel = require('../models/defect.model');
const ExecutionModel = require('../models/execution.model');
const ProjectModel = require('../models/project.model');
const ApiError = require('../utils/api-error.util');
const logger = require('../utils/logger.util');

const VALID_SEVERITIES = ['low', 'medium', 'high', 'critical'];
const VALID_STATUSES = ['open', 'in_progress', 'resolved', 'closed', 'reopened'];
const CREATABLE_FIELDS = ['title', 'description', 'severity', 'execution_id'];
const UPDATABLE_FIELDS = ['title', 'description', 'severity', 'status', 'execution_id'];
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

/**
 * Return a shallow copy of `source` containing only whitelisted keys.
 * Prevents mass-assignment of fields the client should never control
 * (e.g. project_id, reported_by, id).
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
 * Verify the requesting user has access to a project.
 * @param {number} projectId
 * @param {number} userId
 * @returns {Promise<object>} The project record.
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
 * Validate the defect severity and status enums.
 * @param {{severity?: string, status?: string}} payload
 * @throws {ApiError} 400 if an invalid severity or status is supplied.
 */
function validateEnums(payload) {
  if (payload.severity && !VALID_SEVERITIES.includes(payload.severity)) {
    throw ApiError.badRequest(`Invalid severity. Allowed values: ${VALID_SEVERITIES.join(', ')}`);
  }
  if (payload.status && !VALID_STATUSES.includes(payload.status)) {
    throw ApiError.badRequest(`Invalid status. Allowed values: ${VALID_STATUSES.join(', ')}`);
  }
}

/**
 * Log a new defect against a project, optionally linked to an execution.
 * @param {number} projectId
 * @param {number} userId
 * @param {{title: string, description?: string, severity?: string, execution_id?: number}} payload
 * @returns {Promise<object>} The newly created defect.
 * @throws {ApiError} 404/403 via project access checks, 400 for invalid enums.
 */
async function createDefect(projectId, userId, payload) {
  await assertProjectAccess(projectId, userId);
  validateEnums(payload);

  if (payload.execution_id) {
    const execution = await ExecutionModel.findById(payload.execution_id);
    if (!execution) {
      throw ApiError.notFound('Linked execution record not found');
    }
  }

  const defect = await DefectModel.create({
    ...pickAllowedFields(payload, CREATABLE_FIELDS),
    project_id: projectId,
    reported_by: userId,
    severity: payload.severity || 'medium',
    status: 'open',
  });

  logger.info(`Defect created: ${defect.id} in project ${projectId}`);
  return defect;
}

/**
 * Retrieve a single defect by id.
 * @param {number} defectId
 * @param {number} userId
 * @returns {Promise<object>} The defect record.
 * @throws {ApiError} 404 if not found, 403 if access is denied.
 */
async function getDefectById(defectId, userId) {
  const defect = await DefectModel.findById(defectId);
  if (!defect) {
    throw ApiError.notFound('Defect not found');
  }

  await assertProjectAccess(defect.project_id, userId);
  return defect;
}

/**
 * Retrieve all defects belonging to a project.
 * @param {number} projectId
 * @param {number} userId
 * @param {{page?: number, limit?: number, severity?: string, status?: string, search?: string}} [options]
 * @returns {Promise<{items: object[], total: number, page: number, limit: number}>}
 */
async function getDefectsByProject(projectId, userId, options = {}) {
  await assertProjectAccess(projectId, userId);

  const page = options.page && options.page > 0 ? options.page : 1;
  const limit =
    options.limit && options.limit > 0
      ? Math.min(options.limit, MAX_LIMIT)
      : DEFAULT_LIMIT;

  const { items, total } = await DefectModel.findAllByProject(projectId, {
    page,
    limit,
    severity: options.severity,
    status: options.status,
    search: options.search,
  });

  return { items, total, page, limit };
}

/**
 * Update an existing defect (details, severity, or status transitions).
 * @param {number} defectId
 * @param {number} userId
 * @param {object} updates - Partial defect fields to update.
 * @returns {Promise<object>} The updated defect.
 * @throws {ApiError} 404 if not found, 403 if access is denied, 400 for invalid enums.
 */
async function updateDefect(defectId, userId, updates) {
  const defect = await DefectModel.findById(defectId);
  if (!defect) {
    throw ApiError.notFound('Defect not found');
  }

  await assertProjectAccess(defect.project_id, userId);
  validateEnums(updates);

  if (updates.execution_id) {
    const execution = await ExecutionModel.findById(updates.execution_id);
    if (!execution) {
      throw ApiError.notFound('Linked execution record not found');
    }
  }

  const updatedDefect = await DefectModel.update(
    defectId,
    pickAllowedFields(updates, UPDATABLE_FIELDS)
  );
  logger.info(`Defect updated: ${defectId} by user ${userId}`);
  return updatedDefect;
}

/**
 * Delete a defect.
 * @param {number} defectId
 * @param {number} userId
 * @returns {Promise<void>}
 * @throws {ApiError} 404 if not found, 403 if access is denied.
 */
async function deleteDefect(defectId, userId) {
  const defect = await DefectModel.findById(defectId);
  if (!defect) {
    throw ApiError.notFound('Defect not found');
  }

  await assertProjectAccess(defect.project_id, userId);

  await DefectModel.remove(defectId);
  logger.info(`Defect deleted: ${defectId} by user ${userId}`);
}

module.exports = {
  createDefect,
  getDefectById,
  getDefectsByProject,
  updateDefect,
  deleteDefect,
};
