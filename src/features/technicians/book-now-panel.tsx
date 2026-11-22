'use client';

import * as React from 'react';
import Link from 'next/link';
import { Calendar, Clock, MapPin, ArrowRight } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { buttonVariants } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { TechnicianProfile, Service } from '@/types/domain';

interface BookNowPanelProps {
  tech: TechnicianProfile;
  services: Service[];
}

export function BookNowPanel({ tech, services }: BookNowPanelProps) {
  const [selectedServiceId, setSelectedServiceId] = React.useState<string>(
    services[0]?.id || ''
  );

  const selectedService =
    services.find((s) => s.id === selectedServiceId) || services[0];
  const price = selectedService
    ? typeof selectedService.price === 'number'
      ? selectedService.price
      : parseFloat(String(selectedService.price)) || 0
    : typeof tech.hourlyRate === 'number'
      ? tech.hourlyRate
      : parseFloat(String(tech.hourlyRate)) || 500;

  return (
    <Card className="bg-card sticky top-20 border shadow-md">
      <CardHeader className="bg-muted/20 border-b pb-4">
        <CardTitle className="flex items-center justify-between text-lg font-bold">
          <span>Book Technician</span>
          <span className="text-xl font-extrabold text-amber-600 dark:text-amber-400">
            ৳{price.toLocaleString()}
          </span>
        </CardTitle>
        <p className="text-muted-foreground text-xs">
          Select a service and reserve your preferred time slot.
        </p>
      </CardHeader>

      <CardContent className="space-y-4 p-5">
        {/* Service Selector */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold">Choose Service</Label>
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
              General Hourly Consultation (৳
              {Number(tech.hourlyRate || 500).toLocaleString()}/hr)
            </div>
          )}
        </div>

        {/* Service Summary Highlight */}
        <div className="bg-muted/30 space-y-2 rounded-lg border p-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-amber-500" /> Working hours
            </span>
            <span className="text-foreground font-medium">
              9:00 AM - 8:00 PM
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-amber-500" /> Service Area
            </span>
            <span className="text-foreground max-w-[130px] truncate font-medium">
              {tech.location || 'Dhaka Metro'}
            </span>
          </div>
        </div>

        {/* Available Slot Preview Note */}
        <div className="space-y-1 rounded-lg border border-dashed border-amber-500/40 bg-amber-500/5 p-3 text-xs text-amber-800 dark:text-amber-300">
          <p className="flex items-center gap-1.5 font-semibold">
            <Calendar className="h-3.5 w-3.5 text-amber-500" /> Next Available
            Slots
          </p>
          <p className="text-muted-foreground text-[11px]">
            Slots are dynamically updated in real-time. Pick your preferred
            appointment during checkout.
          </p>
        </div>
      </CardContent>

      <CardFooter className="p-5 pt-0">
        <Link
          href={`#book-section`}
          className={buttonVariants({
            size: 'lg',
            className:
              'w-full gap-2 bg-amber-500 font-bold text-white hover:bg-amber-600',
          })}
        >
          Book Now <ArrowRight className="h-4 w-4" />
        </Link>
      </CardFooter>
    </Card>
  );
}
