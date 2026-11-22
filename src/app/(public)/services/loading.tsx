import { Skeleton } from '@/components/ui/skeleton';

export default function ServicesLoading() {
  return (
    <div className="container mx-auto space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-64 rounded-lg" />
        <Skeleton className="h-4 w-96 max-w-full rounded-md" />
      </div>

      {/* Filter Bar Skeleton */}
      <div className="bg-card space-y-4 rounded-2xl border p-6">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
          <Skeleton className="h-10 rounded-md md:col-span-5" />
          <Skeleton className="h-10 rounded-md md:col-span-4" />
          <Skeleton className="h-10 rounded-md md:col-span-3" />
        </div>
        <div className="flex justify-between border-t pt-2">
          <div className="flex gap-2">
            <Skeleton className="h-7 w-16 rounded-full" />
            <Skeleton className="h-7 w-20 rounded-full" />
            <Skeleton className="h-7 w-20 rounded-full" />
          </div>
          <Skeleton className="h-7 w-48 rounded-md" />
        </div>
      </div>

      {/* Results Grid Skeleton */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-card space-y-3 rounded-xl border p-5">
            <div className="flex items-center gap-3">
              <Skeleton className="h-14 w-14 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </div>
            <Skeleton className="h-8 w-full" />
            <div className="flex justify-between pt-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="mt-2 h-9 w-full rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}
