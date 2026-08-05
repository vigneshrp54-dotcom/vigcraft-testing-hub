const winston = require('winston');
const env = require('../config/env.config');

/**
 * Centralized application logger.
 * All logging in the app MUST go through this module — no raw console.log
 * in route/controller/service code (per Development Standards).
 */

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

const devFormat = combine(
  colorize(),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ level, message, timestamp: ts, stack, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `[${ts}] ${level}: ${stack || message}${metaStr}`;
  })
);

const prodFormat = combine(
  timestamp(),
  errors({ stack: true }),
  json()
);

const logger = winston.createLogger({
  level: env.isProduction ? 'info' : 'debug',
  format: env.isProduction ? prodFormat : devFormat,
  transports: [
    new winston.transports.Console(),
  ],
  exitOnError: false,
});

/**
 * Child logger helper — attach a requestId so all logs for a single
 * request can be correlated (matches `meta.requestId` in API error responses).
 */
function withRequestId(requestId) {
  return logger.child({ requestId });
}

module.exports = {
  logger,
  withRequestId,
};
