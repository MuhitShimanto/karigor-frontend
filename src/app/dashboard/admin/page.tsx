'use client';

import * as React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  Users,
  DollarSign,
  Calendar,
  ArrowRight,
  FolderTree,
  Layers,
} from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { StatusBadge } from '@/features/bookings/status-badge';
import { clientRequest } from '@/lib/api/client';
import { Booking, Category, Payment } from '@/types/domain';
import { SafeUser } from '@/types/auth';

interface AdminUsersResponse {
  items: (SafeUser & {
    technicianProfile?: { id: string; location: string };
  })[];
  meta: { total: number };
}

interface AdminBookingsResponse {
  items: Booking[];
  meta: { total: number };
}

interface AdminPaymentsResponse {
  items: Payment[];
  meta: { total: number };
}

export default function AdminDashboardOverviewPage() {
  // Fetch platform users
  const { data: usersRes, isLoading: isUsersLoading } = useQuery({
    queryKey: ['admin', 'users', 'overview'],
    queryFn: () => clientRequest<AdminUsersResponse>('/admin/users?limit=50'),
  });

  // Fetch platform bookings
  const { data: bookingsRes, isLoading: isBookingsLoading } = useQuery({
    queryKey: ['admin', 'bookings', 'overview'],
    queryFn: () =>
      clientRequest<AdminBookingsResponse>('/admin/bookings?limit=50'),
  });

  // Fetch platform categories
  const { data: categoriesRes } = useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: () => clientRequest<Category[]>('/admin/categories'),
  });

  // Fetch payments
  const { data: paymentsRes } = useQuery({
    queryKey: ['admin', 'payments', 'overview'],
    queryFn: () =>
      clientRequest<AdminPaymentsResponse>('/admin/payments?limit=50'),
  });

  const users = usersRes?.data?.items || [];
  const totalUsersCount = usersRes?.data?.meta?.total ?? users.length;

  const bookings = bookingsRes?.data?.items || [];
  const totalBookingsCount = bookingsRes?.data?.meta?.total ?? bookings.length;

  const categories = categoriesRes?.data || [];
  const payments = paymentsRes?.data?.items || [];

  // Metrics computation
  const customersCount = users.filter((u) => u.role === 'CUSTOMER').length;
  const techniciansCount = users.filter((u) => u.role === 'TECHNICIAN').length;
  const bannedCount = users.filter((u) => u.status === 'BANNED').length;

  const totalGMV = payments
    .filter((p) => p.status === 'COMPLETED')
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);

  const activeBookingsCount = bookings.filter((b) =>
    ['PAID', 'IN_PROGRESS'].includes(b.status)
  ).length;

  const completedBookingsCount = bookings.filter(
    (b) => b.status === 'COMPLETED'
  ).length;

  const isLoading = isUsersLoading || isBookingsLoading;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-foreground text-2xl font-extrabold tracking-tight sm:text-3xl">
            System Administration
          </h1>
          <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
            Live overview of Karigor platform metrics, volume, user activity,
            and categories.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/dashboard/admin/users"
            className={buttonVariants({
              variant: 'outline',
              size: 'sm',
              className: 'gap-1.5 text-xs',
            })}
          >
            <Users className="text-primary h-3.5 w-3.5" />
            Manage Users
          </Link>
          <Link
            href="/dashboard/admin/categories"
            className={buttonVariants({
              size: 'sm',
              className: 'gap-1.5 text-xs',
            })}
          >
            <FolderTree className="h-3.5 w-3.5" />
            Manage Categories
          </Link>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {/* Total GMV Volume */}
        <Card className="border">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-muted-foreground text-xs font-medium">
                Platform Volume (GMV)
              </p>
              <p className="text-foreground mt-1 text-2xl font-bold">
                ${totalGMV.toFixed(2)}
              </p>
              <p className="text-muted-foreground mt-0.5 text-[11px]">
                From completed Stripe checkouts
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <DollarSign className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        {/* Registered Users */}
        <Card className="border">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-muted-foreground text-xs font-medium">
                Platform Users
              </p>
              <p className="text-foreground mt-1 text-2xl font-bold">
                {totalUsersCount}
              </p>
              <p className="text-muted-foreground mt-0.5 text-[11px]">
                {customersCount} customers, {techniciansCount} technicians
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Users className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        {/* Total Service Bookings */}
        <Card className="border">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-muted-foreground text-xs font-medium">
                Total Bookings
              </p>
              <p className="text-foreground mt-1 text-2xl font-bold">
                {totalBookingsCount}
              </p>
              <p className="text-muted-foreground mt-0.5 text-[11px]">
                {activeBookingsCount} active, {completedBookingsCount} completed
              </p>
            </div>
            <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-xl">
              <Calendar className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        {/* Categories & Catalog */}
        <Card className="border">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-muted-foreground text-xs font-medium">
                Service Categories
              </p>
              <p className="text-foreground mt-1 text-2xl font-bold">
                {categories.length}
              </p>
              <p className="text-muted-foreground mt-0.5 text-[11px]">
                {bannedCount > 0 ? (
                  <span className="text-destructive font-medium">
                    {bannedCount} banned users
                  </span>
                ) : (
                  <span>All users in good standing</span>
                )}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Layers className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admin Action Hub Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Link
          href="/dashboard/admin/users"
          className="group border-border/70 bg-card hover:border-primary/40 block rounded-xl border p-5 transition-all hover:shadow-xs"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Users className="h-5 w-5" />
            </div>
            <ArrowRight className="text-muted-foreground group-hover:text-primary h-4 w-4 transition-transform group-hover:translate-x-1" />
          </div>
          <h3 className="text-foreground mt-3 text-sm font-bold">
            User Management
          </h3>
          <p className="text-muted-foreground mt-1 text-xs">
            Search, filter, view profiles, and ban or reinstate customer and
            technician accounts.
          </p>
        </Link>

        <Link
          href="/dashboard/admin/categories"
          className="group border-border/70 bg-card hover:border-primary/40 block rounded-xl border p-5 transition-all hover:shadow-xs"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <FolderTree className="h-5 w-5" />
            </div>
            <ArrowRight className="text-muted-foreground group-hover:text-primary h-4 w-4 transition-transform group-hover:translate-x-1" />
          </div>
          <h3 className="text-foreground mt-3 text-sm font-bold">
            Category Management
          </h3>
          <p className="text-muted-foreground mt-1 text-xs">
            Create new service categories, manage active status, and maintain
            marketplace taxonomy.
          </p>
        </Link>

        <Link
          href="/dashboard/admin/bookings"
          className="group border-border/70 bg-card hover:border-primary/40 block rounded-xl border p-5 transition-all hover:shadow-xs"
        >
          <div className="flex items-center justify-between">
            <div className="bg-primary/10 text-primary flex h-9 w-9 items-center justify-center rounded-lg">
              <Calendar className="h-5 w-5" />
            </div>
            <ArrowRight className="text-muted-foreground group-hover:text-primary h-4 w-4 transition-transform group-hover:translate-x-1" />
          </div>
          <h3 className="text-foreground mt-3 text-sm font-bold">
            Global Bookings
          </h3>
          <p className="text-muted-foreground mt-1 text-xs">
            Monitor platform-wide service orders across customers, technicians,
            and fulfillment stages.
          </p>
        </Link>
      </div>

      {/* Recent Global Bookings Table */}
      <Card className="border">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base font-bold">
              Recent Platform Orders
            </CardTitle>
            <CardDescription className="text-xs">
              Latest bookings submitted across all categories
            </CardDescription>
          </div>
          <Link
            href="/dashboard/admin/bookings"
            className="text-primary inline-flex items-center gap-1 text-xs font-semibold hover:underline"
          >
            View all
            <ArrowRight className="h-3 w-3" />
          </Link>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-muted-foreground animate-pulse p-8 text-center text-xs">
              Loading platform activity...
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-muted-foreground p-8 text-center text-xs">
              No bookings recorded on the platform yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="text-xs">
                    <TableHead>Service</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Technician</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Order Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.slice(0, 8).map((b) => (
                    <TableRow key={b.id} className="text-xs">
                      <TableCell className="text-foreground font-semibold">
                        {b.service?.title || 'Service'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {b.customer?.name || 'Customer'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {b.technician?.user?.name || 'Technician'}
                      </TableCell>
                      <TableCell className="text-foreground font-semibold">
                        ${Number(b.totalAmount || 0).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={b.status} />
                      </TableCell>
                      <TableCell className="text-muted-foreground text-right">
                        {new Date(b.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
