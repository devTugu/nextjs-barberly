export type ServiceFilterId = 'all' | 'haircut' | 'shave' | 'other';

const HAIRCUT = /үс|засалт|hair|cut|fade/i;
const SHAVE = /хус|сахал|shave|beard/i;

export function serviceFilterId(name: string): Exclude<ServiceFilterId, 'all'> {
  if (HAIRCUT.test(name)) return 'haircut';
  if (SHAVE.test(name)) return 'shave';
  return 'other';
}

export function matchesServiceQuery(
  name: string,
  query: string,
  filter: ServiceFilterId,
): boolean {
  const haystack = name.toLowerCase();
  if (query && !haystack.includes(query.trim().toLowerCase())) return false;
  if (filter === 'all') return true;
  return serviceFilterId(name) === filter;
}
