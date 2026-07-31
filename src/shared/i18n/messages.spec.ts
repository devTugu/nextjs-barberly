import { describe, expect, it } from 'vitest';
import en from './messages/en.json';
import mn from './messages/mn.json';
import { getPageTitle, getStepHeadings } from './messages';

function collectKeyPaths(
  value: unknown,
  prefix = '',
): string[] {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return prefix ? [prefix] : [];
  }

  return Object.entries(value).flatMap(([key, nested]) => {
    const nextPrefix = prefix ? `${prefix}.${key}` : key;
    if (nested !== null && typeof nested === 'object' && !Array.isArray(nested)) {
      return collectKeyPaths(nested, nextPrefix);
    }
    return [nextPrefix];
  });
}

function diffCatalogKeys(left: string[], right: string[]) {
  const rightSet = new Set(right);
  const leftSet = new Set(left);

  return {
    onlyInLeft: left.filter((key) => !rightSet.has(key)).sort(),
    onlyInRight: right.filter((key) => !leftSet.has(key)).sort(),
  };
}

describe('getStepHeadings', () => {
  it('returns localized MFA enrollment heading in Mongolian', () => {
    const headings = getStepHeadings('mn');
    expect(headings['mfa-enroll'].title).toBe('MFA тохируулах');
  });
});

describe('getPageTitle', () => {
  it('returns Mongolian nav title for dashboard route', () => {
    expect(getPageTitle('/dashboard', 'mn')).toBe('Тойм');
  });

  it('uses Mongolian as the default locale', async () => {
    const { defaultLocale } = await import('./config');
    expect(defaultLocale).toBe('mn');
  });
});

describe('message catalogs', () => {
  it('keeps en and mn key structures in sync', () => {
    const enKeys = collectKeyPaths(en).sort();
    const mnKeys = collectKeyPaths(mn).sort();
    const { onlyInLeft: onlyInEn, onlyInRight: onlyInMn } = diffCatalogKeys(
      enKeys,
      mnKeys,
    );

    expect(
      { missingFromMn: onlyInEn, missingFromEn: onlyInMn },
      [
        onlyInEn.length
          ? `Keys present in en.json but missing from mn.json:\n${onlyInEn.join('\n')}`
          : null,
        onlyInMn.length
          ? `Keys present in mn.json but missing from en.json:\n${onlyInMn.join('\n')}`
          : null,
      ]
        .filter(Boolean)
        .join('\n\n'),
    ).toEqual({ missingFromMn: [], missingFromEn: [] });
  });
});
