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
      <Card className="border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base font-bold">
              <MessageSquare className="h-4 w-4 text-amber-500" />
              Your Review
            </CardTitle>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={cn(
                    'h-4 w-4',
                    star <= review.rating
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-muted-foreground/30 fill-transparent'
                  )}
                />
              ))}
              <span className="text-foreground ml-1 text-xs font-semibold">
                {review.rating}/5
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {review.comment ? (
            <p className="text-foreground/90 bg-muted/30 border-border/40 rounded-lg border p-3 text-sm italic">
              &ldquo;{review.comment}&rdquo;
            </p>
          ) : (
            <p className="text-muted-foreground text-xs italic">
              No written comments provided.
            </p>
          )}
          {review.createdAt && (
            <p className="text-muted-foreground text-[11px]">
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
        <Card className="border border-amber-500/30 bg-amber-500/5">
          <CardContent className="flex flex-col items-center justify-between gap-4 p-5 sm:flex-row">
            <div className="space-y-1 text-center sm:text-left">
              <h3 className="text-foreground flex items-center justify-center gap-1.5 text-sm font-bold sm:justify-start">
                <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                How was your service?
              </h3>
              <p className="text-muted-foreground text-xs">
                Share your experience to help{' '}
                {booking.technician?.user?.name || 'the technician'} build
                credibility on Karigor.
              </p>
            </div>
            <Button
              onClick={() => setDialogOpen(true)}
              className="shrink-0 gap-1.5 bg-amber-500 text-xs font-medium text-white hover:bg-amber-600"
              size="sm"
            >
              <Star className="h-3.5 w-3.5 fill-white" />
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
