export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    MFA_VERIFY: '/auth/mfa/verify',
    MFA_ENROLL: '/auth/mfa/enroll',
    MFA_ENROLL_CONFIRM: '/auth/mfa/enroll/confirm',
    MFA_DISABLE: '/auth/mfa/disable',
    MFA_ENROLLMENT_ENROLL: '/auth/mfa/enrollment/enroll',
    MFA_ENROLLMENT_CONFIRM: '/auth/mfa/enrollment/confirm',
    OAUTH_AUTHORIZE: '/auth/oauth/authorize',
    OAUTH_CALLBACK: '/auth/oauth/callback',
  },
  USERS: {
    LIST: '/users',
    BY_ID: (id: number) => `/users/${id}`,
    EXPORT: (id: number) => `/users/${id}/export`,
    ANONYMIZE: (id: number) => `/users/${id}/anonymize`,
  },
  ROLES: {
    LIST: '/roles',
    BY_ID: (id: number) => `/roles/${id}`,
    ASSIGN: '/roles/assign',
    UNASSIGN: (userId: number, roleId: number) =>
      `/roles/assign/${userId}/${roleId}`,
  },
  PERMISSIONS: {
    LIST: '/permissions',
    BY_ID: (id: number) => `/permissions/${id}`,
  },
  MEDIA: {
    UPLOAD: '/admin/media/upload',
  },
  DASHBOARD: {
    STATS: '/admin/dashboard/stats',
    PLATFORM_FINANCE: '/admin/dashboard/platform-finance',
  },
  AUDIT_LOGS: {
    LIST: '/admin/audit-logs',
  },
  TENANTS: {
    LIST: '/admin/tenants',
    BY_ID: (id: number) => `/admin/tenants/${id}`,
  },
  SERVICES: {
    LIST: '/admin/services',
    BY_ID: (id: number) => `/admin/services/${id}`,
  },
  STAFF: {
    LIST: '/admin/staff',
    BY_ID: (id: number) => `/admin/staff/${id}`,
  },
  BOOKINGS: {
    LIST: '/admin/bookings',
    MANUAL: '/admin/bookings/manual',
    COMPLETE: (id: number) => `/admin/bookings/${id}/complete`,
    CANCEL: (id: number) => `/admin/bookings/${id}/cancel`,
    NO_SHOW: (id: number) => `/admin/bookings/${id}/no-show`,
    CONFIRM: (id: number) => `/admin/bookings/${id}/confirm`,
  },
  WALLET: {
    BALANCE: '/admin/wallet',
    TRANSACTIONS: '/admin/wallet/transactions',
    WITHDRAW: '/admin/wallet/withdraw',
  },
  PUBLIC: {
    TENANT: '/public/tenant',
    SERVICES: '/public/services',
    SLOTS: '/public/available-slots',
    LOCK: '/public/bookings/lock',
    BOOKING: (id: number) => `/public/bookings/${id}`,
    PAY: (id: number) => `/public/bookings/${id}/pay`,
    MINE: '/public/bookings/mine',
  },
} as const;
