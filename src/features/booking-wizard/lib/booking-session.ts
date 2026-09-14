const STORAGE_KEY = 'barberly.booking.draft';

export interface BookingDraftBooking {
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
}

/** Ephemeral QPay payload — React state only, never sessionStorage. */
export interface BookingPaymentSession {
  paymentId: number;
  invoiceId: string;
  amount: number;
  qrText: string;
  qrImage: string | null;
  urls: Array<{ name: string; link: string; description: string }>;
}

export interface BookingDraft {
  serviceIds: number[];
  totalDurationMinutes: number;
  selectedStaffId: number | null;
  anyStaff: boolean;
  date: string;
  selectedSlot: { startAtUtc: string; staffId: number } | null;
  booking: BookingDraftBooking | null;
  phone: string;
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
});

/** Strip legacy payment/QR fields that must not live in sessionStorage. */
export function sanitizeBookingDraft(raw: unknown): BookingDraft {
  if (!raw || typeof raw !== 'object') return emptyDraft();
  const source = raw as Record<string, unknown>;
  const base = emptyDraft();
  return {
    ...base,
    serviceIds: Array.isArray(source.serviceIds)
      ? source.serviceIds.filter((id): id is number => typeof id === 'number')
      : base.serviceIds,
    totalDurationMinutes:
      typeof source.totalDurationMinutes === 'number'
        ? source.totalDurationMinutes
        : base.totalDurationMinutes,
    selectedStaffId:
      typeof source.selectedStaffId === 'number' ? source.selectedStaffId : null,
    anyStaff: Boolean(source.anyStaff),
    date: typeof source.date === 'string' ? source.date : '',
    selectedSlot:
      source.selectedSlot &&
      typeof source.selectedSlot === 'object' &&
      typeof (source.selectedSlot as { startAtUtc?: unknown }).startAtUtc ===
        'string' &&
      typeof (source.selectedSlot as { staffId?: unknown }).staffId === 'number'
        ? (source.selectedSlot as BookingDraft['selectedSlot'])
        : null,
    booking:
      source.booking && typeof source.booking === 'object'
        ? (source.booking as BookingDraftBooking)
        : null,
    phone: typeof source.phone === 'string' ? source.phone : '',
  };
}

function canUseSessionStorage(): boolean {
  try {
    return typeof sessionStorage !== 'undefined';
  } catch {
    return false;
  }
}

export function readBookingDraft(): BookingDraft {
  if (!canUseSessionStorage()) return emptyDraft();
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyDraft();
    return sanitizeBookingDraft(JSON.parse(raw));
  } catch {
    return emptyDraft();
  }
}

export function writeBookingDraft(patch: Partial<BookingDraft>): BookingDraft {
  const next = sanitizeBookingDraft({ ...readBookingDraft(), ...patch });
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function clearBookingDraft(): void {
  sessionStorage.removeItem(STORAGE_KEY);
}
