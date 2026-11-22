'use client';

import * as React from 'react';
import { Calendar as CalendarIcon, Clock, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { AvailabilitySlot } from '@/types/domain';

interface SlotPickerProps {
  slots?: AvailabilitySlot[];
  selectedSlotId?: string;
  onSelectSlot: (slot: AvailabilitySlot) => void;
}

export function SlotPicker({
  slots = [],
  selectedSlotId,
  onSelectSlot,
}: SlotPickerProps) {
  // Format helper for slot time range
  const formatTimeRange = (start: string, end: string) => {
    try {
      const s = new Date(start);
      const e = new Date(end);
      const formatTime = (d: Date) =>
        d.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        });
      return `${formatTime(s)} - ${formatTime(e)}`;
    } catch {
      return 'Scheduled Slot';
    }
  };

  // Group slots by date
  const groupedSlots = React.useMemo(() => {
    const groups: Record<string, AvailabilitySlot[]> = {};
    for (const slot of slots) {
      try {
        const d = new Date(slot.startTime);
        const dateKey = d.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        });
        if (!groups[dateKey]) groups[dateKey] = [];
        groups[dateKey].push(slot);
      } catch {
        // skip invalid
      }
    }
    return groups;
  }, [slots]);

  const dates = Object.keys(groupedSlots);
  const [activeDate, setActiveDate] = React.useState<string | null>(null);
  const selectedDate =
    activeDate && dates.includes(activeDate) ? activeDate : dates[0] || '';

  if (slots.length === 0) {
    return (
      <div className="bg-muted/20 space-y-2 rounded-xl border border-dashed p-4 text-center">
        <Clock className="text-muted-foreground mx-auto h-5 w-5" />
        <p className="text-foreground text-xs font-semibold">
          No pre-set future slots
        </p>
        <p className="text-muted-foreground text-[11px]">
          This technician accepts bookings based on consultation. Select your
          preferred date below.
        </p>
      </div>
    );
  }

  const activeDateSlots = groupedSlots[selectedDate] || [];

  return (
    <div className="space-y-3">
      {/* Date Tabs */}
      <div className="flex scrollbar-none items-center gap-1.5 overflow-x-auto pb-1">
        {dates.map((dateKey) => (
          <button
            key={dateKey}
            type="button"
            onClick={() => setActiveDate(dateKey)}
            className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium whitespace-nowrap transition-all ${
              selectedDate === dateKey
                ? 'border-primary bg-primary/10 text-primary ring-primary/30 font-semibold ring-1'
                : 'border-border bg-card text-muted-foreground hover:bg-muted'
            }`}
          >
            <CalendarIcon className="h-3 w-3" />
            <span>{dateKey}</span>
          </button>
        ))}
      </div>

      {/* Slots Grid */}
      <div className="grid max-h-48 grid-cols-2 gap-2 overflow-y-auto pr-1">
        {activeDateSlots.map((slot) => {
          const isSelected = selectedSlotId === slot.id;
          const isBooked = slot.isBooked;

          return (
            <button
              key={slot.id}
              type="button"
              disabled={isBooked}
              onClick={() => onSelectSlot(slot)}
              className={`flex items-center justify-between rounded-lg border p-2.5 text-left text-xs transition-all ${
                isBooked
                  ? 'border-border bg-muted/50 text-muted-foreground/60 cursor-not-allowed line-through'
                  : isSelected
                    ? 'border-primary bg-primary text-primary-foreground ring-primary/20 font-semibold shadow-sm ring-2'
                    : 'border-border bg-card text-foreground hover:bg-muted/40 hover:border-primary/40'
              }`}
            >
              <span className="truncate">
                {formatTimeRange(slot.startTime, slot.endTime)}
              </span>
              {isSelected ? (
                <CheckCircle2 className="ml-1 h-3.5 w-3.5 shrink-0 text-white" />
              ) : isBooked ? (
                <Badge
                  variant="outline"
                  className="border-muted-foreground/30 text-muted-foreground/70 h-4 px-1 py-0 text-[9px]"
                >
                  Booked
                </Badge>
              ) : (
                <Badge variant="secondary" className="h-4 px-1 py-0 text-[9px]">
                  Open
                </Badge>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="text-muted-foreground flex items-center justify-between border-t pt-2 text-[10px]">
        <div className="flex items-center gap-1">
          <span className="bg-primary inline-block h-2 w-2 rounded-full" />
          <span>Selected</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="bg-muted-foreground/40 inline-block h-2 w-2 rounded-full" />
          <span>Booked / Reserved</span>
        </div>
      </div>
    </div>
  );
}
