'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Star, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ReviewDialog } from './review-dialog';
import { Booking } from '@/types/domain';
import { cn } from '@/lib/utils';

interface BookingReviewCardProps {
  booking: Booking;
}

export function BookingReviewCard({ booking }: BookingReviewCardProps) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = React.useState(false);

  // If already reviewed, display the review card
  if (booking.review) {
    const review = booking.review;
    return (
      <Card className="border-border/80 bg-card dark:border-border/60 overflow-hidden rounded-xl border shadow-xs">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-foreground flex items-center gap-2 text-base font-bold">
              <MessageSquare className="text-primary h-4 w-4" />
              Your Review
            </CardTitle>
            <div className="border-border/70 bg-muted/40 flex items-center gap-1.5 rounded-md border px-2 py-0.5">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      'h-3.5 w-3.5',
                      star <= review.rating
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-muted-foreground/30 fill-transparent'
                    )}
                  />
                ))}
              </div>
              <span className="text-foreground text-xs font-bold">
                {review.rating}/5
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2.5">
          {review.comment ? (
            <p className="border-border/60 bg-muted/20 text-foreground/90 rounded-lg border p-3.5 text-sm leading-relaxed italic">
              &ldquo;{review.comment}&rdquo;
            </p>
          ) : (
            <p className="text-muted-foreground text-xs italic">
              No written comments provided.
            </p>
          )}
          {review.createdAt && (
            <p className="text-muted-foreground text-[11px] font-medium">
              Submitted on{' '}
              {new Date(review.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  // If completed and not yet reviewed, show prompt
  if (booking.status === 'COMPLETED') {
    return (
      <>
        <Card className="group border-border/80 bg-card hover:border-foreground/30 dark:border-border/60 dark:hover:border-foreground/40 overflow-hidden rounded-xl border p-0 transition-all duration-300 hover:shadow-lg">
          <CardContent className="flex flex-col items-center justify-between gap-4 p-5 sm:flex-row">
            <div className="flex items-start gap-3 text-center sm:text-left">
              <div className="border-border/80 bg-muted/60 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border text-amber-500 shadow-xs transition-transform duration-300 group-hover:scale-105">
                <Star className="h-4 w-4 fill-amber-500" />
              </div>
              <div className="space-y-1">
                <h3 className="text-foreground text-sm font-bold tracking-tight">
                  How was your service experience?
                </h3>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  Share your feedback to help{' '}
                  <strong className="text-foreground">
                    {booking.technician?.user?.name || 'the technician'}
                  </strong>{' '}
                  build trust on Karigor.
                </p>
              </div>
            </div>
            <Button
              onClick={() => setDialogOpen(true)}
              className="shrink-0 gap-1.5 text-xs font-semibold shadow-xs"
              size="sm"
            >
              <Star className="h-3.5 w-3.5 fill-current" />
              Leave a Review
            </Button>
          </CardContent>
        </Card>

        <ReviewDialog
          booking={booking}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSuccess={() => router.refresh()}
        />
      </>
    );
  }

  return null;
}
