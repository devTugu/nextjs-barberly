/** Host-based tenant vs platform scope resolution. */

export { isPlatformOnlyPath } from '@/shared/config/platform-protected-paths';

export const PLATFORM_SUBDOMAIN = 'platform';
export const DEFAULT_TENANT_SUBDOMAIN = 'demo';

const ROOT_DOMAIN =
  process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'barberly.mn';

export type HostScope = 'platform' | 'tenant' | 'local';

export interface HostContext {
  scope: HostScope;
  subdomain: string | null;
  hostname: string;
}

function stripPort(host: string): string {
  return host.split(':')[0] ?? host;
}

function parseSubdomain(hostname: string): string | null {
  const host = stripPort(hostname).toLowerCase();

  if (host === 'localhost' || host.endsWith('.localhost')) {
    const parts = host.split('.');
    if (parts.length >= 2 && parts[0] !== 'localhost') {
      return parts[0] ?? null;
    }
    return null;
  }

  const root = ROOT_DOMAIN.toLowerCase();
  if (host === root || host === `www.${root}`) {
    return null;
  }

  if (host.endsWith(`.${root}`)) {
    const label = host.slice(0, -(root.length + 1));
    const subdomain = label.split('.').pop();
    return subdomain && subdomain.length > 0 ? subdomain : null;
  }

  return null;
}

export function resolveHostContext(hostname: string): HostContext {
  const host = stripPort(hostname).toLowerCase();
  const subdomain = parseSubdomain(host);

  if (subdomain === PLATFORM_SUBDOMAIN) {
    return { scope: 'platform', subdomain: null, hostname: host };
  }

  if (subdomain) {
    return { scope: 'tenant', subdomain, hostname: host };
  }

  if (host === 'localhost' || host.endsWith('.localhost')) {
    return { scope: 'local', subdomain: null, hostname: host };
  }

  return { scope: 'local', subdomain: null, hostname: host };
}

export function resolveTenantSubdomain(
  hostname: string,
  queryTenant?: string | null,
): string {
  const ctx = resolveHostContext(hostname);
  if (ctx.subdomain && ctx.subdomain !== PLATFORM_SUBDOMAIN) {
    return ctx.subdomain;
  }
  if (queryTenant && queryTenant.length > 0) {
    return queryTenant;
  }
  return DEFAULT_TENANT_SUBDOMAIN;
}

const TENANT_ONLY_PREFIXES = ['/book', '/user', '/admin'] as const;

export function isTenantOnlyPath(pathname: string): boolean {
  return TENANT_ONLY_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}
