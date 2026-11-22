'use client';

import * as React from 'react';
import Link from 'next/link';
import { AlertCircle, RotateCcw, ArrowLeft } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';

export default function TechnicianError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error('Technician Profile Error:', error);
  }, [error]);

  return (
    <div className="container mx-auto flex flex-col items-center justify-center px-4 py-16 text-center">
      <div className="bg-destructive/10 text-destructive mb-6 flex h-16 w-16 items-center justify-center rounded-2xl">
        <AlertCircle className="h-8 w-8" />
      </div>

      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
        Could not load technician profile
      </h1>
      <p className="text-muted-foreground mt-2 max-w-md text-sm">
        {error.message ||
          'The requested technician profile could not be retrieved from the server.'}
      </p>

      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
        <Button onClick={() => reset()} className="gap-2">
          <RotateCcw className="h-4 w-4" /> Try Again
        </Button>
        <Link
          href="/services"
          className={buttonVariants({ variant: 'outline', className: 'gap-2' })}
        >
          <ArrowLeft className="h-4 w-4" /> Back to Services
        </Link>
      </div>
    </div>
  );
}
