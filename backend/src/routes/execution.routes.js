'use strict';

/**
 * @module routes/execution.routes
 * @description RESTful routes for test execution tracking.
 * Delegates all request handling to `controllers/execution.controller.js`.
 * All endpoints require authentication. Recording and history are nested
 * under a test case; single-resource operations use the execution id directly.
 */

const express = require('express');
const executionController = require('../controllers/execution.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authenticate);

/**
 * @route   POST /api/v1/test-cases/:testCaseId/executions
 * @desc    Record a new execution result for a test case
 * @access  Private
 */
router.post('/test-cases/:testCaseId/executions', executionController.recordExecution);

/**
 * @route   GET /api/v1/test-cases/:testCaseId/executions
 * @desc    List the execution history for a test case
 * @access  Private
 */
router.get('/test-cases/:testCaseId/executions', executionController.getExecutionsByTestCase);

/**
 * @route   GET /api/v1/projects/:projectId/executions/summary
 * @desc    Get aggregated execution statistics (pass/fail/blocked) for a project
 * @access  Private
 */
router.get('/projects/:projectId/executions/summary', executionController.getExecutionSummaryByProject);

/**
 * @route   GET /api/v1/executions/:id
 * @desc    Get a single execution record by id
 * @access  Private
 */
router.get('/executions/:id', executionController.getExecutionById);

/**
 * @route   PATCH /api/v1/executions/:id
 * @desc    Update an existing execution record
 * @access  Private
 */
router.patch('/executions/:id', executionController.updateExecution);

/**
 * @route   DELETE /api/v1/executions/:id
 * @desc    Delete an execution record
 * @access  Private
 */
router.delete('/executions/:id', executionController.deleteExecution);

module.exports = router;
