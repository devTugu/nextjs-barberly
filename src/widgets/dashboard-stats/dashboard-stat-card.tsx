'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ArrowRight, type LucideIcon } from 'lucide-react';
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';
import { cn } from '@/shared/lib/utils';

interface StatCardProps {
  title: string;
  value?: number;
  valueText?: string;
  loading: boolean;
  icon: LucideIcon;
  href?: string;
  accent?: 'blue' | 'violet' | 'amber' | 'emerald';
}

const accentStyles = {
  blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  violet: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
  amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
} as const;

export function DashboardStatCard({
  title,
  value,
  valueText,
  loading,
  icon: Icon,
  href,
  accent = 'blue',
}: StatCardProps) {
  const t = useTranslations('dashboard');

  const card = (
    <Card
      className={cn(
        'gap-4 py-4',
        href && 'hover:border-primary/40 hover:bg-muted/20 transition-colors',
      )}
    >
      <CardHeader className="px-4">
        <CardDescription className="line-clamp-1">{title}</CardDescription>
        <CardTitle className="text-3xl font-semibold tabular-nums">
          {loading ? (
            <Skeleton className="h-8 w-14" />
          ) : valueText ? (
            valueText
          ) : value !== undefined ? (
            value
          ) : (
            <span className="text-xl">{t('open')}</span>
          )}
        </CardTitle>
        <CardAction>
          <div
            className={cn(
              'flex size-9 items-center justify-center rounded-lg',
              accentStyles[accent],
            )}
          >
            <Icon className="size-4" aria-hidden />
          </div>
        </CardAction>
        {href ? (
          <span className="text-muted-foreground flex items-center gap-1 text-xs font-medium">
            {t('view')}
            <ArrowRight className="size-3" aria-hidden />
          </span>
        ) : null}
      </CardHeader>
    </Card>
  );

  if (!href) return card;

  return (
    <Link
      href={href}
      className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {card}
    </Link>
  );
}

export function DashboardOverviewSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div>
        <h3 className="text-sm font-medium">{title}</h3>
        {description ? (
          <p className="text-muted-foreground text-sm">{description}</p>
        ) : null}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{children}</div>
    </section>
  );
}
