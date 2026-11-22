'use client';

import * as React from 'react';
import Link from 'next/link';
import { AlertTriangle, RotateCw, Home } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function ServicesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    // Log error to monitoring if configured
    console.error('Services catalog render error:', error);
  }, [error]);

  return (
    <div className="container max-w-xl py-16 text-center md:py-24">
      <Card className="border-border/60 overflow-hidden shadow-lg">
        <div className="from-destructive/10 bg-gradient-to-b to-transparent px-6 py-8">
          <div className="bg-destructive/20 text-destructive mx-auto flex h-16 w-16 items-center justify-center rounded-full">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <CardHeader className="p-0 pt-4">
            <CardTitle className="text-foreground text-xl font-bold tracking-tight">
              Unable to Load Services Catalog
            </CardTitle>
          </CardHeader>
        </div>

        <CardContent className="px-6 pt-2 pb-6">
          <p className="text-muted-foreground text-sm">
            We encountered an unexpected issue while retrieving the service
            directory and technician ratings.
          </p>
          {error.message && (
            <div className="bg-muted/40 border-border/40 text-muted-foreground mx-auto mt-4 max-w-md truncate rounded-lg border p-3 font-mono text-xs">
              {error.message}
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col justify-center gap-3 px-6 pt-0 pb-8 sm:flex-row">
          <Button onClick={() => reset()} className="w-full gap-1.5 sm:w-auto">
            <RotateCw className="h-4 w-4" />
            Try Again
          </Button>
          <Link
            href="/"
            className={buttonVariants({
              variant: 'outline',
              className: 'w-full gap-1.5 sm:w-auto',
            })}
          >
            <Home className="h-4 w-4" />
            Return Home
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
