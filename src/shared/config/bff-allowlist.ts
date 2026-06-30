export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

type RoutePattern = {
  pattern: RegExp;
  methods: ReadonlySet<HttpMethod>;
};

/** Static BFF routes derived from API_ENDPOINTS — single catalog for client + server. */
const ROUTE_DEFINITIONS: Array<{ path: string; methods: HttpMethod[] }> = [
  { path: '/users', methods: ['GET', 'POST'] },
  { path: '/users/:id', methods: ['GET', 'PATCH', 'DELETE'] },
  { path: '/roles', methods: ['GET', 'POST'] },
  { path: '/roles/:id', methods: ['GET', 'PATCH', 'DELETE'] },
  { path: '/roles/assign', methods: ['POST'] },
  { path: '/roles/assign/:userId/:roleId', methods: ['DELETE'] },
  { path: '/permissions', methods: ['GET', 'POST'] },
  { path: '/permissions/:id', methods: ['GET', 'PATCH', 'DELETE'] },
  { path: '/admin/media/upload', methods: ['POST'] },
  { path: '/admin/dashboard/stats', methods: ['GET'] },
  { path: '/admin/dashboard/platform-finance', methods: ['GET'] },
  { path: '/admin/audit-logs', methods: ['GET'] },
  { path: '/admin/tenants', methods: ['GET', 'POST'] },
  { path: '/admin/tenants/:id', methods: ['GET', 'PATCH', 'DELETE'] },
  { path: '/users/:id/export', methods: ['GET'] },
  { path: '/users/:id/anonymize', methods: ['POST'] },
  { path: '/auth/mfa/enroll', methods: ['POST'] },
  { path: '/auth/mfa/enroll/confirm', methods: ['POST'] },
  { path: '/auth/mfa/disable', methods: ['POST'] },
  { path: '/auth/oauth/authorize', methods: ['GET'] },
  { path: '/admin/services', methods: ['GET', 'POST'] },
  { path: '/admin/services/:id', methods: ['GET', 'PATCH', 'DELETE'] },
  { path: '/admin/staff', methods: ['GET', 'POST'] },
  { path: '/admin/staff/:id', methods: ['GET', 'PATCH', 'DELETE'] },
  { path: '/admin/bookings', methods: ['GET'] },
  { path: '/admin/bookings/manual', methods: ['POST'] },
  { path: '/admin/bookings/:id/complete', methods: ['PATCH'] },
  { path: '/admin/bookings/:id/cancel', methods: ['PATCH'] },
  { path: '/admin/bookings/:id/no-show', methods: ['PATCH'] },
  { path: '/admin/bookings/:id/confirm', methods: ['PATCH'] },
  { path: '/admin/wallet', methods: ['GET'] },
  { path: '/admin/wallet/transactions', methods: ['GET'] },
  { path: '/admin/wallet/withdraw', methods: ['POST'] },
];

function pathToPattern(path: string): RegExp {
  const escaped = path
    .split('/')
    .map((segment) => {
      if (segment.startsWith(':')) {
        return '[^/]+';
      }
      return segment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    })
    .join('/');
  return new RegExp(`^${escaped}$`);
}

const ALLOWED_ROUTE_PATTERNS: RoutePattern[] = ROUTE_DEFINITIONS.map(
  ({ path, methods }) => ({
    pattern: pathToPattern(path),
    methods: new Set(methods),
  }),
);

const PATH_TRAVERSAL = /(\.\.|%2e%2e|%2E%2E|\\)/i;

export function normalizeBffPath(segments: string[]): string {
  const decoded = segments.map((s) => {
    try {
      return decodeURIComponent(s);
    } catch {
      return s;
    }
  });

  if (decoded.some((s) => PATH_TRAVERSAL.test(s))) {
    throw new BffPathError('Path traversal is not allowed');
  }

  return `/${decoded.join('/')}`;
}

export class BffPathError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BffPathError';
  }
}

export function isBffPathAllowed(path: string, method: string): boolean {
  const httpMethod = method.toUpperCase() as HttpMethod;
  return ALLOWED_ROUTE_PATTERNS.some(
    ({ pattern, methods }) => pattern.test(path) && methods.has(httpMethod),
  );
}

export { ALLOWED_ROUTE_PATTERNS, ROUTE_DEFINITIONS };
