import { Suspense } from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { TechnicianFilterSidebar } from '@/features/technicians/technician-filter-sidebar';
import { Pagination } from '@/features/services/pagination';
import { TechnicianCard } from '@/features/technicians/technician-card';
import { EmptyState } from '@/components/feedback/empty-state';
import { buttonVariants } from '@/components/ui/button';
import { serverRequest } from '@/lib/api/server';
import { Category, TechnicianProfile } from '@/types/domain';

export const metadata: Metadata = {
  title: 'Top Verified Technicians | Karigor',
  description:
    'Browse, review, and hire top-rated background-checked technicians near you.',
};

interface TechniciansPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

async function getTechniciansData(params: Record<string, string>) {
  const query = new URLSearchParams({
    sortBy: 'rating',
    order: 'desc',
    ...params,
  }).toString();
  const endpoint = `/technicians${query ? `?${query}` : ''}`;

  try {
    const [categoriesRes, techsRes] = await Promise.all([
      serverRequest<Category[]>('/categories'),
      serverRequest<TechnicianProfile[]>(endpoint),
    ]);

    return {
      categories: categoriesRes.data || [],
      technicians: techsRes.data || [],
      meta: techsRes.meta || {
        page: 1,
        limit: 10,
        total: techsRes.data?.length || 0,
        totalPages: 1,
      },
    };
  } catch {
    return {
      categories: [],
      technicians: [],
      meta: { page: 1, limit: 10, total: 0, totalPages: 1 },
    };
  }
}

export default async function TopTechniciansPage({
  searchParams,
}: TechniciansPageProps) {
  const resolvedSearchParams = await searchParams;

  const flatParams: Record<string, string> = {};
  for (const [key, value] of Object.entries(resolvedSearchParams)) {
    if (typeof value === 'string') {
      flatParams[key] = value;
    } else if (Array.isArray(value) && value[0]) {
      flatParams[key] = value[0];
    }
  }

  const { categories, technicians, meta } =
    await getTechniciansData(flatParams);

  return (
    <div className="container mx-auto space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      {/* Page Title & Header */}
      <div>
        <h1 className="text-foreground text-3xl font-extrabold tracking-tight sm:text-4xl">
          Top Verified Technicians
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Hire verified, highly-rated technicians specialized in home
          maintenance, appliance repair, plumbing, and electrical services.
        </p>
      </div>

      {/* Main Two-Column Layout */}
      <div className="flex flex-col items-start gap-8 lg:flex-row">
        {/* Left Filter Sidebar */}
        <aside className="w-full shrink-0 lg:w-72">
          <Suspense
            fallback={
              <div className="bg-muted/20 border-border/60 h-96 animate-pulse rounded-xl border" />
            }
          >
            <TechnicianFilterSidebar categories={categories} />
          </Suspense>
        </aside>

        {/* Right Content Area: Technician Cards Grid and Pagination */}
        <div className="w-full min-w-0 flex-1 space-y-6">
          {/* Results Header */}
          <div className="border-border/60 flex items-center justify-between border-b pb-3">
            <p className="text-muted-foreground text-sm font-medium">
              Showing{' '}
              <span className="text-foreground font-bold">
                {technicians.length}
              </span>{' '}
              {technicians.length === 1 ? 'technician' : 'technicians'}
              {flatParams.location ? ` in "${flatParams.location}"` : ''}
              {flatParams.search ? ` matching "${flatParams.search}"` : ''}
            </p>
          </div>

          {/* Results Grid or Empty State */}
          {technicians.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {technicians.map((tech) => (
                <TechnicianCard key={tech.id} tech={tech} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No technicians found"
              description="We couldn't find any technicians matching your selected criteria. Try adjusting or clearing your filters."
              action={
                <Link
                  href="/technicians"
                  className={buttonVariants({ variant: 'outline', size: 'sm' })}
                >
                  Clear all filters
                </Link>
              }
            />
          )}

          {/* Pagination */}
          <Suspense fallback={null}>
            <Pagination
              currentPage={meta.page}
              totalPages={meta.totalPages}
              totalItems={meta.total}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
