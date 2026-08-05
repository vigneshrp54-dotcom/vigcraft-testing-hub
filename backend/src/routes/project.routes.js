'use strict';

/**
 * @module routes/project.routes
 * @description RESTful routes for project management.
 * Delegates all request handling to `controllers/project.controller.js`.
 * All endpoints require authentication.
 */

const express = require('express');
const projectController = require('../controllers/project.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authenticate);

/**
 * @route   POST /api/v1/projects
 * @desc    Create a new project
 * @access  Private
 */
router.post('/', projectController.createProject);

/**
 * @route   GET /api/v1/projects
 * @desc    List all projects accessible to the authenticated user
 * @access  Private
 */
router.get('/', projectController.getAllProjects);

/**
 * @route   GET /api/v1/projects/:id
 * @desc    Get a single project by id
 * @access  Private
 */
router.get('/:id', projectController.getProjectById);

/**
 * @route   PATCH /api/v1/projects/:id
 * @desc    Update an existing project
 * @access  Private
 */
router.patch('/:id', projectController.updateProject);

/**
 * @route   DELETE /api/v1/projects/:id
 * @desc    Delete a project
 * @access  Private
 */
router.delete('/:id', projectController.deleteProject);

module.exports = router;
