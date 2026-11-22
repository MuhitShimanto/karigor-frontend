'use client';

import * as React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Calendar,
  Clock,
  CreditCard,
  CheckCircle,
  RotateCw,
} from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { BookingTable } from '@/features/bookings/booking-table';
import { PaymentTable } from '@/features/payments/payment-table';
import { ReviewDialog } from '@/features/reviews/review-dialog';
import { EmptyState } from '@/components/feedback/empty-state';
import { ErrorState } from '@/components/feedback/error-state';
import { clientRequest } from '@/lib/api/client';
import { Booking, Payment } from '@/types/domain';

export default function CustomerDashboardPage() {
  const [activeTab, setActiveTab] = React.useState<string>('bookings');
  const [statusFilter, setStatusFilter] = React.useState<string>('ALL');
  const [reviewingBooking, setReviewingBooking] =
    React.useState<Booking | null>(null);

  // Track previous booking statuses to show FR-CUS-8 status-change toasts
  const previousStatusMap = React.useRef<Record<string, string>>({});

  // Fetch Bookings with 20s refetch interval
  const {
    data: bookingsRes,
    isLoading: isBookingsLoading,
    isError: isBookingsError,
    refetch: refetchBookings,
    isFetching: isBookingsFetching,
  } = useQuery({
    queryKey: ['bookings', 'customer', statusFilter],
    queryFn: () => {
      const query = statusFilter !== 'ALL' ? `?status=${statusFilter}` : '';
      return clientRequest<Booking[]>(`/bookings${query}`);
    },
    refetchInterval: 20000,
  });

  // Fetch Payments history
  const {
    data: paymentsRes,
    isLoading: isPaymentsLoading,
    isError: isPaymentsError,
    refetch: refetchPayments,
  } = useQuery({
    queryKey: ['payments', 'customer'],
    queryFn: () => clientRequest<Payment[]>('/payments'),
    enabled: activeTab === 'payments',
  });

  const bookings = React.useMemo(
    () => bookingsRes?.data || [],
    [bookingsRes?.data]
  );
  const payments = React.useMemo(
    () => paymentsRes?.data || [],
    [paymentsRes?.data]
  );

  // FR-CUS-8: Trigger toast notifications when a booking status changes
  React.useEffect(() => {
    if (bookings.length === 0) return;

    for (const b of bookings) {
      const prev = previousStatusMap.current[b.id];
      if (prev && prev !== b.status) {
        if (b.status === 'ACCEPTED') {
          toast.success(
            `Good news! Your booking for "${b.service?.title || 'Service'}" was accepted. You can now proceed to payment.`
          );
        } else if (b.status === 'PAID') {
          toast.info(
            `Payment verified for "${b.service?.title || 'Service'}". Status is now PAID.`
          );
        } else if (b.status === 'IN_PROGRESS') {
          toast.info(
            `The technician has started work on "${b.service?.title || 'Service'}".`
          );
        } else if (b.status === 'COMPLETED') {
          toast.success(
            `Job completed! Please leave a review for your technician.`
          );
        } else if (b.status === 'DECLINED') {
          toast.warning(
            `Your booking request for "${b.service?.title || 'Service'}" was declined.`
          );
        } else if (b.status === 'CANCELLED') {
          toast.info(`Booking #${b.id.slice(0, 8)} has been cancelled.`);
        }
      }
      previousStatusMap.current[b.id] = b.status;
    }
  }, [bookings]);

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
            onClick={() => {
              refetchBookings();
              if (activeTab === 'payments') refetchPayments();
            }}
            disabled={isBookingsFetching}
            className="h-9 gap-1.5 text-xs"
          >
            <RotateCw
              className={`h-3.5 w-3.5 ${isBookingsFetching ? 'animate-spin' : ''}`}
            />
            Refresh
          </Button>

          <Link
            href="/services"
            className={buttonVariants({
              size: 'sm',
              className: 'h-9 gap-1.5 text-xs shadow-sm',
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
            <div className="bg-primary/10 text-primary flex h-9 w-9 items-center justify-center rounded-lg">
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

      {/* Main Tabs: Bookings vs Payment History */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="bg-muted/60 p-1">
          <TabsTrigger value="bookings" className="px-4 text-xs">
            My Bookings ({totalBookings})
          </TabsTrigger>
          <TabsTrigger value="payments" className="px-4 text-xs">
            Payment History
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Bookings */}
        <TabsContent value="bookings" className="space-y-4">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <h2 className="text-foreground text-base font-bold">
              Service Requests
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

          {isBookingsLoading ? (
            <div className="text-muted-foreground animate-pulse rounded-xl border p-8 text-center text-xs">
              Loading your bookings...
            </div>
          ) : isBookingsError ? (
            <ErrorState
              title="Could not load bookings"
              message="Please check your connection and click retry."
              onRetry={() => refetchBookings()}
            />
          ) : bookings.length > 0 ? (
            <BookingTable
              bookings={bookings}
              onRefresh={() => refetchBookings()}
              onLeaveReview={(booking) => setReviewingBooking(booking)}
            />
          ) : (
            <EmptyState
              title="No bookings in this category"
              description="You do not have any requests under the selected status filter."
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
        </TabsContent>

        {/* Tab 2: Payments History */}
        <TabsContent value="payments" className="space-y-4">
          <h2 className="text-foreground text-base font-bold">
            Transactions Log
          </h2>

          {isPaymentsLoading ? (
            <div className="text-muted-foreground animate-pulse rounded-xl border p-8 text-center text-xs">
              Loading transactions...
            </div>
          ) : isPaymentsError ? (
            <ErrorState
              title="Could not load payment logs"
              message="Please check your connection and try again."
              onRetry={() => refetchPayments()}
            />
          ) : payments.length > 0 ? (
            <PaymentTable payments={payments} />
          ) : (
            <EmptyState
              title="No payment records yet"
              description="Your verified Stripe payments will appear here once you complete checkout for accepted bookings."
            />
          )}
        </TabsContent>
      </Tabs>

      <ReviewDialog
        booking={reviewingBooking}
        open={Boolean(reviewingBooking)}
        onOpenChange={(open) => !open && setReviewingBooking(null)}
        onSuccess={() => refetchBookings()}
      />
    </div>
  );
}
