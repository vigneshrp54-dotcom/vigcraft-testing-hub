'use strict';

/**
 * @module routes/auth.routes
 * @description RESTful routes for authentication and account management.
 * Delegates all request handling to `controllers/auth.controller.js`.
 * Public endpoints: register, login, refresh-token.
 * Protected endpoints: profile, change-password.
 */

const express = require('express');
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

/**
 * Rate limiter for unauthenticated auth endpoints. Protects /login from
 * brute-force credential guessing and /register, /refresh-token from
 * automated abuse. Applied per-IP.
 */
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please try again later.',
  },
});

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new user account
 * @access  Public
 */
router.post('/register', authRateLimiter, authController.register);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Authenticate a user and issue access/refresh tokens
 * @access  Public
 */
router.post('/login', authRateLimiter, authController.login);

/**
 * @route   POST /api/v1/auth/refresh-token
 * @desc    Exchange a valid refresh token for a new access token
 * @access  Public
 */
router.post('/refresh-token', authRateLimiter, authController.refreshToken);

/**
 * @route   GET /api/v1/auth/profile
 * @desc    Get the authenticated user's profile
 * @access  Private
 */
router.get('/profile', authenticate, authController.getProfile);

/**
 * @route   PATCH /api/v1/auth/change-password
 * @desc    Change the authenticated user's password
 * @access  Private
 */
router.patch('/change-password', authenticate, authController.changePassword);

module.exports = router;
