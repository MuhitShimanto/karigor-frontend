'use client';

import * as React from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  Trash2,
  Lock,
  AlertCircle,
  ArrowLeft,
  Loader2,
  Save,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { clientRequest } from '@/lib/api/client';
import { SafeUser } from '@/types/auth';
import { AvailabilitySlot, TechnicianProfile } from '@/types/domain';
import { cn } from '@/lib/utils';

interface AuthMeResponse extends SafeUser {
  technicianProfile?: TechnicianProfile;
}

interface LocalSlot {
  id?: string;
  startTime: string; // ISO string
  endTime: string; // ISO string
  isBooked?: boolean;
}

export default function TechnicianAvailabilityPage() {
  const queryClient = useQueryClient();

  // Generate next 7 days for the date picker
  const upcomingDays = React.useMemo(() => {
    const days: { dateStr: string; label: string; weekday: string }[] = [];
    const base = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const weekday =
        i === 0
          ? 'Today'
          : i === 1
            ? 'Tomorrow'
            : d.toLocaleDateString('en-US', { weekday: 'short' });
      const label = d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
      days.push({ dateStr, label, weekday });
    }
    return days;
  }, []);

  const [selectedDate, setSelectedDate] = React.useState<string>(
    upcomingDays[0]?.dateStr || ''
  );
  const [localSlots, setLocalSlots] = React.useState<LocalSlot[]>([]);
  const [slotsInitialized, setSlotsInitialized] = React.useState(false);

  // New slot inputs
  const [startHour, setStartHour] = React.useState('09:00');
  const [endHour, setEndHour] = React.useState('11:00');

  // Fetch current technician info to get profile ID
  const { data: userRes } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: () => clientRequest<AuthMeResponse>('/auth/me'),
  });

  const profileId = userRes?.data?.technicianProfile?.id;

  // Fetch technician details including current slots
  const { data: techRes, isLoading } = useQuery({
    queryKey: ['technician-details', profileId],
    queryFn: () =>
      clientRequest<TechnicianProfile>(`/technicians/${profileId}`),
    enabled: Boolean(profileId),
  });

  // Load existing slots into state once
  if (techRes?.data?.slots && !slotsInitialized) {
    const existing = techRes.data.slots.map((s: AvailabilitySlot) => ({
      id: s.id,
      startTime: s.startTime,
      endTime: s.endTime,
      isBooked: s.isBooked,
    }));
    setLocalSlots(existing);
    setSlotsInitialized(true);
  }

  // Save availability mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      // Backend replaces all unbooked future slots with the provided array
      const now = new Date();
      // Keep unbooked slots that start in the future
      const futureUnbooked = localSlots
        .filter((s) => !s.isBooked && new Date(s.startTime) > now)
        .map((s) => ({
          startTime: new Date(s.startTime).toISOString(),
          endTime: new Date(s.endTime).toISOString(),
        }));

      return clientRequest('/technician/availability', {
        method: 'PUT',
        body: JSON.stringify({ slots: futureUnbooked }),
      });
    },
    onSuccess: () => {
      toast.success('Availability schedule saved successfully.');
      queryClient.invalidateQueries({ queryKey: ['technician-details'] });
    },
    onError: (err: unknown) => {
      const msg =
        err instanceof Error ? err.message : 'Could not save availability.';
      toast.error(msg);
    },
  });

  // Filter slots for currently selected date
  const slotsForSelectedDate = localSlots.filter((s) => {
    return s.startTime.startsWith(selectedDate);
  });

  const handleAddCustomSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startHour || !endHour) {
      toast.error('Please specify both start and end times.');
      return;
    }

    const startDateTime = new Date(`${selectedDate}T${startHour}:00`);
    const endDateTime = new Date(`${selectedDate}T${endHour}:00`);
    const now = new Date();

    if (startDateTime <= now) {
      toast.error('Slot start time must be in the future.');
      return;
    }

    if (endDateTime <= startDateTime) {
      toast.error('Slot end time must be after the start time.');
      return;
    }

    // Check overlap with existing slots
    const hasOverlap = localSlots.some((s) => {
      const existingStart = new Date(s.startTime);
      const existingEnd = new Date(s.endTime);
      return startDateTime < existingEnd && endDateTime > existingStart;
    });

    if (hasOverlap) {
      toast.error('This time slot overlaps with an existing slot.');
      return;
    }

    setLocalSlots((prev) => [
      ...prev,
      {
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        isBooked: false,
      },
    ]);

    toast.info(
      `Added slot ${startHour} - ${endHour}. Click "Save Schedule" to publish.`
    );
  };

  const handleQuickAddSlots = () => {
    const presets = [
      { s: '09:00', e: '11:00' },
      { s: '11:30', e: '13:30' },
      { s: '14:30', e: '16:30' },
      { s: '17:00', e: '19:00' },
    ];

    const now = new Date();
    let addedCount = 0;
    const newSlots = [...localSlots];

    for (const p of presets) {
      const startDateTime = new Date(`${selectedDate}T${p.s}:00`);
      const endDateTime = new Date(`${selectedDate}T${p.e}:00`);

      if (startDateTime <= now) continue;

      const hasOverlap = newSlots.some((s) => {
        const existingStart = new Date(s.startTime);
        const existingEnd = new Date(s.endTime);
        return startDateTime < existingEnd && endDateTime > existingStart;
      });

      if (!hasOverlap) {
        newSlots.push({
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
          isBooked: false,
        });
        addedCount++;
      }
    }

    if (addedCount > 0) {
      setLocalSlots(newSlots);
      toast.success(
        `Generated ${addedCount} standard 2-hour slots for ${selectedDate}.`
      );
    } else {
      toast.warning(
        'Standard slots could not be added (they may be in the past or already exist).'
      );
    }
  };

  const handleRemoveSlot = (indexToRemove: number) => {
    const slot = slotsForSelectedDate[indexToRemove];
    if (slot.isBooked) {
      toast.error(
        'Cannot remove a booked slot. A customer has reserved this time.'
      );
      return;
    }
    setLocalSlots((prev) =>
      prev.filter(
        (s) => s.startTime !== slot.startTime || s.endTime !== slot.endTime
      )
    );
    toast.info('Slot removed from local schedule.');
  };

  const formatTimeDisplay = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Header */}
      <div>
        <Link
          href="/dashboard/technician"
          className="text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1.5 text-xs font-semibold transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Technician Overview
        </Link>
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-foreground text-2xl font-extrabold tracking-tight sm:text-3xl">
              Availability Scheduler
            </h1>
            <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
              Publish open slots for the week so customers can book appointments
              in real time.
            </p>
          </div>

          <Button
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
            className="shrink-0 gap-1.5 text-xs font-bold shadow-md sm:text-sm"
          >
            {saveMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save Schedule
          </Button>
        </div>
      </div>

      {/* Date Selector Row */}
      <Card className="border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-bold">
            <CalendarIcon className="text-primary h-4 w-4" />
            Select Day
          </CardTitle>
          <CardDescription className="text-xs">
            Choose a day to view existing appointments and add availability
            slots
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-7">
            {upcomingDays.map((day) => {
              const isSelected = day.dateStr === selectedDate;
              const countForDay = localSlots.filter((s) =>
                s.startTime.startsWith(day.dateStr)
              ).length;

              return (
                <button
                  key={day.dateStr}
                  type="button"
                  onClick={() => setSelectedDate(day.dateStr)}
                  className={cn(
                    'flex flex-col items-center justify-center gap-1 rounded-xl border p-2.5 text-center transition-all',
                    isSelected
                      ? 'border-primary bg-primary/10 text-primary ring-primary font-bold shadow-xs ring-1'
                      : 'border-border/60 hover:bg-muted/50 text-foreground font-medium'
                  )}
                >
                  <span className="text-muted-foreground text-[11px] tracking-wider uppercase">
                    {day.weekday}
                  </span>
                  <span className="text-sm font-extrabold">{day.label}</span>
                  <Badge
                    variant={isSelected ? 'default' : 'outline'}
                    className="mt-0.5 h-4 px-1.5 py-0 text-[10px]"
                  >
                    {countForDay} {countForDay === 1 ? 'slot' : 'slots'}
                  </Badge>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Slots for Selected Day */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Left Column: Existing Slots */}
        <div className="space-y-4 md:col-span-2">
          <Card className="border">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-sm font-bold">
                  Slots for {selectedDate}
                </CardTitle>
                <CardDescription className="text-xs">
                  {slotsForSelectedDate.length} slot(s) configured
                </CardDescription>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleQuickAddSlots}
                className="border-primary/30 text-primary hover:bg-primary/10 h-8 gap-1.5 text-xs"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Quick Presets (4 slots)
              </Button>
            </CardHeader>

            <CardContent>
              {isLoading ? (
                <div className="text-muted-foreground animate-pulse p-8 text-center text-xs">
                  Loading schedule...
                </div>
              ) : slotsForSelectedDate.length === 0 ? (
                <div className="space-y-2 rounded-xl border border-dashed p-8 text-center">
                  <Clock className="text-muted-foreground/30 mx-auto h-8 w-8" />
                  <p className="text-foreground text-xs font-medium">
                    No slots configured for this day
                  </p>
                  <p className="text-muted-foreground text-[11px]">
                    Use the form on the right or click &quot;Quick Presets&quot;
                    to open slots for customers.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {slotsForSelectedDate.map((slot, idx) => (
                    <div
                      key={slot.id || `${slot.startTime}-${idx}`}
                      className={cn(
                        'flex items-center justify-between rounded-xl border p-3 text-xs transition-colors',
                        slot.isBooked
                          ? 'border-amber-500/40 bg-amber-500/5 text-amber-700 dark:text-amber-300'
                          : 'border-border/60 bg-card hover:bg-muted/30 text-foreground'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            'flex h-8 w-8 items-center justify-center rounded-lg',
                            slot.isBooked
                              ? 'bg-amber-500/20 text-amber-600'
                              : 'bg-emerald-500/20 text-emerald-600'
                          )}
                        >
                          {slot.isBooked ? (
                            <Lock className="h-4 w-4" />
                          ) : (
                            <Clock className="h-4 w-4" />
                          )}
                        </div>

                        <div>
                          <div className="text-sm font-semibold">
                            {formatTimeDisplay(slot.startTime)} &ndash;{' '}
                            {formatTimeDisplay(slot.endTime)}
                          </div>
                          <div className="text-muted-foreground text-[10px]">
                            {slot.isBooked ? (
                              <span className="font-semibold text-amber-600 dark:text-amber-400">
                                Reserved by customer &bull; Locked
                              </span>
                            ) : (
                              <span className="font-medium text-emerald-600 dark:text-emerald-400">
                                Available for booking
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {!slot.isBooked && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveSlot(idx)}
                          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-7 w-7"
                          title="Remove slot"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Add Custom Slot */}
        <div>
          <Card className="border">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-bold">
                <Plus className="text-primary h-4 w-4" />
                Add Custom Slot
              </CardTitle>
              <CardDescription className="text-xs">
                Create a specific time block on {selectedDate}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddCustomSlot} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="start-time" className="text-xs font-semibold">
                    Start Time
                  </Label>
                  <Input
                    id="start-time"
                    type="time"
                    value={startHour}
                    onChange={(e) => setStartHour(e.target.value)}
                    required
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="end-time" className="text-xs font-semibold">
                    End Time
                  </Label>
                  <Input
                    id="end-time"
                    type="time"
                    value={endHour}
                    onChange={(e) => setEndHour(e.target.value)}
                    required
                    className="text-xs"
                  />
                </div>

                <Button
                  type="submit"
                  size="sm"
                  className="w-full gap-1.5 text-xs font-semibold"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Slot
                </Button>
              </form>
            </CardContent>
            <CardFooter className="text-muted-foreground pt-0 text-[11px]">
              <div className="bg-muted/40 border-border/40 flex items-start gap-1.5 rounded-lg border p-2.5">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
                <span>
                  Remember to click &quot;Save Schedule&quot; after adding or
                  deleting slots to publish your updates.
                </span>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
