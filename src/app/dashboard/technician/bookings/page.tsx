'use client';

import * as React from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Calendar,
  MapPin,
  User,
  Phone,
  Mail,
  FileText,
  DollarSign,
  Check,
  X,
  Play,
  CheckCircle2,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatusBadge } from '@/features/bookings/status-badge';
import { EmptyState } from '@/components/feedback/empty-state';
import { ErrorState } from '@/components/feedback/error-state';
import { clientRequest } from '@/lib/api/client';
import { Booking } from '@/types/domain';
import { BookingStatus } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface TechnicianBookingsResponse {
  items: Booking[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function TechnicianBookingsManagementPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = React.useState<string>('ALL');
  const [page, setPage] = React.useState<number>(1);
  const [expandedId, setExpandedId] = React.useState<string | null>(null);

  const queryKey = ['technician', 'bookings', statusFilter, page];

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey,
    queryFn: () => {
      const statusParam =
        statusFilter !== 'ALL' ? `&status=${statusFilter}` : '';
      return clientRequest<TechnicianBookingsResponse>(
        `/technician/bookings?page=${page}&limit=10${statusParam}`
      );
    },
  });

  // Optimistic booking action mutation (MR-2, FR-TECH-4)
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
    onMutate: async ({ bookingId, action }) => {
      await queryClient.cancelQueries({ queryKey });
      const previousData =
        queryClient.getQueryData<TechnicianBookingsResponse>(queryKey);

      const targetStatus: Record<string, BookingStatus> = {
        accept: 'ACCEPTED',
        decline: 'DECLINED',
        start: 'IN_PROGRESS',
        complete: 'COMPLETED',
      };

      if (previousData) {
        queryClient.setQueryData<TechnicianBookingsResponse>(queryKey, {
          ...previousData,
          items: previousData.items.map((b) =>
            b.id === bookingId
              ? { ...b, status: targetStatus[action] || b.status }
              : b
          ),
        });
      }

      return { previousData };
    },
    onError: (err: unknown, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
      const msg =
        err instanceof Error
          ? err.message
          : 'Could not perform booking action.';
      toast.error(msg);
    },
    onSuccess: (_, variables) => {
      const messages = {
        accept: 'Booking accepted! Customer can now proceed to payment.',
        decline: 'Booking request declined.',
        start: 'Job started. Customer notified that work is in progress.',
        complete: 'Job marked as completed. Customer can now leave a review.',
      };
      toast.success(messages[variables.action]);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['technician', 'bookings'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });

  const bookings = data?.data?.items || [];
  const meta = data?.data?.meta || {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  };

  const formatSlot = (slot?: { startTime: string; endTime: string }) => {
    if (!slot) return 'Standard Consultation';
    try {
      const s = new Date(slot.startTime);
      const e = new Date(slot.endTime);
      return `${s.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}, ${s.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} - ${e.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    } catch {
      return 'Scheduled slot';
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/dashboard/technician"
          className="text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1.5 text-xs font-semibold transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Technician Overview
        </Link>
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-foreground text-2xl font-extrabold tracking-tight sm:text-3xl">
              Job Requests & Bookings
            </h1>
            <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
              Manage incoming requests, start confirmed jobs, and record
              completed assignments.
            </p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <Tabs
        value={statusFilter}
        onValueChange={(val) => {
          setStatusFilter(val);
          setPage(1);
        }}
        className="space-y-4"
      >
        <div className="overflow-x-auto pb-1">
          <TabsList className="bg-muted/60 h-9 p-1">
            <TabsTrigger value="ALL" className="px-3 text-xs">
              All
            </TabsTrigger>
            <TabsTrigger value="REQUESTED" className="px-3 text-xs">
              Requested
            </TabsTrigger>
            <TabsTrigger value="ACCEPTED" className="px-3 text-xs">
              Accepted
            </TabsTrigger>
            <TabsTrigger value="PAID" className="px-3 text-xs">
              Paid (Ready)
            </TabsTrigger>
            <TabsTrigger value="IN_PROGRESS" className="px-3 text-xs">
              In Progress
            </TabsTrigger>
            <TabsTrigger value="COMPLETED" className="px-3 text-xs">
              Completed
            </TabsTrigger>
            <TabsTrigger value="CANCELLED" className="px-3 text-xs">
              Cancelled
            </TabsTrigger>
          </TabsList>
        </div>
      </Tabs>

      {/* Bookings List */}
      {isLoading ? (
        <div className="text-muted-foreground animate-pulse rounded-xl border p-12 text-center text-xs">
          Loading bookings...
        </div>
      ) : isError ? (
        <ErrorState
          title="Could not load bookings"
          message="Please verify your connection and click retry."
          onRetry={() => refetch()}
        />
      ) : bookings.length === 0 ? (
        <EmptyState
          title="No bookings under this filter"
          description="You do not have any jobs matching the selected status filter."
        />
      ) : (
        <div className="space-y-3">
          {bookings.map((booking) => {
            const isExpanded = expandedId === booking.id;
            const isMutating =
              actionMutation.isPending &&
              actionMutation.variables?.bookingId === booking.id;

            return (
              <Card
                key={booking.id}
                className={cn(
                  'border transition-all',
                  isExpanded
                    ? 'ring-primary/40 shadow-sm ring-1'
                    : 'hover:border-border'
                )}
              >
                <CardContent className="p-4 sm:p-5">
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    {/* Left: Summary info */}
                    <div className="flex-1 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-foreground text-sm font-extrabold sm:text-base">
                          {booking.service?.title || 'Service Appointment'}
                        </span>
                        <StatusBadge status={booking.status} />
                      </div>

                      <div className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                        <span className="flex items-center gap-1">
                          <User className="text-primary h-3.5 w-3.5" />
                          <strong className="text-foreground">
                            {booking.customer?.name || 'Customer'}
                          </strong>
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatSlot(booking.slot)}
                        </span>
                        <span className="text-foreground flex items-center gap-1 font-semibold">
                          <DollarSign className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                          ${Number(booking.totalAmount || 0).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      {/* REQUESTED: Accept / Decline */}
                      {booking.status === 'REQUESTED' && (
                        <>
                          <Button
                            size="sm"
                            disabled={isMutating}
                            onClick={() =>
                              actionMutation.mutate({
                                bookingId: booking.id,
                                action: 'accept',
                              })
                            }
                            className="h-8 gap-1 bg-emerald-600 text-xs font-semibold text-white hover:bg-emerald-700"
                          >
                            {isMutating &&
                            actionMutation.variables?.action === 'accept' ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Check className="h-3.5 w-3.5" />
                            )}
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={isMutating}
                            onClick={() =>
                              actionMutation.mutate({
                                bookingId: booking.id,
                                action: 'decline',
                              })
                            }
                            className="text-destructive hover:bg-destructive/10 border-destructive/30 h-8 gap-1 text-xs"
                          >
                            <X className="h-3.5 w-3.5" />
                            Decline
                          </Button>
                        </>
                      )}

                      {/* ACCEPTED: Waiting for customer payment */}
                      {booking.status === 'ACCEPTED' && (
                        <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-600 dark:text-amber-400">
                          Awaiting Customer Payment
                        </span>
                      )}

                      {/* PAID: Start Job */}
                      {booking.status === 'PAID' && (
                        <Button
                          size="sm"
                          disabled={isMutating}
                          onClick={() =>
                            actionMutation.mutate({
                              bookingId: booking.id,
                              action: 'start',
                            })
                          }
                          className="h-8 gap-1 bg-blue-600 text-xs font-semibold text-white hover:bg-blue-700"
                        >
                          {isMutating ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Play className="h-3.5 w-3.5" />
                          )}
                          Start Job
                        </Button>
                      )}

                      {/* IN_PROGRESS: Complete Job */}
                      {booking.status === 'IN_PROGRESS' && (
                        <Button
                          size="sm"
                          disabled={isMutating}
                          onClick={() =>
                            actionMutation.mutate({
                              bookingId: booking.id,
                              action: 'complete',
                            })
                          }
                          className="h-8 gap-1 bg-emerald-600 text-xs font-semibold text-white hover:bg-emerald-700"
                        >
                          {isMutating ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          )}
                          Mark Completed
                        </Button>
                      )}

                      {/* Expand / Collapse Details Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setExpandedId(isExpanded ? null : booking.id)
                        }
                        className="text-muted-foreground hover:text-foreground h-8 px-2 text-xs"
                      >
                        {isExpanded ? (
                          <>
                            Less <ChevronUp className="ml-1 h-3.5 w-3.5" />
                          </>
                        ) : (
                          <>
                            Details <ChevronDown className="ml-1 h-3.5 w-3.5" />
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Expanded Detail Panel */}
                  {isExpanded && (
                    <div className="border-border/60 animate-in fade-in-50 mt-4 grid grid-cols-1 gap-4 border-t pt-4 text-xs duration-200 md:grid-cols-2">
                      {/* Customer Contact Card */}
                      <div className="bg-muted/30 border-border/40 space-y-2 rounded-lg border p-3">
                        <span className="text-foreground flex items-center gap-1.5 font-bold">
                          <User className="text-primary h-3.5 w-3.5" />
                          Customer Information
                        </span>
                        <div className="text-muted-foreground space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-foreground font-medium">
                              {booking.customer?.name}
                            </span>
                          </div>
                          {booking.customer?.phone && (
                            <div className="flex items-center gap-1.5">
                              <Phone className="text-muted-foreground h-3 w-3" />
                              <a
                                href={`tel:${booking.customer.phone}`}
                                className="text-foreground hover:underline"
                              >
                                {booking.customer.phone}
                              </a>
                            </div>
                          )}
                          {booking.customer?.email && (
                            <div className="flex items-center gap-1.5">
                              <Mail className="text-muted-foreground h-3 w-3" />
                              <a
                                href={`mailto:${booking.customer.email}`}
                                className="hover:underline"
                              >
                                {booking.customer.email}
                              </a>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Location & Instructions */}
                      <div className="bg-muted/30 border-border/40 space-y-2 rounded-lg border p-3">
                        <span className="text-foreground flex items-center gap-1.5 font-bold">
                          <MapPin className="h-3.5 w-3.5 text-amber-500" />
                          Job Location & Instructions
                        </span>
                        <div className="text-muted-foreground space-y-1">
                          <div>
                            <span className="text-muted-foreground block text-[11px]">
                              Address:
                            </span>
                            <span className="text-foreground font-medium">
                              {booking.address}
                            </span>
                          </div>
                          {booking.notes && (
                            <div className="pt-1">
                              <span className="text-muted-foreground block flex items-center gap-1 text-[11px]">
                                <FileText className="h-3 w-3" /> Special Notes:
                              </span>
                              <span className="text-foreground italic">
                                &ldquo;{booking.notes}&rdquo;
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}

          {/* Pagination Footer */}
          {meta.totalPages > 1 && (
            <div className="text-muted-foreground flex items-center justify-between pt-4 text-xs">
              <span>
                Page {meta.page} of {meta.totalPages} ({meta.total} total jobs)
              </span>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="h-8 px-2.5 text-xs"
                >
                  <ChevronLeft className="mr-1 h-3.5 w-3.5" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= meta.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="h-8 px-2.5 text-xs"
                >
                  Next
                  <ChevronRight className="ml-1 h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
