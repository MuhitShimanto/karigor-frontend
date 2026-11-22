'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
}: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(page));
    router.push(`/services?${params.toString()}`);
  };

  return (
    <div className="flex flex-col items-center justify-between gap-4 border-t pt-6 sm:flex-row">
      <p className="text-muted-foreground text-xs">
        Showing page{' '}
        <span className="text-foreground font-semibold">{currentPage}</span> of{' '}
        <span className="text-foreground font-semibold">{totalPages}</span>
        {totalItems ? ` (${totalItems} total results)` : ''}
      </p>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="h-8 gap-1 px-3 text-xs"
        >
          <ChevronLeft className="h-4 w-4" /> Previous
        </Button>

        <div className="flex items-center gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(
              (p) =>
                p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1
            )
            .map((page, idx, arr) => {
              const prev = arr[idx - 1];
              return (
                <div key={page} className="flex items-center">
                  {prev && page - prev > 1 && (
                    <span className="text-muted-foreground px-1 text-xs">
                      …
                    </span>
                  )}
                  <Button
                    variant={page === currentPage ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handlePageChange(page)}
                    className={`h-8 w-8 p-0 text-xs ${
                      page === currentPage
                        ? 'bg-amber-500 font-bold text-white hover:bg-amber-600'
                        : ''
                    }`}
                  >
                    {page}
                  </Button>
                </div>
              );
            })}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="h-8 gap-1 px-3 text-xs"
        >
          Next <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
