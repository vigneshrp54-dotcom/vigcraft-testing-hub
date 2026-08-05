/**
 * @module controllers/auth
 * @description
 * HTTP layer for Authentication. Controllers only translate HTTP
 * requests into service calls and shape the HTTP response — all
 * business logic (validation of business rules, password hashing,
 * token issuance/revocation, persistence) lives in `auth.service.js`.
 */

const asyncHandler = require('../utils/async-handler.util');
const { successResponse } = require('../utils/response.util');
const authService = require('../services/auth.service');

/**
 * Registers a new user.
 * Expects `req.body` to contain the fields required by `authService.register`
 * (e.g. email, password, firstName, lastName).
 *
 * @route POST /api/v1/auth/register
 * @access Public
 */
const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);

  return successResponse(res, {
    statusCode: 201,
    data: result,
  });
});

/**
 * Authenticates a user and issues access/refresh tokens.
 * Expects `req.body` to contain email and password.
 *
 * @route POST /api/v1/auth/login
 * @access Public
 */
const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);

  return successResponse(res, {
    statusCode: 200,
    data: result,
  });
});

/**
 * Logs out the current user by invalidating their refresh token.
 * Expects `req.body` to contain the refresh token (or reads it from
 * the authenticated request context, depending on service contract).
 *
 * Note: unlike the (params, body, user) shape used by CRUD controllers,
 * this endpoint has no route params, so the service is called with
 * (body, user) — intentional, not an inconsistency.
 *
 * @route POST /api/v1/auth/logout
 * @access Private
 */
const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.body, req.user);

  return successResponse(res, {
    statusCode: 200,
    data: { loggedOut: true },
  });
});

module.exports = {
  register,
  login,
  logout,
};
