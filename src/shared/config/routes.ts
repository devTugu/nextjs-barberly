export const PUBLIC_ROUTES = {
  HOME: '/',
} as const;

/** Customer booking flow (tenant host). */
export const BOOK_ROUTES = {
  BOOK: '/book',
  BOOK_BRANCH: '/book/branch',
  BOOK_STAFF: '/book/staff',
  BOOK_SLOT: '/book/slot',
  BOOK_OTP: '/book/otp',
  BOOK_PAY: '/book/pay',
  BOOK_CONFIRM: '/book/confirm',
} as const;

/** Customer account (tenant host). */
export const USER_ROUTES = {
  USER_LOGIN: '/user/login',
  USER_DASHBOARD: '/user/dashboard',
  USER_PROFILE: '/user/profile',
  USER_WALLET: '/user/wallet',
  userBooking: (id: number | string) => `/user/bookings/${id}`,
  userBookingReschedule: (id: number | string) => `/user/bookings/${id}/reschedule`,
  userBookingCancel: (id: number | string) => `/user/bookings/${id}/cancel`,
} as const;

/** Barber / tenant admin (tenant host). */
export const ADMIN_ROUTES = {
  ADMIN: '/admin',
  ADMIN_LOGIN: '/admin/login',
  ADMIN_LOGIN_STAFF: '/admin/login/staff',
  ADMIN_ACCEPT_INVITE: '/admin/accept-invite',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_BRAND: '/admin/brand',
  ADMIN_CALENDAR: '/admin/calendar',
  ADMIN_BOOKINGS: '/admin/bookings',
  ADMIN_BOOKINGS_NEW: '/admin/bookings/new',
  adminBooking: (id: number | string) => `/admin/bookings/${id}`,
  ADMIN_SERVICES: '/admin/services',
  ADMIN_SERVICES_NEW: '/admin/services/new',
  adminServiceEdit: (id: number | string) => `/admin/services/${id}/edit`,
  ADMIN_SCHEDULE: '/admin/schedule',
  ADMIN_SCHEDULE_SETUP: '/admin/schedule/setup',
  ADMIN_SCHEDULE_EXCEPTIONS: '/admin/schedule/exceptions',
  ADMIN_STAFF: '/admin/staff',
  ADMIN_STAFF_NEW: '/admin/staff/new',
  adminStaffEdit: (id: number | string) => `/admin/staff/${id}/edit`,
  ADMIN_FINANCE: '/admin/finance',
  ADMIN_EARNINGS: '/admin/earnings',
  ADMIN_RENT_INVOICES: '/admin/settings/rent-invoices',
  ADMIN_SETTINGS_LOYALTY: '/admin/settings/loyalty',
  ADMIN_WALLET: '/admin/wallet',
  ADMIN_WALLET_WITHDRAW: '/admin/wallet/withdraw',
  ADMIN_SETTINGS: '/admin/settings',
  ADMIN_SETTINGS_BRANDING: '/admin/settings/branding',
  ADMIN_SETTINGS_POLICY: '/admin/settings/policy',
  ADMIN_SETTINGS_LANDING: '/admin/settings/landing',
} as const;

/** Platform super-admin (platform host). */
export const PLATFORM_ROUTES = {
  PLATFORM_LOGIN: '/login',
  PLATFORM_DASHBOARD: '/dashboard',
  PLATFORM_TENANTS: '/tenants',
  PLATFORM_TENANTS_NEW: '/tenants/new',
  platformTenant: (id: number | string) => `/tenants/${id}`,
  platformTenantEdit: (id: number | string) => `/tenants/${id}/edit`,
  PLATFORM_ANALYTICS: '/analytics',
  PLATFORM_WITHDRAWALS: '/withdrawals',
  platformWithdrawal: (id: number | string) => `/withdrawals/${id}`,
  PLATFORM_USERS: '/users',
  PLATFORM_ROLES: '/roles',
  PLATFORM_PERMISSIONS: '/permissions',
  PLATFORM_AUDIT: '/audit',
  PLATFORM_SECURITY: '/security',
  PLATFORM_SUPPORT: '/support',
  PLATFORM_LANDING: '/landing',
  OAUTH_CALLBACK: '/oauth/callback',
} as const;

export const ROUTES = {
  HOME: '/',
  ...BOOK_ROUTES,
  ...USER_ROUTES,
  ...ADMIN_ROUTES,
  ...PLATFORM_ROUTES,
} as const;

export type Route = (typeof ROUTES)[keyof typeof ROUTES];
