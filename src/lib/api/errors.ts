export interface NormalizedError {
  status: number;
  message: string;
  fieldErrors?: Record<string, string>;
}

export class ApiError extends Error {
  public status: number;
  public fieldErrors?: Record<string, string>;

  constructor(
    status: number,
    message: string,
    fieldErrors?: Record<string, string>
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

export function normalizeError(error: unknown): NormalizedError {
  if (error instanceof ApiError) {
    return {
      status: error.status,
      message: error.message,
      fieldErrors: error.fieldErrors,
    };
  }

  if (typeof error === 'object' && error !== null) {
    const anyErr = error as Record<string, unknown>;
    const status = typeof anyErr.status === 'number' ? anyErr.status : 500;
    const message =
      typeof anyErr.message === 'string'
        ? anyErr.message
        : 'An unexpected error occurred.';

    // Extract fieldErrors from backend's errorDetails array
    let fieldErrors: Record<string, string> | undefined = undefined;
    if (Array.isArray(anyErr.errorDetails)) {
      fieldErrors = {};
      for (const item of anyErr.errorDetails) {
        if (typeof item === 'object' && item !== null) {
          const detail = item as { field?: string; message?: string };
          if (detail.field && detail.message) {
            // Strip prefixes like "body." or "query." or "params." from Zod path
            const cleanField = detail.field.replace(
              /^(body|query|params)\./,
              ''
            );
            fieldErrors[cleanField] = detail.message;
          }
        }
      }
      if (Object.keys(fieldErrors).length === 0) {
        fieldErrors = undefined;
      }
    } else if (
      typeof anyErr.fieldErrors === 'object' &&
      anyErr.fieldErrors !== null
    ) {
      fieldErrors = anyErr.fieldErrors as Record<string, string>;
    }

    return {
      status,
      message,
      fieldErrors,
    };
  }

  if (typeof error === 'string') {
    return {
      status: 500,
      message: error,
    };
  }

  return {
    status: 500,
    message: 'An unexpected error occurred. Please try again.',
  };
}
