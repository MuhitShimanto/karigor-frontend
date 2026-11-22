import * as React from 'react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`border-border bg-muted/20 flex min-h-[220px] flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center ${className}`}
    >
      <div className="bg-muted text-muted-foreground mb-4 flex h-12 w-12 items-center justify-center rounded-full">
        {icon || <Inbox className="h-6 w-6" />}
      </div>
      <h3 className="text-foreground mb-1 text-base font-semibold">{title}</h3>
      {description && (
        <p className="text-muted-foreground mb-4 max-w-sm text-xs sm:text-sm">
          {description}
        </p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
