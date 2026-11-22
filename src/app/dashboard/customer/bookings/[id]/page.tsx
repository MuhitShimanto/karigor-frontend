import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  CreditCard,
  User,
  Wrench,
  CheckCircle2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { buttonVariants } from '@/components/ui/button';
import { StatusBadge } from '@/features/bookings/status-badge';
import { bookingActions } from '@/features/bookings/actions';
import { BookingReviewCard } from '@/features/reviews/booking-review-card';
import { serverRequest } from '@/lib/api/server';
import { Booking } from '@/types/domain';
import { BookingStatus } from '@/lib/constants';

interface BookingDetailPageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: 'Booking Details | Karigor',
  description: 'View service request timeline and booking specifications.',
};

async function getBookingDetail(id: string): Promise<Booking | null> {
  try {
    const res = await serverRequest<Booking>(`/bookings/${id}`);
    return res.data || null;
  } catch {
    return null;
  }
}

export default async function BookingDetailPage({
  params,
}: BookingDetailPageProps) {
  const { id } = await params;
  const booking = await getBookingDetail(id);

  if (!booking) {
    notFound();
  }

  const actions = bookingActions(booking.status, 'CUSTOMER');
  const amount =
    typeof booking.totalAmount === 'number'
      ? booking.totalAmount
      : parseFloat(String(booking.totalAmount)) || 0;

  // Timeline Step calculation
  const timelineSteps: {
    status: BookingStatus;
    label: string;
    desc: string;
  }[] = [
    {
      status: 'REQUESTED',
      label: 'Requested',
      desc: 'Request sent to technician',
    },
    { status: 'ACCEPTED', label: 'Accepted', desc: 'Technician approved slot' },
    { status: 'PAID', label: 'Paid', desc: 'Payment completed via Stripe' },
    {
      status: 'IN_PROGRESS',
      label: 'In Progress',
      desc: 'Technician on-site working',
    },
    {
      status: 'COMPLETED',
      label: 'Completed',
      desc: 'Job finished & verified',
    },
  ];

  const getStepIndex = (status: BookingStatus) => {
    switch (status) {
      case 'REQUESTED':
        return 0;
      case 'ACCEPTED':
        return 1;
      case 'PAID':
        return 2;
      case 'IN_PROGRESS':
        return 3;
      case 'COMPLETED':
        return 4;
      default:
        return -1;
    }
  };

  const currentStep = getStepIndex(booking.status);
  const isCancelled = booking.status === 'CANCELLED';
  const isDeclined = booking.status === 'DECLINED';

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Back Link & Header */}
      <div>
        <Link
          href="/dashboard/customer"
          className="text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1.5 text-xs font-semibold transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to My Bookings
        </Link>
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-foreground text-2xl font-extrabold tracking-tight sm:text-3xl">
              Booking Details
            </h1>
            <p className="text-muted-foreground mt-1 text-xs">
              Reference ID: <span className="font-mono">{booking.id}</span>
            </p>
          </div>
          <StatusBadge status={booking.status} />
        </div>
      </div>

      {/* Visual Status Timeline (FR-CUS-9) */}
      <Card className="border">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-bold">
            Progress Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isCancelled || isDeclined ? (
            <div className="border-destructive/30 bg-destructive/10 space-y-1 rounded-xl border p-4 text-center">
              <p className="text-destructive text-sm font-bold">
                Booking {isCancelled ? 'Cancelled' : 'Declined'}
              </p>
              <p className="text-muted-foreground text-xs">
                This service request has concluded and the technician time slot
                was released.
              </p>
            </div>
          ) : (
            <div className="relative flex flex-col justify-between gap-6 md:flex-row md:gap-2">
              {timelineSteps.map((step, idx) => {
                const isPassed = currentStep >= idx;
                const isCurrent = currentStep === idx;

                return (
                  <div
                    key={step.status}
                    className="flex flex-1 flex-row items-start gap-3 text-left md:flex-col md:items-center md:gap-2 md:text-center"
                  >
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                        isCurrent
                          ? 'bg-primary text-primary-foreground ring-primary/20 ring-4'
                          : isPassed
                            ? 'bg-emerald-500 text-white'
                            : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {isPassed ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        idx + 1
                      )}
                    </div>

                    <div>
                      <p
                        className={`text-xs font-semibold ${
                          isCurrent
                            ? 'text-primary font-bold'
                            : isPassed
                              ? 'text-foreground'
                              : 'text-muted-foreground'
                        }`}
                      >
                        {step.label}
                      </p>
                      <p className="text-muted-foreground hidden max-w-[120px] text-[11px] sm:block">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Section (FR-CUS-10) */}
      <BookingReviewCard booking={booking} />

      {/* Booking Details Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Service & Technician Card */}
        <Card className="border">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-bold">
              <Wrench className="h-4 w-4 text-amber-500" /> Service Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div>
              <span className="text-muted-foreground block text-[11px]">
                Service Name
              </span>
              <span className="text-foreground text-sm font-semibold">
                {booking.service?.title || 'General Service'}
              </span>
            </div>

            <div className="border-t pt-2">
              <span className="text-muted-foreground block text-[11px]">
                Technician
              </span>
              <span className="text-foreground mt-0.5 flex items-center gap-1.5 text-sm font-medium">
                <User className="h-3.5 w-3.5 text-amber-500" />
                {booking.technician?.user?.name || 'Assigned Technician'}
              </span>
            </div>

            <div className="border-t pt-2">
              <span className="text-muted-foreground block text-[11px]">
                Scheduled Time
              </span>
              <span className="text-foreground mt-0.5 flex items-center gap-1.5 font-medium">
                <Calendar className="h-3.5 w-3.5 text-amber-500" />
                {booking.slot?.startTime
                  ? new Date(booking.slot.startTime).toLocaleString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true,
                    })
                  : 'Time confirmed'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Address & Payment Card */}
        <Card className="border">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-bold">
              <MapPin className="h-4 w-4 text-amber-500" /> Address & Pricing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div>
              <span className="text-muted-foreground block text-[11px]">
                Service Address
              </span>
              <span className="text-foreground mt-0.5 block leading-relaxed font-medium">
                {booking.address}
              </span>
            </div>

            {booking.notes && (
              <div className="border-t pt-2">
                <span className="text-muted-foreground block text-[11px]">
                  Special Instructions
                </span>
                <span className="text-muted-foreground mt-0.5 block italic">
                  &ldquo;{booking.notes}&rdquo;
                </span>
              </div>
            )}

            <div className="flex items-center justify-between border-t pt-3">
              <span className="text-muted-foreground font-medium">
                Total Payable
              </span>
              <span className="text-foreground text-lg font-extrabold">
                ৳{amount.toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Footer */}
      <div className="bg-card flex flex-col items-center justify-between gap-4 rounded-xl border p-4 sm:flex-row">
        <div className="text-muted-foreground flex items-center gap-2 text-xs">
          <Clock className="h-4 w-4 text-amber-500" />
          <span>Need help with this order? Contact support anytime.</span>
        </div>

        <div className="flex w-full items-center gap-2 sm:w-auto">
          {actions.pay && (
            <Link
              href={`/dashboard/customer/bookings/${booking.id}/pay`}
              className={buttonVariants({
                size: 'sm',
                className: 'w-full gap-2 font-bold shadow-md sm:w-auto',
              })}
            >
              <CreditCard className="h-4 w-4" /> Pay Now (Stripe)
            </Link>
          )}

          {booking.status === 'COMPLETED' && (
            <Link
              href="/dashboard/customer"
              className={buttonVariants({
                variant: 'outline',
                size: 'sm',
                className: 'w-full gap-2 sm:w-auto',
              })}
            >
              Back to Dashboard
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
