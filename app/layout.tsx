import type { Metadata } from 'next';
import { Geist, Geist_Mono, Inter } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale } from 'next-intl/server';
import './globals.css';
import { Providers } from '@/processes/providers';
import { env } from '@/shared/config/env';
import { getMessages as getAppMessages, resolveLocale } from '@/shared/i18n/messages';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
});

const cyrillicSans = Inter({
  variable: '--font-cyrillic',
  subsets: ['cyrillic', 'cyrillic-ext'],
  display: 'swap',
});

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: {
      default: env.BRAND_NAME,
      template: `%s · ${env.BRAND_NAME}`,
    },
    description: `${env.BRAND_NAME} — barbershop booking platform`,
    metadataBase: env.SITE_URL
      ? new URL(env.SITE_URL)
      : new URL('https://barberly.mn'),
    manifest: '/manifest.webmanifest',
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = getAppMessages(resolveLocale(locale));

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${cyrillicSans.variable} min-h-svh antialiased`}
      >
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
