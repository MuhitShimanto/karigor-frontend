'use client';

import * as React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error('Dashboard Error:', error);
  }, [error]);

  return (
    <div className="border-destructive/30 bg-destructive/5 flex min-h-[50vh] flex-col items-center justify-center rounded-xl border border-dashed p-6 text-center">
      <div className="bg-destructive/10 text-destructive mb-4 flex h-14 w-14 items-center justify-center rounded-full">
        <AlertCircle className="h-7 w-7" />
      </div>

      <h2 className="text-foreground text-xl font-bold tracking-tight">
        Failed to load dashboard data
      </h2>
      <p className="text-muted-foreground mt-2 max-w-md text-sm">
        {error.message ||
          'There was a problem retrieving data from the server. Please try refreshing.'}
      </p>

      <div className="mt-6 flex items-center gap-3">
        <Button onClick={() => reset()} className="gap-2">
          <RotateCcw className="h-4 w-4" /> Try Again
        </Button>
      </div>
    </div>
  );
}
