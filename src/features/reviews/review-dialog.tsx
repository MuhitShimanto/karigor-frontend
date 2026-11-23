'use client';

import * as React from 'react';
import { Star, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { clientRequest, ApiResponse } from '@/lib/api/client';
import { Booking, Review } from '@/types/domain';
import { cn } from '@/lib/utils';

interface ReviewDialogProps {
  booking: Booking | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const RATING_LABELS: Record<number, string> = {
  1: '1 - Poor (Unsatisfactory)',
  2: '2 - Fair (Needs improvement)',
  3: '3 - Good (Met expectations)',
  4: '4 - Very Good (High quality)',
  5: '5 - Excellent (Outstanding service!)',
};

export function ReviewDialog({
  booking,
  open,
  onOpenChange,
  onSuccess,
}: ReviewDialogProps) {
  const [rating, setRating] = React.useState<number>(5);
  const [hoverRating, setHoverRating] = React.useState<number | null>(null);
  const [comment, setComment] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const queryClient = useQueryClient();

  if (!booking) return null;

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setRating(5);
      setHoverRating(null);
      setComment('');
    }
    onOpenChange(nextOpen);
  };

  const currentDisplayRating = hoverRating || rating;
  const serviceTitle = booking.service?.title || 'Service';
  const technicianName = booking.technician?.user?.name || 'Technician';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) {
      toast.error('Please select a star rating between 1 and 5.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await clientRequest<Review>('/reviews', {
        method: 'POST',
        body: JSON.stringify({
          bookingId: booking.id,
          rating,
          comment: comment.trim() || undefined,
        }),
      });

      const newReview: Review = res.data || {
        id: 'new-review',
        bookingId: booking.id,
        customerId: booking.customerId,
        technicianId: booking.technicianId,
        rating,
        comment: comment.trim() || undefined,
        createdAt: new Date().toISOString(),
      };

      // Optimistically update all bookings queries in cache so table immediately shows reviewed badge
      queryClient.setQueriesData<ApiResponse<Booking[] | { items: Booking[] }>>(
        { queryKey: ['bookings'] },
        (oldData) => {
          if (!oldData) return oldData;
          if (Array.isArray(oldData.data)) {
            return {
              ...oldData,
              data: oldData.data.map((b) =>
                b.id === booking.id ? { ...b, review: newReview } : b
              ),
            };
          }
          if (
            oldData.data &&
            Array.isArray((oldData.data as { items?: Booking[] }).items)
          ) {
            return {
              ...oldData,
              data: {
                ...oldData.data,
                items: (oldData.data as { items: Booking[] }).items.map((b) =>
                  b.id === booking.id ? { ...b, review: newReview } : b
                ),
              },
            };
          }
          return oldData;
        }
      );

      // Also update single booking query
      queryClient.setQueriesData<ApiResponse<Booking>>(
        { queryKey: ['booking', booking.id] },
        (oldData) => {
          if (!oldData?.data) return oldData;
          return {
            ...oldData,
            data: {
              ...oldData.data,
              review: newReview,
            },
          };
        }
      );

      toast.success('Thank you! Your review and rating have been published.');
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['technician'] });
      onOpenChange(false);
      onSuccess?.();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Could not submit review.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-lg font-bold">
              Rate your experience
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-xs">
              Reviewing{' '}
              <span className="text-foreground font-semibold">
                {serviceTitle}
              </span>{' '}
              with{' '}
              <span className="text-foreground font-semibold">
                {technicianName}
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-4">
            {/* Star Rating Picker */}
            <div className="space-y-2 text-center">
              <Label className="text-foreground text-xs font-semibold">
                Your Rating
              </Label>
              <div className="flex items-center justify-center gap-1.5 pt-1">
                {[1, 2, 3, 4, 5].map((star) => {
                  const isFilled = star <= currentDisplayRating;
                  return (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(null)}
                      className="focus-visible:ring-primary rounded-md p-1 transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2"
                      aria-label={`Rate ${star} stars`}
                    >
                      <Star
                        className={cn(
                          'h-7 w-7 transition-colors',
                          isFilled
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-muted-foreground/40 fill-transparent'
                        )}
                      />
                    </button>
                  );
                })}
              </div>
              <p className="min-h-[1.25rem] text-xs font-medium text-amber-600 dark:text-amber-400">
                {RATING_LABELS[currentDisplayRating]}
              </p>
            </div>

            {/* Comment Area */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="review-comment"
                  className="text-foreground text-xs font-semibold"
                >
                  Feedback / Comment (optional)
                </Label>
                <span className="text-muted-foreground text-[11px]">
                  {comment.length} / 500
                </span>
              </div>
              <textarea
                id="review-comment"
                value={comment}
                onChange={(e) => setComment(e.target.value.slice(0, 500))}
                rows={4}
                placeholder="Share how the technician did, punctuality, quality of work..."
                className="border-input placeholder:text-muted-foreground focus-visible:ring-ring w-full rounded-lg border bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="gap-1.5"
            >
              {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Submit Review
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
