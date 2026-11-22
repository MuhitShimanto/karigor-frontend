import { BookingStatus } from '@/lib/constants';

export interface BookingAllowedActions {
  pay: boolean;
  cancel: boolean;
  review: boolean;
  accept?: boolean;
  decline?: boolean;
  start?: boolean;
  complete?: boolean;
}

/**
 * Single source of truth for booking actions per role and status.
 * Derived from Section 5 & 18.4 of Karigor SRS.
 */
export function bookingActions(
  status: BookingStatus,
  role: 'CUSTOMER' | 'TECHNICIAN' | 'ADMIN' = 'CUSTOMER'
): BookingAllowedActions {
  if (role === 'TECHNICIAN') {
    return {
      accept: status === 'REQUESTED',
      decline: status === 'REQUESTED',
      start: status === 'PAID',
      complete: status === 'IN_PROGRESS',
      pay: false,
      cancel: false,
      review: false,
    };
  }

  if (role === 'ADMIN') {
    return {
      pay: false,
      cancel: ['REQUESTED', 'ACCEPTED'].includes(status),
      review: false,
    };
  }

  // Customer actions
  return {
    pay: status === 'ACCEPTED',
    cancel: ['REQUESTED', 'ACCEPTED'].includes(status),
    review: status === 'COMPLETED',
  };
}
