import type { Metadata } from 'next';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { env } from '@/shared/config/env';
import { ROUTES } from '@/shared/config/routes';
import { hasServerSession } from '@/shared/lib/server-session';
import { Button } from '@/shared/ui/button';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: env.BRAND_NAME,
    description: 'Multi-tenant barbershop booking platform',
  };
}

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = await getTranslations('home');
  const hasSession = await hasServerSession();

  return (
    <div className="flex min-h-svh flex-col">
      <header className="border-b bg-background">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <Link href={ROUTES.HOME} className="text-lg font-semibold">
            {env.BRAND_NAME}
          </Link>
          <Button asChild variant={hasSession ? 'default' : 'outline'} size="sm">
            <Link href={hasSession ? ROUTES.DASHBOARD : ROUTES.LOGIN}>
              {hasSession ? t('dashboard') : t('signIn')}
            </Link>
          </Button>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} {env.BRAND_NAME}
      </footer>
    </div>
  );
}
