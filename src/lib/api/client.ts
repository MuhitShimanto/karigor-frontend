import { ApiError, normalizeError } from './errors';

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  errorDetails?: Array<{ field: string; message: string }> | unknown;
}

export async function clientRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = path.startsWith('/api/bff')
    ? path
    : `/api/bff${path.startsWith('/') ? path : `/${path}`}`;

  let res: Response;
  try {
    res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
  } catch {
    throw new ApiError(
      0,
      'Network error. Please check your internet connection.'
    );
  }

  const json = (await res.json().catch(() => null)) as ApiResponse<T> | null;

  if (res.status === 401) {
    if (
      typeof window !== 'undefined' &&
      !window.location.pathname.startsWith('/auth/login')
    ) {
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.assign('/auth/login?expired=1');
    }
  }

  if (!res.ok) {
    const normalized = normalizeError({
      status: res.status,
      message: json?.message || 'An unexpected error occurred.',
      errorDetails: json?.errorDetails,
    });
    throw new ApiError(
      normalized.status,
      normalized.message,
      normalized.fieldErrors
    );
  }

  return json as ApiResponse<T>;
}
