export interface TenantSettings {
  logoUrl: string | null;
  bannerUrl: string | null;
  phone: string | null;
  address: string | null;
}

export interface TenantPolicies {
  slotLockMinutes: number;
  cancelHoursBefore: number;
  rescheduleHoursBefore: number;
  commissionPercent: number;
}

export interface Tenant {
  id: number;
  subdomain: string;
  name: string;
  timezone: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  settings: TenantSettings;
  policies: TenantPolicies;
}

export interface CreateTenantInput {
  subdomain: string;
  name: string;
  timezone?: string;
  isActive?: boolean;
  phone?: string;
  address?: string;
}

export interface UpdateTenantInput {
  name?: string;
  timezone?: string;
  isActive?: boolean;
  phone?: string | null;
  address?: string | null;
  slotLockMinutes?: number;
  cancelHoursBefore?: number;
  rescheduleHoursBefore?: number;
  commissionPercent?: number;
}
