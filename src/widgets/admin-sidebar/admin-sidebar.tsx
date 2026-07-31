'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  Calendar,
  CalendarDays,
  LayoutDashboard,
  Scissors,
  Settings,
  Store,
  Users,
  Wallet,
  Banknote,
} from 'lucide-react';
import { env } from '@/shared/config/env';
import { ROUTES } from '@/shared/config/routes';
import {
  PERMISSION_CODES,
  type PermissionCode,
} from '@/shared/config/permissions';
import { useAuthPermissions } from '@/features/auth';
import type { AppMessages } from '@/shared/i18n/messages';
import { LocaleSwitcher } from '@/shared/i18n/locale-switcher';
import { TenantSwitcher } from '@/widgets/tenant-switcher/tenant-switcher';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/shared/ui/sidebar';
import { NavUser } from '@/widgets/app-sidebar/nav-user';
import { NavSection, type NavSectionItem } from '@/widgets/shared/nav-section';

type AdminNavTitleKey = keyof Pick<
  AppMessages['nav'],
  | 'adminDashboard'
  | 'adminBrand'
  | 'adminCalendar'
  | 'adminBookings'
  | 'adminServices'
  | 'adminStaff'
  | 'adminSchedule'
  | 'adminWallet'
  | 'adminFinance'
  | 'adminEarnings'
  | 'adminSettings'
>;

type NavItem = NavSectionItem<AdminNavTitleKey>;

const dailyNavItems: NavItem[] = [
  {
    titleKey: 'adminDashboard',
    href: ROUTES.ADMIN_DASHBOARD,
    icon: LayoutDashboard,
    permission: PERMISSION_CODES.BOOKING_READ,
  },
  {
    titleKey: 'adminBrand',
    href: ROUTES.ADMIN_BRAND,
    icon: Store,
    permission: PERMISSION_CODES.BOOKING_READ,
  },
  {
    titleKey: 'adminCalendar',
    href: ROUTES.ADMIN_CALENDAR,
    icon: CalendarDays,
    permission: PERMISSION_CODES.BOOKING_READ,
  },
  {
    titleKey: 'adminBookings',
    href: ROUTES.ADMIN_BOOKINGS,
    icon: Calendar,
    permission: PERMISSION_CODES.BOOKING_READ,
  },
  {
    titleKey: 'adminSchedule',
    href: ROUTES.ADMIN_SCHEDULE,
    icon: CalendarDays,
    permission: PERMISSION_CODES.SCHEDULE_READ,
  },
];

const manageNavItems: NavItem[] = [
  {
    titleKey: 'adminServices',
    href: ROUTES.ADMIN_SERVICES,
    icon: Scissors,
    permission: PERMISSION_CODES.SERVICE_READ,
  },
  {
    titleKey: 'adminStaff',
    href: ROUTES.ADMIN_STAFF,
    icon: Users,
    permission: PERMISSION_CODES.STAFF_READ,
  },
  {
    titleKey: 'adminWallet',
    href: ROUTES.ADMIN_WALLET,
    icon: Wallet,
    permission: PERMISSION_CODES.WALLET_READ,
  },
  {
    titleKey: 'adminFinance',
    href: ROUTES.ADMIN_FINANCE,
    icon: Banknote,
    permission: PERMISSION_CODES.WALLET_READ,
  },
  {
    titleKey: 'adminSettings',
    href: ROUTES.ADMIN_SETTINGS,
    icon: Settings,
    permission: PERMISSION_CODES.TENANT_SETTINGS_READ,
  },
];

const staffNavItems: NavItem[] = [
  {
    titleKey: 'adminEarnings',
    href: ROUTES.ADMIN_EARNINGS,
    icon: Banknote,
    permission: PERMISSION_CODES.DASHBOARD_READ,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { can, isStaff } = useAuthPermissions();
  const tNav = useTranslations('nav');

  return (
    <Sidebar collapsible="icon" variant="inset" className="hidden md:flex">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href={ROUTES.ADMIN_DASHBOARD}>
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Scissors className="size-4" />
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
          labelKey="adminDaily"
          items={
            isStaff
              ? dailyNavItems.filter((item) => item.href !== ROUTES.ADMIN_DASHBOARD)
              : dailyNavItems
          }
          pathname={pathname}
          can={can}
          tNav={tNav}
          matchPrefix
        />
        {isStaff ? (
          <NavSection
            labelKey="adminManage"
            items={staffNavItems}
            pathname={pathname}
            can={can}
            tNav={tNav}
            matchPrefix
          />
        ) : (
          <NavSection
            labelKey="adminManage"
            items={manageNavItems}
            pathname={pathname}
            can={can}
            tNav={tNav}
            matchPrefix
          />
        )}
      </SidebarContent>
      <SidebarFooter>
        <div className="px-2 pb-2 group-data-[collapsible=icon]:hidden">
          <TenantSwitcher />
        </div>
        <div className="px-2 pb-2 group-data-[collapsible=icon]:hidden">
          <LocaleSwitcher className="justify-center" />
        </div>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
