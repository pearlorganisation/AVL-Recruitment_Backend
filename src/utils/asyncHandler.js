// ─── asyncHandler.js ──────────────────────────────────────────────────────────
// Wraps async route handlers to eliminate try/catch boilerplate.
// Usage: export const myHandler = asyncHandler(async (req, res) => { ... });

export const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};






