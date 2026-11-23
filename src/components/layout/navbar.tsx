'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Wrench,
  Calendar,
  LogIn,
  UserPlus,
  User,
  LayoutDashboard,
  Clock,
  Users,
  Layers,
  LogOut,
} from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
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
  avatarUrl?: string | null;
}

interface NavbarProps {
  user?: UserSession | null;
  onLogout?: () => void;
}

function getInitials(name?: string, email?: string): string {
  if (name?.trim()) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  }
  if (email?.trim()) {
    return email.trim().slice(0, 2).toUpperCase();
  }
  return '';
}

function NavLinks() {
  const pathname = usePathname();

  const isHome = pathname === '/';
  const isServices =
    pathname === '/services' || pathname.startsWith('/services/');
  const isTopTechnicians =
    pathname === '/technicians' || pathname.startsWith('/technicians/');

  const links = [
    { href: '/', label: 'Home', active: isHome },
    { href: '/services', label: 'Services', active: isServices },
    {
      href: '/technicians',
      label: 'Top Technicians',
      active: isTopTechnicians,
    },
  ];

  return (
    <nav className="hidden items-center gap-1.5 md:flex">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            'rounded-lg px-3.5 py-1.5 text-sm font-medium transition-all duration-200',
            link.active
              ? 'bg-primary/10 text-primary dark:bg-primary/20 font-bold shadow-xs'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          )}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
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

  const initials = user ? getInitials(user.name, user.email) : '';

  return (
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40 w-full border-b backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 transition-opacity hover:opacity-90"
        >
          <div className="bg-primary text-primary-foreground flex h-9 w-9 items-center justify-center rounded-lg shadow-sm">
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
        <React.Suspense
          fallback={
            <nav className="hidden items-center gap-1.5 md:flex">
              <span className="text-muted-foreground rounded-lg px-3.5 py-1.5 text-sm font-medium">
                Home
              </span>
              <span className="text-muted-foreground rounded-lg px-3.5 py-1.5 text-sm font-medium">
                Services
              </span>
              <span className="text-muted-foreground rounded-lg px-3.5 py-1.5 text-sm font-medium">
                Top Technicians
              </span>
            </nav>
          }
        >
          <NavLinks />
        </React.Suspense>

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
                    variant="ghost"
                    size="icon"
                    className="border-border bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary focus-visible:ring-ring relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border transition-colors focus-visible:ring-2"
                    aria-label="User menu"
                  >
                    {user.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={user.avatarUrl}
                        alt={user.name || 'User avatar'}
                        className="h-full w-full object-cover"
                      />
                    ) : initials ? (
                      <span className="text-xs font-semibold tracking-wider">
                        {initials}
                      </span>
                    ) : (
                      <User className="h-4 w-4" />
                    )}
                  </Button>
                }
              />
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-foreground truncate text-sm font-semibold">
                        {user.name || 'User'}
                      </p>
                      <Badge
                        variant="secondary"
                        className="shrink-0 text-[10px] font-bold uppercase"
                      >
                        {user.role}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mt-0.5 truncate text-xs font-normal">
                      {user.email}
                    </p>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Link
                    href={getDashboardLink()}
                    className="flex w-full items-center gap-2"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                {user.role === 'CUSTOMER' && (
                  <DropdownMenuItem>
                    <Link
                      href="/dashboard/customer"
                      className="flex w-full items-center gap-2"
                    >
                      <Calendar className="h-4 w-4" />
                      My Bookings
                    </Link>
                  </DropdownMenuItem>
                )}
                {user.role === 'TECHNICIAN' && (
                  <>
                    <DropdownMenuItem>
                      <Link
                        href="/dashboard/technician/bookings"
                        className="flex w-full items-center gap-2"
                      >
                        <Calendar className="h-4 w-4" />
                        My Bookings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link
                        href="/dashboard/technician/availability"
                        className="flex w-full items-center gap-2"
                      >
                        <Clock className="h-4 w-4" />
                        Availability Calendar
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link
                        href="/dashboard/technician/profile"
                        className="flex w-full items-center gap-2"
                      >
                        <User className="h-4 w-4" />
                        Edit Profile & Rates
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                {user.role === 'ADMIN' && (
                  <>
                    <DropdownMenuItem>
                      <Link
                        href="/dashboard/admin/bookings"
                        className="flex w-full items-center gap-2"
                      >
                        <Calendar className="h-4 w-4" />
                        All Bookings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link
                        href="/dashboard/admin/users"
                        className="flex w-full items-center gap-2"
                      >
                        <Users className="h-4 w-4" />
                        User Management
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link
                        href="/dashboard/admin/categories"
                        className="flex w-full items-center gap-2"
                      >
                        <Layers className="h-4 w-4" />
                        Service Categories
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={onLogout}
                  className="text-destructive focus:text-destructive flex cursor-pointer items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
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
