import { BookingStatus, STATUS_COLORS } from '@/lib/constants';

export function StatusBadge({ status }: { status: BookingStatus }) {
  const config = STATUS_COLORS[status] || {
    bg: 'bg-muted',
    text: 'text-muted-foreground',
    border: 'border-border',
    label: status,
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${config.bg} ${config.text} ${config.border}`}
    >
      <span className="inline-block h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      <span>{config.label}</span>
    </span>
  );
}
