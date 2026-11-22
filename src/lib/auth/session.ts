import { cookies } from 'next/headers';
import { decodeJwt } from 'jose';
import { SafeUser, UserRole } from '@/types/auth';

const COOKIE_NAME = process.env.AUTH_COOKIE_NAME || 'karigor_token';
const BACKEND_URL = process.env.BACKEND_API_URL || 'http://localhost:5000/api';

export async function getServerSession(): Promise<SafeUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) return null;

  try {
    const res = await fetch(`${BACKEND_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });

    if (!res.ok) {
      return null;
    }

    const json = await res.json();
    return json.data as SafeUser;
  } catch {
    // If backend is temporarily unreachable, decode the token payload for basic role
    try {
      const decoded = decodeJwt(token) as { id: string; role: UserRole };
      if (decoded?.id && decoded?.role) {
        return {
          id: decoded.id,
          name: 'Authenticated User',
          email: '',
          role: decoded.role,
          status: 'ACTIVE',
        };
      }
    } catch {
      return null;
    }
    return null;
  }
}
