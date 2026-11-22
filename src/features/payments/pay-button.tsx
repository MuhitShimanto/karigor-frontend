'use client';

import * as React from 'react';
import { CreditCard, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { clientRequest } from '@/lib/api/client';

interface PayButtonProps {
  bookingId: string;
  amount: number | string;
  disabled?: boolean;
  className?: string;
}

export function PayButton({
  bookingId,
  amount,
  disabled = false,
  className = '',
}: PayButtonProps) {
  const [isPending, setIsPending] = React.useState(false);

  const formattedAmount =
    typeof amount === 'number' ? amount : parseFloat(String(amount)) || 0;

  const handlePay = async () => {
    setIsPending(true);
    try {
      const res = await clientRequest<{
        redirectUrl: string;
        paymentId: string;
      }>('/payments/create', {
        method: 'POST',
        body: JSON.stringify({ bookingId, provider: 'STRIPE' }),
      });

      if (!res.data?.redirectUrl) {
        throw new Error('Payment gateway URL not provided by the server.');
      }

      toast.info('Redirecting to Stripe secure checkout...');
      window.location.assign(res.data.redirectUrl);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Could not initialize payment. Please try again.';
      toast.error(msg);
      setIsPending(false);
    }
  };

  return (
    <Button
      type="button"
      onClick={handlePay}
      disabled={disabled || isPending}
      className={`gap-2 bg-amber-500 font-bold text-white shadow-md hover:bg-amber-600 ${className}`}
    >
      {isPending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Preparing Checkout...
        </>
      ) : (
        <>
          <CreditCard className="h-4 w-4" />
          Pay ৳{formattedAmount.toLocaleString()} via Stripe
        </>
      )}
    </Button>
  );
}
