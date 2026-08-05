/**
 * @module utils/api-error
 * @description
 * Reusable custom error class for operational (expected) errors thrown
 * throughout services/controllers — e.g. validation failures, not-found
 * resources, auth failures. The central error-handling middleware relies
 * on `isOperational` to distinguish these from unexpected programming
 * errors/bugs when deciding what to expose to the client.
 */

/**
 * Represents a known, operational application error with an associated
 * HTTP status code (as opposed to an unexpected programming error).
 *
 * @extends Error
 */
class AppError extends Error {
  /**
   * @param {string} message - Human-readable error message.
   * @param {number} statusCode - HTTP status code associated with this error.
   */
  constructor(message, statusCode) {
    super(message);

    /**
     * HTTP status code for this error.
     * @type {number}
     */
    this.statusCode = statusCode;

    /**
     * Status classification derived from statusCode:
     * '4xx' -> 'fail', '5xx' -> 'error'.
     * @type {string}
     */
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';

    /**
     * Marks this as a known, handled (operational) error rather than
     * an unexpected bug — used by the error-handling middleware to
     * decide whether to expose the message to the client or mask it.
     * @type {boolean}
     */
    this.isOperational = true;

    // Excludes the AppError constructor itself from the captured stack
    // trace, so the trace points to where the error was thrown.
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
