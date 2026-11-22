'use client';

import * as React from 'react';
import Link from 'next/link';
import { AlertCircle, RotateCcw, Home } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    // Log error securely
    console.error('Unhandled Root Error:', error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="bg-destructive/10 text-destructive mb-6 flex h-16 w-16 items-center justify-center rounded-2xl shadow-sm">
        <AlertCircle className="h-8 w-8" />
      </div>

      <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
        Something went wrong
      </h1>
      <p className="text-muted-foreground mt-2 max-w-md text-sm">
        {error.message ||
          'An unexpected application error occurred. We apologize for the inconvenience.'}
      </p>

      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
        <Button onClick={() => reset()} className="gap-2">
          <RotateCcw className="h-4 w-4" /> Try Again
        </Button>
        <Link
          href="/"
          className={buttonVariants({ variant: 'outline', className: 'gap-2' })}
        >
          <Home className="h-4 w-4" /> Return Home
        </Link>
      </div>
    </div>
  );
}
