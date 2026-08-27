import { describe, expect, it } from 'vitest';
import {
  formatBookingDateTime,
  formatMnt,
  formatSlotTime,
  getInitials,
  serviceLabel,
  staffRatingPlaceholder,
} from './booking-format';

describe('booking-format', () => {
  it('builds initials from one or two names', () => {
    expect(getInitials('Amina')).toBe('AM');
    expect(getInitials('Amina Erdene')).toBe('AE');
    expect(getInitials('   ')).toBe('?');
  });

  it('joins service labels', () => {
    expect(serviceLabel([{ serviceName: 'Cut' }, { serviceName: 'Wash' }])).toBe(
      'Cut, Wash',
    );
    expect(serviceLabel([])).toBe('');
    expect(serviceLabel(undefined)).toBe('');
  });

  it('derives a stable staff rating placeholder', () => {
    expect(staffRatingPlaceholder(1)).toBe('4.6');
    expect(staffRatingPlaceholder(5)).toBe('4.5');
  });

  it('formats MNT without fraction digits', () => {
    expect(formatMnt(15000, 'en-US')).toContain('15,000');
  });

  it('formats slot and booking times in UTC', () => {
    const utc = '2026-01-15T09:30:00.000Z';
    expect(formatSlotTime(utc, 'en-GB', 'UTC')).toMatch(/09:30/);
    expect(formatBookingDateTime(utc, 'en-US', 'UTC')).toMatch(/9:30|09:30/);
  });
});
