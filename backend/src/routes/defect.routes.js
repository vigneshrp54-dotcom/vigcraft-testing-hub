'use strict';

/**
 * @module routes/defect.routes
 * @description RESTful routes for defect (bug) tracking.
 * Delegates all request handling to `controllers/defect.controller.js`.
 * All endpoints require authentication. Creation and listing are nested
 * under a project; single-resource operations use the defect id directly.
 */

const express = require('express');
const defectController = require('../controllers/defect.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authenticate);

/**
 * @route   POST /api/v1/projects/:projectId/defects
 * @desc    Log a new defect under a project
 * @access  Private
 */
router.post('/projects/:projectId/defects', defectController.createDefect);

/**
 * @route   GET /api/v1/projects/:projectId/defects
 * @desc    List all defects belonging to a project
 * @access  Private
 */
router.get('/projects/:projectId/defects', defectController.getDefectsByProject);

/**
 * @route   GET /api/v1/defects/:id
 * @desc    Get a single defect by id
 * @access  Private
 */
router.get('/defects/:id', defectController.getDefectById);

/**
 * @route   PATCH /api/v1/defects/:id
 * @desc    Update an existing defect (details, severity, or status)
 * @access  Private
 */
router.patch('/defects/:id', defectController.updateDefect);

/**
 * @route   DELETE /api/v1/defects/:id
 * @desc    Delete a defect
 * @access  Private
 */
router.delete('/defects/:id', defectController.deleteDefect);

module.exports = router;
