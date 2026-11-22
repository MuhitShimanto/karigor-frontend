import { NextResponse, type NextRequest } from 'next/server';
import { decodeJwt } from 'jose';
import { ROLE_HOMES, UserRole } from '@/lib/auth/roles';

const COOKIE_NAME = process.env.AUTH_COOKIE_NAME || 'karigor_token';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(COOKIE_NAME)?.value;

  const isAuthRoute = pathname.startsWith('/auth');
  const isProtectedRoute =
    pathname.startsWith('/dashboard') || pathname.startsWith('/payment');

  // 1. If user is already authenticated and visits /auth/login or /auth/register
  if (isAuthRoute && token) {
    try {
      const decoded = decodeJwt(token) as { role?: UserRole };
      const role = decoded?.role || 'CUSTOMER';
      const home = ROLE_HOMES[role] || ROLE_HOMES.CUSTOMER;
      return NextResponse.redirect(new URL(home, req.url));
    } catch {
      // invalid token, delete cookie and allow auth page
      const res = NextResponse.next();
      res.cookies.delete(COOKIE_NAME);
      return res;
    }
  }

  // 2. If guest tries to access protected dashboard or payment
  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/auth/login', req.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 3. Role-based scoping for /dashboard/**
  if (pathname.startsWith('/dashboard') && token) {
    try {
      const decoded = decodeJwt(token) as { role?: UserRole };
      const role = decoded?.role || 'CUSTOMER';
      const home = ROLE_HOMES[role] || ROLE_HOMES.CUSTOMER;

      const isAllowed =
        (role === 'ADMIN' && pathname.startsWith('/dashboard/admin')) ||
        (role === 'TECHNICIAN' &&
          pathname.startsWith('/dashboard/technician')) ||
        (role === 'CUSTOMER' && pathname.startsWith('/dashboard/customer'));

      if (!isAllowed) {
        // Redirect to their own dashboard segment
        return NextResponse.redirect(new URL(home, req.url));
      }
    } catch {
      const loginUrl = new URL('/auth/login', req.url);
      loginUrl.searchParams.set('next', pathname);
      const res = NextResponse.redirect(loginUrl);
      res.cookies.delete(COOKIE_NAME);
      return res;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/payment/:path*', '/auth/:path*'],
};
