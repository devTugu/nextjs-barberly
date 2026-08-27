import type { PublicDirectoryItem } from '../types/public-shop';

const LIST_KEYS = ['items', 'bookableItems', 'tenants', 'shops', 'data'] as const;

function asRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

function asString(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0
    ? value.trim()
    : null;
}

export function extractDirectoryList(raw: unknown): unknown[] {
  if (Array.isArray(raw)) return raw;
  const record = asRecord(raw);
  if (!record) return [];
  for (const key of LIST_KEYS) {
    const value = record[key];
    if (Array.isArray(value)) return value;
  }
  return [];
}

export function toDirectoryItem(raw: unknown): PublicDirectoryItem | null {
  const record = asRecord(raw);
  if (!record) return null;
  const subdomain = asString(record.subdomain) ?? asString(record.slug);
  if (!subdomain) return null;
  return {
    subdomain,
    name: asString(record.name) ?? undefined,
    address: asString(record.address),
    brandColor: asString(record.brandColor),
    logoUrl: asString(record.logoUrl),
    bannerUrl: asString(record.bannerUrl),
    parentTenantId:
      typeof record.parentTenantId === 'number' ? record.parentTenantId : null,
    isActive: typeof record.isActive === 'boolean' ? record.isActive : undefined,
    settings: asRecord(record.settings) as PublicDirectoryItem['settings'],
  };
}

export function selectShowcaseShops(
  items: PublicDirectoryItem[],
  limit = 24,
): PublicDirectoryItem[] {
  const active = items.filter((item) => item.isActive !== false);
  const unique = new Map<string, PublicDirectoryItem>();
  for (const item of active) {
    if (!unique.has(item.subdomain)) unique.set(item.subdomain, item);
  }
  const list = [...unique.values()];
  const roots = list.filter((item) => item.parentTenantId == null);
  return (roots.length > 0 ? roots : list).slice(0, limit);
}
