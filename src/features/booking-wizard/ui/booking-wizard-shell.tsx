'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ROUTES } from '@/shared/config/routes';
import { Button } from '@/shared/ui/button';

interface BookingWizardShellProps {
  title: string;
  subtitle?: string;
  backHref?: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
}

export function BookingWizardShell({
  title,
  subtitle,
  backHref = ROUTES.USER_DASHBOARD,
  footer,
  children,
}: BookingWizardShellProps) {
  const t = useTranslations('bookingWizard');

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="sticky top-0 z-40 bg-background/95 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur-md">
        <div className="flex items-start gap-2">
          <Button variant="ghost" size="icon" className="mt-0.5 shrink-0 rounded-full" asChild>
            <Link href={backHref} aria-label={t('back')}>
              <ArrowLeft className="size-5" />
            </Link>
          </Button>
          <div className="min-w-0 flex-1 pt-1">
            <h1 className="text-lg font-semibold leading-tight">{title}</h1>
            {subtitle ? (
              <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
            ) : null}
          </div>
        </div>
      </header>

      <div className="flex-1 px-4 pb-4">{children}</div>

      {footer ? (
        <footer
          className="sticky bottom-0 bg-background/95 px-4 pt-3 backdrop-blur-md"
          style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
        >
          {footer}
        </footer>
      ) : null}
    </div>
  );
}
