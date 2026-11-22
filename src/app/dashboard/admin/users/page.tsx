'use client';

import * as React from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Users,
  Search,
  ShieldAlert,
  ShieldCheck,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertTriangle,
  UserCheck,
  UserX,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { EmptyState } from '@/components/feedback/empty-state';
import { ErrorState } from '@/components/feedback/error-state';
import { clientRequest, ApiResponse } from '@/lib/api/client';
import { useAuthStore } from '@/store/auth.store';
import { SafeUser } from '@/types/auth';

interface AdminUserItem extends Omit<SafeUser, 'technicianProfile'> {
  technicianProfile?: {
    id: string;
    location: string;
    avgRating?: number;
    reviewCount?: number;
  } | null;
}

type AdminUsersResult =
  AdminUserItem[] | { items: AdminUserItem[]; meta?: ApiResponse['meta'] };

export default function AdminUsersManagementPage() {
  const queryClient = useQueryClient();
  const authStoreUser = useAuthStore((s) => s.user);

  const [search, setSearch] = React.useState('');
  const [debouncedSearch, setDebouncedSearch] = React.useState('');
  const [roleFilter, setRoleFilter] = React.useState<string>('ALL');
  const [statusFilter, setStatusFilter] = React.useState<string>('ALL');
  const [page, setPage] = React.useState<number>(1);

  // Dialog state for confirm ban / unban
  const [targetUser, setTargetUser] = React.useState<AdminUserItem | null>(
    null
  );
  const [dialogOpen, setDialogOpen] = React.useState(false);

  // Debounce search query
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch current admin user to prevent self-ban
  const { data: meRes } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: () => clientRequest<SafeUser>('/auth/me'),
  });
  const currentAdmin = meRes?.data || authStoreUser;

  // Build query string
  const queryKey = [
    'admin',
    'users',
    debouncedSearch,
    roleFilter,
    statusFilter,
    page,
  ];
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey,
    queryFn: () => {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '10');
      if (debouncedSearch.trim()) params.set('search', debouncedSearch.trim());
      if (roleFilter !== 'ALL') params.set('role', roleFilter);
      if (statusFilter !== 'ALL') params.set('status', statusFilter);
      return clientRequest<AdminUsersResult>(
        `/admin/users?${params.toString()}`
      );
    },
  });

  // Ban/Unban mutation with optimistic updates
  const statusMutation = useMutation({
    mutationFn: async ({
      userId,
      newStatus,
    }: {
      userId: string;
      newStatus: 'ACTIVE' | 'BANNED';
    }) => {
      return clientRequest(`/admin/users/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
    },
    onMutate: async ({ userId, newStatus }) => {
      await queryClient.cancelQueries({ queryKey });
      const previousData =
        queryClient.getQueryData<ApiResponse<AdminUsersResult>>(queryKey);

      if (previousData) {
        let updatedData = previousData.data;
        if (Array.isArray(previousData.data)) {
          updatedData = previousData.data.map((u) =>
            u.id === userId ? { ...u, status: newStatus } : u
          );
        } else if (
          previousData.data &&
          Array.isArray(
            (previousData.data as { items?: AdminUserItem[] }).items
          )
        ) {
          updatedData = {
            ...previousData.data,
            items: (previousData.data as { items: AdminUserItem[] }).items.map(
              (u) => (u.id === userId ? { ...u, status: newStatus } : u)
            ),
          };
        }

        queryClient.setQueryData(queryKey, {
          ...previousData,
          data: updatedData,
        });
      }

      return { previousData };
    },
    onError: (err: unknown, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
      const msg =
        err instanceof Error ? err.message : 'Could not change user status.';
      toast.error(msg);
    },
    onSuccess: (_, variables) => {
      const isBanned = variables.newStatus === 'BANNED';
      toast.success(
        isBanned
          ? 'User account has been banned. They cannot sign in.'
          : 'User account has been reinstated to active status.'
      );
      setDialogOpen(false);
      setTargetUser(null);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });

  const rawData = data?.data;
  const users: AdminUserItem[] = Array.isArray(rawData)
    ? rawData
    : Array.isArray((rawData as { items?: AdminUserItem[] })?.items)
      ? (rawData as { items: AdminUserItem[] }).items
      : [];

  const meta = data?.meta ||
    (rawData as { meta?: ApiResponse['meta'] })?.meta || {
      page,
      limit: 10,
      total: users.length,
      totalPages: Math.max(1, Math.ceil(users.length / 10)),
    };

  const handleToggleClick = (u: AdminUserItem) => {
    setTargetUser(u);
    setDialogOpen(true);
  };

  const handleConfirmToggle = () => {
    if (!targetUser) return;
    const nextStatus = targetUser.status === 'BANNED' ? 'ACTIVE' : 'BANNED';
    statusMutation.mutate({ userId: targetUser.id, newStatus: nextStatus });
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
              User Management
            </h1>
            <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
              Review platform members, verify technician accounts, and ban
              abusive actors.
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="border">
        <CardContent className="space-y-3 p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
            {/* Search Input */}
            <div className="relative sm:col-span-2">
              <Search className="text-muted-foreground absolute top-2.5 left-3 h-3.5 w-3.5" />
              <Input
                placeholder="Search by name or email address..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 text-xs"
              />
            </div>

            {/* Role Filter */}
            <div>
              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setPage(1);
                }}
                className="border-input bg-card focus-visible:ring-ring w-full rounded-lg border px-3 py-2 text-xs shadow-sm focus-visible:ring-1 focus-visible:outline-none"
              >
                <option value="ALL">All Roles</option>
                <option value="CUSTOMER">Customers</option>
                <option value="TECHNICIAN">Technicians</option>
                <option value="ADMIN">Administrators</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="border-input bg-card focus-visible:ring-ring w-full rounded-lg border px-3 py-2 text-xs shadow-sm focus-visible:ring-1 focus-visible:outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active Users</option>
                <option value="BANNED">Banned Users</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="overflow-hidden border">
        <CardHeader className="border-border/40 border-b px-5 py-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm font-bold">
              <Users className="text-primary h-4 w-4" />
              Platform Members ({meta.total})
            </CardTitle>
            <CardDescription className="text-xs">
              Page {meta.page} of {meta.totalPages}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="text-muted-foreground animate-pulse p-12 text-center text-xs">
              Loading users...
            </div>
          ) : isError ? (
            <div className="p-6">
              <ErrorState
                title="Could not load users"
                message={
                  error instanceof Error
                    ? error.message
                    : 'Failed to fetch users from server.'
                }
                onRetry={() => refetch()}
              />
            </div>
          ) : users.length === 0 ? (
            <div className="p-6">
              <EmptyState
                title="No users found"
                description="Try clearing or adjusting your search keyword and filters."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="text-xs">
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Phone / Area</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => {
                    const isAdmin = u.role === 'ADMIN';
                    const isSelf = currentAdmin && u.id === currentAdmin.id;
                    const isBanned = u.status === 'BANNED';
                    const canToggleStatus = !isAdmin && !isSelf;

                    return (
                      <TableRow key={u.id} className="text-xs">
                        <TableCell>
                          <div className="text-foreground font-semibold">
                            {u.name}
                          </div>
                          <div className="text-muted-foreground font-mono text-[11px]">
                            {u.email}
                          </div>
                        </TableCell>

                        <TableCell>
                          <Badge
                            variant={
                              isAdmin
                                ? 'default'
                                : u.role === 'TECHNICIAN'
                                  ? 'secondary'
                                  : 'outline'
                            }
                            className="text-[10px] font-bold uppercase"
                          >
                            {u.role}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          {isBanned ? (
                            <span className="text-destructive inline-flex items-center gap-1 font-semibold">
                              <ShieldAlert className="h-3.5 w-3.5" />
                              Banned
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
                              <ShieldCheck className="h-3.5 w-3.5" />
                              Active
                            </span>
                          )}
                        </TableCell>

                        <TableCell className="text-muted-foreground">
                          {u.technicianProfile?.location ||
                            u.phone ||
                            '&mdash;'}
                        </TableCell>

                        <TableCell className="text-muted-foreground">
                          {u.createdAt
                            ? new Date(u.createdAt).toLocaleDateString(
                                'en-US',
                                {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                }
                              )
                            : '—'}
                        </TableCell>

                        <TableCell className="text-right">
                          {canToggleStatus ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleToggleClick(u)}
                              className={`h-7 gap-1 px-2.5 text-xs font-medium ${
                                isBanned
                                  ? 'text-emerald-600 hover:bg-emerald-500/10 hover:text-emerald-700 dark:text-emerald-400'
                                  : 'text-destructive hover:bg-destructive/10 border-destructive/30'
                              }`}
                            >
                              {isBanned ? (
                                <>
                                  <UserCheck className="h-3 w-3" /> Reinstate
                                </>
                              ) : (
                                <>
                                  <UserX className="h-3 w-3" /> Ban User
                                </>
                              )}
                            </Button>
                          ) : (
                            <span
                              className="text-muted-foreground/50 cursor-not-allowed text-[11px] italic"
                              title={
                                isSelf
                                  ? 'You cannot change your own admin account status'
                                  : 'Admin accounts cannot be banned'
                              }
                            >
                              Protected
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>

        {/* Pagination Footer */}
        {meta.totalPages > 1 && (
          <div className="border-border/40 text-muted-foreground flex items-center justify-between border-t p-4 text-xs">
            <span>
              Showing {users.length} of {meta.total} registered users
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

      {/* Confirmation Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="space-y-1">
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Confirm{' '}
              {targetUser?.status === 'BANNED'
                ? 'Reinstatement'
                : 'Account Ban'}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-xs">
              {targetUser?.status === 'BANNED' ? (
                <>
                  Are you sure you want to reinstate access for{' '}
                  <strong className="text-foreground">
                    {targetUser?.name}
                  </strong>{' '}
                  ({targetUser?.email})? They will immediately regain ability to
                  log in and use Karigor.
                </>
              ) : (
                <>
                  Are you sure you want to ban{' '}
                  <strong className="text-foreground">
                    {targetUser?.name}
                  </strong>{' '}
                  ({targetUser?.email})? They will be immediately blocked from
                  logging in or booking services.
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 pt-3 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDialogOpen(false)}
              disabled={statusMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleConfirmToggle}
              disabled={statusMutation.isPending}
              className={`gap-1.5 text-xs font-semibold ${
                targetUser?.status === 'BANNED'
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'bg-destructive hover:bg-destructive/90 text-white'
              }`}
            >
              {statusMutation.isPending && (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              )}
              {targetUser?.status === 'BANNED'
                ? 'Reinstate Account'
                : 'Confirm Ban'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
