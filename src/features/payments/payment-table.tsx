'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CreditCard, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { Payment } from '@/types/domain';

export function PaymentTable({ payments }: { payments: Payment[] }) {
  const getStatusBadge = (status: Payment['status']) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <Badge className="gap-1 border-emerald-500/20 bg-emerald-500/10 text-[11px] text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="h-3 w-3" /> Paid
          </Badge>
        );
      case 'PENDING':
        return (
          <Badge className="gap-1 border-amber-500/20 bg-amber-500/10 text-[11px] text-amber-700 dark:text-amber-400">
            <Clock className="h-3 w-3" /> Pending
          </Badge>
        );
      case 'FAILED':
        return (
          <Badge className="gap-1 border-rose-500/20 bg-rose-500/10 text-[11px] text-rose-700 dark:text-rose-400">
            <AlertCircle className="h-3 w-3" /> Failed
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });
    } catch {
      return 'N/A';
    }
  };

  return (
    <div className="bg-card overflow-hidden rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30">
            <TableHead className="text-xs font-semibold">
              Transaction ID
            </TableHead>
            <TableHead className="text-xs font-semibold">
              Booking / Service
            </TableHead>
            <TableHead className="text-xs font-semibold">Gateway</TableHead>
            <TableHead className="text-xs font-semibold">Amount</TableHead>
            <TableHead className="text-xs font-semibold">Date</TableHead>
            <TableHead className="text-right text-xs font-semibold">
              Status
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map((p) => {
            const amount =
              typeof p.amount === 'number'
                ? p.amount
                : parseFloat(String(p.amount)) || 0;

            return (
              <TableRow key={p.id} className="hover:bg-muted/20">
                <TableCell className="text-muted-foreground max-w-[140px] truncate font-mono text-xs">
                  {p.transactionId || p.id}
                </TableCell>

                <TableCell className="text-foreground text-xs font-medium">
                  {p.booking?.service?.title ||
                    `Booking #${p.bookingId.slice(0, 8)}`}
                </TableCell>

                <TableCell className="text-xs">
                  <span className="inline-flex items-center gap-1 font-semibold text-purple-600 dark:text-purple-400">
                    <CreditCard className="h-3 w-3" />
                    {p.provider || 'Stripe'}
                  </span>
                </TableCell>

                <TableCell className="text-foreground text-xs font-bold">
                  ৳{amount.toLocaleString()} {p.currency || 'BDT'}
                </TableCell>

                <TableCell className="text-muted-foreground text-xs">
                  {formatDate(p.paidAt || p.createdAt)}
                </TableCell>

                <TableCell className="text-right">
                  {getStatusBadge(p.status)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
