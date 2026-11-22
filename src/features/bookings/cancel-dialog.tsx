'use client';

import * as React from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

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
import { Input } from '@/components/ui/input';
import { clientRequest } from '@/lib/api/client';
import { Booking } from '@/types/domain';

interface CancelDialogProps {
  booking: Booking | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CancelDialog({
  booking,
  open,
  onOpenChange,
  onSuccess,
}: CancelDialogProps) {
  const [reason, setReason] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  if (!booking) return null;

  const handleCancel = async () => {
    setIsSubmitting(true);
    try {
      await clientRequest(`/bookings/${booking.id}/cancel`, {
        method: 'PATCH',
        body: JSON.stringify({ reason: reason.trim() || undefined }),
      });

      toast.success('Booking cancelled. The reserved slot has been released.');
      onOpenChange(false);
      onSuccess();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Could not cancel booking.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="bg-destructive/10 text-destructive mb-2 flex h-12 w-12 items-center justify-center rounded-full">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <DialogTitle>Cancel Booking Request</DialogTitle>
          <DialogDescription className="text-xs">
            Are you sure you want to cancel this booking for{' '}
            <strong className="text-foreground">
              {booking.service?.title || 'Service'}
            </strong>
            ? This will immediately release the technician&apos;s reserved time
            slot.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-2">
          <Label htmlFor="cancel-reason" className="text-xs">
            Reason for cancellation (optional)
          </Label>
          <Input
            id="cancel-reason"
            placeholder="e.g. Schedule change, issue resolved..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="h-9 text-xs"
          />
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Keep Booking
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleCancel}
            disabled={isSubmitting}
            className="gap-1.5"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Cancelling...
              </>
            ) : (
              'Confirm Cancellation'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
