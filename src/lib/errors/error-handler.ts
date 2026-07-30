// ThinkPost AI — Error Handler
// Maps any thrown error to the standardized FRD Section 7 response shape:
// { error: { code, message, field? } }
//
// CRITICAL: Never leaks stack traces, raw DB errors, or internal exception 
// text to the client. Logs full context server-side instead.

import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { AppError, ErrorCode, serverError } from './app-error';

/**
 * Handles any error and returns a properly formatted NextResponse.
 * 
 * Mapping:
 * - AppError → uses its code, message, field, httpStatus directly
 * - ZodError → maps to VALIDATION_ERROR with field-specific message
 * - Everything else → SERVER_ERROR with generic message, full context logged
 */
export function handleApiError(error: unknown): NextResponse {
  // Known application errors
  if (error instanceof AppError) {
    return NextResponse.json(error.toResponse(), { status: error.httpStatus });
  }

  // Zod validation errors → VALIDATION_ERROR
  if (error instanceof ZodError) {
    const firstIssue = error.issues[0];
    const field = firstIssue?.path?.join('.') || undefined;
    const message = firstIssue?.message || 'Invalid input. Please check your data and try again.';

    return NextResponse.json(
      {
        error: {
          code: ErrorCode.VALIDATION_ERROR,
          message,
          ...(field ? { field } : {}),
        },
      },
      { status: 400 }
    );
  }

  // Unknown errors → SERVER_ERROR
  // Log full context server-side, return generic message to client
  const wrappedError = serverError(error);

  console.error('[ThinkPost AI] Unhandled error:', {
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    cause: error instanceof Error ? error.cause : undefined,
    timestamp: new Date().toISOString(),
  });

  return NextResponse.json(wrappedError.toResponse(), { status: wrappedError.httpStatus });
}

/**
 * Formats an error for MCP tool responses (not HTTP).
 * Returns the same { error: { code, message, field? } } shape.
 */
export function handleMcpError(error: unknown): {
  content: Array<{ type: 'text'; text: string }>;
  isError: true;
} {
  let errorResponse: { error: { code: string; message: string; field?: string } };

  if (error instanceof AppError) {
    errorResponse = error.toResponse();
  } else if (error instanceof ZodError) {
    const firstIssue = error.issues[0];
    const field = firstIssue?.path?.join('.') || undefined;
    const message = firstIssue?.message || 'Invalid input. Please check your data and try again.';
    errorResponse = {
      error: {
        code: ErrorCode.VALIDATION_ERROR,
        message,
        ...(field ? { field } : {}),
      },
    };
  } else {
    // Log full context server-side
    console.error('[ThinkPost AI] Unhandled MCP error:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });
    errorResponse = serverError(error).toResponse();
  }

  return {
    content: [{ type: 'text', text: JSON.stringify(errorResponse) }],
    isError: true,
  };
}
