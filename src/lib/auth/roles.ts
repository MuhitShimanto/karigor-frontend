export const ROLE_HOMES = {
  CUSTOMER: '/dashboard/customer',
  TECHNICIAN: '/dashboard/technician',
  ADMIN: '/dashboard/admin',
} as const;

export type UserRole = keyof typeof ROLE_HOMES;

export function getRoleHome(role?: string | null): string {
  if (role === 'ADMIN') return ROLE_HOMES.ADMIN;
  if (role === 'TECHNICIAN') return ROLE_HOMES.TECHNICIAN;
  return ROLE_HOMES.CUSTOMER;
}

export function isPathAllowedForRole(
  pathname: string,
  role?: string | null
): boolean {
  if (!role) return false;
  if (role === 'ADMIN') {
    return (
      pathname.startsWith('/dashboard/admin') || pathname.startsWith('/payment')
    );
  }
  if (role === 'TECHNICIAN') {
    return (
      pathname.startsWith('/dashboard/technician') ||
      pathname.startsWith('/payment')
    );
  }
  if (role === 'CUSTOMER') {
    return (
      pathname.startsWith('/dashboard/customer') ||
      pathname.startsWith('/payment')
    );
  }
  return false;
}
