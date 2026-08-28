import { cache } from 'react';
import { fetchInternal, parseInternalJson } from '@/shared/lib/internal-api';
import { tenantSiteUrlForHost } from '@/shared/lib/tenant-url';
import type { PublicShopCard, PublicDirectoryItem } from '../types/public-shop';
import { loadTenantMarketingContext } from './marketing-page-data';
import {
  extractDirectoryList,
  selectShowcaseShops,
  toDirectoryItem,
} from './shop-directory-normalize';

const DIRECTORY_PATHS = ['/public/platform/tenants', '/public/tenants'] as const;
const HYDRATE_BATCH = 4;

async function tryLoadDirectory(path: string): Promise<unknown | null> {
  try {
    const response = await fetchInternal(path);
    if (!response.ok) return null;
    const body = await parseInternalJson<unknown>(response);
    return body.data;
  } catch {
    return null;
  }
}

async function mapInBatches<T, R>(
  items: T[],
  size: number,
  mapper: (item: T) => Promise<R>,
): Promise<R[]> {
  const output: R[] = [];
  for (let index = 0; index < items.length; index += size) {
    const batch = items.slice(index, index + size);
    output.push(...(await Promise.all(batch.map(mapper))));
  }
  return output;
}

function hasVisuals(item: PublicDirectoryItem): boolean {
  return Boolean(
    item.bannerUrl ||
      item.logoUrl ||
      item.settings?.bannerUrl ||
      item.settings?.logoUrl,
  );
}

function toCard(
  item: PublicDirectoryItem,
  host: string,
  extras?: Partial<PublicShopCard>,
): PublicShopCard {
  const settings = item.settings;
  const landing = settings?.landingContent;
  return {
    subdomain: item.subdomain,
    name: extras?.name ?? item.name ?? item.subdomain,
    address: extras?.address ?? item.address ?? settings?.address ?? null,
    brandColor:
      extras?.brandColor ?? item.brandColor ?? settings?.brandColor ?? null,
    logoUrl: extras?.logoUrl ?? item.logoUrl ?? settings?.logoUrl ?? null,
    bannerUrl:
      extras?.bannerUrl ?? item.bannerUrl ?? settings?.bannerUrl ?? null,
    heroTagline: extras?.heroTagline ?? landing?.heroTagline ?? null,
    heroSubtitle: extras?.heroSubtitle ?? landing?.heroSubtitle ?? null,
    href: tenantSiteUrlForHost(host, item.subdomain),
  };
}

async function hydrateShop(
  item: PublicDirectoryItem,
  host: string,
): Promise<PublicShopCard> {
  if (hasVisuals(item) && item.name) {
    return toCard(item, host);
  }
  try {
    const context = await loadTenantMarketingContext(item.subdomain);
    return toCard(item, host, {
      name: context.name || item.name || item.subdomain,
      address: context.settings?.address ?? item.address ?? null,
      brandColor: context.settings?.brandColor ?? item.brandColor ?? null,
      logoUrl: context.settings?.logoUrl ?? item.logoUrl ?? null,
      bannerUrl: context.settings?.bannerUrl ?? item.bannerUrl ?? null,
      heroTagline: context.settings?.landingContent?.heroTagline ?? null,
      heroSubtitle: context.settings?.landingContent?.heroSubtitle ?? null,
    });
  } catch {
    return toCard(item, host);
  }
}

export const loadPublicShopDirectory = cache(
  async (host: string): Promise<PublicShopCard[]> => {
    let raw: unknown = null;
    for (const path of DIRECTORY_PATHS) {
      raw = await tryLoadDirectory(path);
      if (raw) break;
    }
    const items = selectShowcaseShops(
      extractDirectoryList(raw).map(toDirectoryItem).filter(
        (item): item is PublicDirectoryItem => item !== null,
      ),
    );
    return mapInBatches(items, HYDRATE_BATCH, (item) => hydrateShop(item, host));
  },
);

export const loadPublicShopSitemapEntries = cache(
  async (): Promise<Array<{ subdomain: string }>> => {
    let raw: unknown = null;
    for (const path of DIRECTORY_PATHS) {
      raw = await tryLoadDirectory(path);
      if (raw) break;
    }
    return selectShowcaseShops(
      extractDirectoryList(raw)
        .map(toDirectoryItem)
        .filter((item): item is PublicDirectoryItem => item !== null),
    ).map((item) => ({ subdomain: item.subdomain }));
  },
);
