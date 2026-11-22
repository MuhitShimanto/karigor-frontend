'use client';

import * as React from 'react';
import Link from 'next/link';
import { Menu, Wrench, Shield, Calendar, LogIn, UserPlus } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ThemeToggle } from '@/components/layout/theme-toggle';

interface MobileNavProps {
  user?: {
    name: string;
    email: string;
    role: 'CUSTOMER' | 'TECHNICIAN' | 'ADMIN';
  } | null;
}

export function MobileNav({ user }: MobileNavProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Open navigation menu</span>
          </Button>
        }
      />
      <SheetContent side="right" className="flex w-72 flex-col justify-between">
        <div className="flex flex-col gap-6 py-4">
          <SheetHeader className="text-left">
            <SheetTitle className="text-primary flex items-center gap-2 text-xl font-bold">
              <Wrench className="text-primary h-5 w-5" />
              <span>Karigor</span>
            </SheetTitle>
          </SheetHeader>

          <nav className="flex flex-col gap-3 font-medium">
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="hover:bg-accent rounded-md px-3 py-2 text-sm transition-colors"
            >
              Home
            </Link>
            <Link
              href="/services"
              onClick={() => setOpen(false)}
              className="hover:bg-accent rounded-md px-3 py-2 text-sm transition-colors"
            >
              All Services
            </Link>
            <Link
              href="/services?sort=rating"
              onClick={() => setOpen(false)}
              className="hover:bg-accent rounded-md px-3 py-2 text-sm transition-colors"
            >
              Top Technicians
            </Link>

            {user && (
              <>
                <div className="my-2 border-t" />
                <span className="text-muted-foreground px-3 text-xs font-semibold tracking-wider uppercase">
                  {user.role} Dashboard
                </span>
                {user.role === 'CUSTOMER' && (
                  <Link
                    href="/dashboard/customer"
                    onClick={() => setOpen(false)}
                    className="hover:bg-accent flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors"
                  >
                    <Calendar className="h-4 w-4" /> My Bookings
                  </Link>
                )}
                {user.role === 'TECHNICIAN' && (
                  <>
                    <Link
                      href="/dashboard/technician"
                      onClick={() => setOpen(false)}
                      className="hover:bg-accent flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors"
                    >
                      <Wrench className="h-4 w-4" /> Technician Dashboard
                    </Link>
                    <Link
                      href="/dashboard/technician/bookings"
                      onClick={() => setOpen(false)}
                      className="hover:bg-accent rounded-md px-3 py-2 text-sm transition-colors"
                    >
                      Booking Requests
                    </Link>
                    <Link
                      href="/dashboard/technician/availability"
                      onClick={() => setOpen(false)}
                      className="hover:bg-accent rounded-md px-3 py-2 text-sm transition-colors"
                    >
                      Availability Scheduler
                    </Link>
                  </>
                )}
                {user.role === 'ADMIN' && (
                  <>
                    <Link
                      href="/dashboard/admin"
                      onClick={() => setOpen(false)}
                      className="hover:bg-accent flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors"
                    >
                      <Shield className="h-4 w-4" /> Admin Console
                    </Link>
                    <Link
                      href="/dashboard/admin/categories"
                      onClick={() => setOpen(false)}
                      className="hover:bg-accent rounded-md px-3 py-2 text-sm transition-colors"
                    >
                      Manage Categories
                    </Link>
                  </>
                )}
              </>
            )}
          </nav>
        </div>

        <div className="flex flex-col gap-3 border-t pt-4">
          <div className="flex items-center justify-between px-2">
            <span className="text-muted-foreground text-sm">Appearance</span>
            <ThemeToggle />
          </div>

          {!user ? (
            <div className="flex flex-col gap-2">
              <Link
                href="/auth/login"
                onClick={() => setOpen(false)}
                className={buttonVariants({
                  variant: 'outline',
                  className: 'w-full justify-start gap-2',
                })}
              >
                <LogIn className="h-4 w-4" /> Sign In
              </Link>
              <Link
                href="/auth/register"
                onClick={() => setOpen(false)}
                className={buttonVariants({
                  className: 'w-full justify-start gap-2',
                })}
              >
                <UserPlus className="h-4 w-4" /> Register
              </Link>
            </div>
          ) : (
            <div className="text-muted-foreground px-2 py-1 text-xs">
              Signed in as{' '}
              <span className="text-foreground font-semibold">
                {user.email}
              </span>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
