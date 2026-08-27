'use client';

import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import type { useTranslations } from 'next-intl';
import type { PermissionCode } from '@/shared/config/permissions';
import type { AppMessages } from '@/shared/i18n/messages';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/shared/ui/sidebar';

export interface NavSectionItem<TitleKey extends string = string> {
  titleKey: TitleKey;
  href: string;
  icon: LucideIcon;
  permission?: PermissionCode;
  badgeCount?: number;
}

interface NavSectionProps<TitleKey extends string> {
  labelKey: keyof AppMessages['nav'];
  items: NavSectionItem<TitleKey>[];
  pathname: string;
  can: (code: PermissionCode) => boolean;
  tNav: ReturnType<typeof useTranslations<'nav'>>;
  matchPrefix?: boolean;
}

export function NavSection<TitleKey extends string>({
  labelKey,
  items,
  pathname,
  can,
  tNav,
  matchPrefix = false,
}: NavSectionProps<TitleKey>) {
  const visibleItems = items.filter(
    (item) => !item.permission || can(item.permission),
  );

  if (visibleItems.length === 0) return null;

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{tNav(labelKey)}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {visibleItems.map((item) => {
            const title = tNav(item.titleKey as keyof AppMessages['nav']);
            const active = matchPrefix
              ? pathname === item.href || pathname.startsWith(`${item.href}/`)
              : pathname === item.href;
            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild isActive={active} tooltip={title}>
                  <Link href={item.href}>
                    <item.icon />
                    <span>{title}</span>
                  </Link>
                </SidebarMenuButton>
                {item.badgeCount && item.badgeCount > 0 ? (
                  <SidebarMenuBadge>
                    {item.badgeCount > 99 ? '99+' : item.badgeCount}
                  </SidebarMenuBadge>
                ) : null}
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
