import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { env } from '@/shared/config/env';
import { ROUTES } from '@/shared/config/routes';
import { hasServerSession } from '@/shared/lib/server-session';
import { Button } from '@/shared/ui/button';

export default async function HomePage() {
  const t = await getTranslations('home');
  const hasSession = await hasServerSession();

  return (
    <section className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-4 py-24 text-center">
      <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
        Barberly
      </p>
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
        {env.BRAND_NAME}
      </h1>
      <p className="text-lg text-muted-foreground">{t('subtitle')}</p>
      <div className="flex flex-wrap justify-center gap-3">
        <Button asChild size="lg">
          <Link href={hasSession ? ROUTES.DASHBOARD : ROUTES.LOGIN}>
            {hasSession ? t('dashboard') : t('signIn')}
          </Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href={`${ROUTES.BOOK}?tenant=demo`}>Book appointment</Link>
        </Button>
        {hasSession && (
          <Button asChild size="lg" variant="secondary">
            <Link href={`${ROUTES.SHOP}?tenant=demo`}>Shop admin</Link>
          </Button>
        )}
      </div>
    </section>
  );
}
