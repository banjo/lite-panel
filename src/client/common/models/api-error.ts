export type ErrorType = "NOT_FOUND" | "UNAUTHORIZED" | "FORBIDDEN" | "INTERNAL_SERVER_ERROR";

export class ApiError extends Error {
    public type: ErrorType;

    constructor(message: string, type: ErrorType) {
        super(message);
        this.name = this.constructor.name;
        this.type = type;
        Error.captureStackTrace(this, this.constructor);
    }

    static isApiError = (error: Error): error is ApiError => error instanceof ApiError;
}
