'use client';

import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'An unexpected error occurred while loading this section. Please try again.',
  onRetry,
  className = '',
}: ErrorStateProps) {
  return (
    <div
      className={`border-destructive/40 bg-destructive/5 flex min-h-[240px] flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center ${className}`}
    >
      <div className="bg-destructive/10 text-destructive mb-4 flex h-12 w-12 items-center justify-center rounded-full">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <h3 className="text-foreground mb-1 text-lg font-semibold">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-md text-sm">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" size="sm" className="gap-2">
          <RotateCcw className="h-4 w-4" />
          Try Again
        </Button>
      )}
    </div>
  );
}
