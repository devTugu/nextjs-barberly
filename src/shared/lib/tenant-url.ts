import { ROUTES } from '@/shared/config/routes';

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'barberly.mn';

function stripPort(host: string): string {
  return host.split(':')[0] ?? host;
}

function hostPortSuffix(host: string): string {
  const separator = host.indexOf(':');
  return separator >= 0 ? host.slice(separator) : '';
}

function withLeadingSlash(path: string): string {
  return path.startsWith('/') ? path : `/${path}`;
}

/** Build a tenant origin from the current request host (SSR-safe). */
export function tenantSiteUrlForHost(
  host: string,
  subdomain: string,
  path = '/',
): string {
  const hostname = stripPort(host).toLowerCase();
  const pathName = withLeadingSlash(path);

  if (hostname === 'localhost' || hostname.endsWith('.localhost')) {
    return `http://${subdomain}.localhost${hostPortSuffix(host)}${pathName}`;
  }

  const root = ROOT_DOMAIN.toLowerCase();
  if (hostname === root || hostname.endsWith(`.${root}`)) {
    return `https://${subdomain}.${root}${pathName}`;
  }

  return tenantSiteUrl(subdomain, pathName);
}

export function tenantSiteUrl(subdomain: string, path = '/'): string {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host.endsWith('.localhost')) {
      const port = window.location.port ? `:${window.location.port}` : '';
      return `http://${subdomain}.localhost${port}${path}`;
    }
  }

  const appEnv = process.env.NODE_ENV ?? 'development';
  if (appEnv !== 'production') {
    return `http://${subdomain}.localhost:3000${path}`;
  }

  return `https://${subdomain}.${ROOT_DOMAIN}${path}`;
}

export function tenantCustomerUrl(subdomain: string, path = '/user/dashboard'): string {
  return tenantSiteUrl(subdomain, path);
}

export function tenantAdminUrl(subdomain: string, path: string): string {
  return tenantSiteUrl(subdomain, path);
}

export function platformSiteUrl(path: string): string {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host.endsWith('.localhost')) {
      const port = window.location.port ? `:${window.location.port}` : '';
      return `http://platform.localhost${port}${path}`;
    }
  }

  const appEnv = process.env.NODE_ENV ?? 'development';
  if (appEnv !== 'production') {
    return `http://platform.localhost:3000${path}`;
  }

  return `https://platform.${ROOT_DOMAIN}${path}`;
}

export { ROUTES };
