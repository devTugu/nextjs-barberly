export interface TenantSettings {
  logoUrl: string | null;
  bannerUrl: string | null;
  phone: string | null;
  address: string | null;
  brandColor: string | null;
  landingContent?: import('./landing-content').TenantLandingContent | null;
}

export interface TenantPolicies {
  slotLockMinutes: number;
  cancelHoursBefore: number;
  rescheduleHoursBefore: number;
  commissionPercent: number;
  depositPercent: number;
}

export type InheritFieldState = 'inherited' | 'override' | 'local';

export type InheritField =
  | 'logoUrl'
  | 'brandColor'
  | 'landingContent'
  | 'cancelHoursBefore'
  | 'rescheduleHoursBefore'
  | 'depositPercent';

export interface TenantInheritance {
  isChild: boolean;
  brandRootId: number | null;
  fields: Record<InheritField, InheritFieldState>;
  own: {
    logoUrl: string | null;
    brandColor: string | null;
    landingContent: import('./landing-content').TenantLandingContent | null;
    cancelHoursBefore: number | null;
    rescheduleHoursBefore: number | null;
    depositPercent: number | null;
  };
}

export interface Tenant {
  id: number;
  subdomain: string;
  name: string;
  timezone: string;
  isActive: boolean;
  parentTenantId: number | null;
  catalogSyncedAt?: string | null;
  catalogUpdatedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  settings: TenantSettings;
  policies: TenantPolicies;
  inheritance?: TenantInheritance;
}

export interface CreateTenantInput {
  subdomain: string;
  name: string;
  timezone?: string;
  isActive?: boolean;
  phone?: string;
  address?: string;
  brandColor?: string;
  ownerEmail?: string;
  commissionPercent?: number;
  parentTenantId?: number | null;
}

export interface UpdateTenantInput {
  name?: string;
  timezone?: string;
  isActive?: boolean;
  phone?: string | null;
  address?: string | null;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  brandColor?: string | null;
  landingContent?: import('./landing-content').TenantLandingContent | null;
  slotLockMinutes?: number;
  cancelHoursBefore?: number | null;
  rescheduleHoursBefore?: number | null;
  commissionPercent?: number;
  depositPercent?: number | null;
  parentTenantId?: number | null;
}
