import { Suspense } from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { FilterBar } from '@/features/services/filter-bar';
import { Pagination } from '@/features/services/pagination';
import { ServiceCard } from '@/features/services/service-card';
import { EmptyState } from '@/components/feedback/empty-state';
import { buttonVariants } from '@/components/ui/button';
import { serverRequest } from '@/lib/api/server';
import { Category, Service } from '@/types/domain';

export const metadata: Metadata = {
  title: 'Browse Services | Karigor',
  description:
    'Find and book verified home repair and maintenance services near you.',
};

interface ServicesPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

async function getServicesData(params: Record<string, string>) {
  const query = new URLSearchParams(params).toString();
  const endpoint = `/services${query ? `?${query}` : ''}`;

  try {
    const [categoriesRes, servicesRes] = await Promise.all([
      serverRequest<Category[]>('/categories'),
      serverRequest<Service[]>(endpoint),
    ]);

    return {
      categories: categoriesRes.data || [],
      services: servicesRes.data || [],
      meta: servicesRes.meta || {
        page: 1,
        limit: 10,
        total: servicesRes.data?.length || 0,
        totalPages: 1,
      },
    };
  } catch {
    return {
      categories: [],
      services: [],
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

  // Redirect legacy /services?sort=rating to the dedicated Top Technicians page
  if (flatParams.sort === 'rating') {
    redirect('/technicians');
  }

  const { categories, services, meta } = await getServicesData(flatParams);

  return (
    <div className="container mx-auto space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      {/* Page Title & Header */}
      <div>
        <h1 className="text-foreground text-3xl font-extrabold tracking-tight sm:text-4xl">
          Browse All Services
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Explore home maintenance, electrical, plumbing, and appliance repair
          services offered by verified professionals.
        </p>
      </div>

      {/* Main Two-Column Layout: Filter Sidebar on Left, Results on Right */}
      <div className="flex flex-col items-start gap-8 lg:flex-row">
        {/* Left Filter Sidebar */}
        <aside className="w-full shrink-0 lg:w-72">
          <Suspense
            fallback={
              <div className="bg-muted/20 border-border/60 h-96 animate-pulse rounded-xl border" />
            }
          >
            <FilterBar categories={categories} />
          </Suspense>
        </aside>

        {/* Right Content Area: Results and Pagination */}
        <div className="w-full min-w-0 flex-1 space-y-6">
          {/* Results Header */}
          <div className="border-border/60 flex items-center justify-between border-b pb-3">
            <p className="text-muted-foreground text-sm font-medium">
              Showing{' '}
              <span className="text-foreground font-bold">
                {services.length}
              </span>{' '}
              {services.length === 1 ? 'service' : 'services'}
              {flatParams.location ? ` in "${flatParams.location}"` : ''}
              {flatParams.search ? ` matching "${flatParams.search}"` : ''}
            </p>
          </div>

          {/* Results Grid or Empty State */}
          {services.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {services.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No services found"
              description="We couldn't find any services matching your selected criteria. Try adjusting or clearing your filters."
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
      </div>
    </div>
  );
}
