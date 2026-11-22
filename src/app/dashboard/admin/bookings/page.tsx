'use client';

import * as React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Calendar, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { Booking } from '@/types/domain';

interface AdminBookingsResponse {
  items: Booking[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function AdminGlobalBookingsPage() {
  const [statusFilter, setStatusFilter] = React.useState<string>('ALL');
  const [page, setPage] = React.useState<number>(1);

  const queryKey = ['admin', 'bookings', statusFilter, page];

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey,
    queryFn: () => {
      const statusParam =
        statusFilter !== 'ALL' ? `&status=${statusFilter}` : '';
      return clientRequest<AdminBookingsResponse>(
        `/admin/bookings?page=${page}&limit=10${statusParam}`
      );
    },
  });

  const bookings = data?.data?.items || [];
  const meta = data?.data?.meta || {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/dashboard/admin"
          className="text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1.5 text-xs font-semibold transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Administration Overview
        </Link>
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-foreground text-2xl font-extrabold tracking-tight sm:text-3xl">
              Global Platform Bookings
            </h1>
            <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
              Comprehensive registry of all customer service requests across the
              marketplace.
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
              All Orders
            </TabsTrigger>
            <TabsTrigger value="REQUESTED" className="px-3 text-xs">
              Requested
            </TabsTrigger>
            <TabsTrigger value="ACCEPTED" className="px-3 text-xs">
              Accepted
            </TabsTrigger>
            <TabsTrigger value="PAID" className="px-3 text-xs">
              Paid
            </TabsTrigger>
            <TabsTrigger value="IN_PROGRESS" className="px-3 text-xs">
              In Progress
            </TabsTrigger>
            <TabsTrigger value="COMPLETED" className="px-3 text-xs">
              Completed
            </TabsTrigger>
            <TabsTrigger value="DECLINED" className="px-3 text-xs">
              Declined
            </TabsTrigger>
            <TabsTrigger value="CANCELLED" className="px-3 text-xs">
              Cancelled
            </TabsTrigger>
          </TabsList>
        </div>
      </Tabs>

      {/* Bookings Table */}
      <Card className="overflow-hidden border">
        <CardHeader className="border-border/40 border-b px-5 py-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm font-bold">
              <Calendar className="text-primary h-4 w-4" />
              Bookings Registry ({meta.total})
            </CardTitle>
            <CardDescription className="text-xs">
              Page {meta.page} of {meta.totalPages}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="text-muted-foreground animate-pulse p-12 text-center text-xs">
              Loading orders...
            </div>
          ) : isError ? (
            <div className="p-6">
              <ErrorState
                title="Could not load bookings"
                message="Failed to fetch orders from server."
                onRetry={() => refetch()}
              />
            </div>
          ) : bookings.length === 0 ? (
            <div className="p-6">
              <EmptyState
                title="No orders found"
                description="No bookings match the selected status filter."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="text-xs">
                    <TableHead>Booking ID</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Technician</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((b) => (
                    <TableRow key={b.id} className="text-xs">
                      <TableCell className="text-muted-foreground font-mono text-[11px]">
                        {b.id.slice(0, 8)}...
                      </TableCell>

                      <TableCell className="text-foreground font-semibold">
                        {b.service?.title || 'Service'}
                      </TableCell>

                      <TableCell>
                        <div className="text-foreground font-medium">
                          {b.customer?.name || 'Customer'}
                        </div>
                        <div className="text-muted-foreground text-[10px]">
                          {b.customer?.email}
                        </div>
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

        {/* Pagination Footer */}
        {meta.totalPages > 1 && (
          <div className="border-border/40 text-muted-foreground flex items-center justify-between border-t p-4 text-xs">
            <span>
              Showing {bookings.length} of {meta.total} bookings
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
      </Card>
    </div>
  );
}
