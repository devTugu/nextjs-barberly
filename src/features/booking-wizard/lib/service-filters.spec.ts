import { describe, expect, it } from 'vitest';
import { matchesServiceQuery, serviceFilterId } from './service-filters';

describe('serviceFilterId', () => {
  it('classifies haircut and shave names', () => {
    expect(serviceFilterId('Үс засалт')).toBe('haircut');
    expect(serviceFilterId('Beard shave')).toBe('shave');
    expect(serviceFilterId('Massage')).toBe('other');
  });
});

describe('matchesServiceQuery', () => {
  it('filters by search and category', () => {
    expect(matchesServiceQuery('Haircut', 'hair', 'all')).toBe(true);
    expect(matchesServiceQuery('Haircut', 'shave', 'all')).toBe(false);
    expect(matchesServiceQuery('Haircut', '', 'shave')).toBe(false);
    expect(matchesServiceQuery('Хусуулах', '', 'shave')).toBe(true);
  });
});
