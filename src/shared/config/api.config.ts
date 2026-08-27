export const API_ENDPOINTS = {
  /** Auth routes proxied via `/api/auth/*` BFF handlers — not the generic backend proxy. */
  AUTH: {
    /** @deprecated Use `/api/auth/login` BFF route */
    LOGIN: '/auth/login',
    /** @deprecated Use `/api/auth/refresh` BFF route */
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    MY_TENANTS: '/auth/me/tenants',
    /** @deprecated Use `/api/auth/mfa/*` BFF routes */
    MFA_VERIFY: '/auth/mfa/verify',
    MFA_ENROLL: '/auth/mfa/enroll',
    MFA_ENROLL_CONFIRM: '/auth/mfa/enroll/confirm',
    MFA_DISABLE: '/auth/mfa/disable',
    MFA_ENROLLMENT_ENROLL: '/auth/mfa/enrollment/enroll',
    MFA_ENROLLMENT_CONFIRM: '/auth/mfa/enrollment/confirm',
    /** @deprecated Use `/api/auth/oauth/*` BFF routes */
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
    TENANT_STATS: '/admin/dashboard/tenant-stats',
    BRAND: '/admin/brand/dashboard',
    BRAND_CATALOG_SYNC: '/admin/brand/catalog-sync',
    PLATFORM_FINANCE: '/admin/dashboard/platform-finance',
    PLATFORM_FINANCE_TREND: '/admin/dashboard/platform-finance/trend',
    PLATFORM_FINANCE_EXPORT: '/admin/dashboard/platform-finance/export',
  },
  MY_TENANT: '/admin/tenant',
  AUDIT_LOGS: {
    LIST: '/admin/audit-logs',
  },
  TENANTS: {
    LIST: '/admin/tenants',
    BY_ID: (id: number) => `/admin/tenants/${id}`,
    CONTRACT: (id: number) => `/admin/tenants/${id}/contract`,
  },
  SERVICES: {
    LIST: '/admin/services',
    BY_ID: (id: number) => `/admin/services/${id}`,
  },
  STAFF: {
    LIST: '/admin/staff',
    BY_ID: (id: number) => `/admin/staff/${id}`,
    COMPENSATION: (id: number) => `/admin/staff/${id}/compensation`,
    LINK_BRANCH: (id: number) => `/admin/staff/${id}/link-branch`,
  },
  BOOKINGS: {
    LIST: '/admin/bookings',
    DETAIL: (id: number) => `/admin/bookings/${id}`,
    MANUAL: '/admin/bookings/manual',
    COMPLETE: (id: number) => `/admin/bookings/${id}/complete`,
    CANCEL: (id: number) => `/admin/bookings/${id}/cancel`,
    NO_SHOW: (id: number) => `/admin/bookings/${id}/no-show`,
    CONFIRM: (id: number) => `/admin/bookings/${id}/confirm`,
    OFFLINE_SETTLEMENT: (id: number) =>
      `/admin/bookings/${id}/settlements/offline`,
    REOPEN_SETTLEMENT: (id: number) =>
      `/admin/bookings/${id}/reopen-settlement`,
  },
  WALLET: {
    BALANCE: '/admin/wallet',
    TRANSACTIONS: '/admin/wallet/transactions',
    WITHDRAW: '/admin/wallet/withdraw',
    WITHDRAW_BATCH: '/admin/wallet/withdraw-batch',
    BRAND_BRANCH_BALANCES: '/admin/wallet/brand-branch-balances',
    WITHDRAWALS: '/admin/wallet/withdrawals',
  },
  SCHEDULES: {
    SHIFTS: (staffId: number) => `/admin/schedules/staff/${staffId}/shifts`,
    SHIFT: (staffId: number, id: number) =>
      `/admin/schedules/staff/${staffId}/shifts/${id}`,
    DAY_EXCEPTIONS: (staffId: number) =>
      `/admin/schedules/staff/${staffId}/day-exceptions`,
    DAY_EXCEPTION: (staffId: number, id: number) =>
      `/admin/schedules/staff/${staffId}/day-exceptions/${id}`,
    TIME_BLOCKS: (staffId: number) =>
      `/admin/schedules/staff/${staffId}/time-blocks`,
    TIME_BLOCK: (staffId: number, id: number) =>
      `/admin/schedules/staff/${staffId}/time-blocks/${id}`,
    TENANT_HOLIDAYS: '/admin/schedules/tenant-holidays',
    TENANT_HOLIDAY: (id: number) => `/admin/schedules/tenant-holidays/${id}`,
    TEMPLATES: '/admin/schedules/templates',
    TEMPLATE: (id: number) => `/admin/schedules/templates/${id}`,
    APPLY_TEMPLATE: (id: number) => `/admin/schedules/templates/${id}/apply`,
  },
  WITHDRAWALS: {
    LIST: '/admin/withdrawals',
    BY_ID: (id: number) => `/admin/withdrawals/${id}`,
    APPROVE: (id: number) => `/admin/withdrawals/${id}/approve`,
    REJECT: (id: number) => `/admin/withdrawals/${id}/reject`,
    BATCHES: '/admin/withdrawals/batches',
    BATCH_BY_ID: (id: number) => `/admin/withdrawals/batches/${id}`,
    BATCH_APPROVE: (id: number) => `/admin/withdrawals/batches/${id}/approve`,
    BATCH_REJECT: (id: number) => `/admin/withdrawals/batches/${id}/reject`,
  },
  PLATFORM: {
    TENANTS_OWNER_INVITE: (id: number) => `/platform/tenants/${id}/owner-invite`,
    SUPPORT_TICKETS: '/platform/support-tickets',
    LANDING: '/admin/platform/landing',
  },
  FINANCE: {
    SUMMARY: '/admin/finance/summary',
    STAFF_EARNINGS: '/admin/finance/staff-earnings',
  },
  SETTINGS: {
    LOYALTY: '/admin/settings/loyalty',
    RENT_INVOICES: '/admin/settings/rent-invoices',
    GENERATE_RENT: '/admin/settings/rent-invoices/generate',
  },
  PUSH_SUBSCRIPTIONS: {
    SUBSCRIBE: '/admin/push-subscriptions',
    UNSUBSCRIBE: '/admin/push-subscriptions',
  },
  CUSTOMER: {
    ME: '/public/customer-auth/me',
  },
  PUBLIC: {
    TENANT: '/public/tenant',
    SERVICES: '/public/services',
    SCHEDULE_SUMMARY: '/public/schedule/summary',
    PLATFORM_LANDING: '/public/platform/landing',
    PLATFORM_CONTACT: '/public/platform/contact',
    STAFF: '/public/staff',
    SLOTS: '/public/available-slots',
    LOCK: '/public/bookings/lock',
    BOOKING: (id: number) => `/public/bookings/${id}`,
    PAY: (id: number) => `/public/bookings/${id}/pay`,
    MINE: '/public/bookings/mine',
  },
} as const;
