'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Clock,
  MapPin,
  ArrowRight,
  Loader2,
  LogIn,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { SlotPicker } from '@/features/bookings/slot-picker';
import { useAuthStore } from '@/store/auth.store';
import { clientRequest } from '@/lib/api/client';
import { TechnicianProfile, Service, AvailabilitySlot } from '@/types/domain';

interface BookNowPanelProps {
  tech: TechnicianProfile;
  services: Service[];
  slots?: AvailabilitySlot[];
}

export function BookNowPanel({
  tech,
  services,
  slots = [],
}: BookNowPanelProps) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const [selectedServiceId, setSelectedServiceId] = React.useState<string>(
    services[0]?.id || ''
  );
  const [selectedSlot, setSelectedSlot] =
    React.useState<AvailabilitySlot | null>(
      slots.find((s) => !s.isBooked) || null
    );
  const [address, setAddress] = React.useState<string>('');
  const [notes, setNotes] = React.useState<string>('');
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const [errorMsg, setErrorMsg] = React.useState<string>('');

  const selectedService =
    services.find((s) => s.id === selectedServiceId) || services[0];
  const price = selectedService
    ? typeof selectedService.price === 'number'
      ? selectedService.price
      : parseFloat(String(selectedService.price)) || 0
    : typeof tech.hourlyRate === 'number'
      ? tech.hourlyRate
      : parseFloat(String(tech.hourlyRate)) || 500;

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!user) {
      router.push(`/auth/login?next=/technicians/${tech.id}`);
      return;
    }

    if (user.role !== 'CUSTOMER') {
      setErrorMsg('Bookings can only be created by customer accounts.');
      return;
    }

    if (!selectedService) {
      setErrorMsg('Please choose a service to book.');
      return;
    }

    if (!selectedSlot) {
      setErrorMsg('Please select an available time slot.');
      return;
    }

    if (!address.trim() || address.trim().length < 5) {
      setErrorMsg(
        'Please enter a valid service address (at least 5 characters).'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await clientRequest('/bookings', {
        method: 'POST',
        body: JSON.stringify({
          serviceId: selectedService.id,
          slotId: selectedSlot.id,
          address: address.trim(),
          notes: notes.trim() || undefined,
        }),
      });

      toast.success(
        'Booking requested successfully! The technician has been notified.'
      );
      router.push('/dashboard/customer');
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Failed to create booking. Please try again.';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isGuest = !user;
  const isWrongRole = Boolean(user && user.role !== 'CUSTOMER');

  return (
    <Card className="border-border/80 bg-card dark:border-border/60 sticky top-20 overflow-hidden rounded-xl border shadow-lg">
      <CardHeader className="border-border/60 bg-muted/20 border-b p-5 pb-4">
        <CardTitle className="text-foreground flex items-center justify-between text-lg font-bold tracking-tight">
          <span>Book Technician</span>
          <span className="font-heading text-foreground text-xl font-extrabold">
            ৳{price.toLocaleString()}
          </span>
        </CardTitle>
        <p className="text-muted-foreground text-xs">
          Select your service and choose an available appointment slot.
        </p>
      </CardHeader>

      <form onSubmit={handleBookingSubmit}>
        <CardContent className="space-y-4 p-5">
          {errorMsg && (
            <div className="border-destructive/30 bg-destructive/10 text-destructive flex items-start gap-2 rounded-lg border p-3 text-xs">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {isWrongRole && (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-800 dark:text-amber-300">
              You are signed in as a <strong>{user?.role}</strong>. Please
              switch to a customer account to request bookings.
            </div>
          )}

          {/* Service Selector */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">1. Choose Service</Label>
            {services.length > 0 ? (
              <select
                value={selectedServiceId}
                onChange={(e) => setSelectedServiceId(e.target.value)}
                className="border-input bg-background focus:ring-ring h-10 w-full rounded-md border px-3 py-1 text-xs shadow-sm focus:ring-1 focus:outline-none"
              >
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title} (৳{Number(s.price).toLocaleString()})
                  </option>
                ))}
              </select>
            ) : (
              <div className="text-muted-foreground rounded-md border p-2 text-xs">
                General Consultation (৳
                {Number(tech.hourlyRate || 500).toLocaleString()}/hr)
              </div>
            )}
          </div>

          {/* Available Slots Picker */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">2. Select Time Slot</Label>
            <SlotPicker
              slots={slots}
              selectedSlotId={selectedSlot?.id}
              onSelectSlot={(slot) => {
                setSelectedSlot(slot);
                setErrorMsg('');
              }}
            />
          </div>

          {/* Service Address */}
          <div className="space-y-1.5">
            <Label htmlFor="address" className="text-xs font-semibold">
              3. Service Address *
            </Label>
            <Input
              id="address"
              placeholder="e.g. House 14, Road 5, Dhanmondi, Dhaka"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="h-9 text-xs"
              required
            />
          </div>

          {/* Notes / Issue Details */}
          <div className="space-y-1.5">
            <Label htmlFor="notes" className="text-xs font-semibold">
              4. Issue Details / Instructions (optional)
            </Label>
            <Input
              id="notes"
              placeholder="Describe the issue or gate/door code..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="h-9 text-xs"
            />
          </div>

          {/* Quick Details Bar */}
          <div className="bg-muted/30 space-y-1 rounded-lg border p-2.5 text-xs">
            <div className="text-muted-foreground flex items-center justify-between">
              <span className="flex items-center gap-1">
                <MapPin className="text-primary h-3 w-3" /> Location
              </span>
              <span className="text-foreground font-medium">
                {tech.location || 'Dhaka Metro'}
              </span>
            </div>
            <div className="text-muted-foreground flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Clock className="text-primary h-3 w-3" /> Status on Request
              </span>
              <span className="text-primary font-semibold">REQUESTED</span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="border-border/60 bg-muted/15 border-t px-5 py-4">
          {isGuest ? (
            <Link
              href={`/auth/login?next=/technicians/${tech.id}`}
              className={buttonVariants({
                size: 'lg',
                className: 'w-full gap-2 font-bold shadow-md',
              })}
            >
              <LogIn className="h-4 w-4" /> Sign In to Book
            </Link>
          ) : (
            <Button
              type="submit"
              disabled={isSubmitting || isWrongRole || !selectedSlot}
              className="w-full gap-2 font-bold shadow-md"
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Submitting
                  Request...
                </>
              ) : (
                <>
                  Confirm & Book <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          )}
        </CardFooter>
      </form>
    </Card>
  );
}
