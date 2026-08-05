/**
 * @module middleware/error
 * @description
 * Global Express error-handling middleware. This MUST be registered
 * last, after all routes, per Express error-middleware conventions.
 * Normalizes every thrown/forwarded error — operational (`AppError`),
 * MySQL/database errors, input validation errors, and unexpected
 * (programming/bug) errors — into the standard API error envelope
 * defined in the approved API Design documentation.
 */

const { errorResponse } = require('../utils/response.util');
const AppError = require('../utils/api-error.util');
const { logger, withRequestId } = require('../utils/logger.util');
const env = require('../config/env.config');

/**
 * MySQL error codes mapped to an HTTP status + machine-readable error code.
 * Only common, safe-to-disclose constraint violations are mapped explicitly;
 * anything else falls back to a generic masked 500.
 * @type {Object<string, { statusCode: number, code: string, message: string }>}
 */
const MYSQL_ERROR_MAP = {
  ER_DUP_ENTRY: {
    statusCode: 409,
    code: 'CONFLICT',
    message: 'A record with the same unique value already exists.',
  },
  ER_NO_REFERENCED_ROW_2: {
    statusCode: 409,
    code: 'CONFLICT',
    message: 'The referenced resource does not exist.',
  },
  ER_ROW_IS_REFERENCED_2: {
    statusCode: 409,
    code: 'CONFLICT',
    message: 'This resource cannot be deleted because it is referenced by other records.',
  },
  ER_BAD_NULL_ERROR: {
    statusCode: 400,
    code: 'VALIDATION_ERROR',
    message: 'A required field was missing.',
  },
  ER_DATA_TOO_LONG: {
    statusCode: 400,
    code: 'VALIDATION_ERROR',
    message: 'One or more field values exceed the allowed length.',
  },
};

/**
 * Determines whether an error originated from the MySQL driver (mysql2).
 * mysql2 errors expose `sqlState` and a `code` such as 'ER_DUP_ENTRY'.
 *
 * @param {Error} err - The error to inspect.
 * @returns {boolean}
 */
function isMySQLError(err) {
  return Boolean(err && typeof err.code === 'string' && (err.sqlState || err.errno));
}

/**
 * Determines whether an error represents an input validation failure.
 * Supports the express-validator convention (`err.array()` / `err.errors`)
 * as well as a plain `{ name: 'ValidationError', errors: [...] }` shape.
 *
 * @param {Error} err - The error to inspect.
 * @returns {boolean}
 */
function isValidationError(err) {
  return Boolean(
    err
    && (err.name === 'ValidationError'
      || Array.isArray(err.errors)
      || typeof err.array === 'function')
  );
}

/**
 * Builds a normalized `{ statusCode, code, message, details }` shape from
 * an `AppError`.
 *
 * @param {AppError} err
 * @returns {{ statusCode: number, code: string, message: string, details: Array }}
 */
function normalizeAppError(err) {
  return {
    statusCode: err.statusCode,
    code: err.status === 'fail' ? 'REQUEST_ERROR' : 'INTERNAL_ERROR',
    message: err.message,
    details: [],
  };
}

/**
 * Builds a normalized shape from a MySQL driver error, using the known
 * error-code map when available, otherwise masking as a generic server error.
 *
 * @param {Error} err
 * @returns {{ statusCode: number, code: string, message: string, details: Array }}
 */
function normalizeMySQLError(err) {
  const mapped = MYSQL_ERROR_MAP[err.code];

  if (mapped) {
    return { ...mapped, details: [] };
  }

  return {
    statusCode: 500,
    code: 'INTERNAL_ERROR',
    message: 'A database error occurred while processing the request.',
    details: [],
  };
}

/**
 * Builds a normalized shape from a validation error, extracting
 * field-level details where available.
 *
 * @param {Error} err
 * @returns {{ statusCode: number, code: string, message: string, details: Array }}
 */
function normalizeValidationError(err) {
  const rawErrors = typeof err.array === 'function' ? err.array() : err.errors || [];

  const details = rawErrors.map((item) => ({
    field: item.path || item.param || item.field || 'unknown',
    issue: item.msg || item.message || 'Invalid value.',
  }));

  return {
    statusCode: 400,
    code: 'VALIDATION_ERROR',
    message: 'The request could not be processed due to invalid input.',
    details,
  };
}

/**
 * Builds a normalized shape for any unrecognized error. The real message
 * is never sent to the client in production — only logged internally.
 *
 * @returns {{ statusCode: number, code: string, message: string, details: Array }}
 */
function normalizeUnknownError() {
  return {
    statusCode: 500,
    code: 'INTERNAL_ERROR',
    message: 'An unexpected error occurred. Please try again later.',
    details: [],
  };
}

/**
 * Global Express error-handling middleware. Must be registered with
 * four parameters (`err, req, res, next`) so Express recognizes it as
 * an error handler, even though `next` is unused.
 *
 * @param {Error} err - The error forwarded via `next(err)`.
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Unused, required by Express.
 * @returns {import('express').Response}
 */
// eslint-disable-next-line no-unused-vars
function errorMiddleware(err, req, res, next) {
  const requestId = req.requestId;
  const log = requestId ? withRequestId(requestId) : logger;

  let normalized;

  if (err instanceof AppError) {
    normalized = normalizeAppError(err);
  } else if (isValidationError(err)) {
    normalized = normalizeValidationError(err);
  } else if (isMySQLError(err)) {
    normalized = normalizeMySQLError(err);
  } else {
    normalized = normalizeUnknownError();
  }

  const isServerError = normalized.statusCode >= 500;

  log[isServerError ? 'error' : 'warn']('Request error handled', {
    statusCode: normalized.statusCode,
    code: normalized.code,
    message: err.message,
    stack: env.isProduction ? undefined : err.stack,
    path: req.originalUrl,
    method: req.method,
  });

  return errorResponse(res, {
    statusCode: normalized.statusCode,
    code: normalized.code,
    message: normalized.message,
    details: normalized.details,
    requestId,
  });
}

module.exports = errorMiddleware;
