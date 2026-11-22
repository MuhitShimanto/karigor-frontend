import { Suspense } from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { FilterBar } from '@/features/services/filter-bar';
import { Pagination } from '@/features/services/pagination';
import { TechnicianCard } from '@/features/technicians/technician-card';
import { EmptyState } from '@/components/feedback/empty-state';
import { buttonVariants } from '@/components/ui/button';
import { serverRequest } from '@/lib/api/server';
import { Category, TechnicianProfile } from '@/types/domain';

export const metadata: Metadata = {
  title: 'Browse Services & Technicians | Karigor',
  description:
    'Find and book verified electricians, plumbers, AC technicians, and carpenters near you.',
};

interface ServicesPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

async function getServicesData(params: Record<string, string>) {
  const query = new URLSearchParams(params).toString();
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

export default async function ServicesPage({
  searchParams,
}: ServicesPageProps) {
  const resolvedSearchParams = await searchParams;

  const flatParams: Record<string, string> = {};
  for (const [key, value] of Object.entries(resolvedSearchParams)) {
    if (typeof value === 'string') {
      flatParams[key] = value;
    } else if (Array.isArray(value) && value[0]) {
      flatParams[key] = value[0];
    }
  }

  const { categories, technicians, meta } = await getServicesData(flatParams);

  return (
    <div className="container mx-auto space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      {/* Page Title & Header */}
      <div>
        <h1 className="text-foreground text-3xl font-extrabold tracking-tight sm:text-4xl">
          Services & Verified Technicians
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Discover vetted professionals, compare ratings, and book confirmed
          time slots.
        </p>
      </div>

      {/* Filter Bar */}
      <Suspense
        fallback={
          <div className="bg-muted/20 h-28 animate-pulse rounded-2xl border" />
        }
      >
        <FilterBar categories={categories} />
      </Suspense>

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm font-medium">
          Showing{' '}
          <span className="text-foreground font-semibold">
            {technicians.length}
          </span>{' '}
          {technicians.length === 1 ? 'technician' : 'technicians'}
          {flatParams.location ? ` in "${flatParams.location}"` : ''}
          {flatParams.search ? ` matching "${flatParams.search}"` : ''}
        </p>
      </div>

      {/* Results Grid or Empty State */}
      {technicians.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {technicians.map((tech) => (
            <TechnicianCard key={tech.id} tech={tech} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No technicians found"
          description="We couldn't find any professionals matching your selected criteria. Try adjusting or clearing your filters."
          action={
            <Link
              href="/services"
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
  );
}
