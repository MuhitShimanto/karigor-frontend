import { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  ArrowLeft,
  ShieldCheck,
  CreditCard,
  Lock,
  Wrench,
  Calendar,
  MapPin,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { PayButton } from '@/features/payments/pay-button';
import { StatusBadge } from '@/features/bookings/status-badge';
import { serverRequest } from '@/lib/api/server';
import { Booking } from '@/types/domain';

interface PayPageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: 'Pay for Service | Karigor',
  description:
    'Complete secure online payment for your approved service request via Stripe Checkout.',
};

async function getBooking(id: string): Promise<Booking | null> {
  try {
    const res = await serverRequest<Booking>(`/bookings/${id}`);
    return res.data || null;
  } catch {
    return null;
  }
}

export default async function PayPage({ params }: PayPageProps) {
  const { id } = await params;
  const booking = await getBooking(id);

  if (!booking) {
    redirect('/dashboard/customer');
  }

  // FR-PAY-3: Payment initiation is blocked unless status is ACCEPTED
  if (booking.status !== 'ACCEPTED') {
    redirect('/dashboard/customer');
  }

  const amount =
    typeof booking.totalAmount === 'number'
      ? booking.totalAmount
      : parseFloat(String(booking.totalAmount)) || 0;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Back Link */}
      <div>
        <Link
          href="/dashboard/customer"
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-xs font-semibold transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to My Bookings
        </Link>
      </div>

      {/* Page Title */}
      <div>
        <h1 className="text-foreground text-2xl font-extrabold tracking-tight sm:text-3xl">
          Service Payment Checkout
        </h1>
        <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
          Review your approved booking summary and proceed to Stripe Checkout.
        </p>
      </div>

      {/* Booking Summary Card */}
      <Card className="border shadow-sm">
        <CardHeader className="bg-muted/20 border-b pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base font-bold">
              <Wrench className="text-primary h-4 w-4" />
              {booking.service?.title || 'Service Booking'}
            </CardTitle>
            <StatusBadge status={booking.status} />
          </div>
        </CardHeader>

        <CardContent className="space-y-4 p-6">
          <div className="grid grid-cols-1 gap-4 text-xs sm:grid-cols-2">
            <div>
              <span className="text-muted-foreground block text-[11px]">
                Assigned Technician
              </span>
              <span className="text-foreground text-sm font-semibold">
                {booking.technician?.user?.name || 'Verified Technician'}
              </span>
            </div>

            <div>
              <span className="text-muted-foreground block text-[11px]">
                Appointment Slot
              </span>
              <span className="text-foreground mt-0.5 flex items-center gap-1.5 font-semibold">
                <Calendar className="text-primary h-3.5 w-3.5" />
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

            <div className="border-t pt-3 sm:col-span-2">
              <span className="text-muted-foreground block text-[11px]">
                Service Address
              </span>
              <span className="text-foreground mt-0.5 flex items-center gap-1.5 font-medium">
                <MapPin className="text-primary h-3.5 w-3.5 shrink-0" />
                <span>{booking.address}</span>
              </span>
            </div>
          </div>

          {/* Pricing Breakdown */}
          <div className="bg-muted/30 space-y-2.5 rounded-xl border p-4 text-xs">
            <div className="text-muted-foreground flex justify-between">
              <span>Service Fee</span>
              <span className="text-foreground font-medium">
                ৳{amount.toLocaleString()}
              </span>
            </div>
            <div className="text-muted-foreground flex justify-between">
              <span>Platform Processing Fee</span>
              <span className="font-medium text-emerald-600">Free (৳0)</span>
            </div>
            <div className="text-foreground flex items-baseline justify-between border-t pt-2 text-sm font-bold">
              <span>Total Payable</span>
              <span className="text-primary text-xl font-extrabold">
                ৳{amount.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Gateway Notice - MR-5: No COD / Fake Payment */}
          <div className="flex items-start gap-2 rounded-lg border border-purple-500/20 bg-purple-500/5 p-3 text-xs text-purple-900 dark:text-purple-300">
            <CreditCard className="mt-0.5 h-4 w-4 shrink-0 text-purple-600" />
            <div>
              <p className="font-semibold">
                Hosted Payment via Stripe Checkout
              </p>
              <p className="text-muted-foreground mt-0.5 text-[11px]">
                You will be redirected to Stripe&apos;s 256-bit encrypted
                checkout session. All major credit & debit cards accepted. Test
                Card: 4242 4242 4242 4242.
              </p>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 p-6 pt-0">
          <PayButton
            bookingId={booking.id}
            amount={amount}
            className="h-11 w-full text-sm"
          />

          <div className="text-muted-foreground flex items-center justify-center gap-2 text-xs">
            <Lock className="h-3.5 w-3.5 text-emerald-500" />
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            <span>Encrypted & Verified Payment Gateways Only (MR-5)</span>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
