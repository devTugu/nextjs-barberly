'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  BarChart3,
  ClipboardList,
  Globe,
  KeyRound,
  LayoutDashboard,
  Shield,
  ShieldCheck,
  Store,
  Users,
  Wallet,
} from 'lucide-react';
import { useWithdrawals } from '@/entities/withdrawal/api/queries';
import { env } from '@/shared/config/env';
import { ROUTES } from '@/shared/config/routes';
import {
  PERMISSION_CODES,
  type PermissionCode,
} from '@/shared/config/permissions';
import { useAuthPermissions } from '@/features/auth';
import { usePageVisible } from '@/shared/hooks/use-page-visible';
import type { AppMessages } from '@/shared/i18n/messages';
import { LocaleSwitcher } from '@/shared/i18n/locale-switcher';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/shared/ui/sidebar';
import { NavUser } from './nav-user';
import { NavSection, type NavSectionItem } from '@/widgets/shared/nav-section';

type NavTitleKey = keyof AppMessages['nav'];

type NavItem = NavSectionItem<NavTitleKey>;

const systemNavItems: NavItem[] = [
  {
    titleKey: 'overview',
    href: ROUTES.PLATFORM_DASHBOARD,
    icon: LayoutDashboard,
    permission: PERMISSION_CODES.DASHBOARD_READ,
  },
  {
    titleKey: 'users',
    href: ROUTES.PLATFORM_USERS,
    icon: Users,
    permission: PERMISSION_CODES.USER_READ,
  },
  {
    titleKey: 'roles',
    href: ROUTES.PLATFORM_ROLES,
    icon: Shield,
    permission: PERMISSION_CODES.ROLE_READ,
  },
  {
    titleKey: 'permissions',
    href: ROUTES.PLATFORM_PERMISSIONS,
    icon: KeyRound,
    permission: PERMISSION_CODES.PERMISSION_READ,
  },
  {
    titleKey: 'auditLogs',
    href: ROUTES.PLATFORM_AUDIT,
    icon: ClipboardList,
    permission: PERMISSION_CODES.AUDIT_READ,
  },
  {
    titleKey: 'security',
    href: ROUTES.PLATFORM_SECURITY,
    icon: ShieldCheck,
  },
];

const platformNavItems: NavItem[] = [
  {
    titleKey: 'analytics',
    href: ROUTES.PLATFORM_ANALYTICS,
    icon: BarChart3,
    permission: PERMISSION_CODES.TENANT_READ,
  },
  {
    titleKey: 'tenants',
    href: ROUTES.PLATFORM_TENANTS,
    icon: Store,
    permission: PERMISSION_CODES.TENANT_READ,
  },
  {
    titleKey: 'withdrawals',
    href: ROUTES.PLATFORM_WITHDRAWALS,
    icon: Wallet,
    permission: PERMISSION_CODES.WALLET_READ,
  },
  {
    titleKey: 'support',
    href: ROUTES.PLATFORM_SUPPORT,
    icon: Store,
    permission: PERMISSION_CODES.TENANT_READ,
  },
  {
    titleKey: 'platformLanding',
    href: ROUTES.PLATFORM_LANDING,
    icon: Globe,
    permission: PERMISSION_CODES.TENANT_UPDATE,
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { can } = useAuthPermissions();
  const tNav = useTranslations('nav');
  const showPendingWithdrawals = can(PERMISSION_CODES.WALLET_READ);
  const pageVisible = usePageVisible();
  const { data: pendingWithdrawals } = useWithdrawals(
    { page: 1, limit: 1, status: 'pending' },
    showPendingWithdrawals,
    showPendingWithdrawals && pageVisible ? 15_000 : false,
  );
  const platformItems = useMemo(
    () =>
      platformNavItems.map((item) =>
        item.titleKey === 'withdrawals' && pendingWithdrawals?.total
          ? { ...item, badgeCount: pendingWithdrawals.total }
          : item,
      ),
    [pendingWithdrawals?.total],
  );

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href={ROUTES.PLATFORM_DASHBOARD}>
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Shield className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{env.APP_NAME}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {tNav('adminConsole')}
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavSection
          labelKey="platform"
          items={platformItems}
          pathname={pathname}
          can={can}
          tNav={tNav}
        />
        <NavSection
          labelKey="system"
          items={systemNavItems}
          pathname={pathname}
          can={can}
          tNav={tNav}
        />
      </SidebarContent>
      <SidebarFooter>
        <div className="px-2 pb-2 group-data-[collapsible=icon]:hidden">
          <LocaleSwitcher className="justify-center" />
        </div>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
