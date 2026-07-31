import { ROUTES } from '@/shared/config/routes';

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'barberly.mn';

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
