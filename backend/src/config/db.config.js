const mysql = require('mysql2/promise');
const env = require('./env.config');

/**
 * MySQL connection pool.
 * A pool (not a single connection) is used so concurrent requests reuse
 * connections safely — required for a production Express app.
 */
const pool = mysql.createPool({
  host: env.db.host,
  port: env.db.port,
  user: env.db.user,
  password: env.db.password,
  database: env.db.name,
  waitForConnections: true,
  connectionLimit: env.db.connectionLimit,
  queueLimit: 0,
  namedPlaceholders: true,
  dateStrings: false,
  timezone: 'Z', // store/read all timestamps as UTC
  charset: 'utf8mb4', // full Unicode support (emoji, multi-byte characters)
  multipleStatements: false, // security: explicitly block stacked-query injection via a single call
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000, // 10s — keeps idle connections alive behind load balancers/firewalls
  connectTimeout: 10000, // 10s — fail fast instead of hanging on an unreachable DB
});

/**
 * Background connection errors (e.g. the MySQL server dropping an idle
 * connection, or a network blip) are emitted on the pool as 'error' events.
 * Without a listener, Node treats an unhandled 'error' event as a fatal,
 * process-crashing exception — this handler is required for production stability.
 */
pool.on('error', (err) => {
  console.error(`[db.config] Unexpected MySQL pool error (${err.code || 'UNKNOWN'}):`, err.message);
});

/**
 * Verifies the database is reachable. Called once at server startup
 * so the app fails fast instead of accepting traffic it can't serve.
 */
async function testConnection() {
  const connection = await pool.getConnection();
  try {
    await connection.ping();
  } finally {
    connection.release();
  }
}

/**
 * Gracefully closes all pooled connections. Intended for use in
 * SIGTERM/SIGINT shutdown handlers so the process doesn't hold open
 * sockets after the HTTP server stops accepting requests.
 */
async function closePool() {
  await pool.end();
}

module.exports = {
  pool,
  testConnection,
  closePool,
};
