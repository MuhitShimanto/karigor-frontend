import { describe, it, expect } from 'vitest';
import { bookingActions } from '@/features/bookings/actions';

describe('bookingActions helper', () => {
  describe('Customer Role', () => {
    it('allows cancellation but not payment or review when status is REQUESTED', () => {
      const actions = bookingActions('REQUESTED', 'CUSTOMER');
      expect(actions.cancel).toBe(true);
      expect(actions.pay).toBe(false);
      expect(actions.review).toBe(false);
    });

    it('allows payment and cancellation when status is ACCEPTED', () => {
      const actions = bookingActions('ACCEPTED', 'CUSTOMER');
      expect(actions.cancel).toBe(true);
      expect(actions.pay).toBe(true);
      expect(actions.review).toBe(false);
    });

    it('disallows cancellation and payment once PAID', () => {
      const actions = bookingActions('PAID', 'CUSTOMER');
      expect(actions.cancel).toBe(false);
      expect(actions.pay).toBe(false);
      expect(actions.review).toBe(false);
    });

    it('disallows cancellation and payment when IN_PROGRESS', () => {
      const actions = bookingActions('IN_PROGRESS', 'CUSTOMER');
      expect(actions.cancel).toBe(false);
      expect(actions.pay).toBe(false);
      expect(actions.review).toBe(false);
    });

    it('allows leaving a review only when COMPLETED', () => {
      const actions = bookingActions('COMPLETED', 'CUSTOMER');
      expect(actions.cancel).toBe(false);
      expect(actions.pay).toBe(false);
      expect(actions.review).toBe(true);
    });

    it('disallows all active actions when CANCELLED or DECLINED', () => {
      const cancelled = bookingActions('CANCELLED', 'CUSTOMER');
      expect(cancelled.cancel).toBe(false);
      expect(cancelled.pay).toBe(false);
      expect(cancelled.review).toBe(false);

      const declined = bookingActions('DECLINED', 'CUSTOMER');
      expect(declined.cancel).toBe(false);
      expect(declined.pay).toBe(false);
      expect(declined.review).toBe(false);
    });
  });

  describe('Technician Role', () => {
    it('allows accept and decline when REQUESTED', () => {
      const actions = bookingActions('REQUESTED', 'TECHNICIAN');
      expect(actions.accept).toBe(true);
      expect(actions.decline).toBe(true);
      expect(actions.start).toBe(false);
      expect(actions.complete).toBe(false);
    });

    it('allows starting job when PAID', () => {
      const actions = bookingActions('PAID', 'TECHNICIAN');
      expect(actions.start).toBe(true);
      expect(actions.complete).toBe(false);
      expect(actions.accept).toBe(false);
    });

    it('allows completing job when IN_PROGRESS', () => {
      const actions = bookingActions('IN_PROGRESS', 'TECHNICIAN');
      expect(actions.complete).toBe(true);
      expect(actions.start).toBe(false);
    });
  });
});
