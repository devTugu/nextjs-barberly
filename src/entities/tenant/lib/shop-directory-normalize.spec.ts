import { describe, expect, it } from 'vitest';
import {
  extractDirectoryList,
  selectShowcaseShops,
  toDirectoryItem,
} from './shop-directory-normalize';

describe('shop directory normalize', () => {
  it('reads items from several envelope shapes', () => {
    expect(extractDirectoryList([{ subdomain: 'a' }])).toHaveLength(1);
    expect(
      extractDirectoryList({ items: [{ subdomain: 'a' }, { subdomain: 'b' }] }),
    ).toHaveLength(2);
    expect(extractDirectoryList({ tenants: [{ subdomain: 'c' }] })).toHaveLength(
      1,
    );
    expect(extractDirectoryList(null)).toEqual([]);
  });

  it('requires a subdomain and keeps brand settings', () => {
    expect(toDirectoryItem({ name: 'No slug' })).toBeNull();
    expect(
      toDirectoryItem({
        subdomain: 'atelier',
        name: 'Atelier',
        parentTenantId: null,
        settings: { logoUrl: 'https://cdn.example/logo.png' },
      }),
    ).toMatchObject({
      subdomain: 'atelier',
      name: 'Atelier',
      settings: { logoUrl: 'https://cdn.example/logo.png' },
    });
  });

  it('prefers brand roots and drops inactive or duplicate shops', () => {
    const selected = selectShowcaseShops([
      { subdomain: 'brand', name: 'Brand', parentTenantId: null },
      { subdomain: 'brand', name: 'Dup' },
      { subdomain: 'branch', name: 'Branch', parentTenantId: 1 },
      { subdomain: 'closed', isActive: false },
    ]);
    expect(selected.map((item) => item.subdomain)).toEqual(['brand']);
  });

  it('falls back to all unique shops when no brand roots exist', () => {
    const selected = selectShowcaseShops([
      { subdomain: 'a', parentTenantId: 2 },
      { subdomain: 'b', parentTenantId: 2 },
    ]);
    expect(selected.map((item) => item.subdomain)).toEqual(['a', 'b']);
  });
});
