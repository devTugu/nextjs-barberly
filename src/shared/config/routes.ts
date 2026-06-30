export const PUBLIC_ROUTES = {
  HOME: '/',
} as const;

export const ROUTES = {
  HOME: '/',
  LOGIN: '/sign-in',
  OAUTH_CALLBACK: '/oauth/callback',
  BOOK: '/book',
  BOOK_CONFIRM: '/book/confirm',
  SHOP: '/shop',
  SHOP_SERVICES: '/shop/services',
  SHOP_BOOKINGS: '/shop/bookings',
  SHOP_WALLET: '/shop/wallet',
  DASHBOARD: '/dashboard',
  SECURITY: '/dashboard/security',
  USERS: '/dashboard/users',
  ROLES: '/dashboard/roles',
  PERMISSIONS: '/dashboard/permissions',
  AUDIT_LOGS: '/dashboard/audit-logs',
  TENANTS: '/dashboard/tenants',
} as const;

export type Route = (typeof ROUTES)[keyof typeof ROUTES];
