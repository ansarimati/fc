/**
 * Wraps async route handlers to automatically forward errors to
 * Express's error-handling middleware.
 */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export default asyncHandler;