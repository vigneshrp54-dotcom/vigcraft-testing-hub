/**
 * @module utils/async-handler
 * @description
 * Wraps async Express route/controller handlers so any rejected Promise
 * (thrown error) is automatically forwarded to Express's `next()` and
 * handled by the central error-handling middleware, instead of requiring
 * a try/catch block in every controller.
 */

/**
 * Wraps an async Express handler, catching any rejected Promise and
 * forwarding it to `next()`.
 *
 * @param {(req: import('express').Request, res: import('express').Response, next: import('express').NextFunction) => Promise<*>} fn
 *   The async controller/middleware function to wrap.
 * @returns {(req: import('express').Request, res: import('express').Response, next: import('express').NextFunction) => void}
 *   An Express-compatible handler.
 *
 * @example
 * const asyncHandler = require('../utils/async-handler.util');
 *
 * const getProject = asyncHandler(async (req, res) => {
 *   const project = await projectService.getById(req.params.id);
 *   successResponse(res, { data: project });
 * });
 */
function asyncHandler(fn) {
  return function wrappedHandler(req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = asyncHandler;
