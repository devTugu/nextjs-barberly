'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import {
  ArrowRight,
  KeyRound,
  LayoutDashboard,
  Shield,
  Store,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { useDashboardStats } from '@/entities/dashboard';
import { useAuthPermissions } from '@/features/auth';
import { useAuthStore } from '@/features/auth/model/store';
import { PERMISSION_CODES } from '@/shared/config/permissions';
import { ROUTES } from '@/shared/config/routes';
import { Button } from '@/shared/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card';
import { Separator } from '@/shared/ui/separator';
import { Skeleton } from '@/shared/ui/skeleton';
import { cn } from '@/shared/lib/utils';
import { PlatformFinancePanel } from './platform-finance-panel';

interface StatCardProps {
  title: string;
  value: number;
  loading: boolean;
  icon: LucideIcon;
  href?: string;
  accent?: 'blue' | 'violet' | 'amber';
}

const accentStyles = {
  blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  violet: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
  amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
} as const;

function StatCard({
  title,
  value,
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
          {loading ? <Skeleton className="h-8 w-14" /> : value}
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

  if (!href) {
    return card;
  }

  return (
    <Link
      href={href}
      className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {card}
    </Link>
  );
}

function OverviewSection({
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

export function DashboardOverview() {
  const t = useTranslations('dashboard');
  const { can } = useAuthPermissions();
  const user = useAuthStore((state) => state.user);
  const { data: stats, isLoading } = useDashboardStats();

  const showSystemStats =
    can(PERMISSION_CODES.USER_READ) ||
    can(PERMISSION_CODES.ROLE_READ) ||
    can(PERMISSION_CODES.PERMISSION_READ);

  const showPlatformStats = can(PERMISSION_CODES.TENANT_READ);

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <LayoutDashboard className="text-muted-foreground size-6" aria-hidden />
            {t('title')}
          </CardTitle>
          <CardDescription>
            {user?.email ? t('welcome', { email: user.email }) : t('subtitle')}
          </CardDescription>
        </CardHeader>
        {can(PERMISSION_CODES.TENANT_READ) ||
        can(PERMISSION_CODES.USER_READ) ? (
          <CardContent className="flex flex-wrap gap-2">
            {can(PERMISSION_CODES.TENANT_READ) ? (
              <Button variant="secondary" size="sm" asChild>
                <Link href={ROUTES.TENANTS}>
                  <Store className="size-4" aria-hidden />
                  {t('tenants')}
                </Link>
              </Button>
            ) : null}
            {can(PERMISSION_CODES.USER_READ) ? (
              <Button variant="secondary" size="sm" asChild>
                <Link href={ROUTES.USERS}>
                  <Users className="size-4" aria-hidden />
                  {t('users')}
                </Link>
              </Button>
            ) : null}
          </CardContent>
        ) : null}
      </Card>

      {showPlatformStats ? (
        <>
          <OverviewSection
            title={t('sectionPlatform')}
            description={t('sectionPlatformDescription')}
          >
            <StatCard
              title={t('tenants')}
              value={stats?.tenants ?? 0}
              loading={isLoading}
              icon={Store}
              href={ROUTES.TENANTS}
              accent="blue"
            />
          </OverviewSection>
          <PlatformFinancePanel />
        </>
      ) : null}

      {showSystemStats ? (
        <OverviewSection
          title={t('sectionSystem')}
          description={t('sectionSystemDescription')}
        >
          {can(PERMISSION_CODES.USER_READ) ? (
            <StatCard
              title={t('users')}
              value={stats?.users ?? 0}
              loading={isLoading}
              icon={Users}
              href={ROUTES.USERS}
              accent="blue"
            />
          ) : null}
          {can(PERMISSION_CODES.ROLE_READ) ? (
            <StatCard
              title={t('roles')}
              value={stats?.roles ?? 0}
              loading={isLoading}
              icon={Shield}
              href={ROUTES.ROLES}
              accent="violet"
            />
          ) : null}
          {can(PERMISSION_CODES.PERMISSION_READ) ? (
            <StatCard
              title={t('permissions')}
              value={stats?.permissions ?? 0}
              loading={isLoading}
              icon={KeyRound}
              href={ROUTES.PERMISSIONS}
              accent="amber"
            />
          ) : null}
        </OverviewSection>
      ) : null}

      {!showSystemStats && !showPlatformStats ? <Separator /> : null}
    </div>
  );
}
