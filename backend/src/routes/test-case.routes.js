'use strict';

/**
 * @module routes/test-case.routes
 * @description RESTful routes for test case management.
 * Delegates all request handling to `controllers/test-case.controller.js`.
 * All endpoints require authentication. Creation and listing are nested
 * under a test suite; single-resource operations use the test case id directly.
 */

const express = require('express');
const testCaseController = require('../controllers/test-case.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authenticate);

/**
 * @route   POST /api/v1/test-suites/:suiteId/test-cases
 * @desc    Create a new test case under a test suite
 * @access  Private
 */
router.post('/test-suites/:suiteId/test-cases', testCaseController.createTestCase);

/**
 * @route   GET /api/v1/test-suites/:suiteId/test-cases
 * @desc    List all test cases belonging to a test suite
 * @access  Private
 */
router.get('/test-suites/:suiteId/test-cases', testCaseController.getTestCasesBySuite);

/**
 * @route   GET /api/v1/test-cases/:id
 * @desc    Get a single test case by id
 * @access  Private
 */
router.get('/test-cases/:id', testCaseController.getTestCaseById);

/**
 * @route   PATCH /api/v1/test-cases/:id
 * @desc    Update an existing test case
 * @access  Private
 */
router.patch('/test-cases/:id', testCaseController.updateTestCase);

/**
 * @route   DELETE /api/v1/test-cases/:id
 * @desc    Delete a test case
 * @access  Private
 */
router.delete('/test-cases/:id', testCaseController.deleteTestCase);

module.exports = router;
