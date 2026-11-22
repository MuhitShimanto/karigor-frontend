import Link from 'next/link';
import { AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function PaymentCancelPage() {
  return (
    <div className="container max-w-xl py-12 md:py-20">
      <Card className="border-border/60 overflow-hidden text-center shadow-lg">
        <div className="bg-gradient-to-b from-amber-500/10 to-transparent px-6 py-8">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400">
            <AlertCircle className="animate-in zoom-in-75 h-10 w-10 duration-300" />
          </div>
          <CardHeader className="p-0 pt-6">
            <CardTitle className="text-foreground text-2xl font-bold tracking-tight md:text-3xl">
              Payment Cancelled
            </CardTitle>
            <CardDescription className="text-muted-foreground mx-auto mt-2 max-w-md text-base">
              You chose not to complete the payment session. No charges were
              made to your payment method.
            </CardDescription>
          </CardHeader>
        </div>

        <CardContent className="text-muted-foreground space-y-4 px-6 pt-2 pb-6 text-left text-sm">
          <div className="border-border/60 bg-muted/30 space-y-2 rounded-xl border p-4">
            <h4 className="text-foreground font-medium">What happens now?</h4>
            <p>
              Your booking remains saved in accepted status. You can return to
              your customer dashboard whenever you are ready to complete
              checkout and confirm your technician appointment.
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col justify-center gap-3 px-6 pt-0 pb-8 sm:flex-row">
          <Link
            href="/dashboard/customer"
            className={buttonVariants({
              variant: 'default',
              className: 'w-full sm:w-auto',
            })}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Return to Bookings
          </Link>
          <Link
            href="/services"
            className={buttonVariants({
              variant: 'outline',
              className: 'w-full sm:w-auto',
            })}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Browse Services
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
