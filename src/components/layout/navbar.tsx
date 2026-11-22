'use client';

import * as React from 'react';
import Link from 'next/link';
import { Wrench, Shield, Calendar, LogIn, UserPlus, User } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { MobileNav } from '@/components/layout/mobile-nav';
import { useAuthStore } from '@/store/auth.store';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: 'CUSTOMER' | 'TECHNICIAN' | 'ADMIN';
}

interface NavbarProps {
  user?: UserSession | null;
  onLogout?: () => void;
}

export function Navbar({
  user: propUser,
  onLogout: propOnLogout,
}: NavbarProps) {
  const storeUser = useAuthStore((state) => state.user);
  const storeLogout = useAuthStore((state) => state.logout);
  const checkSession = useAuthStore((state) => state.checkSession);

  React.useEffect(() => {
    checkSession();
  }, [checkSession]);

  const user = propUser !== undefined ? propUser : storeUser;
  const onLogout = propOnLogout || storeLogout;

  const getDashboardLink = () => {
    if (!user) return '/auth/login';
    if (user.role === 'ADMIN') return '/dashboard/admin';
    if (user.role === 'TECHNICIAN') return '/dashboard/technician';
    return '/dashboard/customer';
  };

  return (
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40 w-full border-b backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 transition-opacity hover:opacity-90"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500 text-white shadow-sm">
            <Wrench className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-foreground text-lg font-bold tracking-tight">
              Karigor
            </span>
            <span className="text-muted-foreground -mt-1 hidden text-[10px] sm:inline">
              Trusted Home Services
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          <Link
            href="/"
            className="text-foreground/80 hover:text-foreground underline-offset-4 transition-colors hover:underline"
          >
            Home
          </Link>
          <Link
            href="/services"
            className="text-foreground/80 hover:text-foreground underline-offset-4 transition-colors hover:underline"
          >
            Services
          </Link>
          <Link
            href="/services?sort=rating"
            className="text-foreground/80 hover:text-foreground underline-offset-4 transition-colors hover:underline"
          >
            Top Technicians
          </Link>
          {user && (
            <Link
              href={getDashboardLink()}
              className="text-primary flex items-center gap-1.5 font-semibold underline-offset-4 hover:underline"
            >
              {user.role === 'ADMIN' && <Shield className="h-4 w-4" />}
              {user.role === 'TECHNICIAN' && <Wrench className="h-4 w-4" />}
              {user.role === 'CUSTOMER' && <Calendar className="h-4 w-4" />}
              Dashboard
            </Link>
          )}
        </nav>

        {/* Right Action Buttons */}
        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />

          {!user ? (
            <div className="flex items-center gap-2">
              <Link
                href="/auth/login"
                className={buttonVariants({
                  variant: 'ghost',
                  size: 'sm',
                  className: 'flex items-center gap-1.5',
                })}
              >
                <LogIn className="h-4 w-4" />
                Sign In
              </Link>
              <Link
                href="/auth/register"
                className={buttonVariants({
                  size: 'sm',
                  className: 'flex items-center gap-1.5',
                })}
              >
                <UserPlus className="h-4 w-4" />
                Register
              </Link>
            </div>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <User className="text-muted-foreground h-4 w-4" />
                    <span className="max-w-[120px] truncate">
                      {user.name || user.email}
                    </span>
                    <Badge
                      variant="secondary"
                      className="text-[10px] font-semibold uppercase"
                    >
                      {user.role}
                    </Badge>
                  </Button>
                }
              />
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>
                    <p className="text-sm font-medium">{user.name || 'User'}</p>
                    <p className="text-muted-foreground truncate text-xs">
                      {user.email}
                    </p>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Link href={getDashboardLink()} className="w-full">
                    Dashboard Overview
                  </Link>
                </DropdownMenuItem>
                {user.role === 'CUSTOMER' && (
                  <DropdownMenuItem>
                    <Link href="/dashboard/customer" className="w-full">
                      My Bookings & Payments
                    </Link>
                  </DropdownMenuItem>
                )}
                {user.role === 'TECHNICIAN' && (
                  <>
                    <DropdownMenuItem>
                      <Link
                        href="/dashboard/technician/bookings"
                        className="w-full"
                      >
                        Booking Requests
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link
                        href="/dashboard/technician/availability"
                        className="w-full"
                      >
                        Availability Calendar
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link
                        href="/dashboard/technician/profile"
                        className="w-full"
                      >
                        Edit Profile & Rates
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                {user.role === 'ADMIN' && (
                  <>
                    <DropdownMenuItem>
                      <Link href="/dashboard/admin/users" className="w-full">
                        User Management
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link
                        href="/dashboard/admin/categories"
                        className="w-full"
                      >
                        Service Categories
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={onLogout}
                  className="text-destructive focus:text-destructive cursor-pointer"
                >
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Mobile Nav Button */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <MobileNav user={user} />
        </div>
      </div>
    </header>
  );
}
