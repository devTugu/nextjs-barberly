'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Calendar, Scissors, Wallet } from 'lucide-react';
import { env } from '@/shared/config/env';
import { ROUTES } from '@/shared/config/routes';
import {
  PERMISSION_CODES,
  type PermissionCode,
} from '@/shared/config/permissions';
import { useAuthPermissions } from '@/features/auth';
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
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/shared/ui/sidebar';
import { NavUser } from '@/widgets/app-sidebar/nav-user';

type ShopNavTitleKey = keyof Pick<
  AppMessages['nav'],
  'shop' | 'shopServices' | 'shopBookings' | 'shopWallet'
>;

interface NavItem {
  titleKey: ShopNavTitleKey;
  href: string;
  icon: typeof Scissors;
  permission?: PermissionCode;
}

const shopNavItems: NavItem[] = [
  {
    titleKey: 'shopServices',
    href: ROUTES.SHOP_SERVICES,
    icon: Scissors,
    permission: PERMISSION_CODES.SERVICE_READ,
  },
  {
    titleKey: 'shopBookings',
    href: ROUTES.SHOP_BOOKINGS,
    icon: Calendar,
    permission: PERMISSION_CODES.BOOKING_READ,
  },
  {
    titleKey: 'shopWallet',
    href: ROUTES.SHOP_WALLET,
    icon: Wallet,
    permission: PERMISSION_CODES.WALLET_READ,
  },
];

export function ShopSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tenant = searchParams.get('tenant') ?? 'demo';
  const shopHref = (path: string) =>
    `${path}?tenant=${encodeURIComponent(tenant)}`;
  const { can } = useAuthPermissions();
  const tNav = useTranslations('nav');

  const visibleItems = shopNavItems.filter(
    (item) => !item.permission || can(item.permission),
  );

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href={shopHref(ROUTES.SHOP_BOOKINGS)}>
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Scissors className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{env.APP_NAME}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {tNav('shop')}
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{tNav('shop')}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleItems.map((item) => {
                const title = tNav(item.titleKey);
                const href = shopHref(item.href);
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.href}
                      tooltip={title}
                    >
                      <Link href={href}>
                        <item.icon />
                        <span>{title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
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
