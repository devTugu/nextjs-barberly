'use client';

import Link from 'next/link';
import { ArrowLeft, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ROUTES } from '@/shared/config/routes';
import { LocaleSwitcher } from '@/shared/i18n/locale-switcher';
import { Button } from '@/shared/ui/button';
import { BookingStepIndicator } from './booking-step-indicator';

interface BookingWizardShellProps {
  step: 0 | 1 | 2 | 3 | 4 | 5;
  title: string;
  backHref?: string;
  closeHref?: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
}

export function BookingWizardShell({
  step,
  title,
  backHref,
  closeHref = ROUTES.HOME,
  footer,
  children,
}: BookingWizardShellProps) {
  const t = useTranslations('bookingWizard');

  return (
    <div className="flex min-h-svh flex-col">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/95 px-4 py-3 backdrop-blur-md">
        <div className="flex items-center gap-2">
          {backHref ? (
            <Button variant="ghost" size="icon" className="shrink-0" asChild>
              <Link href={backHref} aria-label={t('back')}>
                <ArrowLeft className="size-5" />
              </Link>
            </Button>
          ) : (
            <Button variant="ghost" size="icon" className="shrink-0" asChild>
              <Link href={closeHref} aria-label={t('close')}>
                <X className="size-5" />
              </Link>
            </Button>
          )}
          <h1 className="flex-1 text-center text-base font-semibold">{title}</h1>
          <LocaleSwitcher variant="flags" className="shrink-0" />
        </div>
        {step > 0 ? <BookingStepIndicator current={step} /> : null}
      </header>

      <div className="flex-1 px-4 py-4">{children}</div>

      {footer ? (
        <footer
          className="sticky bottom-0 border-t border-border/60 bg-card/95 px-4 py-4 backdrop-blur-md"
          style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
        >
          {footer}
        </footer>
      ) : null}
    </div>
  );
}
