'use client';

import * as React from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Calendar,
  Clock,
  DollarSign,
  Star,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Wrench,
  Loader2,
  Play,
  Check,
  X,
} from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
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
import { EmptyState } from '@/components/feedback/empty-state';
import { ErrorState } from '@/components/feedback/error-state';
import { clientRequest } from '@/lib/api/client';
import { Booking, TechnicianProfile } from '@/types/domain';
import { SafeUser } from '@/types/auth';

interface AuthMeResponse extends SafeUser {
  technicianProfile?: TechnicianProfile;
}

interface TechnicianBookingsResponse {
  items: Booking[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function TechnicianOverviewPage() {
  const queryClient = useQueryClient();

  // Fetch current technician info
  const { data: userRes } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: () => clientRequest<AuthMeResponse>('/auth/me'),
  });

  // Fetch recent bookings (poll every 20s for new incoming requests)
  const {
    data: bookingsRes,
    isLoading: isBookingsLoading,
    isError: isBookingsError,
    refetch: refetchBookings,
  } = useQuery({
    queryKey: ['technician', 'bookings', 'recent'],
    queryFn: () =>
      clientRequest<TechnicianBookingsResponse>(
        '/technician/bookings?limit=15'
      ),
    refetchInterval: 20000,
  });

  // Mutation for quick inline booking action (Accept, Decline, Start, Complete)
  const actionMutation = useMutation({
    mutationFn: async ({
      bookingId,
      action,
    }: {
      bookingId: string;
      action: 'accept' | 'decline' | 'start' | 'complete';
    }) => {
      return clientRequest(`/technician/bookings/${bookingId}`, {
        method: 'PATCH',
        body: JSON.stringify({ action }),
      });
    },
    onSuccess: (_, variables) => {
      const actionLabels = {
        accept: 'Booking request accepted.',
        decline: 'Booking request declined.',
        start: 'Job started. Customer has been notified.',
        complete: 'Job marked as completed.',
      };
      toast.success(actionLabels[variables.action]);
      queryClient.invalidateQueries({ queryKey: ['technician', 'bookings'] });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Action failed.';
      toast.error(msg);
    },
  });

  const user = userRes?.data;
  const profile = user?.technicianProfile;
  const bookings = bookingsRes?.data?.items || [];

  // Metrics computation
  const totalEarnings = bookings
    .filter((b) => b.status === 'COMPLETED')
    .reduce((sum, b) => sum + Number(b.totalAmount || 0), 0);

  const pendingRequests = bookings.filter(
    (b) => b.status === 'REQUESTED'
  ).length;
  const activeJobs = bookings.filter((b) =>
    ['PAID', 'IN_PROGRESS'].includes(b.status)
  ).length;
  const completedJobs = bookings.filter((b) => b.status === 'COMPLETED').length;

