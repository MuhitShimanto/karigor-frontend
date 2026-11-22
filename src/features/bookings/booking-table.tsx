'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  CreditCard,
  Ban,
  Star,
  Clock,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button, buttonVariants } from '@/components/ui/button';
import { StatusBadge } from './status-badge';
import { bookingActions } from './actions';
import { CancelDialog } from './cancel-dialog';
import { Booking } from '@/types/domain';

interface BookingTableProps {
  bookings: Booking[];
  onRefresh: () => void;
  onLeaveReview?: (booking: Booking) => void;
}

export function BookingTable({
  bookings,
  onRefresh,
  onLeaveReview,
}: BookingTableProps) {
  const [cancellingBooking, setCancellingBooking] =
    React.useState<Booking | null>(null);

  const formatSlotTime = (slot?: { startTime: string; endTime: string }) => {
    if (!slot) return 'Standard Consultation';
    try {
      const s = new Date(slot.startTime);
      const e = new Date(slot.endTime);
      const datePart = s.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
      const timePart = s.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
      const endPart = e.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
      return `${datePart}, ${timePart} - ${endPart}`;
    } catch {
      return 'Scheduled Slot';
    }
  };

  return (
    <>
      <div className="bg-card overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="text-xs font-semibold">
                Service & Technician
              </TableHead>
              <TableHead className="text-xs font-semibold">
                Scheduled Slot
              </TableHead>
              <TableHead className="text-xs font-semibold">Amount</TableHead>
              <TableHead className="text-xs font-semibold">Status</TableHead>
              <TableHead className="text-right text-xs font-semibold">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.map((booking) => {
              const actions = bookingActions(booking.status, 'CUSTOMER');
              const totalAmount =
                typeof booking.totalAmount === 'number'
                  ? booking.totalAmount
                  : parseFloat(String(booking.totalAmount)) || 0;

              return (
                <TableRow key={booking.id} className="hover:bg-muted/20">
                  {/* Service & Tech */}
                  <TableCell className="py-4">
                    <div className="space-y-0.5">
                      <p className="text-foreground text-sm font-semibold">
                        {booking.service?.title || 'Service Booking'}
                      </p>
                      <p className="text-muted-foreground flex items-center gap-1 text-xs">
                        With{' '}
                        <span className="text-foreground font-medium">
                          {booking.technician?.user?.name ||
                            'Verified Technician'}
                        </span>
                      </p>
                      <p className="text-muted-foreground flex max-w-xs items-center gap-1 truncate text-[11px]">
                        <MapPin className="h-3 w-3 shrink-0 text-amber-500" />
                        <span className="truncate">{booking.address}</span>
                      </p>
                    </div>
                  </TableCell>

                  {/* Scheduled Slot */}
                  <TableCell className="text-xs">
                    <div className="text-muted-foreground flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 shrink-0 text-amber-500" />
                      <span>{formatSlotTime(booking.slot)}</span>
                    </div>
                  </TableCell>

                  {/* Price */}
                  <TableCell className="text-foreground text-sm font-bold">
                    ৳{totalAmount.toLocaleString()}
                  </TableCell>

                  {/* Status Badge */}
                  <TableCell>
                    <StatusBadge status={booking.status} />
                  </TableCell>

                  {/* Actions derived from bookingActions(status, 'CUSTOMER') */}
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Pay Now Button (Only for ACCEPTED status) */}
                      {actions.pay && (
                        <Link
                          href={`/dashboard/customer/bookings/${booking.id}/pay`}
                          className={buttonVariants({
                            size: 'sm',
                            className:
                              'h-8 gap-1 bg-amber-500 px-2.5 text-xs font-semibold text-white shadow-sm hover:bg-amber-600',
                          })}
                        >
                          <CreditCard className="h-3.5 w-3.5" /> Pay Now
                        </Link>
                      )}

                      {/* Cancel Button (Enabled for REQUESTED and ACCEPTED) */}
                      {actions.cancel && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCancellingBooking(booking)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 gap-1 px-2 text-xs"
                        >
                          <Ban className="h-3 w-3" /> Cancel
                        </Button>
                      )}

                      {/* No cancel allowed from PAID onward (FR-CUS-4) */}
                      {!actions.cancel &&
                        ['PAID', 'IN_PROGRESS'].includes(booking.status) && (
                          <span
                            className="text-muted-foreground/60 text-[11px] italic"
                            title="Cancellation is disabled after payment"
                          >
                            Paid (Active)
                          </span>
                        )}

                      {/* Leave Review Button (Only for COMPLETED status without review) */}
                      {actions.review && !booking.review && onLeaveReview && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onLeaveReview(booking)}
                          className="h-8 gap-1 border-amber-500/40 px-2 text-xs text-amber-600 hover:bg-amber-500/10 dark:text-amber-400"
                        >
                          <Star className="h-3.5 w-3.5" /> Review
                        </Button>
                      )}

                      {/* Booking Detail Link */}
                      <Link
                        href={`/dashboard/customer/bookings/${booking.id}`}
                        className={buttonVariants({
                          variant: 'ghost',
                          size: 'icon',
                          className:
                            'text-muted-foreground hover:text-foreground h-8 w-8',
                        })}
                        title="View details"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <CancelDialog
        booking={cancellingBooking}
        open={Boolean(cancellingBooking)}
        onOpenChange={(open) => !open && setCancellingBooking(null)}
        onSuccess={onRefresh}
      />
    </>
  );
}
