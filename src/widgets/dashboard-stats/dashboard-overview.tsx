'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import {
  BarChart3,
  Banknote,
  KeyRound,
  LayoutDashboard,
  Shield,
  Store,
  Users,
  Wallet,
} from 'lucide-react';
import { useState } from 'react';
import { useDashboardStats, usePlatformFinance } from '@/entities/dashboard';
import { useWithdrawals } from '@/entities/withdrawal';
import { useAuthPermissions, useAuthStore } from '@/entities/session';
import { usePageVisible } from '@/shared/hooks/use-page-visible';
import { PERMISSION_CODES } from '@/shared/config/permissions';
import { ROUTES } from '@/shared/config/routes';
import { Button } from '@/shared/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card';
import { Separator } from '@/shared/ui/separator';
import {
  DashboardOverviewSection,
  DashboardStatCard,
} from './dashboard-stat-card';

function currentMonthKey(nowMs: number): string {
  const now = new Date(nowMs);
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${now.getFullYear()}-${month}`;
}

export function DashboardOverview() {
  const t = useTranslations('dashboard');
  const tPlatform = useTranslations('platformDashboard');
  const { can } = useAuthPermissions();
  const user = useAuthStore((state) => state.user);
  const { data: stats, isLoading } = useDashboardStats();
  const [nowMs] = useState(() => Date.now());
  const month = currentMonthKey(nowMs);
  const showFinance = can(PERMISSION_CODES.TENANT_READ);
  const showPendingWithdrawals = can(PERMISSION_CODES.WALLET_READ);
  const pageVisible = usePageVisible();
  const { data: finance, isLoading: financeLoading } = usePlatformFinance(
    showFinance ? month : '',
  );
  const { data: pendingWithdrawals, isLoading: pendingLoading } =
    useWithdrawals(
      { page: 1, limit: 1, status: 'pending' },
      showPendingWithdrawals,
      showPendingWithdrawals && pageVisible ? 15_000 : false,
    );

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
        {can(PERMISSION_CODES.TENANT_READ) || can(PERMISSION_CODES.USER_READ) ? (
          <CardContent className="flex flex-wrap gap-2">
            {can(PERMISSION_CODES.TENANT_READ) ? (
              <>
                <Button variant="secondary" size="sm" asChild>
                  <Link href={ROUTES.PLATFORM_ANALYTICS}>
                    <BarChart3 className="size-4" aria-hidden />
                    {t('analytics')}
                  </Link>
                </Button>
                <Button variant="secondary" size="sm" asChild>
                  <Link href={ROUTES.PLATFORM_TENANTS}>
                    <Store className="size-4" aria-hidden />
                    {t('tenants')}
                  </Link>
                </Button>
              </>
            ) : null}
            {can(PERMISSION_CODES.USER_READ) ? (
              <Button variant="secondary" size="sm" asChild>
                <Link href={ROUTES.PLATFORM_USERS}>
                  <Users className="size-4" aria-hidden />
                  {t('users')}
                </Link>
              </Button>
            ) : null}
          </CardContent>
        ) : null}
      </Card>

      {showPlatformStats ? (
        <DashboardOverviewSection
          title={t('sectionPlatform')}
          description={t('sectionPlatformDescription')}
        >
          {showFinance ? (
            <DashboardStatCard
              title={tPlatform('financeSnapshot')}
              valueText={
                finance
                  ? `${finance.summary.grossPayments.toLocaleString()}₮`
                  : undefined
              }
              loading={financeLoading}
              icon={Banknote}
              href={ROUTES.PLATFORM_ANALYTICS}
              accent="emerald"
            />
          ) : null}
          {showPendingWithdrawals ? (
            <DashboardStatCard
              title={tPlatform('pendingWithdrawals')}
              value={pendingWithdrawals?.total ?? 0}
              loading={pendingLoading}
              icon={Wallet}
              href={ROUTES.PLATFORM_WITHDRAWALS}
              accent="amber"
            />
          ) : null}
          <DashboardStatCard
            title={t('analytics')}
            loading={false}
            icon={BarChart3}
            href={ROUTES.PLATFORM_ANALYTICS}
            accent="violet"
          />
          <DashboardStatCard
            title={t('tenants')}
            value={stats?.tenants ?? 0}
            loading={isLoading}
            icon={Store}
            href={ROUTES.PLATFORM_TENANTS}
            accent="blue"
          />
        </DashboardOverviewSection>
      ) : null}

      {showSystemStats ? (
        <DashboardOverviewSection
          title={t('sectionSystem')}
          description={t('sectionSystemDescription')}
        >
          {can(PERMISSION_CODES.USER_READ) ? (
            <DashboardStatCard
              title={t('users')}
              value={stats?.users ?? 0}
              loading={isLoading}
              icon={Users}
              href={ROUTES.PLATFORM_USERS}
              accent="blue"
            />
          ) : null}
          {can(PERMISSION_CODES.ROLE_READ) ? (
            <DashboardStatCard
              title={t('roles')}
              value={stats?.roles ?? 0}
              loading={isLoading}
              icon={Shield}
              href={ROUTES.PLATFORM_ROLES}
              accent="violet"
            />
          ) : null}
          {can(PERMISSION_CODES.PERMISSION_READ) ? (
            <DashboardStatCard
              title={t('permissions')}
              value={stats?.permissions ?? 0}
              loading={isLoading}
              icon={KeyRound}
              href={ROUTES.PLATFORM_PERMISSIONS}
              accent="amber"
            />
          ) : null}
        </DashboardOverviewSection>
      ) : null}

      {!showSystemStats && !showPlatformStats ? <Separator /> : null}
    </div>
  );
}
