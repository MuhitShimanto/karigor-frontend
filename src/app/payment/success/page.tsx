'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  CheckCircle2,
  ArrowRight,
  Calendar,
  Loader2,
  ShieldCheck,
  Clock,
} from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { clientRequest } from '@/lib/api/client';
import { Payment } from '@/types/domain';

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const queryClient = useQueryClient();
  const [pollCount, setPollCount] = useState(0);
  const [countdown, setCountdown] = useState(5);

  // Countdown and automated redirection in 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/dashboard/customer');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  // Directly verify the Stripe checkout session when session_id is in the URL
  const { data: verifiedPayment, isLoading: isVerifying } = useQuery({
    queryKey: ['payments', 'verify-session', sessionId],
    queryFn: async () => {
      if (!sessionId) return null;
      try {
        const res = await clientRequest<{
          success: boolean;
          payment: Payment;
        }>('/payments/verify-session', {
          method: 'POST',
          body: JSON.stringify({ sessionId }),
        });
        if (res.data?.payment) {
          queryClient.invalidateQueries({ queryKey: ['bookings'] });
          queryClient.invalidateQueries({ queryKey: ['payments'] });
          return res.data.payment;
        }
      } catch (err) {
        console.error('Session verification error:', err);
      }
      return null;
    },
    enabled: !!sessionId,
    staleTime: Infinity,
  });

  // Poll latest payments to verify settlement and keep cache updated
  const { data: paymentsData } = useQuery({
    queryKey: ['payments', 'latest-check', pollCount],
    queryFn: async () => {
      const res = await clientRequest<Payment[]>('/payments?limit=3');
      return res.data;
    },
    refetchInterval: (query) => {
      const items = query.state.data ?? [];
      const hasRecentPaid = items.some(
        (p: Payment) => p.status === 'COMPLETED'
      );
      if (hasRecentPaid || pollCount >= 6) {
        return false;
      }
      return 2500;
    },
  });

  useEffect(() => {
    // Invalidate dashboard caches so when customer navigates back, data is fresh
    queryClient.invalidateQueries({ queryKey: ['bookings'] });
    queryClient.invalidateQueries({ queryKey: ['payments'] });

    const interval = setInterval(() => {
      setPollCount((prev) => (prev < 6 ? prev + 1 : prev));
    }, 2500);

    return () => clearInterval(interval);
  }, [queryClient, verifiedPayment]);

  const latestPayment =
    verifiedPayment ||
    (Array.isArray(paymentsData)
      ? paymentsData.find((p) => p.status === 'COMPLETED') || paymentsData[0]
      : undefined);

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-8rem)] max-w-xl items-center justify-center px-4 py-12 md:py-16">
      <Card className="border-border/60 w-full gap-0 overflow-hidden py-0 pt-0 text-center shadow-lg">
        <div className="bg-gradient-to-b from-emerald-500/10 to-transparent px-6 py-8">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="animate-in zoom-in-75 h-10 w-10 duration-300" />
          </div>
          <CardHeader className="p-0 pt-6">
            <CardTitle className="text-foreground text-2xl font-bold tracking-tight md:text-3xl">
              Payment Completed!
            </CardTitle>
            <CardDescription className="text-muted-foreground mx-auto mt-2 max-w-md text-base">
              Thank you for your payment. Your booking has been verified and
              your technician will arrive at the scheduled time.
            </CardDescription>
          </CardHeader>
        </div>

        <CardContent className="space-y-6 px-6 pt-2 pb-6">
          <div className="border-border/60 bg-muted/30 space-y-3 rounded-xl border p-4 text-left">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Payment Status</span>
              {isVerifying && !latestPayment ? (
                <span className="inline-flex items-center gap-1.5 font-medium text-amber-600 dark:text-amber-400">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Verifying...
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="h-4 w-4" />
                  {latestPayment?.status ?? 'PAID'}
                </span>
              )}
            </div>

            {latestPayment && (
              <>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Amount Paid</span>
                  <span className="text-foreground font-semibold">
                    ${Number(latestPayment.amount).toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Transaction ID</span>
                  <span className="text-foreground bg-muted rounded px-2 py-0.5 font-mono text-xs">
                    {latestPayment.transactionId}
                  </span>
                </div>

                {latestPayment.booking?.service?.title && (
                  <div className="border-border/40 flex items-center justify-between border-t pt-2 text-sm">
                    <span className="text-muted-foreground">Service</span>
                    <span className="text-foreground max-w-[200px] truncate text-right font-medium">
                      {latestPayment.booking.service.title}
                    </span>
                  </div>
                )}
              </>
            )}

            {sessionId && (
              <div className="text-muted-foreground flex items-center justify-between pt-1 text-xs">
                <span>Session Ref</span>
                <span className="max-w-[180px] truncate font-mono">
                  {sessionId}
                </span>
              </div>
            )}
          </div>

          <div className="text-muted-foreground flex items-center gap-2.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3.5 text-left text-xs">
            <Clock className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>
              Your technician has been notified. You can track booking status,
              view updates, and communicate via your dashboard.
            </span>
          </div>
        </CardContent>

        <CardFooter className="mt-6 flex flex-col items-center justify-center gap-4 border-t-0 bg-transparent px-6 pt-0 pb-8">
          <p className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
            <Clock className="text-primary h-3.5 w-3.5" />
            Redirecting to dashboard in{' '}
            <span className="text-primary font-mono font-bold">
              {countdown}s
            </span>
            ...
          </p>
          <div className="flex w-full flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/dashboard/customer"
              className={buttonVariants({
                variant: 'default',
                className: 'w-full font-semibold sm:w-auto',
              })}
            >
              Go to Dashboard ({countdown}s)
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link
              href="/services"
              className={buttonVariants({
                variant: 'outline',
                className: 'w-full sm:w-auto',
              })}
            >
              <Calendar className="mr-2 h-4 w-4" />
              Book Another Service
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
