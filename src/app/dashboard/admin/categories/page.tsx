'use client';

import * as React from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  FolderTree,
  Plus,
  Search,
  ArrowLeft,
  Loader2,
  Tag,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { clientRequest } from '@/lib/api/client';
import { Category } from '@/types/domain';

export default function AdminCategoriesManagementPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = React.useState('');
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [newCategoryName, setNewCategoryName] = React.useState('');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: () => clientRequest<Category[]>('/admin/categories'),
  });

  const createMutation = useMutation({
    mutationFn: async (name: string) => {
      return clientRequest('/admin/categories', {
        method: 'POST',
        body: JSON.stringify({ name }),
      });
    },
    onSuccess: () => {
      toast.success(`Category "${newCategoryName}" created successfully.`);
      setNewCategoryName('');
      setDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (err: unknown) => {
      const msg =
        err instanceof Error ? err.message : 'Could not create category.';
      toast.error(msg);
    },
  });

  const categories = React.useMemo(() => data?.data || [], [data?.data]);

  const filteredCategories = React.useMemo(() => {
    if (!search.trim()) return categories;
    const q = search.toLowerCase();
    return categories.filter((c) => c.name.toLowerCase().includes(q));
  }, [categories, search]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCategoryName.trim();
    if (trimmed.length < 2) {
      toast.error('Category name must be at least 2 characters.');
      return;
    }
    createMutation.mutate(trimmed);
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
              Category Management
            </h1>
            <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
              Organize marketplace offerings and add new trade classifications
              for technician services.
            </p>
          </div>

          <Button
            onClick={() => setDialogOpen(true)}
            className="shrink-0 gap-1.5 text-xs font-bold sm:text-sm"
          >
            <Plus className="h-4 w-4" />
            Add Category
          </Button>
        </div>
      </div>

      {/* Search & Stats Bar */}
      <Card className="border">
        <CardContent className="flex flex-col items-center justify-between gap-3 p-4 sm:flex-row">
          <div className="relative w-full sm:max-w-xs">
            <Search className="text-muted-foreground absolute top-2.5 left-3 h-3.5 w-3.5" />
            <Input
              placeholder="Filter categories by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>

          <div className="text-muted-foreground text-xs">
            Total Categories:{' '}
            <strong className="text-foreground">{categories.length}</strong>
          </div>
        </CardContent>
      </Card>

      {/* Categories Table */}
      <Card className="overflow-hidden border">
        <CardHeader className="border-border/40 border-b px-5 py-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm font-bold">
              <FolderTree className="text-primary h-4 w-4" />
              Service Taxonomies ({filteredCategories.length})
            </CardTitle>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="text-muted-foreground animate-pulse p-12 text-center text-xs">
              Loading categories...
            </div>
          ) : isError ? (
            <div className="p-6">
              <ErrorState
                title="Could not load categories"
                message="Failed to retrieve categories from server."
                onRetry={() => refetch()}
              />
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="p-6">
              <EmptyState
                title="No categories found"
                description={
                  search.trim()
                    ? 'No category names matched your search term.'
                    : 'Click "Add Category" to create your first platform taxonomy.'
                }
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="text-xs">
                    <TableHead>Category Name</TableHead>
                    <TableHead>Identifier</TableHead>
                    <TableHead>Public Status</TableHead>
                    <TableHead className="text-right">Badge Preview</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCategories.map((cat) => (
                    <TableRow key={cat.id} className="text-xs">
                      <TableCell>
                        <div className="text-foreground flex items-center gap-2 font-semibold">
                          <Tag className="text-primary/70 h-3.5 w-3.5" />
                          {cat.name}
                        </div>
                      </TableCell>

                      <TableCell className="text-muted-foreground font-mono text-[11px]">
                        {cat.id}
                      </TableCell>

                      <TableCell>
                        {cat.isActive !== false ? (
                          <span className="inline-flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            Active in Marketplace
                          </span>
                        ) : (
                          <span className="text-muted-foreground">
                            Inactive
                          </span>
                        )}
                      </TableCell>

                      <TableCell className="text-right">
                        <Badge variant="secondary" className="text-xs">
                          {cat.name}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Category Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleCreate}>
            <DialogHeader className="space-y-1">
              <DialogTitle className="flex items-center gap-2 text-base font-bold">
                <Plus className="text-primary h-4 w-4" />
                Create New Category
              </DialogTitle>
              <DialogDescription className="text-muted-foreground text-xs">
                Add a new service classification so technicians can list
                offerings and customers can browse services under it.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-4">
              <div className="space-y-1.5">
                <Label htmlFor="cat-name" className="text-xs font-semibold">
                  Category Name *
                </Label>
                <Input
                  id="cat-name"
                  placeholder="e.g. Electrical, Home Automation, Carpentry"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  required
                  autoFocus
                  className="text-xs"
                />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDialogOpen(false)}
                disabled={createMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={createMutation.isPending}
                className="gap-1.5 text-xs font-semibold"
              >
                {createMutation.isPending && (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                )}
                Save Category
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
