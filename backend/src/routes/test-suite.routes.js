'use strict';

/**
 * @module routes/test-suite.routes
 * @description RESTful routes for test suite management.
 * Delegates all request handling to `controllers/test-suite.controller.js`.
 * All endpoints require authentication. Creation and listing are nested
 * under a project; single-resource operations use the suite id directly.
 */

const express = require('express');
const testSuiteController = require('../controllers/test-suite.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authenticate);

/**
 * @route   POST /api/v1/projects/:projectId/test-suites
 * @desc    Create a new test suite under a project
 * @access  Private
 */
router.post('/projects/:projectId/test-suites', testSuiteController.createTestSuite);

/**
 * @route   GET /api/v1/projects/:projectId/test-suites
 * @desc    List all test suites belonging to a project
 * @access  Private
 */
router.get('/projects/:projectId/test-suites', testSuiteController.getTestSuitesByProject);

/**
 * @route   GET /api/v1/test-suites/:id
 * @desc    Get a single test suite by id
 * @access  Private
 */
router.get('/test-suites/:id', testSuiteController.getTestSuiteById);

/**
 * @route   PATCH /api/v1/test-suites/:id
 * @desc    Update an existing test suite
 * @access  Private
 */
router.patch('/test-suites/:id', testSuiteController.updateTestSuite);

/**
 * @route   DELETE /api/v1/test-suites/:id
 * @desc    Delete a test suite
 * @access  Private
 */
router.delete('/test-suites/:id', testSuiteController.deleteTestSuite);

module.exports = router;
