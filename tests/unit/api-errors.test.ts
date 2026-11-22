import { describe, it, expect } from 'vitest';
import { ApiError, normalizeError } from '@/lib/api/errors';

describe('API Error Normalization', () => {
  it('correctly extracts message and status from ApiError instances', () => {
    const apiError = new ApiError(404, 'Technician profile not found');
    const normalized = normalizeError(apiError);

    expect(normalized.status).toBe(404);
    expect(normalized.message).toBe('Technician profile not found');
  });

  it('handles field validation error details with body prefix stripping', () => {
    const errorWithDetails = {
      status: 400,
      message: 'Validation failed',
      errorDetails: [
        { field: 'body.email', message: 'Invalid email address' },
        {
          field: 'body.password',
          message: 'Password must be at least 8 characters',
        },
      ],
    };
    const normalized = normalizeError(errorWithDetails);

    expect(normalized.status).toBe(400);
    expect(normalized.fieldErrors).toBeDefined();
    expect(normalized.fieldErrors?.email).toBe('Invalid email address');
    expect(normalized.fieldErrors?.password).toBe(
      'Password must be at least 8 characters'
    );
  });

  it('normalizes standard JavaScript Error object', () => {
    const generic = new Error('Unexpected connection timeout');
    const normalized = normalizeError(generic);

    expect(normalized.status).toBe(500);
    expect(normalized.message).toBe('Unexpected connection timeout');
  });

  it('normalizes string error values into safe user-facing message', () => {
    const stringErr = 'Failed to fetch resource';
    const normalized = normalizeError(stringErr);

    expect(normalized.status).toBe(500);
    expect(normalized.message).toBe('Failed to fetch resource');
  });

  it('normalizes unknown values into safe fallback message', () => {
    const nullVal = null;
    const normalized = normalizeError(nullVal);

    expect(normalized.status).toBe(500);
    expect(normalized.message).toBe(
      'An unexpected error occurred. Please try again.'
    );
  });
});
