const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });

/**
 * Centralized environment configuration.
 * All environment variable access in the app MUST go through this module —
 * no direct process.env reads elsewhere (per Development Standards: no hardcoded config).
 */

const VALID_NODE_ENVS = ['development', 'test', 'staging', 'production'];

/**
 * Reads a required environment variable. Throws immediately if it is
 * missing/blank so the app fails fast at startup instead of at runtime.
 * Use for values that have no safe default (secrets, credentials).
 */
function requireEnv(key) {
  const value = process.env[key];
  if (value === undefined || value === null || value.trim() === '') {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

/**
 * Reads an optional environment variable, returning `fallback` when unset
 * or blank. Use only for values with a genuinely safe default.
 */
function getEnv(key, fallback) {
  const value = process.env[key];
  return value === undefined || value === null || value.trim() === '' ? fallback : value;
}

/**
 * Parses an environment variable as an integer and validates it against
 * an optional [min, max] range. Throws on malformed or out-of-range values
 * instead of silently coercing to NaN or an unsafe number.
 */
function getEnvInt(key, fallback, { min, max } = {}) {
  const raw = getEnv(key, String(fallback));
  const parsed = parseInt(raw, 10);
  if (Number.isNaN(parsed)) {
    throw new Error(`Environment variable ${key} must be a valid integer, received: "${raw}"`);
  }
  if (min !== undefined && parsed < min) {
    throw new Error(`Environment variable ${key} must be >= ${min}, received: ${parsed}`);
  }
  if (max !== undefined && parsed > max) {
    throw new Error(`Environment variable ${key} must be <= ${max}, received: ${parsed}`);
  }
  return parsed;
}

const NODE_ENV = getEnv('NODE_ENV', 'development').toLowerCase();
if (!VALID_NODE_ENVS.includes(NODE_ENV)) {
  throw new Error(`Invalid NODE_ENV: "${NODE_ENV}". Expected one of: ${VALID_NODE_ENVS.join(', ')}`);
}
const isProduction = NODE_ENV === 'production';

// Empty DB passwords are acceptable for local dev but must never reach production.
const dbPassword = process.env.DB_PASSWORD || '';
if (isProduction && dbPassword === '') {
  throw new Error('DB_PASSWORD is required and cannot be empty when NODE_ENV=production');
}

// CORS defaulting to localhost in production would silently lock out real clients
// (or, if paired with credentials, open the API to an unintended origin). Require
// an explicit value in production instead of relying on the dev default.
if (isProduction && !process.env.CORS_ALLOWED_ORIGINS) {
  throw new Error('CORS_ALLOWED_ORIGINS must be explicitly set when NODE_ENV=production');
}
const corsOrigins = getEnv('CORS_ALLOWED_ORIGINS', 'http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const jwtAccessSecret = requireEnv('JWT_ACCESS_SECRET');
const jwtRefreshSecret = requireEnv('JWT_REFRESH_SECRET');
const MIN_SECRET_LENGTH = 32;
if (isProduction && (jwtAccessSecret.length < MIN_SECRET_LENGTH || jwtRefreshSecret.length < MIN_SECRET_LENGTH)) {
  throw new Error(
    `JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must each be at least ${MIN_SECRET_LENGTH} characters in production`
  );
}

const env = {
  NODE_ENV,
  isProduction,

  server: {
    port: getEnvInt('PORT', 8080, { min: 1, max: 65535 }),
    apiVersion: getEnv('API_VERSION', 'v1'),
  },

  db: {
    host: getEnv('DB_HOST', 'localhost'),
    port: getEnvInt('DB_PORT', 3306, { min: 1, max: 65535 }),
    user: getEnv('DB_USER', 'root'),
    password: dbPassword,
    name: getEnv('DB_NAME', 'vigcraft_testing_hub'),
    connectionLimit: getEnvInt('DB_CONNECTION_LIMIT', 10, { min: 1, max: 100 }),
  },

  jwt: {
    accessSecret: jwtAccessSecret,
    refreshSecret: jwtRefreshSecret,
    accessExpiry: getEnv('JWT_ACCESS_EXPIRY', '15m'),
    refreshExpiry: getEnv('JWT_REFRESH_EXPIRY', '7d'),
  },

  cors: {
    allowedOrigins: corsOrigins,
  },

  rateLimit: {
    windowMs: getEnvInt('RATE_LIMIT_WINDOW_MS', 900000, { min: 1000 }), // 15 min
    max: getEnvInt('RATE_LIMIT_MAX', 100, { min: 1 }),
  },

  bcrypt: {
    saltRounds: getEnvInt('BCRYPT_SALT_ROUNDS', 12, { min: 10, max: 15 }),
  },
};

module.exports = Object.freeze(env);
