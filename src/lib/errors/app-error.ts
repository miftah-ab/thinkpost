// ThinkPost AI — Application Error System
// Implements FRD Section 7 Error Handling exactly
// Every error code, HTTP status, and user-facing message matches the FRD table

// ============================================
// Error Codes — exact FRD names
// ============================================

export const ErrorCode = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  FORBIDDEN: 'FORBIDDEN',
  READ_ONLY_MODE: 'READ_ONLY_MODE',
  NOT_FOUND: 'NOT_FOUND',
  RATE_LIMITED: 'RATE_LIMITED',
  PROFILE_INCOMPLETE: 'PROFILE_INCOMPLETE',
  CONFLICT: 'CONFLICT', // Reserved for future — not used in v1
  SERVER_ERROR: 'SERVER_ERROR',
} as const;

export type ErrorCodeType = typeof ErrorCode[keyof typeof ErrorCode];

// ============================================
// HTTP Status mapping — exact FRD table
// ============================================

const ERROR_HTTP_STATUS: Record<ErrorCodeType, number> = {
  [ErrorCode.VALIDATION_ERROR]: 400,
  [ErrorCode.UNAUTHORIZED]: 401,
  [ErrorCode.TOKEN_EXPIRED]: 401,
  [ErrorCode.FORBIDDEN]: 403,
  [ErrorCode.READ_ONLY_MODE]: 403,
  [ErrorCode.NOT_FOUND]: 404,
  [ErrorCode.RATE_LIMITED]: 429,
  [ErrorCode.PROFILE_INCOMPLETE]: 200, // Flag, not error
  [ErrorCode.CONFLICT]: 409, // Reserved for future
  [ErrorCode.SERVER_ERROR]: 500,
};

// ============================================
// Default user-facing messages — exact FRD text
// ============================================

const DEFAULT_MESSAGES: Record<ErrorCodeType, string> = {
  [ErrorCode.VALIDATION_ERROR]: 'Invalid input. Please check your data and try again.',
  [ErrorCode.UNAUTHORIZED]: 'You need to sign in to do that.',
  [ErrorCode.TOKEN_EXPIRED]: 'Your session has expired. Please sign in again.',
  [ErrorCode.FORBIDDEN]: "You don't have permission to access this.",
  [ErrorCode.READ_ONLY_MODE]: 'This AI client is in read-only mode. Enable write access in Settings to allow it to save changes.',
  [ErrorCode.NOT_FOUND]: "We couldn't find that draft. It may have been deleted.",
  [ErrorCode.RATE_LIMITED]: "You're doing that a bit too fast — please wait a moment and try again.",
  [ErrorCode.PROFILE_INCOMPLETE]: 'Finish setting up your profile for better personalized posts.',
  [ErrorCode.CONFLICT]: 'This draft was changed elsewhere. Your version may overwrite those changes — continue?',
  [ErrorCode.SERVER_ERROR]: 'Something went wrong on our end. Please try again in a moment.',
};

// ============================================
// AppError class
// ============================================

export class AppError extends Error {
  public readonly code: ErrorCodeType;
  public readonly httpStatus: number;
  public readonly field?: string;
  public readonly userMessage: string;

  constructor(
    code: ErrorCodeType,
    options?: {
      message?: string;  // Custom user-facing message (overrides default)
      field?: string;     // Field name for VALIDATION_ERROR
      cause?: unknown;    // Original error for logging
    }
  ) {
    const userMessage = options?.message ?? DEFAULT_MESSAGES[code];
    super(userMessage);
    this.name = 'AppError';
    this.code = code;
    this.httpStatus = ERROR_HTTP_STATUS[code];
    this.userMessage = userMessage;
    this.field = options?.field;
    if (options?.cause) {
      this.cause = options.cause;
    }
  }

  /**
   * Returns the standardized error response shape (FRD Section 7):
   * { error: { code, message, field? } }
   */
  toResponse(): { error: { code: string; message: string; field?: string } } {
    const response: { error: { code: string; message: string; field?: string } } = {
      error: {
        code: this.code,
        message: this.userMessage,
      },
    };
    if (this.field) {
      response.error.field = this.field;
    }
    return response;
  }
}

// ============================================
// Convenience factory functions
// ============================================

export function validationError(message: string, field: string): AppError {
  return new AppError(ErrorCode.VALIDATION_ERROR, { message, field });
}

export function unauthorizedError(message?: string): AppError {
  return new AppError(ErrorCode.UNAUTHORIZED, { message });
}

export function tokenExpiredError(): AppError {
  return new AppError(ErrorCode.TOKEN_EXPIRED);
}

export function forbiddenError(message?: string): AppError {
  return new AppError(ErrorCode.FORBIDDEN, { message });
}

export function readOnlyModeError(): AppError {
  return new AppError(ErrorCode.READ_ONLY_MODE);
}

export function notFoundError(message?: string): AppError {
  return new AppError(ErrorCode.NOT_FOUND, { message });
}

export function rateLimitedError(): AppError {
  return new AppError(ErrorCode.RATE_LIMITED);
}

export function serverError(cause?: unknown): AppError {
  return new AppError(ErrorCode.SERVER_ERROR, { cause });
}
