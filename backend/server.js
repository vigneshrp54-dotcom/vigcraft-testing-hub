'use strict';

/**
 * @module server
 * @description Application entry point for the VigCraft Testing Hub API.
 * Loads environment configuration, verifies the database connection,
 * registers global middleware, mounts all route modules, wires the
 * global error handler, and starts the HTTP server.
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const { testConnection } = require('./config/db.config');
const { logger } = require('./utils/logger.util');
const errorMiddleware = require('./middleware/error.middleware');

const authRoutes = require('./routes/auth.routes');
const projectRoutes = require('./routes/project.routes');
const testSuiteRoutes = require('./routes/test-suite.routes');
const testCaseRoutes = require('./routes/test-case.routes');
const executionRoutes = require('./routes/execution.routes');
const defectRoutes = require('./routes/defect.routes');

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const API_PREFIX = process.env.API_PREFIX || '/api/v1';

const app = express();

/* ------------------------------------------------------------------ */
/* Global Middleware                                                   */
/* ------------------------------------------------------------------ */

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

if (NODE_ENV !== 'test') {
  app.use(morgan(NODE_ENV === 'production' ? 'combined' : 'dev', {
    stream: { write: (message) => logger.info(message.trim()) },
  }));
}

/* ------------------------------------------------------------------ */
/* Health Check                                                        */
/* ------------------------------------------------------------------ */

/**
 * @route   GET /health
 * @desc    Lightweight liveness probe for uptime monitoring / load balancers
 * @access  Public
 */
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'VigCraft Testing Hub API is running',
    environment: NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

/* ------------------------------------------------------------------ */
/* Route Registration                                                  */
/* ------------------------------------------------------------------ */

app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/projects`, projectRoutes);
app.use(API_PREFIX, testSuiteRoutes);
app.use(API_PREFIX, testCaseRoutes);
app.use(API_PREFIX, executionRoutes);
app.use(API_PREFIX, defectRoutes);

/* ------------------------------------------------------------------ */
/* Unmatched Route Handler                                             */
/* ------------------------------------------------------------------ */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

/* ------------------------------------------------------------------ */
/* Global Error Middleware                                             */
/* ------------------------------------------------------------------ */

app.use(errorMiddleware);

/* ------------------------------------------------------------------ */
/* Server Bootstrap                                                    */
/* ------------------------------------------------------------------ */

/**
 * Verify the database connection and start the HTTP server.
 * Exits the process if the database is unreachable, preventing the
 * app from serving traffic against a broken data layer.
 * @returns {Promise<void>}
 */
async function startServer() {
  try {
    await testConnection();
    logger.info('Database connection established successfully');

    app.listen(PORT, () => {
      logger.info(`VigCraft Testing Hub API running on port ${PORT} [${NODE_ENV}]`);
    });
  } catch (error) {
    logger.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
}

/**
 * Gracefully handle unexpected process-level failures so they are
 * logged before the process exits, instead of failing silently.
 */
process.on('unhandledRejection', (reason) => {
  logger.error(`Unhandled Promise Rejection: ${reason}`);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  logger.error(`Uncaught Exception: ${error.message}`);
  process.exit(1);
});

startServer();

module.exports = app;
