export interface TenantLandingService {
  id: number;
  name: string;
  durationMinutes: number;
  price: number;
}

export interface TenantLandingSettings {
  logoUrl?: string | null;
  bannerUrl?: string | null;
  phone?: string | null;
  address?: string | null;
  brandColor?: string | null;
}

export interface TenantScheduleDay {
  dayOfWeek: number;
  label: string;
  closed: boolean;
  blocks: Array<{ startTime: string; endTime: string }>;
}

export interface TenantHoliday {
  localDate: string;
  name: string;
}

export interface TenantNavItem {
  href: string;
  label: string;
}
