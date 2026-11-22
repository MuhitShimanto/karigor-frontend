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

function NavContent({
  role,
  user,
  items,
  pathname,
  onNavigate,
  onLogout,
}: NavContentProps) {
  return (
    <div className="flex h-full flex-col justify-between p-4">
      <div className="space-y-6">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500 text-white shadow-sm">
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

        {/* Role Badge & Profile */}
        <div className="bg-muted/30 rounded-xl border p-3">
          <div className="mb-1 flex items-center justify-between">
            <p className="text-foreground truncate text-xs font-semibold">
              {user?.name || 'User'}
            </p>
            <Badge
              variant="secondary"
              className="text-[10px] font-bold uppercase"
            >
              {role}
            </Badge>
          </div>
          <p className="text-muted-foreground truncate text-[11px]">
            {user?.email}
          </p>
        </div>

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
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Icon
                  className={`h-4 w-4 ${isActive ? 'text-white' : 'text-muted-foreground'}`}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Controls */}
      <div className="space-y-3 border-t pt-4">
        <div className="flex items-center justify-between px-2">
          <span className="text-muted-foreground text-xs">Theme</span>
          <ThemeToggle />
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onLogout}
          className="text-destructive hover:text-destructive hover:bg-destructive/10 w-full justify-start gap-2"
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
      <aside className="bg-card/60 hidden min-h-screen w-64 flex-col border-r backdrop-blur md:flex">
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
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-amber-500 text-white shadow-sm">
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
