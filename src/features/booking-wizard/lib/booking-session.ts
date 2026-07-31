const STORAGE_KEY = 'barberly.booking.draft';

export interface BookingDraft {
  serviceIds: number[];
  totalDurationMinutes: number;
  selectedStaffId: number | null;
  anyStaff: boolean;
  date: string;
  selectedSlot: { startAtUtc: string; staffId: number } | null;
  booking: {
    id: number;
    status: string;
    totalPrice: number;
    depositAmount?: number;
    balanceDue?: number;
    remainingBalance?: number;
    startAtUtc: string;
    lockExpiresAt?: string | null;
    endAtUtc?: string;
    services?: Array<{
      serviceId: number;
      serviceName: string;
      durationMinutes: number;
      price: number;
    }>;
  } | null;
  phone: string;
  payment: {
    paymentId: number;
    invoiceId: string;
    amount: number;
    qrText: string;
    qrImage: string | null;
    urls: Array<{ name: string; link: string; description: string }>;
  } | null;
}

const emptyDraft = (): BookingDraft => ({
  serviceIds: [],
  totalDurationMinutes: 0,
  selectedStaffId: null,
  anyStaff: false,
  date: '',
  selectedSlot: null,
  booking: null,
  phone: '',
  payment: null,
});

export function readBookingDraft(): BookingDraft {
  if (typeof window === 'undefined') return emptyDraft();
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyDraft();
    return { ...emptyDraft(), ...JSON.parse(raw) } as BookingDraft;
  } catch {
    return emptyDraft();
  }
}

export function writeBookingDraft(patch: Partial<BookingDraft>): BookingDraft {
  const next = { ...readBookingDraft(), ...patch };
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function clearBookingDraft(): void {
  sessionStorage.removeItem(STORAGE_KEY);
}
