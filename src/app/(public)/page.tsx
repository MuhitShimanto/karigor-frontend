import Link from 'next/link';
import { ArrowRight, Wrench, Shield, Clock, CheckCircle } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="via-background to-background relative overflow-hidden bg-gradient-to-b from-amber-500/10 py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="bg-background mb-6 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium text-amber-600 shadow-sm dark:text-amber-400">
              <Wrench className="h-3.5 w-3.5" />
              <span>Your Trusted Home Service Marketplace</span>
            </div>

            <h1 className="text-foreground text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
              Professional Home Services at{' '}
              <span className="text-amber-500 dark:text-amber-400">
                Your Doorstep
              </span>
            </h1>

            <p className="text-muted-foreground mt-6 text-base leading-relaxed sm:text-lg">
              Book certified electricians, plumbers, AC technicians, and
              carpenters in minutes. Transparent pricing, verified background
              checks, and guaranteed satisfaction.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/services"
                className={buttonVariants({
                  size: 'lg',
                  className:
                    'w-full gap-2 bg-amber-500 text-white hover:bg-amber-600 sm:w-auto',
                })}
              >
                Browse Services <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/auth/register"
                className={buttonVariants({
                  variant: 'outline',
                  size: 'lg',
                  className: 'w-full sm:w-auto',
                })}
              >
                Join as a Technician
              </Link>
            </div>

            {/* Quick stats / trust row */}
            <div className="mt-12 grid grid-cols-3 gap-4 border-t pt-8 text-center">
              <div>
                <p className="text-foreground text-2xl font-bold">500+</p>
                <p className="text-muted-foreground text-xs">
                  Verified Technicians
                </p>
              </div>
              <div>
                <p className="text-foreground text-2xl font-bold">15,000+</p>
                <p className="text-muted-foreground text-xs">Jobs Completed</p>
              </div>
              <div>
                <p className="text-foreground text-2xl font-bold">4.8 / 5</p>
                <p className="text-muted-foreground text-xs">Average Rating</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Section */}
      <section className="bg-muted/20 border-y py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Why Choose Karigor?
            </h2>
            <p className="text-muted-foreground mt-2 text-sm">
              We make home repairs and improvements stress-free and reliable.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="bg-card rounded-xl border p-6 shadow-sm">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
                <Shield className="h-5 w-5" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Verified Experts</h3>
              <p className="text-muted-foreground text-sm">
                Every technician undergoes skills verification and identity
                validation before serving customers.
              </p>
            </div>

            <div className="bg-card rounded-xl border p-6 shadow-sm">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600">
                <Clock className="h-5 w-5" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Exact Time Slots</h3>
              <p className="text-muted-foreground text-sm">
                No all-day waiting windows. Pick the exact slot that suits your
                schedule.
              </p>
            </div>

            <div className="bg-card rounded-xl border p-6 shadow-sm">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
                <CheckCircle className="h-5 w-5" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">
                Secure Online Payment
              </h3>
              <p className="text-muted-foreground text-sm">
                Pay safely through Stripe Checkout only after the technician
                confirms your booking.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
