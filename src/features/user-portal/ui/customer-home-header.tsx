'use client';

import Link from 'next/link';
import { CalendarPlus, History, Scissors, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ROUTES } from '@/shared/config/routes';
import { cn } from '@/shared/lib/utils';

interface CustomerHomeHeaderProps {
  name: string | null;
}

export function CustomerHomeHeader({ name }: CustomerHomeHeaderProps) {
  const t = useTranslations('customerShell');
  const displayName = name?.trim() || t('guest');

  return (
    <header className="space-y-4 px-4 pt-5">
      <div className="flex items-center justify-between">
        <p className="text-lg font-semibold tracking-tight lowercase">
          {t('wordmark')}
        </p>
      </div>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {t('helloName', { name: displayName })}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{t('todayPrompt')}</p>
      </div>
    </header>
  );
}

export function CustomerHomeActions() {
  const t = useTranslations('customerShell');
  const items = [
    {
      href: ROUTES.BOOK,
      label: t('bookCta'),
      icon: CalendarPlus,
      primary: true,
    },
    { href: `${ROUTES.BOOK}#services`, label: t('services'), icon: Scissors },
    { href: '#barbers', label: t('barbers'), icon: Users },
    { href: '#history', label: t('history'), icon: History },
  ];

  return (
    <div className="grid grid-cols-4 gap-2 px-4">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              'flex flex-col items-center gap-2 rounded-2xl px-1 py-3 text-center',
              item.primary
                ? 'bg-[var(--brand-primary,#3b82f6)] text-white'
                : 'bg-white/5 text-foreground',
            )}
          >
            <Icon className="size-5" />
            <span className="text-[10px] font-medium leading-tight">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
