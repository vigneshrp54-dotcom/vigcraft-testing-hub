/**
 * @module middleware/auth
 * @description
 * Express middleware that verifies a JWT Bearer access token on
 * protected routes. On success, the decoded token payload is attached
 * to `req.user` for downstream controllers/services. On failure,
 * responds with `401 Unauthorized` via the centralized `AppError` /
 * error-handling flow.
 */

const jwt = require('jsonwebtoken');
const env = require('../config/env.config');
const AppError = require('../utils/api-error.util');

/**
 * Extracts the Bearer token from the `Authorization` header.
 *
 * @param {import('express').Request} req - Express request object.
 * @returns {string|null} The raw token string, or null if not present/malformed.
 */
function extractBearerToken(req) {
  const header = req.headers.authorization;

  if (!header || typeof header !== 'string') {
    return null;
  }

  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return null;
  }

  return token;
}

/**
 * Authentication middleware — verifies the JWT access token and attaches
 * the decoded payload to `req.user`. Calls `next()` on success, or
 * `next(AppError)` with a 401 status on any failure (missing token,
 * invalid signature, expired token, malformed token).
 *
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next function.
 * @returns {void}
 *
 * @example
 * const authMiddleware = require('../middleware/auth.middleware');
 * router.get('/projects', authMiddleware, projectController.getProjects);
 */
function authMiddleware(req, res, next) {
  try {
    const token = extractBearerToken(req);

    if (!token) {
      throw new AppError('Authentication token is missing or malformed.', 401);
    }

    const decoded = jwt.verify(token, env.jwt.accessSecret);

    req.user = decoded;

    return next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return next(new AppError('Authentication token has expired.', 401));
    }

    if (err instanceof jwt.JsonWebTokenError) {
      return next(new AppError('Authentication token is invalid.', 401));
    }

    if (err instanceof AppError) {
      return next(err);
    }

    return next(new AppError('Unable to authenticate request.', 401));
  }
}

module.exports = authMiddleware;
