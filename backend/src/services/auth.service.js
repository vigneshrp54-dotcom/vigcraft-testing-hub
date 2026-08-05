'use strict';

/**
 * @module services/auth.service
 * @description Business logic layer for authentication and account management.
 * Consumes the User model only. Contains no SQL — all persistence is
 * delegated to `models/user.model.js`.
 */

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const UserModel = require('../models/user.model');
const ApiError = require('../utils/api-error.util');
const logger = require('../utils/logger.util');

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10;
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || JWT_SECRET;
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required but was not set');
}

if (!process.env.JWT_REFRESH_SECRET) {
  logger.warn(
    'JWT_REFRESH_SECRET is not set; falling back to JWT_SECRET. ' +
      'Use a distinct refresh secret in production.'
  );
}

/**
 * Issue a signed access token for a user.
 * @param {{id: number, email: string, role: string}} user
 * @returns {string} Signed JWT access token.
 */
function generateAccessToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/**
 * Issue a signed refresh token for a user.
 * @param {{id: number}} user
 * @returns {string} Signed JWT refresh token.
 */
function generateRefreshToken(user) {
  return jwt.sign({ sub: user.id }, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
  });
}

/**
 * Strip sensitive fields before returning a user object to the caller.
 * @param {object} user - Raw user record from the model layer.
 * @returns {object} Sanitized user object safe for API responses.
 */
function sanitizeUser(user) {
  if (!user) return user;
  const { password, ...safeUser } = user;
  return safeUser;
}

/**
 * Register a new user account.
 * @param {{name: string, email: string, password: string}} payload - Role is
 * always assigned server-side as 'tester'; any role field in the payload is ignored.
 * @returns {Promise<{user: object, accessToken: string, refreshToken: string}>}
 * @throws {ApiError} 409 if the email is already registered.
 */
async function register(payload) {
  const { name, email, password } = payload;

  const existingUser = await UserModel.findByEmail(email);
  if (existingUser) {
    throw ApiError.conflict('An account with this email already exists');
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  // Self-registration is always provisioned as 'tester'. The role is never
  // taken from client input here — accepting a client-supplied role would
  // let any caller register as an elevated role (e.g. 'admin'). Elevated
  // roles must be granted via a separate, authorization-gated admin flow.
  const newUser = await UserModel.create({
    name,
    email,
    password: hashedPassword,
    role: 'tester',
  });

  const accessToken = generateAccessToken(newUser);
  const refreshToken = generateRefreshToken(newUser);

  logger.info(`New user registered: ${email}`);

  return {
    user: sanitizeUser(newUser),
    accessToken,
    refreshToken,
  };
}

/**
 * Authenticate a user and issue tokens.
 * @param {{email: string, password: string}} credentials
 * @returns {Promise<{user: object, accessToken: string, refreshToken: string}>}
 * @throws {ApiError} 401 if credentials are invalid.
 */
async function login({ email, password }) {
  const user = await UserModel.findByEmail(email);
  if (!user) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  if (user.is_active === 0 || user.is_active === false) {
    throw ApiError.forbidden('This account has been deactivated');
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  logger.info(`User logged in: ${email}`);

  return {
    user: sanitizeUser(user),
    accessToken,
    refreshToken,
  };
}

/**
 * Exchange a valid refresh token for a new access token.
 * @param {string} refreshToken
 * @returns {Promise<{accessToken: string}>}
 * @throws {ApiError} 401 if the refresh token is invalid, expired, or the user no longer exists.
 */
async function refreshAccessToken(refreshToken) {
  if (!refreshToken) {
    throw ApiError.unauthorized('Refresh token is required');
  }

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
  } catch (error) {
    throw ApiError.unauthorized('Invalid or expired refresh token');
  }

  const user = await UserModel.findById(decoded.sub);
  if (!user) {
    throw ApiError.unauthorized('User no longer exists');
  }

  const accessToken = generateAccessToken(user);
  return { accessToken };
}

/**
 * Retrieve the profile of the currently authenticated user.
 * @param {number} userId
 * @returns {Promise<object>} Sanitized user profile.
 * @throws {ApiError} 404 if the user cannot be found.
 */
async function getProfile(userId) {
  const user = await UserModel.findById(userId);
  if (!user) {
    throw ApiError.notFound('User not found');
  }
  return sanitizeUser(user);
}

/**
 * Change the password for an authenticated user.
 * @param {number} userId
 * @param {{currentPassword: string, newPassword: string}} payload
 * @returns {Promise<void>}
 * @throws {ApiError} 404 if the user is not found, 401 if the current password is incorrect.
 */
async function changePassword(userId, { currentPassword, newPassword }) {
  const user = await UserModel.findById(userId);
  if (!user) {
    throw ApiError.notFound('User not found');
  }

  const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
  if (!isPasswordValid) {
    throw ApiError.unauthorized('Current password is incorrect');
  }

  const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await UserModel.update(userId, { password: hashedPassword });

  logger.info(`Password changed for user id: ${userId}`);
}

module.exports = {
  register,
  login,
  refreshAccessToken,
  getProfile,
  changePassword,
};
