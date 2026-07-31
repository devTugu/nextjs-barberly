export const locales = ['mn', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'mn';
