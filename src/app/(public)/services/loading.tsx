import { Skeleton } from '@/components/ui/skeleton';

export default function ServicesLoading() {
  return (
    <div className="container mx-auto space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-9 w-64 rounded-lg" />
        <Skeleton className="h-4 w-96 max-w-full rounded-md" />
      </div>

      {/* Main Two-Column Layout */}
      <div className="flex flex-col items-start gap-8 lg:flex-row">
        {/* Left Sidebar Skeleton */}
        <div className="w-full shrink-0 lg:w-72">
          <div className="bg-card border-border/80 space-y-5 rounded-xl border p-5 shadow-xs">
            <div className="flex items-center justify-between border-b pb-3">
              <Skeleton className="h-5 w-24 rounded-md" />
              <Skeleton className="h-5 w-12 rounded-md" />
            </div>
            {/* Search field */}
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-28 rounded-md" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
            {/* Location field */}
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-20 rounded-md" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
            {/* Sort field */}
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-24 rounded-md" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
            {/* Categories */}
            <div className="space-y-2 border-t pt-3">
              <Skeleton className="h-4 w-24 rounded-md" />
              <div className="space-y-1.5">
                <Skeleton className="h-8 w-full rounded-md" />
                <Skeleton className="h-8 w-full rounded-md" />
                <Skeleton className="h-8 w-full rounded-md" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Content Area Skeleton */}
        <div className="w-full min-w-0 flex-1 space-y-6">
          <div className="flex items-center justify-between border-b pb-3">
            <Skeleton className="h-5 w-40 rounded-md" />
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-card space-y-3 rounded-xl border p-5">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-24 rounded-full" />
                  <Skeleton className="h-6 w-16" />
                </div>
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-10 w-full" />
                <div className="flex justify-between border-t pt-3">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="mt-2 h-9 w-full rounded-md" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