  const formatSlot = (slot?: { startTime: string; endTime: string }) => {
    if (!slot) return 'Standard slot';
    try {
      const s = new Date(slot.startTime);
      const e = new Date(slot.endTime);
      return `${s.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${s.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} - ${e.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    } catch {
      return 'Scheduled slot';
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome header & quick navigation */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-foreground text-2xl font-extrabold tracking-tight sm:text-3xl">
            Welcome back, {user?.name || 'Technician'}
          </h1>
          <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
            Here is your live overview of bookings, schedule, and earnings.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/dashboard/technician/availability"
            className={buttonVariants({
              variant: 'outline',
              size: 'sm',
              className: 'gap-1.5 text-xs',
            })}
          >
            <Calendar className="text-primary h-3.5 w-3.5" />
            Set Availability
          </Link>
          <Link
            href="/dashboard/technician/profile"
            className={buttonVariants({
              size: 'sm',
              className: 'gap-1.5 text-xs',
            })}
          >
            <Wrench className="h-3.5 w-3.5" />
            Manage Services
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {/* Total Earnings */}
        <Card className="border">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-muted-foreground text-xs font-medium">
                Total Earnings
              </p>
              <p className="text-foreground mt-1 text-2xl font-bold">
                ${totalEarnings.toFixed(2)}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <DollarSign className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        {/* Pending Requests */}
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
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <AlertCircle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        {/* Active Jobs */}
        <Card className="border">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-muted-foreground text-xs font-medium">
                Active Jobs
              </p>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-foreground text-2xl font-bold">
                  {activeJobs}
                </span>
                <span className="text-muted-foreground text-xs">
                  ({completedJobs} done)
                </span>
              </div>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Clock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        {/* Rating & Reviews */}
        <Card className="border">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-muted-foreground text-xs font-medium">
                Rating
              </p>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-foreground text-2xl font-bold">
                  {profile?.avgRating
                    ? Number(profile.avgRating).toFixed(1)
                    : 'New'}
                </span>
                <span className="text-muted-foreground text-xs">
                  ({profile?.reviewCount ?? 0} reviews)
                </span>
              </div>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
              <Star className="h-5 w-5 fill-amber-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Bookings & Action Feed */}
      <Card className="border">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base font-bold">
              Recent Jobs & Requests
            </CardTitle>
            <CardDescription className="text-xs">
              Incoming service requests and current jobs requiring attention
            </CardDescription>
          </div>
          <Link
            href="/dashboard/technician/bookings"
            className="text-primary inline-flex items-center gap-1 text-xs font-semibold hover:underline"
          >
            View all bookings
            <ArrowRight className="h-3 w-3" />
          </Link>
        </CardHeader>
        <CardContent>
          {isBookingsLoading ? (
            <div className="text-muted-foreground animate-pulse p-8 text-center text-xs">
              Loading requests and jobs...
            </div>
          ) : isBookingsError ? (
            <ErrorState
              title="Could not load bookings"
              message="Failed to fetch your technician bookings."
              onRetry={() => refetchBookings()}
            />
          ) : bookings.length === 0 ? (
            <EmptyState
              title="No bookings assigned yet"
              description="Make sure you have added your services and scheduled availability so customers can find and book you."
              action={
                <Link
                  href="/dashboard/technician/availability"
                  className={buttonVariants({ size: 'sm', variant: 'outline' })}
                >
                  Configure Availability
                </Link>
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="text-xs">
                    <TableHead>Customer</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Scheduled Slot</TableHead>
                    <TableHead>Fee</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.slice(0, 8).map((b) => {
                    const isMutating =
                      actionMutation.isPending &&
                      actionMutation.variables?.bookingId === b.id;

                    return (
                      <TableRow key={b.id} className="text-xs">
                        <TableCell>
                          <div className="text-foreground font-semibold">
                            {b.customer?.name || 'Customer'}
                          </div>
                          <div className="text-muted-foreground text-[11px]">
                            {b.customer?.phone ||
                              b.customer?.email ||
                              b.address}
                          </div>
                        </TableCell>

                        <TableCell>
                          <span className="text-foreground font-medium">
                            {b.service?.title || 'Service'}
                          </span>
                        </TableCell>

                        <TableCell className="text-muted-foreground">
                          {formatSlot(b.slot)}
                        </TableCell>

                        <TableCell className="text-foreground font-semibold">
                          ${Number(b.totalAmount || 0).toFixed(2)}
                        </TableCell>

                        <TableCell>
                          <StatusBadge status={b.status} />
                        </TableCell>

                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* REQUESTED: Accept / Decline */}
                            {b.status === 'REQUESTED' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled={isMutating}
                                  onClick={() =>
                                    actionMutation.mutate({
                                      bookingId: b.id,
                                      action: 'accept',
                                    })
                                  }
                                  className="h-7 px-2 text-xs text-emerald-600 hover:bg-emerald-500/10 hover:text-emerald-700 dark:text-emerald-400"
                                >
                                  {isMutating &&
                                  actionMutation.variables?.action ===
                                    'accept' ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <Check className="mr-1 h-3 w-3" />
                                  )}
                                  Accept
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  disabled={isMutating}
                                  onClick={() =>
                                    actionMutation.mutate({
                                      bookingId: b.id,
                                      action: 'decline',
                                    })
                                  }
                                  className="text-destructive hover:bg-destructive/10 h-7 px-2 text-xs"
                                >
                                  <X className="mr-1 h-3 w-3" />
                                  Decline
                                </Button>
                              </>
                            )}

                            {/* PAID: Start Job */}
                            {b.status === 'PAID' && (
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={isMutating}
                                onClick={() =>
                                  actionMutation.mutate({
                                    bookingId: b.id,
                                    action: 'start',
                                  })
                                }
                                className="h-7 px-2 text-xs text-blue-600 hover:bg-blue-500/10 hover:text-blue-700 dark:text-blue-400"
                              >
                                {isMutating ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Play className="mr-1 h-3 w-3" />
                                )}
                                Start Job
                              </Button>
                            )}

                            {/* IN_PROGRESS: Complete Job */}
                            {b.status === 'IN_PROGRESS' && (
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={isMutating}
                                onClick={() =>
                                  actionMutation.mutate({
                                    bookingId: b.id,
                                    action: 'complete',
                                  })
                                }
                                className="h-7 px-2 text-xs text-emerald-600 hover:bg-emerald-500/10 hover:text-emerald-700 dark:text-emerald-400"
                              >
                                {isMutating ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <CheckCircle2 className="mr-1 h-3 w-3" />
                                )}
                                Complete
                              </Button>
                            )}

                            {['COMPLETED', 'DECLINED', 'CANCELLED'].includes(
                              b.status
                            ) && (
                              <span className="text-muted-foreground/60 text-[11px] italic">
                                Concluded
                              </span>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
