import { Skeleton } from '@/components/ui/skeleton';

export default function CustomerDashboardLoading() {
  return (
    <div className="animate-in fade-in-50 space-y-8 duration-200">
      <div className="flex flex-col justify-between gap-4 sm:flex-row">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-9 w-36" />
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-card space-y-2 rounded-xl border p-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>

      {/* Tabs & Table */}
      <div className="space-y-4">
        <Skeleton className="h-9 w-60" />
        <div className="bg-card space-y-4 rounded-xl border p-6">
          <Skeleton className="h-6 w-48" />
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
