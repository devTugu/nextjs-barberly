import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/entities/booking', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/entities/booking')>();
  return {
    ...actual,
    fetchAvailableSlots: vi.fn(),
    lockBookingSlot: vi.fn(),
  };
});

vi.mock('@/entities/customer', () => ({
  fetchCustomerSession: vi.fn(),
  attachCustomerBooking: vi.fn(),
}));

import {
  fetchAvailableSlots,
  lockBookingSlot,
} from '@/entities/booking';
import {
  attachCustomerBooking,
  fetchCustomerSession,
} from '@/entities/customer';
import {
  loadAvailableSlotsUseCase,
  lockSlotAndRouteUseCase,
} from './lock-slot-use-case';

describe('lock-slot-use-case', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads and maps available slots', async () => {
    vi.mocked(fetchAvailableSlots).mockResolvedValueOnce({
      timezone: 'Asia/Ulaanbaatar',
      staffId: 7,
      slots: [{ startUtc: '2026-01-01T01:00:00.000Z' }],
    });

    const result = await loadAvailableSlotsUseCase({
      tenant: 'demo',
      date: '2026-01-01',
      durationMinutes: 30,
      serviceIds: [1],
      anyStaff: false,
      selectedStaffId: 7,
    });

    expect(result.timezone).toBe('Asia/Ulaanbaatar');
    expect(result.slots).toEqual([
      { startAtUtc: '2026-01-01T01:00:00.000Z', staffId: 7 },
    ]);
  });

  it('locks slot and routes authenticated customers to pay', async () => {
    vi.mocked(lockBookingSlot).mockResolvedValueOnce({
      id: 42,
      status: 'locked',
      totalPrice: 10000,
      startAtUtc: '2026-01-01T01:00:00.000Z',
      customerId: null,
    });
    vi.mocked(fetchCustomerSession).mockResolvedValueOnce({
      id: 1,
      phone: '9911',
      name: 'A',
      needsProfile: false,
    });
    vi.mocked(attachCustomerBooking).mockResolvedValueOnce(undefined);

    const result = await lockSlotAndRouteUseCase({
      tenant: 'demo',
      serviceIds: [1],
      startAtUtc: '2026-01-01T01:00:00.000Z',
      staffId: 7,
    });

    expect(attachCustomerBooking).toHaveBeenCalledWith('demo', 42);
    expect(result.route).toBe('pay');
  });

  it('routes guests without profile to otp', async () => {
    vi.mocked(lockBookingSlot).mockResolvedValueOnce({
      id: 43,
      status: 'locked',
      totalPrice: 10000,
      startAtUtc: '2026-01-01T01:00:00.000Z',
    });
    vi.mocked(fetchCustomerSession).mockResolvedValueOnce(null);

    const result = await lockSlotAndRouteUseCase({
      tenant: 'demo',
      serviceIds: [1],
      startAtUtc: '2026-01-01T01:00:00.000Z',
      staffId: 7,
    });

    expect(result.route).toBe('otp');
    expect(attachCustomerBooking).not.toHaveBeenCalled();
  });
});
