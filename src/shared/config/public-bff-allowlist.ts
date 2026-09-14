import {
  isQpaySimulateAllowed,
  QPAY_SIMULATE_PUBLIC_PATH,
} from './qpay-simulate';

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

/** Static public BFF routes. QPay simulate is intentionally omitted — gated at runtime. */
export const PUBLIC_BFF_ROUTE_DEFINITIONS: Array<{
  path: string;
  methods: HttpMethod[];
}> = [
  { path: '/public/tenant', methods: ['GET'] },
  { path: '/public/tenants', methods: ['GET'] },
  { path: '/public/services', methods: ['GET'] },
  { path: '/public/staff', methods: ['GET'] },
  { path: '/public/owner-invites/accept', methods: ['GET', 'POST'] },
  { path: '/public/staff-auth/otp/send', methods: ['POST'] },
  { path: '/public/staff-auth/otp/verify', methods: ['POST'] },
  { path: '/public/schedule/summary', methods: ['GET'] },
  { path: '/public/platform/landing', methods: ['GET'] },
  { path: '/public/available-slots', methods: ['GET'] },
  { path: '/public/bookings/lock', methods: ['POST'] },
  { path: '/public/bookings/mine', methods: ['GET'] },
  { path: '/public/bookings/:id/cancel-preview', methods: ['GET'] },
  { path: '/public/bookings/:id/reschedule-preview', methods: ['GET'] },
  { path: '/public/bookings/:id', methods: ['GET'] },
  { path: '/public/bookings/:id/pay', methods: ['POST'] },
  { path: '/public/bookings/:id/cancel', methods: ['POST'] },
  { path: '/public/bookings/:id/reschedule', methods: ['POST'] },
  { path: '/public/customer-auth/otp/send', methods: ['POST'] },
  { path: '/public/customer-auth/otp/verify', methods: ['POST'] },
  { path: '/public/customer-auth/me', methods: ['GET', 'PATCH'] },
  { path: '/public/customer-auth/me/wallet', methods: ['GET'] },
  { path: '/public/customer-auth/push-subscriptions', methods: ['POST', 'DELETE'] },
];

function pathToPattern(path: string): RegExp {
  const escaped = path
    .split('/')
    .map((segment) => {
      if (segment.startsWith(':')) return '[^/]+';
      return segment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    })
    .join('/');
  return new RegExp(`^${escaped}$`);
}

const PUBLIC_PATTERNS = PUBLIC_BFF_ROUTE_DEFINITIONS.map(({ path, methods }) => ({
  pattern: pathToPattern(path),
  methods: new Set<HttpMethod>(methods),
}));

/**
 * Whether the public BFF proxy may forward this path/method.
 * QPay simulate is never on the static allowlist — only when explicitly gated.
 */
export function isPublicBffPathAllowed(
  path: string,
  method: string,
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  const httpMethod = method.toUpperCase() as HttpMethod;

  if (path === QPAY_SIMULATE_PUBLIC_PATH && httpMethod === 'POST') {
    return isQpaySimulateAllowed(env);
  }

  return PUBLIC_PATTERNS.some(
    ({ pattern, methods }) => pattern.test(path) && methods.has(httpMethod),
  );
}
