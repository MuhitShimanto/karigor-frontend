import { Star, MessageSquare, CheckCircle2 } from 'lucide-react';
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
    <Card className="border-border/80 bg-card dark:border-border/60 overflow-hidden rounded-xl border shadow-xs">
      <CardHeader className="border-border/60 border-b p-5 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-foreground flex items-center gap-2 text-lg font-bold tracking-tight">
            <MessageSquare className="text-primary h-5 w-5" />
            Customer Reviews ({reviewCount})
          </CardTitle>
          <div className="border-border/80 bg-muted/40 text-foreground inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-bold">
            <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
            <span>{Number(avgRating || 0).toFixed(1)} / 5.0</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="divide-border/60 divide-y p-0">
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
              <div
                key={rev.id}
                className="hover:bg-muted/10 space-y-2.5 p-5 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-foreground text-sm font-semibold tracking-tight">
                      {rev.customer?.name || 'Verified Customer'}
                    </span>
                    <span className="border-border/60 bg-muted/40 text-muted-foreground flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium">
                      <CheckCircle2 className="h-2.5 w-2.5 text-emerald-600 dark:text-emerald-400" />
                      Verified
                    </span>
                  </div>
                  <span className="text-muted-foreground text-xs font-medium">
                    {dateStr}
                  </span>
                </div>

                <div className="flex items-center gap-1">
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
                  <p className="border-border/40 bg-muted/20 text-foreground/90 rounded-lg border p-3 text-xs leading-relaxed sm:text-sm">
                    {rev.comment}
                  </p>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-muted-foreground p-8 text-center text-xs font-medium">
            No customer reviews yet. Be the first to book and rate this
            technician!
          </div>
        )}
      </CardContent>
    </Card>
  );
}
