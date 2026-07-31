import { ROUTES } from '@/shared/config/routes';
import en from './messages/en.json';
import mn from './messages/mn.json';
import { defaultLocale, locales, type Locale } from './config';

const catalogs = { en, mn } as const;

export type AppMessages = typeof en;

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export function resolveLocale(value: string | null | undefined): Locale {
  if (value && isLocale(value)) {
    return value;
  }
  return defaultLocale;
}

export function getMessages(locale: Locale = defaultLocale): AppMessages {
  return catalogs[locale] ?? catalogs[defaultLocale];
}

export function getStepHeadings(locale: Locale = defaultLocale) {
  const messages = getMessages(locale);
  return {
    credentials: {
      title: messages.auth.signInTitle,
      subtitle: messages.auth.signInSubtitle,
    },
    'mfa-verify': {
      title: messages.auth.verifyMfaTitle,
      subtitle: messages.auth.verifyMfaSubtitle,
    },
    'mfa-enroll': {
      title: messages.auth.enrollMfaTitle,
      subtitle: messages.auth.enrollMfaSubtitle,
    },
  } as const;
}

const PAGE_TITLE_KEYS: Record<string, keyof AppMessages['nav']> = {
  [ROUTES.PLATFORM_DASHBOARD]: 'overview',
  [ROUTES.PLATFORM_USERS]: 'users',
  [ROUTES.PLATFORM_ROLES]: 'roles',
  [ROUTES.PLATFORM_PERMISSIONS]: 'permissions',
  [ROUTES.PLATFORM_AUDIT]: 'auditLogs',
  [ROUTES.PLATFORM_SECURITY]: 'security',
  [ROUTES.PLATFORM_TENANTS]: 'tenants',
  [ROUTES.PLATFORM_ANALYTICS]: 'analytics',
  [ROUTES.PLATFORM_WITHDRAWALS]: 'withdrawals',
  [ROUTES.ADMIN_DASHBOARD]: 'adminDashboard',
  [ROUTES.ADMIN_BRAND]: 'adminBrand',
  [ROUTES.ADMIN_CALENDAR]: 'adminCalendar',
  [ROUTES.ADMIN_BOOKINGS]: 'adminBookings',
  [ROUTES.ADMIN_SERVICES]: 'adminServices',
  [ROUTES.ADMIN_STAFF]: 'adminStaff',
  [ROUTES.ADMIN_STAFF_NEW]: 'adminStaff',
  [ROUTES.ADMIN_SCHEDULE]: 'adminSchedule',
  [ROUTES.ADMIN_SCHEDULE_EXCEPTIONS]: 'adminSchedule',
  [ROUTES.ADMIN_FINANCE]: 'adminFinance',
  [ROUTES.ADMIN_EARNINGS]: 'adminEarnings',
  [ROUTES.ADMIN_WALLET]: 'adminWallet',
  [ROUTES.ADMIN_SETTINGS]: 'adminSettings',
  [ROUTES.ADMIN_SETTINGS_BRANDING]: 'adminSettings',
  [ROUTES.ADMIN_SETTINGS_POLICY]: 'adminSettings',
  [ROUTES.ADMIN_SETTINGS_LOYALTY]: 'adminSettings',
  [ROUTES.ADMIN_RENT_INVOICES]: 'adminSettings',
};

export function getPageTitle(
  pathname: string,
  locale: Locale = defaultLocale,
): string {
  const messages = getMessages(locale);
  const key = PAGE_TITLE_KEYS[pathname];
  if (key) {
    return messages.nav[key];
  }
  return messages.common.dashboard;
}

export function getDateLocale(locale: Locale): string {
  return locale === 'mn' ? 'mn-MN' : 'en-US';
}
