// ─── ApiError.js ──────────────────────────────────────────────────────────────
// Standardised operational error class.
// throw new ApiError(404, "Resource not found")

export class ApiError extends Error {
    constructor(statusCode, message, errors = [], stack = "") {
        super(message);
        this.statusCode = statusCode;
        this.message = message;
        this.success = false;
        this.errors = errors;

        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}
