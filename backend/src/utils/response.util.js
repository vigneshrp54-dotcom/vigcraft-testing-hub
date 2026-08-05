/**
 * @module utils/response
 * @description
 * Centralized HTTP response utility. All controllers MUST use these
 * helpers to send responses — no ad-hoc `res.json()` calls — so every
 * API response follows the standard enterprise envelope defined in the
 * approved API Design documentation. This module contains NO business
 * logic; it only shapes and sends response payloads.
 */

/**
 * Sends a standardized success response.
 *
 * @param {import('express').Response} res - Express response object.
 * @param {Object} [options={}] - Response options.
 * @param {number} [options.statusCode=200] - HTTP status code.
 * @param {*} [options.data=null] - Payload to return under `data`.
 * @param {Object} [options.meta={}] - Additional metadata (e.g. requestId).
 * @returns {import('express').Response} The Express response.
 *
 * @example
 * successResponse(res, { statusCode: 201, data: { userId: 'usr_1029' } });
 */
function successResponse(res, options = {}) {
  const {
    statusCode = 200,
    data = null,
    meta = {},
  } = options;

  return res.status(statusCode).json({
    success: true,
    data,
    meta: {
      ...meta,
      timestamp: new Date().toISOString(),
    },
  });
}

/**
 * Sends a standardized error response, matching the API Design
 * error envelope: { success, error: { code, message, details }, meta }.
 *
 * @param {import('express').Response} res - Express response object.
 * @param {Object} [options={}] - Error options.
 * @param {number} [options.statusCode=500] - HTTP status code.
 * @param {string} [options.code='INTERNAL_ERROR'] - Machine-readable error code.
 * @param {string} [options.message='An unexpected error occurred.'] - Human-readable message.
 * @param {Array<Object>} [options.details=[]] - Field-level error details.
 * @param {string} [options.requestId] - Correlation ID for tracing/logging.
 * @returns {import('express').Response} The Express response.
 *
 * @example
 * errorResponse(res, {
 *   statusCode: 400,
 *   code: 'VALIDATION_ERROR',
 *   message: 'The request could not be processed due to invalid input.',
 *   details: [{ field: 'email', issue: 'must be a valid email address' }],
 *   requestId: req.requestId,
 * });
 */
function errorResponse(res, options = {}) {
  const {
    statusCode = 500,
    code = 'INTERNAL_ERROR',
    message = 'An unexpected error occurred.',
    details = [],
    requestId,
  } = options;

  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      details,
    },
    meta: {
      ...(requestId ? { requestId } : {}),
      timestamp: new Date().toISOString(),
    },
  });
}

/**
 * Sends a standardized paginated success response.
 *
 * @param {import('express').Response} res - Express response object.
 * @param {Object} options - Pagination response options.
 * @param {Array<*>} options.data - Array of resource items for the current page.
 * @param {number} options.page - Current page number (1-indexed).
 * @param {number} options.pageSize - Number of items per page.
 * @param {number} options.totalItems - Total number of items across all pages.
 * @param {number} [options.statusCode=200] - HTTP status code.
 * @returns {import('express').Response} The Express response.
 *
 * @example
 * paginationResponse(res, {
 *   data: users,
 *   page: 1,
 *   pageSize: 20,
 *   totalItems: 145,
 * });
 */
function paginationResponse(res, options) {
  const {
    data,
    page,
    pageSize,
    totalItems,
    statusCode = 200,
  } = options;

  const totalPages = pageSize > 0 ? Math.ceil(totalItems / pageSize) : 0;

  return res.status(statusCode).json({
    success: true,
    data,
    meta: {
      page,
      pageSize,
      totalItems,
      totalPages,
    },
  });
}

module.exports = {
  successResponse,
  errorResponse,
  paginationResponse,
};
