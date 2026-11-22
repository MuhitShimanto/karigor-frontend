import { cookies } from 'next/headers';
import { ApiError, normalizeError } from './errors';
import { ApiResponse } from './client';

export async function serverRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const baseUrl = process.env.BACKEND_API_URL || 'http://localhost:5000/api';
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${baseUrl}${cleanPath}`;

  const cookieStore = await cookies();
  const token = cookieStore.get(
    process.env.AUTH_COOKIE_NAME || 'karigor_token'
  )?.value;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  let res: Response;
  try {
    res = await fetch(url, {
      ...options,
      headers,
    });
  } catch {
    throw new ApiError(0, 'Unable to connect to the backend server.');
  }

  const json = (await res.json().catch(() => null)) as ApiResponse<T> | null;

  if (!res.ok) {
    const normalized = normalizeError({
      status: res.status,
      message: json?.message || 'Server request failed.',
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
