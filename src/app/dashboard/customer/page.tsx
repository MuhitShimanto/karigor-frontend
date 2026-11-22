'use client';

import * as React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  Calendar,
  Clock,
  CreditCard,
  CheckCircle,
  RotateCw,
} from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookingTable } from '@/features/bookings/booking-table';
import { EmptyState } from '@/components/feedback/empty-state';
import { ErrorState } from '@/components/feedback/error-state';
import { clientRequest } from '@/lib/api/client';
import { Booking } from '@/types/domain';

export default function CustomerDashboardPage() {
  const [statusFilter, setStatusFilter] = React.useState<string>('ALL');

  const {
    data: bookingsRes,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['bookings', 'customer', statusFilter],
    queryFn: () => {
      const query = statusFilter !== 'ALL' ? `?status=${statusFilter}` : '';
      return clientRequest<Booking[]>(`/bookings${query}`);
    },
    refetchInterval: 20000, // SRS FR-CUS-8: Refetch interval every 20s
  });

  const bookings = bookingsRes?.data || [];

  // Metrics
  const totalBookings = bookings.length;
  const pendingRequests = bookings.filter(
    (b) => b.status === 'REQUESTED'
  ).length;
  const acceptedJobs = bookings.filter((b) => b.status === 'ACCEPTED').length;
  const activeJobs = bookings.filter((b) =>
    ['PAID', 'IN_PROGRESS'].includes(b.status)
  ).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-foreground text-2xl font-extrabold tracking-tight sm:text-3xl">
            Customer Dashboard
          </h1>
          <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
            Track your home service requests, review quotes, and complete
            payments securely.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="h-9 gap-1.5 text-xs"
          >
            <RotateCw
              className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`}
            />
            Refresh
          </Button>

          <Link
            href="/services"
            className={buttonVariants({
              size: 'sm',
              className:
                'h-9 gap-1.5 bg-amber-500 text-xs text-white hover:bg-amber-600',
            })}
          >
            <Calendar className="h-3.5 w-3.5" /> Book Service
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="border">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-muted-foreground text-xs font-medium">
                Total Bookings
              </p>
              <p className="text-foreground mt-1 text-2xl font-bold">
                {totalBookings}
              </p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
              <Calendar className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-muted-foreground text-xs font-medium">
                Pending Requests
              </p>
              <p className="mt-1 text-2xl font-bold text-amber-600 dark:text-amber-400">
                {pendingRequests}
              </p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
              <Clock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-muted-foreground text-xs font-medium">
                Ready to Pay
              </p>
              <p className="mt-1 text-2xl font-bold text-blue-600 dark:text-blue-400">
                {acceptedJobs}
              </p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600">
              <CreditCard className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-muted-foreground text-xs font-medium">
                Active Jobs
              </p>
              <p className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {activeJobs}
              </p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
              <CheckCircle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bookings Section with Status Tabs */}
      <div className="space-y-4">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <h2 className="text-foreground text-lg font-bold">
            My Booking Requests
          </h2>

          <Tabs
            value={statusFilter}
            onValueChange={setStatusFilter}
            className="w-auto"
          >
            <TabsList className="bg-muted/60 h-8 p-0.5">
              <TabsTrigger value="ALL" className="h-7 px-2.5 text-xs">
                All
              </TabsTrigger>
              <TabsTrigger value="REQUESTED" className="h-7 px-2.5 text-xs">
                Requested
              </TabsTrigger>
              <TabsTrigger value="ACCEPTED" className="h-7 px-2.5 text-xs">
                Accepted
              </TabsTrigger>
              <TabsTrigger value="PAID" className="h-7 px-2.5 text-xs">
                Paid
              </TabsTrigger>
              <TabsTrigger value="COMPLETED" className="h-7 px-2.5 text-xs">
                Completed
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {isLoading ? (
          <div className="text-muted-foreground animate-pulse rounded-xl border p-8 text-center text-xs">
            Loading your bookings...
          </div>
        ) : isError ? (
          <ErrorState
            title="Could not load bookings"
            message="Please check your connection and click retry."
            onRetry={() => refetch()}
          />
        ) : bookings.length > 0 ? (
          <BookingTable bookings={bookings} onRefresh={() => refetch()} />
        ) : (
          <EmptyState
            title="No bookings in this status"
            description="You don't have any bookings matching the current filter."
            action={
              <Link
                href="/services"
                className={buttonVariants({ size: 'sm', variant: 'outline' })}
              >
                Explore Services
              </Link>
            }
          />
        )}
      </div>
    </div>
  );
}
