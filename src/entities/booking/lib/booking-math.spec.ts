import { describe, expect, it } from 'vitest';
import {
  bookingServicesDuration,
  sumServiceDuration,
  sumServicePrice,
} from './booking-math';

const services = [
  { id: 1, durationMinutes: 30, price: 10000 },
  { id: 2, durationMinutes: 45, price: 15000 },
];

describe('booking-math', () => {
  it('sums duration for selected services', () => {
    expect(sumServiceDuration(services, [1, 2])).toBe(75);
    expect(sumServiceDuration(services, [2])).toBe(45);
  });

  it('sums price for selected services', () => {
    expect(sumServicePrice(services, [1, 2])).toBe(25000);
  });

  it('sums booking service line durations', () => {
    expect(
      bookingServicesDuration([
        { durationMinutes: 30 },
        { durationMinutes: 20 },
      ]),
    ).toBe(50);
  });
});
