// ─── ApiResponse.js ───────────────────────────────────────────────────────────
// Uniform success response shape.
// return res.status(200).json(new ApiResponse(200, data, "Done"))

export class ApiResponse {
    constructor(statusCode, data, message = "Success") {
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
        this.success = statusCode < 400;
    }
}
