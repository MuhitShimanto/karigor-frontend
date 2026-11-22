import { Star, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Review } from '@/types/domain';

export function ReviewList({
  reviews,
  avgRating,
  reviewCount,
}: {
  reviews?: Review[];
  avgRating: number;
  reviewCount: number;
}) {
  return (
    <Card className="border">
      <CardHeader className="border-b pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg font-bold">
            <MessageSquare className="h-5 w-5 text-amber-500" />
            Customer Reviews ({reviewCount})
          </CardTitle>
          <div className="flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-sm font-bold text-amber-700 dark:text-amber-400">
            <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
            <span>{Number(avgRating || 0).toFixed(1)} / 5.0</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="divide-y p-0">
        {reviews && reviews.length > 0 ? (
          reviews.map((rev) => {
            const dateStr = rev.createdAt
              ? new Date(rev.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })
              : 'Recent';

            return (
              <div key={rev.id} className="space-y-2 p-5">
                <div className="flex items-center justify-between">
                  <span className="text-foreground text-sm font-semibold">
                    {rev.customer?.name || 'Verified Customer'}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {dateStr}
                  </span>
                </div>

                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3.5 w-3.5 ${
                        i < rev.rating
                          ? 'fill-amber-500 text-amber-500'
                          : 'fill-muted text-muted-foreground/30'
                      }`}
                    />
                  ))}
                </div>

                {rev.comment && (
                  <p className="text-muted-foreground pt-1 text-xs leading-relaxed sm:text-sm">
                    {rev.comment}
                  </p>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-muted-foreground p-8 text-center text-xs">
            No customer reviews yet. Be the first to book and rate this
            technician!
          </div>
        )}
      </CardContent>
    </Card>
  );
}
