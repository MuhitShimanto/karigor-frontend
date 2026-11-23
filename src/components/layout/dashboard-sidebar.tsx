'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Wrench,
  LayoutDashboard,
  Calendar,
  Clock,
  User,
  Users,
  Layers,
  ShoppingBag,
  LogOut,
  Menu,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { useAuthStore } from '@/store/auth.store';
import { SafeUser } from '@/types/auth';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavContentProps {
  role: string;
  user: SafeUser | null;
  items: NavItem[];
  pathname: string;
  onNavigate?: () => void;
  onLogout: () => void;
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

function NavContent({
  role,
  user,
  items,
  pathname,
  onNavigate,
  onLogout,
}: NavContentProps) {
  const initials = getInitials(user?.name, user?.email);

  return (
    <div className="flex h-full flex-col justify-between p-4">
      <div className="space-y-6">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 px-2">
          <div className="bg-primary text-primary-foreground flex h-9 w-9 items-center justify-center rounded-lg shadow-sm">
            <Wrench className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-foreground text-lg font-bold tracking-tight">
              Karigor
            </span>
            <span className="text-muted-foreground -mt-1 text-[10px]">
              {role === 'ADMIN'
                ? 'Admin Portal'
                : role === 'TECHNICIAN'
                  ? 'Technician Hub'
                  : 'Customer Area'}
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="space-y-1">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Icon
                  className={`h-4 w-4 ${isActive ? 'text-primary-foreground' : 'text-muted-foreground'}`}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Controls */}
      <div className="space-y-3 pt-4">
        {/* Role Badge & Profile (Premium Glass Card with soft light glow behind) */}
        <div className="group relative">
          {/* Soft light radius behind the glass */}
          <div className="from-primary/30 via-primary/10 to-primary/20 pointer-events-none absolute -inset-1 rounded-2xl bg-gradient-to-tr opacity-70 blur-md transition-opacity duration-300 group-hover:opacity-100" />

          {/* Glass Card */}
          <div className="bg-card/75 dark:bg-card/50 relative rounded-xl border border-white/20 p-3 shadow-md backdrop-blur-xl dark:border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="border-primary/20 bg-primary/10 text-primary relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-xs font-bold uppercase shadow-inner">
                {user?.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.avatarUrl}
                    alt={user.name || 'User avatar'}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : initials ? (
                  initials
                ) : (
                  <User className="h-4 w-4" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1.5">
                  <p className="text-foreground truncate text-xs leading-tight font-semibold">
                    {user?.name || 'User'}
                  </p>
                  <Badge
                    variant="secondary"
                    className="shrink-0 px-1.5 py-0 text-[9px] font-bold tracking-wider uppercase"
                  >
                    {role}
                  </Badge>
                </div>
                <p className="text-muted-foreground mt-0.5 truncate text-[11px]">
                  {user?.email}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t px-2 pt-2">
          <span className="text-muted-foreground text-xs font-medium">
            Appearance
          </span>
          <ThemeToggle />
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onLogout}
          className="text-destructive hover:text-destructive hover:bg-destructive/10 w-full justify-center gap-2 font-medium transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </Button>
      </div>
    </div>
  );
}

export function DashboardSidebar({
  user: initialUser,
}: {
  user?: SafeUser | null;
}) {
  const pathname = usePathname();
  const storeUser = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const user = initialUser || storeUser;
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const role = user?.role || 'CUSTOMER';

  const customerNav: NavItem[] = [
    { label: 'My Bookings', href: '/dashboard/customer', icon: Calendar },
    { label: 'Browse Services', href: '/services', icon: ShoppingBag },
  ];

  const technicianNav: NavItem[] = [
    { label: 'Overview', href: '/dashboard/technician', icon: LayoutDashboard },
    {
      label: 'Job Requests',
      href: '/dashboard/technician/bookings',
      icon: Calendar,
    },
    {
      label: 'Availability',
      href: '/dashboard/technician/availability',
      icon: Clock,
    },
    {
      label: 'Profile & Rates',
      href: '/dashboard/technician/profile',
      icon: User,
    },
  ];

  const adminNav: NavItem[] = [
    {
      label: 'Platform Stats',
      href: '/dashboard/admin',
      icon: LayoutDashboard,
    },
    { label: 'User Management', href: '/dashboard/admin/users', icon: Users },
    { label: 'Categories', href: '/dashboard/admin/categories', icon: Layers },
    {
      label: 'All Bookings',
      href: '/dashboard/admin/bookings',
      icon: Calendar,
    },
  ];

  const currentNav =
    role === 'ADMIN'
      ? adminNav
      : role === 'TECHNICIAN'
        ? technicianNav
        : customerNav;

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="bg-card/60 sticky top-0 hidden h-screen w-64 flex-col border-r backdrop-blur md:flex">
        <NavContent
          role={role}
          user={user}
          items={currentNav}
          pathname={pathname}
          onLogout={() => logout()}
        />
      </aside>

      {/* Mobile Top Navbar with Sheet Drawer */}
      <div className="bg-background flex h-14 items-center justify-between border-b px-4 md:hidden">
        <div className="flex items-center gap-2">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle Dashboard Nav</span>
                </Button>
              }
            />
            <SheetContent side="left" className="w-72 p-0">
              <SheetHeader className="sr-only">
                <SheetTitle>Dashboard Navigation</SheetTitle>
              </SheetHeader>
              <NavContent
                role={role}
                user={user}
                items={currentNav}
                pathname={pathname}
                onNavigate={() => setMobileOpen(false)}
                onLogout={() => logout()}
              />
            </SheetContent>
          </Sheet>

          <Link href="/" className="flex items-center gap-2">
            <div className="bg-primary text-primary-foreground flex h-7 w-7 items-center justify-center rounded-md shadow-sm">
              <Wrench className="h-4 w-4" />
            </div>
            <span className="text-base font-bold">Karigor</span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="text-[10px] font-semibold uppercase"
          >
            {role}
          </Badge>
          <ThemeToggle />
        </div>
      </div>
    </>
  );
}
