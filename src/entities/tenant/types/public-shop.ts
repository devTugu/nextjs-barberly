import type { TenantLandingContent } from './landing-content';

export interface PublicShopSettings {
  logoUrl?: string | null;
  bannerUrl?: string | null;
  phone?: string | null;
  address?: string | null;
  brandColor?: string | null;
  landingContent?: TenantLandingContent | null;
}

export interface PublicShopCard {
  subdomain: string;
  name: string;
  address: string | null;
  brandColor: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  heroTagline: string | null;
  heroSubtitle: string | null;
  href: string;
}

export interface PublicDirectoryItem {
  subdomain: string;
  name?: string;
  address?: string | null;
  brandColor?: string | null;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  parentTenantId?: number | null;
  isActive?: boolean;
  settings?: PublicShopSettings;
}
