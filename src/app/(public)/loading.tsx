import { Skeleton } from '@/components/ui/skeleton';

export default function PublicLoading() {
  return (
    <div className="container mx-auto space-y-12 px-4 py-12 sm:px-6 lg:px-8">
      {/* Hero skeleton */}
      <div className="mx-auto max-w-3xl space-y-4 text-center">
        <Skeleton className="mx-auto h-6 w-48 rounded-full" />
        <Skeleton className="mx-auto h-12 w-full max-w-xl rounded-lg" />
        <Skeleton className="mx-auto h-4 w-full max-w-md rounded-md" />
        <div className="flex justify-center gap-4 pt-4">
          <Skeleton className="h-10 w-36 rounded-md" />
          <Skeleton className="h-10 w-36 rounded-md" />
        </div>
      </div>

      {/* Services Grid Skeleton */}
      <div className="space-y-4 pt-8">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-3 rounded-xl border p-5">
              <div className="flex justify-between">
                <Skeleton className="h-5 w-24 rounded-full" />
                <Skeleton className="h-5 w-16" />
              </div>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <div className="pt-2">
                <Skeleton className="h-9 w-full rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Technicians Grid Skeleton */}
      <div className="space-y-4 pt-8">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-3 rounded-xl border p-5">
              <div className="flex items-center gap-3">
                <Skeleton className="h-14 w-14 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </div>
              <Skeleton className="h-4 w-full" />
              <div className="flex gap-1 pt-2">
                <Skeleton className="h-4 w-16 rounded-full" />
                <Skeleton className="h-4 w-16 rounded-full" />
              </div>
              <Skeleton className="mt-2 h-9 w-full rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
