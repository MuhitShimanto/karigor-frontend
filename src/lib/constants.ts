export const BOOKING_STATUSES = {
  REQUESTED: 'REQUESTED',
  ACCEPTED: 'ACCEPTED',
  DECLINED: 'DECLINED',
  PAID: 'PAID',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;

export type BookingStatus =
  (typeof BOOKING_STATUSES)[keyof typeof BOOKING_STATUSES];

/**
 * Standard Status Colors derived from Section 5 of SRS:
 * - REQUESTED: Yellow/Orange
 * - ACCEPTED: Blue
 * - DECLINED: Red
 * - PAID: Purple
 * - IN_PROGRESS: Green
 * - COMPLETED: Gray
 * - CANCELLED: Dark Red
 */
export const STATUS_COLORS: Record<
  BookingStatus,
  { bg: string; text: string; border: string; label: string }
> = {
  REQUESTED: {
    bg: 'bg-amber-100 dark:bg-amber-950/70',
    text: 'text-amber-800 dark:text-amber-300',
    border: 'border-amber-300 dark:border-amber-800',
    label: 'Requested',
  },
  ACCEPTED: {
    bg: 'bg-blue-100 dark:bg-blue-950/70',
    text: 'text-blue-800 dark:text-blue-300',
    border: 'border-blue-300 dark:border-blue-800',
    label: 'Accepted',
  },
  DECLINED: {
    bg: 'bg-rose-100 dark:bg-rose-950/70',
    text: 'text-rose-800 dark:text-rose-300',
    border: 'border-rose-300 dark:border-rose-800',
    label: 'Declined',
  },
  PAID: {
    bg: 'bg-purple-100 dark:bg-purple-950/70',
    text: 'text-purple-800 dark:text-purple-300',
    border: 'border-purple-300 dark:border-purple-800',
    label: 'Paid',
  },
  IN_PROGRESS: {
    bg: 'bg-emerald-100 dark:bg-emerald-950/70',
    text: 'text-emerald-800 dark:text-emerald-300',
    border: 'border-emerald-300 dark:border-emerald-800',
    label: 'In Progress',
  },
  COMPLETED: {
    bg: 'bg-slate-100 dark:bg-slate-800/80',
    text: 'text-slate-800 dark:text-slate-300',
    border: 'border-slate-300 dark:border-slate-700',
    label: 'Completed',
  },
  CANCELLED: {
    bg: 'bg-red-100 dark:bg-red-950/80',
    text: 'text-red-900 dark:text-red-300',
    border: 'border-red-400 dark:border-red-900',
    label: 'Cancelled',
  },
};

export const ROUTES = {
  HOME: '/',
  SERVICES: '/services',
  TECHNICIANS: '/technicians',
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  CUSTOMER_DASHBOARD: '/dashboard/customer',
  TECHNICIAN_DASHBOARD: '/dashboard/technician',
  ADMIN_DASHBOARD: '/dashboard/admin',
  PAYMENT_SUCCESS: '/payment/success',
  PAYMENT_CANCEL: '/payment/cancel',
} as const;

export const DEFAULT_PAGE_SIZE = 10;
